import cv2
import numpy as np
import base64
from typing import Tuple, Dict, Any

def load_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    """Decode raw image bytes to OpenCV BGR numpy array."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid or corrupted image format. OpenCV cannot decode bytes.")
    return img

def to_base64(img: np.ndarray, format: str = ".jpg", quality: int = 85) -> str:
    """Encode OpenCV BGR or Gray image to base64 data URL."""
    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality] if format == ".jpg" else []
    success, buffer = cv2.imencode(format, img, encode_params)
    if not success:
        raise ValueError("Failed to encode image to base64")
    b64_str = base64.b64encode(buffer).decode('utf-8')
    mime = "image/jpeg" if format == ".jpg" else "image/png"
    return f"data:{mime};base64,{b64_str}"

def compute_quality_metrics(img_bgr: np.ndarray) -> Dict[str, Any]:
    """Calculate real image quality indicators: blur (Laplacian var), brightness, contrast."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(np.mean(gray))
    contrast = float(np.std(gray))
    
    if blur_score < 60.0:
        sharpness = "Blurry"
    elif blur_score < 150.0:
        sharpness = "Acceptable"
    else:
        sharpness = "Sharp"
        
    return {
        "blur_score": round(blur_score, 1),
        "brightness": round(brightness, 1),
        "contrast": round(contrast, 1),
        "sharpness": sharpness
    }

def process_pipeline(image_bytes: bytes, target_size: Tuple[int, int] = (224, 224)) -> Dict[str, Any]:
    """
    Real OpenCV 4-Stage Preprocessing Pipeline:
    1. Original Image Decode
    2. Resized Image (224x224, cv2.INTER_AREA)
    3. Noise reduction & CLAHE Enhancement (LAB color space)
    4. RGB Tensor Normalization ([0, 1] float32)
    """
    # 1. Original Decode
    original_bgr = load_image_from_bytes(image_bytes)
    h, w, c = original_bgr.shape
    quality = compute_quality_metrics(original_bgr)
    
    # 2. Resized Image
    resized_bgr = cv2.resize(original_bgr, target_size, interpolation=cv2.INTER_AREA)
    
    # 3. Noise Reduction + CLAHE Enhancement
    blurred = cv2.GaussianBlur(resized_bgr, (3, 3), 0)
    lab = cv2.cvtColor(blurred, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)
    enhanced_lab = cv2.merge((cl, a_channel, b_channel))
    enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    
    # 4. RGB Conversion & Tensor Normalization
    rgb_img = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
    norm_tensor = rgb_img.astype(np.float32) / 255.0  # Range [0.0, 1.0]
    
    # Normalized pseudo-color visualization for UI display
    tensor_vis = cv2.applyColorMap((norm_tensor[:, :, 1] * 255).astype(np.uint8), cv2.COLORMAP_VIRIDIS)
    
    return {
        "original_bgr": original_bgr,
        "enhanced_bgr": enhanced_bgr,
        "rgb_tensor": norm_tensor,
        "original_b64": to_base64(original_bgr),
        "resized_b64": to_base64(resized_bgr),
        "enhanced_b64": to_base64(enhanced_bgr),
        "tensor_norm_b64": to_base64(tensor_vis),
        "dimensions": {
            "width": int(w),
            "height": int(h),
            "channels": int(c)
        },
        "quality": quality
    }
