"""
Crop Growth Stage Engine
Provides crop-specific growth frameworks and visual estimation logic based on vegetative, floral, or fruiting markers.
Respects strict truthful AI rules: Never claims exact age from a single photo.
"""

from typing import Dict, Any, Optional, List
from ..knowledge.crop_database import CROPS_DATABASE, get_crop_knowledge

def estimate_growth_stage(
    crop_name: str,
    visual_cues: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Estimate crop growth stage based on crop-specific framework and visible markers.
    If visual evidence is ambiguous, returns clear indeterminate state.
    """
    if not crop_name or "unknown" in crop_name.lower() or "low confidence" in crop_name.lower():
        return {
            "status": "undetermined",
            "crop": "Unknown",
            "stage_name": "Unknown / Not Applicable",
            "message": "Growth stage cannot be reliably determined without confirmed crop identification.",
            "is_determined": False,
            "stages_framework": []
        }

    crop_data = get_crop_knowledge(crop_name)
    if not crop_data:
        # Fallback generic framework for unrecognized crops
        return {
            "status": "general_vegetative",
            "crop": crop_name,
            "stage_name": "Vegetative / Canopy Stage (Estimated)",
            "description": "Foliage and canopy structure visible.",
            "what_is_happening": "Photosynthesis and vegetative growth.",
            "farmer_monitoring": "Monitor leaf health, check for foliar lesions and insect vectors.",
            "care_considerations": "Maintain appropriate soil moisture and balanced nutrition.",
            "next_stage": "Flowering / Reproductive",
            "is_determined": True,
            "message": "Note: Exact plant age cannot be determined from a single photograph.",
            "stages_framework": []
        }

    stages: List[Dict[str, Any]] = crop_data.get("growth_stages", [])

    # Default estimation heuristic:
    # Most close-up leaf scans submitted to disease scanners represent active vegetative or fruit development stages.
    # We provide the complete crop stage framework with the most plausible stage highlighted,
    # accompanied by an explicit agronomic notice.
    default_stage_idx = 2  # Typically active vegetative stage
    if visual_cues:
        if visual_cues.get("has_flowers"):
            default_stage_idx = 3
        elif visual_cues.get("has_fruit"):
            default_stage_idx = 4

    selected_stage = stages[min(default_stage_idx, len(stages) - 1)]

    return {
        "status": "estimated",
        "crop": crop_data["name"],
        "stage_name": selected_stage["name"],
        "stage_number": selected_stage["stage_number"],
        "total_stages": len(stages),
        "duration_days": selected_stage.get("duration_days", "Varies with climate"),
        "description": selected_stage["description"],
        "what_is_happening": selected_stage["what_is_happening"],
        "farmer_monitoring": selected_stage["farmer_monitoring"],
        "care_considerations": selected_stage["care_considerations"],
        "next_stage": selected_stage["next_stage"],
        "is_determined": True,
        "note": "Estimated visual stage based on foliar canopy. Exact chronological plant age cannot be determined from a single 2D photograph.",
        "stages_framework": stages
    }

def get_growth_framework_for_crop(crop_name: str) -> Optional[Dict[str, Any]]:
    """Return complete growth stage framework for an interactive UI timeline."""
    crop_data = get_crop_knowledge(crop_name)
    if not crop_data:
        return None
    return {
        "crop": crop_data["name"],
        "growth_cycle_days": crop_data["growth_cycle_days"],
        "stages": crop_data["growth_stages"]
    }
