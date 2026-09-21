"""
Smart Crop AI - Truthful Multi-Crop Inference Engine

Pipeline:
1. Decode uploaded image
2. Image quality gate
3. Plant / non-crop gate
4. Preprocess image
5. Crop identification
6. Disease/visual-health analysis
7. Growth-stage framework
8. Sustainable care information
9. Explainable visual analysis
10. SQLite history

IMPORTANT:
- Never invent a crop name.
- Never invent a disease diagnosis.
- Never claim RGB/OpenCV analysis is multispectral.
- Never provide crop-specific information when crop identification is unreliable.
- Custom ACRNN predictions are used only when trained weights are actually available.
"""

import os
import json
import time
from typing import Dict, Any, List

import cv2
import numpy as np

from ..preprocessing.cv_pipeline import process_pipeline
from .attention import generate_attention_heatmap
from .plant_detector import plant_detector
from .growth_engine import estimate_growth_stage

from ..knowledge.crop_database import (
    get_crop_knowledge,
    PEST_AND_DISEASE_FRAMEWORK,
)

from ..database import add_scan


# ============================================================
# PATHS
# ============================================================

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PROJECT_DIR = os.path.dirname(BACKEND_DIR)

MODELS_DIR = os.path.join(PROJECT_DIR, "models")

LABELS_PATH = os.path.join(
    MODELS_DIR,
    "labels.json"
)

WEIGHTS_PATH = os.path.join(
    MODELS_DIR,
    "acrnn_weights.h5"
)


# ============================================================
# LOAD MODEL CLASS METADATA
# ============================================================

CLASS_METADATA: List[Dict[str, Any]] = []

if os.path.exists(LABELS_PATH):

    try:

        with open(
            LABELS_PATH,
            "r",
            encoding="utf-8"
        ) as file:

            loaded_labels = json.load(file)

        if isinstance(loaded_labels, list):

            CLASS_METADATA = loaded_labels

        elif isinstance(loaded_labels, dict):

            # Support either:
            # {"classes": [...]}
            # or {"0": {...}, "1": {...}}

            if isinstance(
                loaded_labels.get("classes"),
                list
            ):

                CLASS_METADATA = loaded_labels["classes"]

            else:

                CLASS_METADATA = list(
                    loaded_labels.values()
                )

        print(
            f"[InferenceEngine] Loaded "
            f"{len(CLASS_METADATA)} class metadata entries."
        )

    except Exception as error:

        print(
            "[InferenceEngine] Could not read "
            f"labels.json: {error}"
        )

else:

    print(
        "[InferenceEngine] labels.json not found. "
        "Custom ACRNN classification unavailable."
    )


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def _safe_float(value: Any, default: float = 0.0) -> float:

    try:

        if value is None:
            return default

        return float(value)

    except (
        TypeError,
        ValueError
    ):

        return default


def _safe_round(
    value: Any,
    digits: int = 1
) -> float:

    return round(
        _safe_float(value),
        digits
    )


def _normalize_crop_name(
    crop: Any
) -> str:

    if crop is None:
        return ""

    crop_name = str(crop).strip()

    if not crop_name:
        return ""

    unknown_values = {
        "unknown",
        "none",
        "null",
        "n/a",
        "unknown crop",
        "unknown / low confidence",
        "low confidence",
    }

    if crop_name.lower() in unknown_values:

        return ""

    return crop_name


def _get_crop_confidence(
    detection: Dict[str, Any]
) -> float:

    value = detection.get(
        "crop_confidence",
        detection.get(
            "confidence",
            0.0
        )
    )

    confidence = _safe_float(
        value,
        0.0
    )

    # Handle either 0-1 or 0-100 representation.
    if 0.0 < confidence <= 1.0:

        confidence *= 100.0

    return max(
        0.0,
        min(
            confidence,
            100.0
        )
    )


def _crop_is_reliable(
    crop: str,
    confidence: float
) -> bool:

    """
    Conservative gate.

    A crop should only be used for crop-specific
    knowledge if the detector actually supplied a
    recognizable crop and confidence is sufficient.

    IMPORTANT:
    This function does not create a crop prediction.
    """

    if not crop:
        return False

    return confidence >= 50.0


