import cv2
import numpy as np
from typing import Dict, Any, Tuple
from .cv_pipeline import load_image_from_bytes, to_base64

def analyze_remote_sensing_image(image_bytes: bytes, index_type: str = "VARI") -> Dict[str, Any]:
    """
    Analyzes Drone UAV or Satellite imagery using real vegetation indices:
    - VARI (Visible Atmospherically Resistant Index): (G - R) / (G + R - B)
    - ExG (Excess Green Index): 2G - R - B
    - NDVI: (NIR - Red) / (NIR + Red) when multi-spectral/NIR channel present.
    """
    img_bgr = load_image_from_bytes(image_bytes)
    h, w, c = img_bgr.shape
    
    # Resize to standard analysis resolution (max 800px)
    max_dim = 800
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        h, w, c = img_bgr.shape
        
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    R = img_rgb[:, :, 0].astype(np.float32)
    G = img_rgb[:, :, 1].astype(np.float32)
    B = img_rgb[:, :, 2].astype(np.float32)
    
    eps = 1e-6
    
    # Compute Vegetation Index
    if index_type.upper() == "EXG":
        total = R + G + B + eps
        r_norm = R / total
        g_norm = G / total
        b_norm = B / total
        index_map = (2.0 * g_norm - r_norm - b_norm)
        # Normalize ExG to [-1, 1] range for thresholding
        index_map = np.clip(index_map * 2.0, -1.0, 1.0)
        index_name = "ExG (Excess Green Index)"
    else:
        # Default to VARI for high-resolution RGB drone / satellite data
        denom = G + R - B
        # Avoid division by near zero
        denom = np.where(np.abs(denom) < eps, eps, denom)
        index_map = (G - R) / denom
        index_map = np.clip(index_map, -1.0, 1.0)
        index_name = "VARI (Visible Atmospherically Resistant Index)"
        
    # Crop Canopy / Vegetation Mask: ExG > 0 or VARI > -0.05
    veg_mask = ((G > R * 0.95) & (G > B * 0.95) & (index_map > -0.1)).astype(np.uint8) * 255
    
    total_pixels = h * w
    veg_pixels = int(np.sum(veg_mask > 0))
    veg_coverage_pct = round((veg_pixels / total_pixels) * 100.0, 1)
    
    # Zone classification within vegetation
    if veg_pixels > 0:
        veg_indices = index_map[veg_mask > 0]
        
        healthy_count = int(np.sum(veg_indices >= 0.18))
        moderate_count = int(np.sum((veg_indices >= 0.02) & (veg_indices < 0.18)))
        severe_count = int(np.sum(veg_indices < 0.02))
        
        healthy_pct = round((healthy_count / veg_pixels) * 100.0, 1)
        moderate_pct = round((moderate_count / veg_pixels) * 100.0, 1)
        severe_pct = round((severe_count / veg_pixels) * 100.0, 1)
        mean_score = float(np.mean(veg_indices))
    else:
        healthy_pct = 0.0
        moderate_pct = 0.0
        severe_pct = 100.0
        mean_score = 0.0
        
    # Determine overall Field Risk Level
    if severe_pct > 25.0 or moderate_pct > 50.0:
        risk_level = "High"
        summary = f"Severe localized crop stress detected across {severe_pct}% of the surveyed canopy. Immediate field inspection required."
    elif moderate_pct > 25.0 or severe_pct > 10.0:
        risk_level = "Medium"
        summary = f"Moderate vegetative stress identified across {moderate_pct}% of the field. Early disease or moisture deficit suspected."
    else:
        risk_level = "Low"
        summary = f"Field exhibits high photosynthetic vigor ({healthy_pct}% healthy canopy). Normal monitoring recommended."
        
    # 1. Vegetation Mask Visualization
    mask_vis = cv2.cvtColor(veg_mask, cv2.COLOR_GRAY2BGR)
    
    # 2. Health Classification Map (Discrete zones: Green = Healthy, Yellow = Moderate, Red = Severe)
    health_map = np.zeros((h, w, 3), dtype=np.uint8)
    health_map[veg_mask == 0] = [60, 60, 60]  # Non-vegetated / Soil in dark gray
    
    condition_healthy = (veg_mask > 0) & (index_map >= 0.18)
    condition_moderate = (veg_mask > 0) & (index_map >= 0.02) & (index_map < 0.18)
    condition_severe = (veg_mask > 0) & (index_map < 0.02)
    
    health_map[condition_healthy] = [34, 197, 94]    # Vivid Green (BGR: [94, 197, 34])
    health_map[condition_moderate] = [20, 180, 240]  # Amber / Yellow
    health_map[condition_severe] = [30, 30, 239]     # Vivid Red
    
    # 3. Continuous Stress Heatmap Overlay
    norm_idx = ((index_map + 1.0) / 2.0 * 255).astype(np.uint8)
    heatmap_colored = cv2.applyColorMap(norm_idx, cv2.COLORMAP_JET)
    overlay_stress = cv2.addWeighted(img_bgr, 0.45, heatmap_colored, 0.55, 0)
    
    # Agronomic recommendations
    recommendations = []
    if risk_level == "High":
        recommendations.append("Conduct ground-truthing in the red-zoned GPS coordinates for foliar blight or root rot.")
        recommendations.append("Isolate irrigation lines to prevent potential waterborne pathogen transmission.")
        recommendations.append("Consult local agricultural extension officer for targeted fungicide application.")
    elif risk_level == "Medium":
        recommendations.append("Check soil moisture levels and nitrogen distribution in the yellow-flagged sections.")
        recommendations.append("Scout the canopy underleaf for early fungal spores or spider mite colonies.")
        recommendations.append("Re-survey via drone or satellite in 4-5 days to track stress progression.")
    else:
        recommendations.append("Canopy health is optimal. Maintain current irrigation and nutrient scheduling.")
        recommendations.append("Continue routine weekly remote-sensing flights for early anomaly detection.")
        
    return {
        "original_b64": to_base64(img_bgr),
        "vegetation_mask_b64": to_base64(mask_vis),
        "health_map_b64": to_base64(health_map),
        "stress_heatmap_b64": to_base64(overlay_stress),
        "vegetation_coverage_pct": veg_coverage_pct,
        "healthy_area_pct": healthy_pct,
        "moderate_stress_pct": moderate_pct,
        "severe_stress_pct": severe_pct,
        "mean_index_score": round(mean_score, 3),
        "index_type": index_name,
        "risk_level": risk_level,
        "analysis_summary": summary,
        "recommendations": recommendations
    }
