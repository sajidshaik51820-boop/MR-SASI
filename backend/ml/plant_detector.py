"""
Smart Crop AI - Plant / Non-Crop Detection Engine

Purpose:
- Detect whether an uploaded image contains plant/crop vegetation.
- Reject obvious unrelated images such as cars, rocks, people, animals,
  electronics, furniture, buildings, etc.
- Use real MobileNetV2 ImageNet predictions only for classes that it
  genuinely knows.
- Never convert an arbitrary ImageNet prediction into a fake crop name.
- Return Unknown when crop identification is not reliable.

This module is compatible with backend/ml/inference.py.

Expected output fields:
    is_crop
    is_quality_valid
    classification_status
    detected_crop
    crop_confidence
    detected_object
    foliage_metrics
    quality_metrics
    top_classes
"""

from __future__ import annotations

import cv2
import numpy as np
from typing import Tuple, Dict, Any, Optional


# ---------------------------------------------------------------------------
# 1. DEFINITE NON-CROP IMAGE CLASSES
# ---------------------------------------------------------------------------

NON_CROP_KEYWORDS = {
    # Rocks / geology / terrain
    "cliff",
    "promontory",
    "megalith",
    "seashore",
    "geyser",
    "volcano",
    "stone_wall",
    "sandbar",
    "quarry",
    "boulder",
    "rock",
    "stone",
    "gravel",
    "meteorite",

    # Vehicles
    "car",
    "automobile",
    "cab",
    "taxi",
    "minivan",
    "truck",
    "trailer",
    "scooter",
    "motorcycle",
    "bicycle",
    "bus",
    "boat",
    "plane",
    "airplane",
    "ship",
    "train",
    "locomotive",
    "convertible",
    "sports_car",
    "jeep",
    "limousine",
    "golfcart",
    "racer",
    "amphibian",
    "tank",

    # Electronics
    "phone",
    "cellular",
    "telephone",
    "laptop",
    "computer",
    "keyboard",
    "mouse",
    "screen",
    "monitor",
    "television",
    "radio",
    "camera",
    "modem",
    "printer",
    "ipod",
    "remote",
    "cassette",
    "vcr",

    # Furniture / household
    "chair",
    "folding_chair",
    "table",
    "dining_table",
    "desk",
    "couch",
    "sofa",
    "bed",
    "wardrobe",
    "bookcase",
    "lamp",
    "toilet",
    "tub",
    "bathtub",
    "sink",
    "refrigerator",
    "microwave",
    "oven",
    "toaster",
    "cupboard",
    "cabinet",

    # People / clothing
    "person",
    "suit",
    "coat",
    "trench_coat",
    "jersey",
    "gown",
    "uniform",
    "dress",
    "jean",
    "shirt",
    "shoe",
    "boot",
    "hat",
    "glove",
    "mask",
    "scuba",
    "swimming",
    "bikini",
    "sunglasses",
    "wig",
    "diaper",
    "sock",

    # Animals
    "dog",
    "retriever",
    "terrier",
    "hound",
    "shepherd",
    "cat",
    "tabby",
    "lion",
    "tiger",
    "leopard",
    "cheetah",
    "bear",
    "wolf",
    "fox",
    "horse",
    "zebra",
    "cow",
    "bull",
    "ox",
    "pig",
    "sheep",
    "goat",
    "elephant",
    "monkey",
    "gorilla",
    "bird",
    "eagle",
    "hawk",
    "owl",
    "parrot",
    "penguin",
    "fish",
    "shark",
    "whale",
    "dolphin",
    "snake",
    "lizard",
    "alligator",
    "turtle",
    "frog",

    # Tools / objects
    "hammer",
    "wrench",
    "screwdriver",
    "bottle",
    "beer_bottle",
    "wine_bottle",
    "cup",
    "coffee_mug",
    "plate",
    "fork",
    "spoon",
    "knife",
    "guitar",
    "drum",
    "umbrella",
    "clock",
    "watch",
    "coin",
    "pen",
    "pencil",
    "wallet",
    "purse",
    "backpack",
    "lighter",
    "bucket",
    "can",
    "tin",
    "envelope",

    # Buildings / infrastructure
    "bridge",
    "building",
    "palace",
    "church",
    "mosque",
    "dam",
    "beacon",
    "dock",
    "pier",
    "road",
    "street",
    "pavement",
    "wall",
    "fence",
    "skyscraper",
}


