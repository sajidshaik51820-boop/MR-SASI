import os
import time
from datetime import datetime

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Database
from .database import (
    init_db,
    get_all_scans,
    get_scan_stats,
    delete_scan,
    clear_all_scans,
)

# API Schemas
from .schemas import (
    HealthCheck,
    PreprocessResponse,
    PredictResponse,
    RemoteSensingResponse,
    TrainConfig,
    TrainResponse,
    EvaluateResponse,
)

# Image Processing
from .preprocessing.cv_pipeline import process_pipeline
from .preprocessing.remote_sensing import analyze_remote_sensing_image

# Machine Learning
from .ml.inference import engine, CLASS_METADATA
from .ml.acrnn import get_architecture_breakdown
from .ml.train import train_acrnn
from .ml.evaluate import evaluate_model
from .ml.growth_engine import get_growth_framework_for_crop, estimate_growth_stage
from .knowledge.crop_database import (
    CROPS_DATABASE,
    PEST_AND_DISEASE_FRAMEWORK,
    get_crop_knowledge,
    get_all_supported_crops,
)

# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Smart Crop Health, Disease, Growth & Sustainable Care AI API",
    description=(
        "Full-Stack Agricultural Computer Vision & Deep Learning Backend "
        "featuring strict non-crop detection, image quality verification, "
        "crop-specific growth stage tracking, and sustainable IPM management."
    ),
    version="2.0.0",
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# DATABASE STARTUP
# ============================================================

@app.on_event("startup")
def startup_event():
    init_db()
    print("[SERVER] Smart Crop Health Backend running on FastAPI.")

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health", response_model=HealthCheck)
def health_check():
    return {
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": engine.is_loaded,
        "model_name": engine.model_name,
        "classes_count": len(CLASS_METADATA),
        "db_connected": True,
    }

# ============================================================
# IMAGE PREPROCESSING
# ============================================================

@app.post("/api/preprocess", response_model=PreprocessResponse)
async def preprocess_image_endpoint(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be a valid image (JPG, JPEG, PNG).",
        )

    start_time = time.time()
    image_bytes = await file.read()

    if len(image_bytes) > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image file exceeds maximum allowable size (20MB).",
        )

    try:
        pipeline_result = process_pipeline(image_bytes)
    except Exception as error:
        raise HTTPException(
            status_code=422,
            detail=f"Image preprocessing failed: {error}",
        )

    elapsed_ms = (time.time() - start_time) * 1000

    return {
        "original_b64": pipeline_result["original_b64"],
        "resized_b64": pipeline_result["resized_b64"],
        "enhanced_b64": pipeline_result["enhanced_b64"],
        "tensor_norm_b64": pipeline_result["tensor_norm_b64"],
        "dimensions": pipeline_result["dimensions"],
        "quality": pipeline_result["quality"],
        "processing_time_ms": round(elapsed_ms, 1),
    }

# ============================================================
# CROP DISEASE & HEALTH PREDICTION (STRICT GATING)
# ============================================================

@app.post("/api/predict", response_model=PredictResponse)
async def predict_endpoint(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be a valid image (JPG, JPEG, PNG).",
        )

    image_bytes = await file.read()

    if len(image_bytes) > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image file exceeds maximum allowable size (20MB).",
        )

    try:
        result = engine.predict_crop(
            image_bytes,
            image_name=file.filename or "uploaded_image.jpg",
        )
        return result
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Inference error: {error}",
        )

# ============================================================
# REMOTE SENSING ANALYSIS (VARI, ExG, GLI)
# ============================================================

@app.post("/api/remote-sensing", response_model=RemoteSensingResponse)
async def remote_sensing_endpoint(
    file: UploadFile = File(...),
    index_type: str = Form("VARI"),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be a valid image (JPG, JPEG, PNG).",
        )

    image_bytes = await file.read()

    if len(image_bytes) > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image file exceeds maximum allowable size (20MB).",
        )

    start_time = time.time()

    try:
        analysis = analyze_remote_sensing_image(
            image_bytes,
            index_type=index_type,
        )
        analysis["processing_time_ms"] = round(
            (time.time() - start_time) * 1000,
            1,
        )
        return analysis
    except Exception as error:
        raise HTTPException(
            status_code=422,
            detail=f"Remote sensing analysis failed: {error}",
        )

# ============================================================
# SCAN HISTORY & DASHBOARD
# ============================================================

