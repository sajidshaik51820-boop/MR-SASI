from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class HealthCheck(BaseModel):
    status: str
    timestamp: str
    model_loaded: bool
    model_name: str
    classes_count: int
    db_connected: bool

class QualityMetrics(BaseModel):
    blur_score: Optional[float] = None
    brightness: Optional[float] = None
    contrast: Optional[float] = None
    sharpness: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    status: Optional[str] = None

class Dimensions(BaseModel):
    width: int
    height: int
    channels: int

class PreprocessResponse(BaseModel):
    original_b64: str
    resized_b64: str
    enhanced_b64: str
    tensor_norm_b64: str
    dimensions: Dimensions
    quality: QualityMetrics
    processing_time_ms: float

class TopPrediction(BaseModel):
    crop: Optional[str] = None
    disease: Optional[str] = None
    confidence: Optional[float] = None
    score: Optional[float] = None
    label: Optional[str] = None
    health_status: Optional[str] = None

class PredictResponse(BaseModel):
    scan_id: Optional[int] = None
    is_crop: bool = True
    is_quality_valid: bool = True
    classification_status: str = "plant_detected"  # "plant_detected", "not_a_crop", "quality_rejected"
    message: str
    rejection_reason: Optional[str] = None
    detected_object: Optional[str] = None
    detected_confidence: Optional[float] = None

    # Crop Identification
    crop: Optional[str] = None
    crop_confidence: Optional[float] = None

    # Health & Disease
    health_status: Optional[str] = None
    disease: Optional[str] = None
    disease_confidence: Optional[float] = None
    risk_level: Optional[str] = None
    pathogen: Optional[str] = None
    affected_ratio: Optional[float] = None

    # Growth Stage
    growth_stage: Optional[str] = None
    growth_stage_info: Optional[Dict[str, Any]] = None

    # Sustainable Guidance & Symptoms
    visible_symptoms: Optional[str] = None
    sustainable_care: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    next_steps: Optional[List[str]] = None

    # Visual Heatmap & Processing
    original_b64: Optional[str] = None
    resized_b64: Optional[str] = None
    enhanced_b64: Optional[str] = None
    tensor_norm_b64: Optional[str] = None
    attention_heatmap_b64: Optional[str] = None
    overlay_b64: Optional[str] = None

    # Metas
    top_predictions: Optional[List[Dict[str, Any]]] = None
    foliage_metrics: Optional[Dict[str, Any]] = None
    quality_metrics: Optional[Dict[str, Any]] = None
    processing_time_ms: float = 0.0
    model_version: Optional[str] = None
    disclaimer: Optional[str] = None

class RemoteSensingResponse(BaseModel):
    original_b64: str
    vegetation_mask_b64: str
    health_map_b64: str
    stress_heatmap_b64: str
    vegetation_coverage_pct: float
    healthy_area_pct: float
    moderate_stress_pct: float
    severe_stress_pct: float
    mean_index_score: float
    index_type: str
    risk_level: str
    analysis_summary: str
    recommendations: List[str]
    processing_time_ms: float

class TrainConfig(BaseModel):
    dataset_path: str = "datasets/plantvillage"
    backbone: str = "MobileNetV2"
    epochs: int = 5
    batch_size: int = 16
    learning_rate: float = 0.001
    validation_split: float = 0.2

class TrainResponse(BaseModel):
    status: str
    message: str
    epochs_trained: int
    train_accuracy: float
    val_accuracy: float
    train_loss: float
    val_loss: float
    model_saved_path: str

class EvaluateResponse(BaseModel):
    status: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    classes: List[str]
    classification_report: Dict[str, Any]