def _build_low_confidence_response(
    elapsed_ms: float
) -> Dict[str, Any]:

    return {

        "is_crop": True,

        "is_quality_valid": True,

        "classification_status":
            "low_confidence",

        "message":
            "⚠️ LOW CONFIDENCE",

        "message_detail":
            (
                "The image appears to contain a plant, "
                "but the available visual evidence is not "
                "sufficient for a reliable identification."
            ),

        "crop": "Unknown",

        "crop_confidence": 0.0,

        "disease": "Unknown",

        "disease_confidence": 0.0,

        "health_status": "Unknown",

        "risk_level": "Unknown",

        "pathogen": "Unconfirmed",

        "growth_stage": "Unknown",

        "growth_stage_info": None,

        "visible_symptoms":
            "Crop identification is not reliable enough "
            "to provide crop-specific diagnostic information.",

        "sustainable_care": [],

        "recommendations": [
            "Upload a clearer image.",
            "Capture the leaves, stem, fruit, or whole plant.",
            "Use good lighting and avoid severe blur.",
        ],

        "next_steps": [
            "Upload a clearer image.",
            "Capture the leaves, stem, fruit, or whole plant.",
            "Use good lighting and avoid severe blur.",
        ],

        "top_predictions": [],

        "processing_time_ms":
            round(elapsed_ms, 1),

        "disclaimer":
            (
                "Crop identification is uncertain. "
                "No crop-specific disease or treatment "
                "recommendation is provided."
            ),
    }


# ============================================================
# INFERENCE ENGINE
# ============================================================

