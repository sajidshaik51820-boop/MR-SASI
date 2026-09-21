import sqlite3
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'crop_scans.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                image_name TEXT NOT NULL,
                image_info TEXT NOT NULL DEFAULT '',
                crop TEXT NOT NULL,
                confidence REAL NOT NULL DEFAULT 0.0,
                crop_confidence REAL NOT NULL DEFAULT 0.0,
                disease TEXT NOT NULL,
                disease_confidence REAL NOT NULL DEFAULT 0.0,
                health_status TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                growth_stage TEXT NOT NULL DEFAULT 'Unknown',
                model_version TEXT NOT NULL DEFAULT 'ACRNN-v1.0',
                processing_time_ms REAL NOT NULL DEFAULT 0.0,
                image_classification_status TEXT NOT NULL DEFAULT 'plant_detected',
                is_non_crop INTEGER NOT NULL DEFAULT 0,
                affected_ratio REAL NOT NULL DEFAULT 0.0,
                scan_type TEXT NOT NULL DEFAULT 'Leaf Scan'
            )
        ''')
        
        # Migrate existing schema if any columns missing
        cursor.execute("PRAGMA table_info(scans)")
        columns = [row[1] for row in cursor.fetchall()]
        
        col_defs = {
            'image_info': "TEXT NOT NULL DEFAULT ''",
            'confidence': "REAL NOT NULL DEFAULT 0.0",
            'crop_confidence': "REAL NOT NULL DEFAULT 0.0",
            'disease_confidence': "REAL NOT NULL DEFAULT 0.0",
            'growth_stage': "TEXT NOT NULL DEFAULT 'Unknown'",
            'model_version': "TEXT NOT NULL DEFAULT 'ACRNN-v1.0'",
            'image_classification_status': "TEXT NOT NULL DEFAULT 'plant_detected'",
            'is_non_crop': "INTEGER NOT NULL DEFAULT 0"
        }
        for col, col_type in col_defs.items():
            if col not in columns:
                try:
                    cursor.execute(f"ALTER TABLE scans ADD COLUMN {col} {col_type}")
                except Exception as e:
                    print(f"[DB] Migration notice for {col}: {e}")
                    
        conn.commit()

def add_scan(
    crop: str,
    disease: str,
    confidence: float = 0.0,
    crop_confidence: float = 0.0,
    disease_confidence: float = 0.0,
    health_status: str = "Uncertain",
    risk_level: str = "Low",
    growth_stage: str = "Unknown",
    image_name: str = "image.jpg",
    image_info: str = "",
    scan_type: str = 'Leaf Scan',
    model_version: str = 'ACRNN-v1.0',
    processing_time_ms: float = 0.0,
    image_classification_status: str = 'plant_detected',
    is_non_crop: int = 0,
    affected_ratio: float = 0.0
) -> Dict[str, Any]:
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    effective_conf = confidence if confidence > 0 else max(crop_confidence, disease_confidence)
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO scans (
                timestamp, image_name, image_info, crop, confidence, crop_confidence,
                disease, disease_confidence, health_status, risk_level,
                growth_stage, model_version, processing_time_ms,
                image_classification_status, is_non_crop, affected_ratio, scan_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            timestamp, image_name, image_info, crop, round(effective_conf, 2),
            round(crop_confidence, 2), disease, round(disease_confidence, 2),
            health_status, risk_level, growth_stage, model_version,
            round(processing_time_ms, 2), image_classification_status,
            is_non_crop, round(affected_ratio, 2), scan_type
        ))
        conn.commit()
        scan_id = cursor.lastrowid
        return {
            'id': scan_id,
            'timestamp': timestamp,
            'image_name': image_name,
            'image_info': image_info,
            'crop': crop,
            'confidence': round(effective_conf, 2),
            'crop_confidence': round(crop_confidence, 2),
            'disease': disease,
            'disease_confidence': round(disease_confidence, 2),
            'health_status': health_status,
            'risk_level': risk_level,
            'growth_stage': growth_stage,
            'model_version': model_version,
            'processing_time_ms': round(processing_time_ms, 2),
            'image_classification_status': image_classification_status,
            'is_non_crop': is_non_crop,
            'affected_ratio': round(affected_ratio, 2),
            'scan_type': scan_type
        }

def get_all_scans(limit: int = 100) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM scans ORDER BY id DESC LIMIT ?', (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_scan_stats() -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM scans')
        total = cursor.fetchone()[0]
        
        if total == 0:
            return {
                'total_scans': 0,
                'healthy_count': 0,
                'diseased_count': 0,
                'uncertain_count': 0,
                'non_crop_count': 0,
                'avg_crop_confidence': 0.0,
                'avg_disease_confidence': 0.0,
                'crop_distribution': {},
                'disease_distribution': {},
                'health_distribution': {},
                'status_distribution': {},
                'timeline': [],
                'recent_history': []
            }
        
        cursor.execute("SELECT COUNT(*) FROM scans WHERE health_status = 'Healthy' AND is_non_crop = 0")
        healthy = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM scans WHERE health_status = 'Diseased' AND is_non_crop = 0")
        diseased = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM scans WHERE (health_status = 'Uncertain' OR health_status = 'Unknown') AND is_non_crop = 0")
        uncertain = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM scans WHERE is_non_crop = 1")
        non_crop = cursor.fetchone()[0]
        
        cursor.execute('SELECT AVG(crop_confidence) FROM scans WHERE is_non_crop = 0 AND crop_confidence > 0')
        avg_crop_conf = cursor.fetchone()[0] or 0.0

        cursor.execute('SELECT AVG(disease_confidence) FROM scans WHERE is_non_crop = 0 AND disease_confidence > 0')
        avg_disease_conf = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT crop, COUNT(*) as cnt FROM scans WHERE is_non_crop = 0 AND crop != 'Non-Crop' AND crop != 'Unknown / Low Confidence' GROUP BY crop ORDER BY cnt DESC LIMIT 10")
        crop_dist = {row['crop']: row['cnt'] for row in cursor.fetchall()}

        cursor.execute("SELECT disease, COUNT(*) as cnt FROM scans WHERE is_non_crop = 0 AND disease != 'None' AND disease != 'Unknown / Low Confidence' GROUP BY disease ORDER BY cnt DESC LIMIT 10")
        disease_dist = {row['disease']: row['cnt'] for row in cursor.fetchall()}
        
        cursor.execute('SELECT health_status, COUNT(*) as cnt FROM scans WHERE is_non_crop = 0 GROUP BY health_status')
        health_dist = {row['health_status']: row['cnt'] for row in cursor.fetchall()}

        cursor.execute('SELECT image_classification_status, COUNT(*) as cnt FROM scans GROUP BY image_classification_status')
        status_dist = {row['image_classification_status']: row['cnt'] for row in cursor.fetchall()}

        cursor.execute("SELECT SUBSTR(timestamp, 1, 10) as day, COUNT(*) as cnt FROM scans GROUP BY day ORDER BY day ASC LIMIT 14")
        timeline = [{'date': row['day'], 'count': row['cnt']} for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM scans ORDER BY id DESC LIMIT 15')
        recent = [dict(row) for row in cursor.fetchall()]
        
        return {
            'total_scans': total,
            'healthy_count': healthy,
            'diseased_count': diseased,
            'uncertain_count': uncertain,
            'non_crop_count': non_crop,
            'avg_crop_confidence': round(avg_crop_conf, 1),
            'avg_disease_confidence': round(avg_disease_conf, 1),
            'crop_distribution': crop_dist,
            'disease_distribution': disease_dist,
            'health_distribution': health_dist,
            'status_distribution': status_dist,
            'timeline': timeline,
            'recent_history': recent
        }

def delete_scan(scan_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM scans WHERE id = ?', (scan_id,))
        conn.commit()
        return cursor.rowcount > 0

def clear_all_scans() -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM scans')
        conn.commit()
        return True

if __name__ == '__main__':
    init_db()
    print('Database initialized successfully at', DB_PATH)