# ---------------------------------------------------------------------------
# 2. REAL PLANT / PRODUCE CLASSES KNOWN TO IMAGENET
# ---------------------------------------------------------------------------
#
# IMPORTANT:
# MobileNetV2/ImageNet is NOT a crop-disease model.
# Only use labels that actually exist in ImageNet.
#
# We never map "random green object" -> Tomato.
#

PLANT_PRODUCE_SYNSET_MAP = {
    "bell_pepper": "Bell Pepper",
    "cucumber": "Cucumber",
    "artichoke": "Artichoke",
    "cardoon": "Cardoon",
    "head_cabbage": "Cabbage",
    "broccoli": "Broccoli",
    "cauliflower": "Cauliflower",
    "zucchini": "Zucchini",
    "spaghetti_squash": "Squash",
    "acorn_squash": "Squash",
    "butternut_squash": "Squash",
    "mushroom": "Mushroom",

    "Granny_Smith": "Apple",
    "strawberry": "Strawberry",
    "orange": "Orange",
    "lemon": "Lemon",
    "fig": "Fig",
    "pineapple": "Pineapple",
    "banana": "Banana",
    "jackfruit": "Jackfruit",
    "custard_apple": "Custard Apple",
    "pomegranate": "Pomegranate",

    "ear": "Corn (Maize)",
    "corn": "Corn (Maize)",
    "rapeseed": "Rapeseed",

    "daisy": "Daisy (Flora)",
    "sunflower": "Sunflower",

    "pot": "Potted Plant",
    "greenhouse": "Greenhouse Vegetation",
}


# ---------------------------------------------------------------------------
# 3. PLANT-SUGGESTIVE IMAGENET CLASSES
# ---------------------------------------------------------------------------
#
# These classes can help establish that the image contains vegetation,
# but they are NOT automatically converted into crop identities.
#

PLANT_GENERAL_KEYWORDS = {
    "plant",
    "leaf",
    "leaves",
    "flower",
    "flowering",
    "tree",
    "shrub",
    "herb",
    "fern",
    "vine",
    "grass",
    "moss",
    "weed",
    "stem",
    "foliage",
    "vegetation",
    "greenery",
    "garden",
    "greenhouse",
    "pot",
}


# ---------------------------------------------------------------------------
# 4. DETECTOR
# ---------------------------------------------------------------------------