class InferenceEngine:

    def __init__(self):

        self.model = None

        self.is_loaded = False

        self.model_name = (
            "MobileNetV2 ImageNet + "
            "Real Plant Gating & Attention"
        )

        self._load_custom_acrnn()


    # ========================================================
    # LOAD CUSTOM ACRNN
    # ========================================================

    def _load_custom_acrnn(self):

        """
        Load custom ACRNN only if BOTH:
        - labels.json exists
        - acrnn_weights.h5 exists

        Otherwise the application remains in truthful
        fallback mode.
        """

        if not os.path.exists(
            WEIGHTS_PATH
        ):

            print(
                "[InferenceEngine] Custom ACRNN weights "
                "not present."
            )

            self.model = None

            self.is_loaded = False

            return


        if not CLASS_METADATA:

            print(
                "[InferenceEngine] ACRNN weights exist "
                "but class metadata is missing."
            )

            self.model = None

            self.is_loaded = False

            return


        try:

            from .acrnn import build_acrnn_model

            self.model = build_acrnn_model(
                num_classes=len(
                    CLASS_METADATA
                )
            )

            self.model.load_weights(
                WEIGHTS_PATH
            )

            self.is_loaded = True

            self.model_name = (
                "ACRNN "
                "(MobileNetV2 + BiGRU + Attention) "
                "- Trained Weights"
            )

            print(
                "[InferenceEngine] Successfully loaded "
                f"ACRNN weights from {WEIGHTS_PATH}"
            )

        except Exception as error:

            print(
                "[InferenceEngine] Could not load "
                f"ACRNN weights: {error}"
            )

            self.model = None

            self.is_loaded = False


    # ========================================================
    # CUSTOM MODEL PREDICTION
    # ========================================================

    def _predict_with_acrnn(
        self,
        rgb_tensor: np.ndarray
    ) -> Dict[str, Any]:

        """
        Runs the custom ACRNN only when actually loaded.
        """

        if not self.is_loaded:

            return {
                "success": False
            }


        if self.model is None:

            return {
                "success": False
            }


        if not CLASS_METADATA:

            return {
                "success": False
            }


        try:

            input_batch = np.expand_dims(
                rgb_tensor,
                axis=0
            )

            predictions = self.model.predict(
                input_batch,
                verbose=0
            )

            # Expected architecture:
            # predictions[0] = class probabilities
            # predictions[1] = attention weights

            if isinstance(
                predictions,
                (list, tuple)
            ):

                class_output = predictions[0]

                if len(predictions) > 1:

                    attention_output = (
                        predictions[1]
                    )

                else:

                    attention_output = None

            else:

                class_output = predictions

                attention_output = None


            probs = np.asarray(
                class_output
            )


            # Remove batch dimension.
            if probs.ndim > 1:

                probs = probs[0]


            if probs.size == 0:

                return {
                    "success": False
                }


            # Normalize probabilities if necessary.
            probs = np.asarray(
                probs,
                dtype=np.float32
            )

            if (
                np.any(probs < 0)
                or not np.isfinite(
                    probs
                ).all()
            ):

                return {
                    "success": False
                }


            probability_sum = float(
                probs.sum()
            )

            if probability_sum > 0:

                probs = (
                    probs /
                    probability_sum
                )


            top_idx = int(
                np.argmax(probs)
            )

            if top_idx >= len(
                CLASS_METADATA
            ):

                return {
                    "success": False
                }


            selected_meta = (
                CLASS_METADATA[
                    top_idx
                ]
            )


            confidence = (
                float(
                    probs[top_idx]
                ) * 100.0
            )


            crop = _normalize_crop_name(
                selected_meta.get(
                    "crop"
                )
            )


            disease = str(
                selected_meta.get(
                    "disease",
                    "Unknown"
                )
            )


            health_status = str(
                selected_meta.get(
                    "health_status",
                    "Unknown"
                )
            )


            risk_level = str(
                selected_meta.get(
                    "risk_level",
                    "Unknown"
                )
            )


            pathogen = str(
                selected_meta.get(
                    "pathogen",
                    "Unconfirmed"
                )
            )


            top_predictions = []


            top_indices = np.argsort(
                probs
            )[::-1][:3]


            for idx in top_indices:

                idx = int(idx)

                if idx >= len(
                    CLASS_METADATA
                ):
                    continue

                meta = CLASS_METADATA[
                    idx
                ]

                top_predictions.append({

                    "crop":
                        meta.get(
                            "crop",
                            "Unknown"
                        ),

                    "disease":
                        meta.get(
                            "disease",
                            "Unknown"
                        ),

                    "confidence":
                        round(
                            float(
                                probs[idx]
                            ) * 100.0,
                            1
                        ),

                    "health_status":
                        meta.get(
                            "health_status",
                            "Unknown"
                        ),
                })


            attention_weights = None


            if attention_output is not None:

                attention_array = np.asarray(
                    attention_output
                )

                if attention_array.ndim >= 1:

                    attention_weights = (
                        attention_array[0]
                        if attention_array.ndim > 1
                        else attention_array
                    )


            return {

                "success": True,

                "crop": crop,

                "confidence":
                    round(
                        confidence,
                        1
                    ),

                "disease": disease,

                "disease_confidence":
                    round(
                        confidence,
                        1
                    ),

                "health_status":
                    health_status,

                "risk_level":
                    risk_level,

                "pathogen":
                    pathogen,

                "top_predictions":
                    top_predictions,

                "attention_weights":
                    attention_weights,
            }


        except Exception as error:

            print(
                "[InferenceEngine] ACRNN "
                f"prediction error: {error}"
            )

            return {
                "success": False
            }


    # ========================================================
    # MAIN PREDICTION
    # ========================================================

    def predict_crop(
        self,
        image_bytes: bytes,
        image_name: str = "image.jpg"
    ) -> Dict[str, Any]:

        start_time = time.time()


        # ====================================================
        # 1. DECODE IMAGE
        # ====================================================

        nparr = np.frombuffer(
            image_bytes,
            np.uint8
        )

        img_bgr = cv2.imdecode(
            nparr,
            cv2.IMREAD_COLOR
        )


        if img_bgr is None:

            elapsed_ms = (
                time.time() -
                start_time
            ) * 1000.0


            try:

                add_scan(
                    crop="Invalid Image",
                    disease="Corrupted Format",
                    crop_confidence=0.0,
                    disease_confidence=0.0,
                    health_status="Unknown",
                    risk_level="Unknown",
                    growth_stage="Unknown",
                    image_name=image_name,
                    image_classification_status=
                        "quality_rejected",
                    is_non_crop=1,
                    processing_time_ms=
                        elapsed_ms,
                )

            except Exception as error:

                print(
                    "[InferenceEngine] "
                    f"History error: {error}"
                )


            return {

                "is_crop": False,

                "is_quality_valid": False,

                "classification_status":
                    "quality_rejected",

                "message":
                    "⚠️ IMAGE QUALITY TOO LOW",

                "message_detail":
                    (
                        "Uploaded file is corrupted "
                        "or is not a valid image."
                    ),

                "crop": "Unknown",

                "disease": "Unknown",

                "growth_stage": "Unknown",

                "recommendations": [],

                "processing_time_ms":
                    round(
                        elapsed_ms,
                        1
                    ),
            }


        # ====================================================
        # 2. PLANT / NON-CROP + QUALITY GATE
        # ====================================================

        try:

            detection = (
                plant_detector
                .evaluate_plant_or_non_crop(
                    img_bgr
                )
            )

        except Exception as error:

            print(
                "[InferenceEngine] "
                f"Plant detector error: {error}"
            )

            elapsed_ms = (
                time.time() -
                start_time
            ) * 1000.0

            return {

                "is_crop": False,

                "is_quality_valid": False,

                "classification_status":
                    "quality_rejected",

                "message":
                    "⚠️ IMAGE ANALYSIS ERROR",

                "message_detail":
                    (
                        "The image could not be "
                        "reliably analyzed."
                    ),

                "crop": "Unknown",

                "disease": "Unknown",

                "growth_stage": "Unknown",

                "recommendations": [
                    "Please upload another clear image."
                ],

                "processing_time_ms":
                    round(
                        elapsed_ms,
                        1
                    ),
            }


        # ====================================================
        # 3. QUALITY REJECTION
        # ====================================================

        if not detection.get(
            "is_quality_valid",
            True
        ):

            elapsed_ms = (
                time.time() -
                start_time
            ) * 1000.0


            try:

                add_scan(
                    crop="Low Quality",
                    disease="Unreadable",
                    crop_confidence=0.0,
                    disease_confidence=0.0,
                    health_status="Unknown",
                    risk_level="Unknown",
                    growth_stage="Unknown",
                    image_name=image_name,
                    image_classification_status=
                        "quality_rejected",
                    is_non_crop=1,
                    processing_time_ms=
                        elapsed_ms,
                )

            except Exception as error:

                print(
                    "[InferenceEngine] "
                    f"History error: {error}"
                )


            return {

                "is_crop": False,

                "is_quality_valid": False,

                "classification_status":
                    "quality_rejected",

                "message":
                    "⚠️ IMAGE QUALITY TOO LOW",

                "message_detail":
                    detection.get(
                        "message",
                        "The image quality is insufficient."
                    ),

                "rejection_reason":
                    detection.get(
                        "rejection_reason",
                        "Image quality insufficient."
                    ),

                "quality_metrics":
                    detection.get(
                        "quality_metrics",
                        {}
                    ),

                "crop": "Unknown",

                "disease": "Unknown",

                "growth_stage": "Unknown",

                "recommendations": [
                    (
                        "Please upload a sharper, "
                        "well-lit image of the crop."
                    )
                ],

                "processing_time_ms":
                    round(
                        elapsed_ms,
                        1
                    ),
            }


        # ====================================================
        # 4. NON-CROP REJECTION
        # ====================================================

        if not detection.get(
            "is_crop",
            False
        ):

            elapsed_ms = (
                time.time() -
                start_time
            ) * 1000.0


            try:

                add_scan(
                    crop="Non-Crop",
                    disease="None",
                    crop_confidence=0.0,
                    disease_confidence=0.0,
                    health_status="Non-Crop",
                    risk_level="None",
                    growth_stage="None",
                    image_name=image_name,
                    image_classification_status=
                        "not_a_crop",
                    is_non_crop=1,
                    processing_time_ms=
                        elapsed_ms,
                )

            except Exception as error:

                print(
                    "[InferenceEngine] "
                    f"History error: {error}"
                )


            return {

                "is_crop": False,

                "is_quality_valid": True,

                "classification_status":
                    "not_a_crop",

                "message":
                    "⚠️ NOT A CROP IMAGE",

                "message_detail":
                    (
                        "The uploaded image does not "
                        "appear to contain a recognizable "
                        "plant or crop."
                    ),

                "upload_prompt":
                    "[UPLOAD ANOTHER IMAGE]",

                "detected_object":
                    detection.get(
                        "detected_object",
                        "Unrelated Object"
                    ),

                "detected_confidence":
                    detection.get(
                        "confidence",
                        0.0
                    ),

                "rejection_reason":
                    detection.get(
                        "rejection_reason",
                        "Image is not recognized as a plant."
                    ),

                "crop": None,

                "crop_confidence": None,

                "disease": None,

                "disease_confidence": None,

                "health_status": None,

                "risk_level": None,

                "growth_stage": None,

                "growth_stage_info": None,

                "recommendations": [],

                "processing_time_ms":
                    round(
                        elapsed_ms,
                        1
                    ),
            }


        # ====================================================
        # 5. PREPROCESSING
        # ====================================================

        try:

            prep = process_pipeline(
                image_bytes
            )

            rgb_tensor = prep[
                "rgb_tensor"
            ]

        except Exception as error:

            print(
                "[InferenceEngine] "
                f"Preprocessing error: {error}"
            )

            elapsed_ms = (
                time.time() -
                start_time
            ) * 1000.0

            return {

                "is_crop": True,

                "is_quality_valid": True,

                "classification_status":
                    "low_confidence",

                "message":
                    "⚠️ LOW CONFIDENCE",

                "message_detail":
                    (
                        "The image appears to contain "
                        "a plant, but the available visual "
                        "evidence is not sufficient for a "
                        "reliable identification."
                    ),

                "crop": "Unknown",

                "disease": "Unknown",

                "growth_stage": "Unknown",

                "recommendations": [
                    "Upload a clearer image."
                ],

                "processing_time_ms":
                    round(
                        elapsed_ms,
                        1
                    ),
            }


        # ====================================================
        # 6. DEFAULT ANALYSIS VALUES
        # ====================================================

        crop = ""

        crop_confidence = 0.0

        disease = "Unknown"

        disease_confidence = 0.0

        health_status = "Unknown"

        risk_level = "Unknown"

        pathogen = "Unconfirmed"

        top_predictions = []

        attn_weights = None


        # ====================================================
        # 7. TRY REAL ACRNN FIRST
        # ====================================================

        acrnn_result = (
            self._predict_with_acrnn(
                rgb_tensor
            )
        )


        if acrnn_result.get(
            "success",
            False
        ):

            crop = _normalize_crop_name(
                acrnn_result.get(
                    "crop"
                )
            )

            crop_confidence = (
                _safe_float(
                    acrnn_result.get(
                        "confidence"
                    )
                )
            )

            disease = acrnn_result.get(
                "disease",
                "Unknown"
            )

            disease_confidence = (
                _safe_float(
                    acrnn_result.get(
                        "disease_confidence"
                    )
                )
            )

            health_status = acrnn_result.get(
                "health_status",
                "Unknown"
            )

            risk_level = acrnn_result.get(
                "risk_level",
                "Unknown"
            )

            pathogen = acrnn_result.get(
                "pathogen",
                "Unconfirmed"
            )

            top_predictions = (
                acrnn_result.get(
                    "top_predictions",
                    []
                )
            )

            attn_weights = (
                acrnn_result.get(
                    "attention_weights"
                )
            )


        # ====================================================
        # 8. FALLBACK CROP DETECTION
        # ====================================================

        else:

            recognized_crop = (
                detection.get(
                    "detected_crop"
                )
            )

            recognized_crop = (
                _normalize_crop_name(
                    recognized_crop
                )
            )

            detector_confidence = (
                _get_crop_confidence(
                    detection
                )
            )


            if _crop_is_reliable(
                recognized_crop,
                detector_confidence
            ):

                crop = recognized_crop

                crop_confidence = (
                    detector_confidence
                )


            else:

                # IMPORTANT:
                # Do NOT convert ImageNet class names
                # into crop names.
                #
                # Do NOT guess Tomato, Potato,
                # Chilli, etc.

                crop = ""

                crop_confidence = 0.0


            # ------------------------------------------------
            # VISUAL HEALTH ANALYSIS
            # ------------------------------------------------

            foliage = detection.get(
                "foliage_metrics",
                {}
            )


            brown_ratio = _safe_float(
                foliage.get(
                    "brown_ratio",
                    0.0
                )
            )

            chlorotic_ratio = _safe_float(
                foliage.get(
                    "chlorotic_ratio",
                    0.0
                )
            )

            green_ratio = _safe_float(
                foliage.get(
                    "green_ratio",
                    0.0
                )
            )


            # We describe visible visual features.
            # We DO NOT claim these are confirmed
            # diseases without a trained classifier.

            if (
                green_ratio > 0.60
                and brown_ratio < 0.02
                and chlorotic_ratio < 0.04
            ):

                health_status = (
                    "Healthy-looking foliage"
                )

                disease = (
                    "No obvious visible lesion "
                    "pattern detected"
                )

                disease_confidence = 0.0

                risk_level = "Low"

                pathogen = (
                    "No pathogen identified"
                )


            elif (
                brown_ratio > 0.06
                or chlorotic_ratio > 0.10
            ):

                health_status = (
                    "Visible foliar stress observed"
                )

                disease = (
                    "Visible chlorosis / "
                    "foliar necrosis observed"
                )

                disease_confidence = 0.0

                if brown_ratio > 0.12:

                    risk_level = "High"

                else:

                    risk_level = "Medium"

                pathogen = (
                    "Unconfirmed; visual observation "
                    "requires trained disease model "
                    "or agricultural diagnosis"
                )


            else:

                health_status = "Uncertain"

                disease = "Unknown"

                disease_confidence = 0.0

                risk_level = "Unknown"

                pathogen = "Unconfirmed"


            # Keep detector classes transparent,
            # but don't label them as crop predictions.

            for cls in detection.get(
                "top_classes",
                []
            )[:3]:

                if not isinstance(
                    cls,
                    dict
                ):
                    continue

                top_predictions.append({

                    "label":
                        cls.get(
                            "label",
                            "Unknown"
                        ),

                    "confidence":
                        _safe_round(
                            cls.get(
                                "score",
                                0.0
                            ),
                            1
                        ),

                    "source":
                        "ImageNet visual class",

                    "note":
                        (
                            "Not treated as a "
                            "crop identification."
                        ),
                })


        # ====================================================
        # 9. STRICT LOW-CONFIDENCE GATE
        # ====================================================

        if not _crop_is_reliable(
            crop,
            crop_confidence
        ):

            elapsed_ms = (
                time.time() -
                start_time
            ) * 1000.0


            result = (
                _build_low_confidence_response(
                    elapsed_ms
                )
            )


            result[
                "quality_metrics"
            ] = detection.get(
                "quality_metrics",
                {}
            )


            result[
                "foliage_metrics"
            ] = detection.get(
                "foliage_metrics",
                {}
            )


            result[
                "top_predictions"
            ] = top_predictions


            # Preserve visual preprocessing
            # when available.

            if isinstance(
                prep,
                dict
            ):

                for key in [
                    "original_b64",
                    "resized_b64",
                    "enhanced_b64",
                    "tensor_norm_b64",
                ]:

                    if key in prep:

                        result[key] = prep[key]


            try:

                add_scan(
                    crop="Unknown",
                    disease="Unknown",
                    crop_confidence=0.0,
                    disease_confidence=0.0,
                    health_status="Unknown",
                    risk_level="Unknown",
                    growth_stage="Unknown",
                    image_name=image_name,
                    image_info=(
                        f"{img_bgr.shape[1]}x"
                        f"{img_bgr.shape[0]}px"
                    ),
                    model_version=self.model_name,
                    processing_time_ms=
                        elapsed_ms,
                    image_classification_status=
                        "low_confidence",
                    is_non_crop=0,
                )

            except Exception as error:

                print(
                    "[InferenceEngine] "
                    f"History error: {error}"
                )


            return result


        # ====================================================
        # 10. ATTENTION / VISUAL EXPLANATION
        # ====================================================

        try:

            attn_result = (
                generate_attention_heatmap(
                    img_bgr,
                    attention_weights=
                        attn_weights
                )
            )

        except Exception as error:

            print(
                "[InferenceEngine] "
                f"Attention error: {error}"
            )

            attn_result = {

                "affected_ratio": 0.0,

                "attention_heatmap_b64": None,

                "overlay_b64": None,
            }


        # ====================================================
        # 11. GROWTH STAGE
        # ====================================================

        try:

            growth_info = (
                estimate_growth_stage(
                    crop
                )
            )

            if not isinstance(
                growth_info,
                dict
            ):

                growth_info = {}


        except Exception as error:

            print(
                "[InferenceEngine] "
                f"Growth engine error: {error}"
            )

            growth_info = {}


        growth_stage = growth_info.get(
            "stage_name",
            "Unknown"
        )


        # ====================================================
        # 12. CROP KNOWLEDGE
        # ====================================================

        try:

            crop_data = (
                get_crop_knowledge(
                    crop
                )
            )

        except Exception as error:

            print(
                "[InferenceEngine] "
                f"Crop knowledge error: {error}"
            )

            crop_data = None


        # ====================================================
        # 13. CROP-SPECIFIC INFORMATION
        # ====================================================

        foliage = detection.get(
            "foliage_metrics",
            {}
        )


        green_ratio = _safe_float(
            foliage.get(
                "green_ratio",
                0.0
            )
        )


        chlorotic_ratio = _safe_float(
            foliage.get(
                "chlorotic_ratio",
                0.0
            )
        )


        brown_ratio = _safe_float(
            foliage.get(
                "brown_ratio",
                0.0
            )
        )


        if crop_data:

            sustainable_care = (
                crop_data.get(
                    "sustainable_care",
                    []
                )
            )


            if not isinstance(
                sustainable_care,
                list
            ):

                sustainable_care = []


            visible_symptoms = (
                f"Visual analysis for {crop}: "
                f"green vegetation ratio "
                f"{round(green_ratio * 100, 1)}%, "
                f"chlorosis indicator "
                f"{round(chlorotic_ratio * 100, 1)}%, "
                f"and brown/necrotic-region indicator "
                f"{round(brown_ratio * 100, 1)}%."
            )


            next_steps = [

                (
                    f"Continue monitoring "
                    f"{crop} regularly."
                ),

                (
                    "Inspect leaves, stems, "
                    "fruit, and lower leaf surfaces "
                    "for changing symptoms."
                ),

                (
                    "Maintain appropriate irrigation "
                    "and avoid unnecessary leaf wetting."
                ),

                (
                    "Use crop-specific disease "
                    "information as a guide and seek "
                    "local agricultural advice for "
                    "definitive diagnosis."
                ),
            ]


        else:

            # This should only occur if the detector
            # recognized a crop but the knowledge base
            # has no entry.

            sustainable_care = [

                (
                    "Maintain balanced irrigation "
                    "appropriate for the crop."
                ),

                (
                    "Maintain adequate spacing and "
                    "air circulation."
                ),

                (
                    "Monitor leaves and stems regularly "
                    "for changing symptoms."
                ),
            ]


            visible_symptoms = (
                f"{crop} was identified, but a "
                "crop-specific knowledge entry is "
                "not available in the local database."
            )


            next_steps = [

                (
                    "Capture additional images of "
                    "leaves, stem, fruit, and whole plant."
                ),

                (
                    "Monitor the crop for changes "
                    "over the next few days."
                ),

                (
                    "Consult a local agricultural "
                    "extension service for diagnosis."
                ),
            ]


        # ====================================================
        # 14. SAVE HISTORY
        # ====================================================

        elapsed_ms = (
            time.time() -
            start_time
        ) * 1000.0


        scan_record = None


        try:

            scan_record = add_scan(

                crop=crop,

                disease=disease,

                crop_confidence=
                    crop_confidence,

                disease_confidence=
                    disease_confidence,

                health_status=
                    health_status,

                risk_level=
                    risk_level,

                growth_stage=
                    growth_stage,

                image_name=
                    image_name,

                image_info=(
                    f"{img_bgr.shape[1]}x"
                    f"{img_bgr.shape[0]}px"
                ),

                model_version=
                    self.model_name,

                processing_time_ms=
                    elapsed_ms,

                image_classification_status=
                    "plant_detected",

                is_non_crop=0,

                affected_ratio=
                    attn_result.get(
                        "affected_ratio",
                        0.0
                    ),
            )

        except Exception as error:

            print(
                "[InferenceEngine] "
                f"Database logging error: {error}"
            )


        # ====================================================
        # 15. FINAL RESPONSE
        # ====================================================

        response = {

            "scan_id":
                (
                    scan_record.get("id")
                    if isinstance(
                        scan_record,
                        dict
                    )
                    else None
                ),

            "is_crop": True,

            "is_quality_valid": True,

            "classification_status":
                "plant_detected",

            "message":
                "Plant / Crop detected and analyzed.",

            # ----------------------------------------------
            # CROP
            # ----------------------------------------------

            "crop":
                crop,

            "crop_confidence":
                round(
                    crop_confidence,
                    1
                ),

            # ----------------------------------------------
            # HEALTH
            # ----------------------------------------------

            "health_status":
                health_status,

            "disease":
                disease,

            "disease_confidence":
                round(
                    disease_confidence,
                    1
                ),

            "risk_level":
                risk_level,

            "pathogen":
                pathogen,

            "affected_ratio":
                _safe_round(
                    attn_result.get(
                        "affected_ratio",
                        0.0
                    ),
                    2
                ),

            # ----------------------------------------------
            # GROWTH
            # ----------------------------------------------

            "growth_stage":
                growth_stage,

            "growth_stage_info":
                growth_info,

            # ----------------------------------------------
            # CARE
            # ----------------------------------------------

            "visible_symptoms":
                visible_symptoms,

            "sustainable_care":
                sustainable_care,

            "recommendations":
                next_steps,

            "next_steps":
                next_steps,

            # ----------------------------------------------
            # VISUAL ANALYSIS
            # ----------------------------------------------

            "original_b64":
                prep.get(
                    "original_b64"
                ),

            "resized_b64":
                prep.get(
                    "resized_b64"
                ),

            "enhanced_b64":
                prep.get(
                    "enhanced_b64"
                ),

            "tensor_norm_b64":
                prep.get(
                    "tensor_norm_b64"
                ),

            "attention_heatmap_b64":
                attn_result.get(
                    "attention_heatmap_b64"
                ),

            "overlay_b64":
                attn_result.get(
                    "overlay_b64"
                ),

            # ----------------------------------------------
            # METADATA
            # ----------------------------------------------

            "top_predictions":
                top_predictions,

            "foliage_metrics":
                detection.get(
                    "foliage_metrics",
                    {}
                ),

            "quality_metrics":
                detection.get(
                    "quality_metrics",
                    {}
                ),

            "processing_time_ms":
                round(
                    elapsed_ms,
                    1
                ),

            "model_version":
                self.model_name,

            "model_loaded":
                self.is_loaded,

            "disclaimer":
                (
                    "AI output is decision-support "
                    "information based on the available "
                    "visual evidence. Disease observations "
                    "are not a laboratory diagnosis. "
                    "Validate important crop-management "
                    "decisions with a qualified agricultural "
                    "professional."
                ),
        }


        return response


# ============================================================
# GLOBAL ENGINE
# ============================================================

engine = InferenceEngine()