@app.get("/api/history")
def get_history(limit: int = Query(default=50, ge=1, le=200)):
    scans = get_all_scans(limit=limit)
    stats = get_scan_stats()
    return {
        "scans": scans,
        "stats": stats,
    }

@app.delete("/api/history/{scan_id}")
def delete_scan_record(scan_id: int):
    success = delete_scan(scan_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Scan record not found.",
        )
    return {"message": f"Scan {scan_id} deleted successfully."}

@app.delete("/api/history")
def clear_all_history():
    clear_all_scans()
    return {"message": "All scan history cleared."}

# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/api/model-info")
def model_information():
    model_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "models",
        "acrnn_weights.h5",
    )

    return {
        "status": "ready" if engine.is_loaded else "baseline_diagnostic",
        "model_name": engine.model_name,
        "framework": "TensorFlow / Keras 3.x",
        "input_size": "224x224x3 RGB",
        "architecture": get_architecture_breakdown(),
        "classes": CLASS_METADATA,
        "total_classes": len(CLASS_METADATA),
        "model_file_exists": os.path.exists(model_path),
        "local_processing": True,
        "unrelated_image_gate": "MobileNetV2 ImageNet + OpenCV Foliage Biometrics (ExG / VARI / Chlorophyll Spectrum)",
        "limitations": [
            "Cannot diagnose systemic soil root rot solely from close-up leaf photographs without soil sampling.",
            "Chemical pesticides must never be auto-prescribed without confirmed local laboratory/extension verification.",
            "True satellite/drone NDVI requires calibrated Near-Infrared (NIR) sensors; RGB cameras compute VARI / ExG vegetation indices."
        ]
    }

# ============================================================
# CROP KNOWLEDGE & GROWTH ENDPOINTS
# ============================================================

@app.get("/api/crops")
def list_crops():
    """Returns list of supported agricultural crops."""
    return {"crops": get_all_supported_crops()}

@app.get("/api/crops/{crop_name}")
def get_crop_detail(crop_name: str):
    """Returns complete agronomic profile for a specific crop."""
    crop = get_crop_knowledge(crop_name)
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found in knowledge database.")
    return crop

@app.get("/api/growth-stages/{crop_name}")
def get_crop_growth_framework(crop_name: str):
    """Returns crop-specific growth stage timeline and agronomic checklists."""
    framework = get_growth_framework_for_crop(crop_name)
    if not framework:
        raise HTTPException(status_code=404, detail=f"Growth framework for '{crop_name}' not found.")
    return framework

@app.get("/api/pest-management")
def get_pest_management_framework():
    """Returns 4-tier Integrated Pest and Disease Management guide."""
    return PEST_AND_DISEASE_FRAMEWORK

@app.get("/api/diseases")
def list_all_diseases():
    """Returns directory of all known diseases across supported crops."""
    diseases = []
    for crop_name, crop_data in CROPS_DATABASE.items():
        for d in crop_data.get("common_diseases", []):
            diseases.append({
                "crop": crop_name,
                "name": d["name"],
                "pathogen": d.get("pathogen", "Unspecified"),
                "symptoms": d.get("symptoms", ""),
                "causes": d.get("causes", ""),
                "affected_parts": d.get("affected_parts", "Leaves"),
                "risk": d.get("risk", "Medium")
            })
    return {"diseases": diseases, "total": len(diseases)}

# ============================================================
# MODEL TRAINING & EVALUATION (OPTIONAL DEV ENDPOINTS)
# ============================================================

@app.post("/api/train", response_model=TrainResponse)
def train_endpoint(config: TrainConfig):
    result = train_acrnn(
        dataset_path=config.dataset_path,
        backbone=config.backbone,
        epochs=config.epochs,
        batch_size=config.batch_size,
        learning_rate=config.learning_rate,
        val_split=config.validation_split,
    )
    if result.get("status") == "success":
        engine._load_custom_acrnn()
    return result

@app.get("/api/evaluate", response_model=EvaluateResponse)
def evaluate_endpoint(dataset_path: str = Query(default="datasets/plantvillage")):
    return evaluate_model(dataset_path=dataset_path)

# ============================================================
# FRONTEND STATIC FILES (PRODUCTION DEPLOYMENT)
# ============================================================

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(PROJECT_ROOT, "frontend", "dist")

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        requested_file = os.path.join(DIST_DIR, full_path)
        if os.path.exists(requested_file) and os.path.isfile(requested_file):
            return FileResponse(requested_file)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

# ============================================================
# DIRECT RUN
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)