class PlantDetector:

    def __init__(self):
        self.model = None
        self.is_initialized = False
        self._init_vision_model()

    # -----------------------------------------------------------------------
    # MODEL INITIALIZATION
    # -----------------------------------------------------------------------

    def _init_vision_model(self):
        """
        Load pretrained MobileNetV2 with ImageNet weights.

        This is used as a visual gate and limited produce classifier.
        It is NOT claimed to be a custom crop-disease model.
        """

        try:
            import keras

            self.model = keras.applications.MobileNetV2(
                weights="imagenet",
                include_top=True,
            )

            self.is_initialized = True

            print(
                "[PlantDetector] Pretrained MobileNetV2 "
                "(ImageNet) loaded successfully."
            )

        except Exception as e:
            print(
                f"[PlantDetector] Warning: Could not initialize "
                f"MobileNetV2: {e}"
            )

            self.model = None
            self.is_initialized = False

    # -----------------------------------------------------------------------
    # IMAGE QUALITY
    # -----------------------------------------------------------------------

    def validate_image_quality(
        self,
        img_bgr: np.ndarray,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Validate image quality before attempting plant detection.

        Checks:
        - valid image
        - minimum resolution
        - blur
        - brightness
        - contrast
        """

        if img_bgr is None:
            return (
                False,
                "Corrupted or unreadable image data.",
                {},
            )

        if not isinstance(img_bgr, np.ndarray):
            return (
                False,
                "Invalid image format.",
                {},
            )

        if len(img_bgr.shape) < 2:
            return (
                False,
                "Corrupted or unreadable image data.",
                {},
            )

        h, w = img_bgr.shape[:2]

        if h < 80 or w < 80:
            return (
                False,
                (
                    f"Image resolution too small ({w}x{h}px). "
                    "Minimum required is 80x80px."
                ),
                {
                    "width": int(w),
                    "height": int(h),
                    "status": "resolution_too_low",
                },
            )

        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        blur_score = float(
            cv2.Laplacian(gray, cv2.CV_64F).var()
        )

        brightness = float(np.mean(gray))
        contrast = float(np.std(gray))

        quality_metrics = {
            "width": int(w),
            "height": int(h),
            "blur_score": round(blur_score, 1),
            "brightness": round(brightness, 1),
            "contrast": round(contrast, 1),
            "sharpness": (
                "Sharp"
                if blur_score >= 120
                else (
                    "Acceptable"
                    if blur_score >= 40
                    else "Blurry"
                )
            ),
        }

        # Severe blur
        if blur_score < 30.0:
            return (
                False,
                (
                    "Image quality insufficient for reliable analysis: "
                    "Image is severely blurry."
                ),
                quality_metrics,
            )

        # Extremely dark
        if brightness < 15.0:
            return (
                False,
                (
                    "Image quality insufficient for reliable analysis: "
                    "Image is extremely dark/underexposed."
                ),
                quality_metrics,
            )

        # Extremely bright
        if brightness > 245.0:
            return (
                False,
                (
                    "Image quality insufficient for reliable analysis: "
                    "Image is washed out/overexposed."
                ),
                quality_metrics,
            )

        return (
            True,
            "Image quality verified.",
            quality_metrics,
        )

    # -----------------------------------------------------------------------
    # VEGETATION / FOLIAGE ANALYSIS
    # -----------------------------------------------------------------------

    def compute_foliage_metrics(
        self,
        img_bgr: np.ndarray,
    ) -> Dict[str, Any]:
        """
        Compute real image-based vegetation metrics using OpenCV.

        Metrics:
        - ExG
        - green vegetation ratio
        - chlorotic/yellow ratio
        - brown/necrotic-looking ratio
        - estimated plant tissue ratio
        - hue diversity
        """

        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

        h, s, v = cv2.split(hsv)

        # Normalize BGR channels
        b_f, g_f, r_f = cv2.split(
            img_bgr.astype(np.float32) / 255.0
        )

        # Excess Green Index
        exg_map = (
            (2.0 * g_f)
            - r_f
            - b_f
        )

        mean_exg = float(np.mean(exg_map))

        # ---------------------------------------------------------------
        # Green vegetation mask
        # ---------------------------------------------------------------

        hsv_green = cv2.inRange(
            hsv,
            (26, 40, 35),
            (95, 255, 255),
        )

        exg_valid = (
            (exg_map > 0.04)
            & (g_f > r_f)
            & (g_f > b_f)
        )

        green_mask = (
            (hsv_green > 0)
            & exg_valid
        )

        # ---------------------------------------------------------------
        # Yellow / chlorotic-looking pixels
        # ---------------------------------------------------------------

        hsv_chlorotic = cv2.inRange(
            hsv,
            (14, 50, 40),
            (25, 255, 255),
        )

        chlorotic_valid = (
            (r_f > b_f)
            & (g_f > b_f)
        )

        chlorotic_mask = (
            (hsv_chlorotic > 0)
            & chlorotic_valid
        )

        # ---------------------------------------------------------------
        # Brown / necrotic-looking pixels
        # ---------------------------------------------------------------

        hsv_brown = cv2.inRange(
            hsv,
            (8, 60, 20),
            (14, 255, 180),
        )

        brown_mask = hsv_brown > 0

        total_pixels = float(
            img_bgr.shape[0] * img_bgr.shape[1]
        )

        green_ratio = (
            float(np.sum(green_mask))
            / total_pixels
        )

        chlorotic_ratio = (
            float(np.sum(chlorotic_mask))
            / total_pixels
        )

        brown_ratio = (
            float(np.sum(brown_mask))
            / total_pixels
        )

        # Brown pixels alone should NOT prove vegetation.
        plant_tissue_ratio = (
            green_ratio
            + chlorotic_ratio
            + (brown_ratio * 0.4)
        )

        hue_diversity = float(np.std(h))

        return {
            "green_ratio": round(green_ratio, 4),
            "chlorotic_ratio": round(
                chlorotic_ratio,
                4,
            ),
            "brown_ratio": round(
                brown_ratio,
                4,
            ),
            "plant_tissue_ratio": round(
                plant_tissue_ratio,
                4,
            ),
            "mean_exg": round(
                mean_exg,
                4,
            ),
            "hue_diversity": round(
                hue_diversity,
                2,
            ),
        }

    # -----------------------------------------------------------------------
    # MOBILE NET PREDICTION
    # -----------------------------------------------------------------------

    def _run_imagenet_prediction(
        self,
        img_bgr: np.ndarray,
    ) -> Dict[str, Any]:
        """
        Run MobileNetV2/ImageNet prediction.

        Returns:
            {
                "top_predictions": [...],
                "top_label": ...,
                "top_score": ...,
                "recognized_crop": ...,
                "crop_confidence": ...,
                "deep_non_crop": ...,
                "non_crop_name": ...
            }
        """

        result = {
            "top_predictions": [],
            "top_label": None,
            "top_score": 0.0,
            "recognized_crop": None,
            "crop_confidence": 0.0,
            "deep_non_crop": False,
            "non_crop_name": None,
        }

        if not self.is_initialized or self.model is None:
            return result

        try:
            import keras

            # Resize for MobileNetV2
            resized = cv2.resize(
                img_bgr,
                (224, 224),
                interpolation=cv2.INTER_AREA,
            )

            # BGR -> RGB
            rgb = cv2.cvtColor(
                resized,
                cv2.COLOR_BGR2RGB,
            )

            tensor = np.expand_dims(
                rgb.astype(np.float32),
                axis=0,
            )

            tensor = (
                keras.applications.mobilenet_v2
                .preprocess_input(tensor)
            )

            preds = self.model.predict(
                tensor,
                verbose=0,
            )

            decoded = (
                keras.applications.mobilenet_v2
                .decode_predictions(
                    preds,
                    top=5,
                )[0]
            )

            if not decoded:
                return result

            # -----------------------------------------------------------
            # Save top predictions
            # -----------------------------------------------------------

            for item in decoded:
                class_id = item[0]
                label = item[1]
                score = float(item[2])

                result["top_predictions"].append(
                    {
                        "class_id": class_id,
                        "label": (
                            label
                            .replace("_", " ")
                            .title()
                        ),
                        "score": round(
                            score * 100.0,
                            1,
                        ),
                    }
                )

            top_class_id, top_label, top_score = decoded[0]

            result["top_label"] = top_label
            result["top_score"] = float(top_score)

            # -----------------------------------------------------------
            # Detect explicit non-crop object
            # -----------------------------------------------------------

            label_lower = top_label.lower()

            for keyword in NON_CROP_KEYWORDS:

                if keyword in label_lower:

                    result["deep_non_crop"] = True

                    result["non_crop_name"] = (
                        top_label
                        .replace("_", " ")
                        .title()
                    )

                    break

            # -----------------------------------------------------------
            # Recognize only REAL mapped plant/produce classes
            # -----------------------------------------------------------

            for item in decoded:

                cls_key = item[1]
                score = float(item[2])

                if cls_key in PLANT_PRODUCE_SYNSET_MAP:

                    result["recognized_crop"] = (
                        PLANT_PRODUCE_SYNSET_MAP[
                            cls_key
                        ]
                    )

                    result["crop_confidence"] = (
                        round(
                            score * 100.0,
                            1,
                        )
                    )

                    break

        except Exception as e:

            print(
                f"[PlantDetector] "
                f"Deep inference notice: {e}"
            )

        return result

    # -----------------------------------------------------------------------
    # PLANT-LIKELIHOOD CALCULATION
    # -----------------------------------------------------------------------

    def _calculate_plant_likelihood(
        self,
        foliage: Dict[str, Any],
        predictions: Dict[str, Any],
    ) -> float:
        """
        Estimate whether the image visually contains vegetation.

        This is a gating score, NOT a crop classification confidence.

        It combines:
        - green coverage
        - ExG
        - plant-related ImageNet predictions
        - absence of strong non-crop predictions
        """

        green_ratio = float(
            foliage.get(
                "green_ratio",
                0.0,
            )
        )

        plant_tissue_ratio = float(
            foliage.get(
                "plant_tissue_ratio",
                0.0,
            )
        )

        mean_exg = float(
            foliage.get(
                "mean_exg",
                0.0,
            )
        )

        deep_non_crop = bool(
            predictions.get(
                "deep_non_crop",
                False,
            )
        )

        top_score = float(
            predictions.get(
                "top_score",
                0.0,
            )
        )

        top_label = (
            predictions.get(
                "top_label",
                "",
            )
            or ""
        ).lower()

        # ---------------------------------------------------------------
        # Base score from visual vegetation
        # ---------------------------------------------------------------

        score = 0.0

        # Green coverage
        score += min(
            green_ratio / 0.35,
            1.0,
        ) * 55.0

        # Plant tissue estimate
        score += min(
            plant_tissue_ratio / 0.45,
            1.0,
        ) * 25.0

        # Positive ExG
        if mean_exg > 0.03:
            score += 10.0

        # ---------------------------------------------------------------
        # ImageNet semantic evidence
        # ---------------------------------------------------------------

        if any(
            keyword in top_label
            for keyword in PLANT_GENERAL_KEYWORDS
        ):
            score += min(
                top_score * 20.0,
                20.0,
            )

        # Known produce
        if predictions.get("recognized_crop"):
            score += 20.0

        # Strong non-crop evidence
        if deep_non_crop:

            # If ImageNet is strongly confident in an object,
            # reduce plant likelihood significantly.
            if top_score >= 0.35:
                score -= 60.0
            else:
                score -= 35.0

        return float(
            max(
                0.0,
                min(
                    100.0,
                    score,
                ),
            )
        )

    # -----------------------------------------------------------------------
    # MAIN EVALUATION
    # -----------------------------------------------------------------------

    def evaluate_plant_or_non_crop(
        self,
        img_bgr: np.ndarray,
    ) -> Dict[str, Any]:
        """
        Main plant/non-crop evaluation function.

        Returns a dictionary consumed by inference.py.
        """

        # ===============================================================
        # STEP 1 - IMAGE QUALITY
        # ===============================================================

        (
            is_quality_ok,
            quality_msg,
            quality_metrics,
        ) = self.validate_image_quality(
            img_bgr
        )

        if not is_quality_ok:

            return {
                "is_crop": False,
                "is_quality_valid": False,
                "classification_status": "quality_rejected",
                "detected_object": "Low Quality Image",
                "confidence": 0.0,
                "crop_confidence": 0.0,
                "detected_crop": None,
                "rejection_reason": quality_msg,
                "quality_metrics": quality_metrics,
                "foliage_metrics": {},
                "top_classes": [],
                "plant_likelihood": 0.0,
                "message": quality_msg,
            }

        # ===============================================================
        # STEP 2 - REAL FOLIAGE ANALYSIS
        # ===============================================================

        foliage = self.compute_foliage_metrics(
            img_bgr
        )

        plant_tissue_ratio = float(
            foliage["plant_tissue_ratio"]
        )

        mean_exg = float(
            foliage["mean_exg"]
        )

        green_ratio = float(
            foliage["green_ratio"]
        )

        # ===============================================================
        # STEP 3 - DEEP VISION
        # ===============================================================

        predictions = self._run_imagenet_prediction(
            img_bgr
        )

        top_predictions = predictions[
            "top_predictions"
        ]

        top_score_pct = float(
            predictions["top_score"]
        ) * 100.0

        recognized_crop = predictions[
            "recognized_crop"
        ]

        crop_confidence = float(
            predictions["crop_confidence"]
        )

        is_deep_non_crop = bool(
            predictions["deep_non_crop"]
        )

        non_crop_name = predictions[
            "non_crop_name"
        ]

        # ===============================================================
        # STEP 4 - PLANT LIKELIHOOD
        # ===============================================================

        plant_likelihood = (
            self._calculate_plant_likelihood(
                foliage,
                predictions,
            )
        )

        # ===============================================================
        # STEP 5 - HARD NON-CROP GATE
        # ===============================================================
        #
        # Important:
        # We reject clear unrelated objects before crop analysis.
        #

        if is_deep_non_crop:

            # Strong object prediction + weak vegetation
            if (
                top_score_pct >= 30.0
                and plant_tissue_ratio < 0.30
            ):

                return {
                    "is_crop": False,
                    "is_quality_valid": True,
                    "classification_status": "not_a_crop",
                    "detected_object": (
                        non_crop_name
                        or "Unrelated Non-Crop Object"
                    ),
                    "confidence": round(
                        top_score_pct,
                        1,
                    ),
                    "crop_confidence": 0.0,
                    "detected_crop": None,
                    "rejection_reason": (
                        "The image is dominated by "
                        "a non-vegetation object."
                    ),
                    "foliage_metrics": foliage,
                    "quality_metrics": quality_metrics,
                    "top_classes": top_predictions,
                    "plant_likelihood": round(
                        plant_likelihood,
                        1,
                    ),
                    "message": (
                        "The uploaded image does not "
                        "appear to contain a recognizable "
                        "crop or plant."
                    ),
                }

            # Very strong non-crop prediction
            if top_score_pct >= 55.0:

                return {
                    "is_crop": False,
                    "is_quality_valid": True,
                    "classification_status": "not_a_crop",
                    "detected_object": (
                        non_crop_name
                        or "Unrelated Non-Crop Object"
                    ),
                    "confidence": round(
                        top_score_pct,
                        1,
                    ),
                    "crop_confidence": 0.0,
                    "detected_crop": None,
                    "rejection_reason": (
                        "The uploaded image was "
                        "strongly classified as an "
                        "unrelated object."
                    ),
                    "foliage_metrics": foliage,
                    "quality_metrics": quality_metrics,
                    "top_classes": top_predictions,
                    "plant_likelihood": round(
                        plant_likelihood,
                        1,
                    ),
                    "message": (
                        "The uploaded image does not "
                        "appear to contain a recognizable "
                        "crop or plant."
                    ),
                }

        # ===============================================================
        # STEP 6 - HARD VEGETATION GATE
        # ===============================================================
        #
        # Very little vegetation means we should not call it a plant.
        #

        if (
            plant_tissue_ratio < 0.055
            and green_ratio < 0.035
            and mean_exg < 0.015
        ):

            obj_name = (
                top_predictions[0]["label"]
                if top_predictions
                else "Non-Vegetative Surface"
            )

            return {
                "is_crop": False,
                "is_quality_valid": True,
                "classification_status": "not_a_crop",
                "detected_object": obj_name,
                "confidence": (
                    top_predictions[0]["score"]
                    if top_predictions
                    else 0.0
                ),
                "crop_confidence": 0.0,
                "detected_crop": None,
                "rejection_reason": (
                    "Insufficient vegetation detected. "
                    "The image does not contain enough "
                    "visual evidence of plant tissue."
                ),
                "foliage_metrics": foliage,
                "quality_metrics": quality_metrics,
                "top_classes": top_predictions,
                "plant_likelihood": round(
                    plant_likelihood,
                    1,
                ),
                "message": (
                    "The uploaded image does not "
                    "appear to contain a recognizable "
                    "crop or plant."
                ),
            }

        # ===============================================================
        # STEP 7 - LOW-CONFIDENCE PLANT
        # ===============================================================
        #
        # There is vegetation, but we cannot reliably identify a crop.
        #
        # IMPORTANT:
        # We return is_crop=True here because the image appears to
        # contain plant material. inference.py can then produce the
        # required LOW CONFIDENCE result.
        #

        if (
            recognized_crop is None
            or crop_confidence < 30.0
        ):

            return {
                "is_crop": True,
                "is_quality_valid": True,
                "classification_status": "plant_detected",
                "detected_object": (
                    "Agricultural Plant / Vegetation"
                ),
                "detected_crop": None,
                "crop_confidence": 0.0,
                "confidence": round(
                    plant_likelihood,
                    1,
                ),
                "rejection_reason": (
                    "Plant vegetation detected, "
                    "but crop identity is not "
                    "reliable enough."
                ),
                "foliage_metrics": foliage,
                "quality_metrics": quality_metrics,
                "top_classes": top_predictions,
                "plant_likelihood": round(
                    plant_likelihood,
                    1,
                ),
                "message": (
                    "Plant / Crop vegetation verified, "
                    "but crop identification is "
                    "low confidence."
                ),
            }

        # ===============================================================
        # STEP 8 - RECOGNIZED PLANT / PRODUCE
        # ===============================================================

        return {
            "is_crop": True,
            "is_quality_valid": True,
            "classification_status": "plant_detected",
            "detected_object": recognized_crop,
            "detected_crop": recognized_crop,
            "crop_confidence": round(
                crop_confidence,
                1,
            ),
            "confidence": round(
                crop_confidence,
                1,
            ),
            "foliage_metrics": foliage,
            "quality_metrics": quality_metrics,
            "top_classes": top_predictions,
            "plant_likelihood": round(
                plant_likelihood,
                1,
            ),
            "message": (
                "Plant / Crop vegetation verified "
                "and a supported crop/produce class "
                "was recognized."
            ),
        }


# ---------------------------------------------------------------------------
# GLOBAL SINGLETON
# ---------------------------------------------------------------------------

plant_detector = PlantDetector()