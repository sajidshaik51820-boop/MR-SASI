"""
Comprehensive Automated Test Suite
Covers:
1. Backend Health
2. Rock image upload -> STRICT REJECTION as NOT A CROP IMAGE (never Tomato, Potato, etc.)
3. Car / Non-crop object upload -> NOT A CROP IMAGE
4. Blurry image -> Image quality insufficient
5. Corrupted bytes -> Corrupted format rejection
6. Valid plant leaf -> Plant detected, OpenCV pipeline, Attention heatmap
7. Crop growth stages framework
8. SQLite database persistence and statistics
9. Remote sensing VARI/ExG index calculation
"""

import sys
import os
import unittest
import numpy as np
import cv2

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from ml.inference import engine
from database import init_db, add_scan, get_all_scans, get_scan_stats, delete_scan
from preprocessing.cv_pipeline import process_pipeline
from preprocessing.remote_sensing import analyze_remote_sensing_image
from ml.growth_engine import get_growth_framework_for_crop, estimate_growth_stage
from knowledge.crop_database import get_crop_knowledge, get_all_supported_crops

def create_synthetic_rock_image() -> bytes:
    """Creates a synthetic gray/slate rock image with rough mineral noise and zero chlorophyll."""
    np.random.seed(42)
    # Grayish mineral tones (BGR: ~120, 120, 120) with high frequency gravel noise
    base = np.full((256, 256, 3), 115, dtype=np.uint8)
    noise = np.random.normal(0, 25, (256, 256, 3)).astype(np.int16)
    rock = np.clip(base.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    # Add darker fissures/cracks
    for _ in range(5):
        pt1 = (np.random.randint(0, 256), np.random.randint(0, 256))
        pt2 = (np.random.randint(0, 256), pt1[1] + np.random.randint(-30, 30))
        cv2.line(rock, pt1, pt2, (60, 60, 60), 2)
    _, buf = cv2.imencode(".jpg", rock)
    return buf.tobytes()

def create_synthetic_car_image() -> bytes:
    """Creates a synthetic image with metallic blue/silver rectilinear vehicle features."""
    img = np.full((256, 256, 3), (220, 220, 220), dtype=np.uint8)
    # Blue metallic car chassis
    cv2.rectangle(img, (30, 100), (225, 180), (180, 50, 20), -1)
    # Windshield / Cabin
    cv2.rectangle(img, (70, 60), (185, 100), (80, 80, 80), -1)
    # Black wheels
    cv2.circle(img, (70, 185), 25, (20, 20, 20), -1)
    cv2.circle(img, (185, 185), 25, (20, 20, 20), -1)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()

def create_synthetic_leaf_image() -> bytes:
    """Creates a synthetic healthy green plant leaf image with rich chlorophyll hue."""
    img = np.full((256, 256, 3), (240, 240, 240), dtype=np.uint8)
    # Draw green elliptical leaf blade (BGR: 35, 160, 45)
    center = (128, 128)
    axes = (60, 110)
    cv2.ellipse(img, center, axes, 25, 0, 360, (35, 160, 45), -1)
    # Central vein and secondary veins (lighter green)
    cv2.line(img, (128, 20), (128, 235), (65, 200, 75), 3)
    for y in range(50, 220, 25):
        cv2.line(img, (128, y), (128 - 35, y - 15), (65, 200, 75), 1)
        cv2.line(img, (128, y), (128 + 35, y - 15), (65, 200, 75), 1)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()

def create_blurry_image() -> bytes:
    """Creates a severely blurred image (Laplacian variance < 20)."""
    img = np.full((256, 256, 3), (120, 140, 120), dtype=np.uint8)
    blurred = cv2.GaussianBlur(img, (45, 45), 0)
    _, buf = cv2.imencode(".jpg", blurred)
    return buf.tobytes()

class FullAgriculturalTestSuite(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()

    def test_01_rock_image_strict_rejection(self):
        """CRITICAL: Upload a rock image -> MUST reject as NOT A CROP IMAGE with NO crop prediction."""
        rock_bytes = create_synthetic_rock_image()
        result = engine.predict_crop(rock_bytes, image_name="granite_rock.jpg")

        # Must NOT be identified as a crop
        self.assertFalse(result["is_crop"], "A rock image was incorrectly classified as a crop!")
        self.assertEqual(result["classification_status"], "not_a_crop")

        # Rejection message must match specification
        self.assertIn("does not appear to contain a recognizable crop or plant", result["message"])

        # MUST NOT guess a crop name (Must be None)
        self.assertIsNone(result["crop"], f"System guessed crop '{result['crop']}' for a rock!")
        self.assertIsNone(result["crop_confidence"])

        # MUST NOT guess a disease
        self.assertIsNone(result["disease"], f"System guessed disease '{result['disease']}' for a rock!")
        self.assertIsNone(result["disease_confidence"])

        # MUST NOT generate growth stage or pesticide recommendations
        self.assertIsNone(result["growth_stage"])
        self.assertEqual(len(result["recommendations"]), 0)

    def test_02_car_vehicle_rejection(self):
        """Test vehicle/man-made object rejection."""
        car_bytes = create_synthetic_car_image()
        result = engine.predict_crop(car_bytes, image_name="sports_car.jpg")

        self.assertFalse(result["is_crop"], "A vehicle was incorrectly classified as a crop!")
        self.assertEqual(result["classification_status"], "not_a_crop")
        self.assertIsNone(result["crop"])
        self.assertIsNone(result["disease"])

    def test_03_blurry_image_quality_check(self):
        """Test low quality / severely blurred image rejection."""
        blurry_bytes = create_blurry_image()
        result = engine.predict_crop(blurry_bytes, image_name="blurry_leaf.jpg")

        self.assertFalse(result["is_quality_valid"])
        self.assertEqual(result["classification_status"], "quality_rejected")
        self.assertIn("IMAGE QUALITY TOO LOW", result["message"])

    def test_04_corrupted_bytes_rejection(self):
        """Test corrupted non-image bytes handling."""
        corrupt_bytes = b"NOT_A_VALID_JPEG_HEADER_RANDOM_DATA_XYZ"
        result = engine.predict_crop(corrupt_bytes, image_name="corrupt.dat")

        self.assertFalse(result["is_crop"])
        self.assertFalse(result["is_quality_valid"])
        self.assertEqual(result["classification_status"], "quality_rejected")

    def test_05_valid_plant_leaf_detection(self):
        """Test that genuine foliage is accepted and generates full explainable report."""
        leaf_bytes = create_synthetic_leaf_image()
        result = engine.predict_crop(leaf_bytes, image_name="plant_specimen.jpg")

        self.assertTrue(result["is_crop"])
        self.assertEqual(result["classification_status"], "plant_detected")
        self.assertIsNotNone(result["health_status"])
        self.assertIsNotNone(result["growth_stage"])
        self.assertIsNotNone(result["attention_heatmap_b64"])
        self.assertIsNotNone(result["overlay_b64"])
        self.assertGreater(len(result["sustainable_care"]), 0)
        self.assertGreater(len(result["recommendations"]), 0)

    def test_06_cv_preprocessing_pipeline(self):
        """Test OpenCV 4-stage preprocessing pipeline."""
        leaf_bytes = create_synthetic_leaf_image()
        prep = process_pipeline(leaf_bytes)

        self.assertIn("original_b64", prep)
        self.assertIn("resized_b64", prep)
        self.assertIn("enhanced_b64", prep)
        self.assertIn("tensor_norm_b64", prep)
        self.assertEqual(prep["dimensions"]["width"], 256)
        self.assertEqual(prep["dimensions"]["height"], 256)
        self.assertIn("blur_score", prep["quality"])

    def test_07_crop_growth_frameworks(self):
        """Verify crop-specific growth frameworks exist for key crops."""
        for crop in ["Rice (Paddy)", "Tomato", "Corn (Maize)", "Wheat", "Potato", "Apple", "Grape", "Bell Pepper"]:
            framework = get_growth_framework_for_crop(crop)
            self.assertIsNotNone(framework, f"Missing growth framework for {crop}")
            self.assertGreater(len(framework["stages"]), 3, f"Insufficient stages for {crop}")

        # Test growth estimation
        est = estimate_growth_stage("Tomato")
        self.assertTrue(est["is_determined"])
        self.assertEqual(est["crop"], "Tomato")
        self.assertIn("Vegetative", est["stage_name"])

    def test_08_database_persistence_and_stats(self):
        """Test scan insertion, scan stats, and deletion without fake data."""
        scan = add_scan(
            crop="Corn (Maize)",
            disease="Common Rust",
            crop_confidence=88.5,
            disease_confidence=85.2,
            health_status="Diseased",
            risk_level="Medium",
            growth_stage="V6 Vegetative",
            image_name="test_corn.jpg",
            image_classification_status="plant_detected",
            is_non_crop=0
        )
        self.assertIsNotNone(scan["id"])

        stats = get_scan_stats()
        self.assertGreaterEqual(stats["total_scans"], 1)
        self.assertIn("Corn (Maize)", stats["crop_distribution"])

        # Test deletion
        deleted = delete_scan(scan["id"])
        self.assertTrue(deleted)

    def test_09_remote_sensing_vari_and_exg(self):
        """Test visible-band remote sensing calculation."""
        leaf_bytes = create_synthetic_leaf_image()
        analysis = analyze_remote_sensing_image(leaf_bytes, index_type="VARI")

        self.assertIn("vegetation_coverage_pct", analysis)
        self.assertIn("health_map_b64", analysis)
        self.assertIn("stress_heatmap_b64", analysis)
        self.assertIn("VARI", analysis["index_type"])

if __name__ == "__main__":
    unittest.main()
