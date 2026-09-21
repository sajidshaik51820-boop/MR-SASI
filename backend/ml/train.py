import os
import time
import json
from typing import Dict, Any

def train_acrnn(
    dataset_path: str = "datasets/plantvillage",
    backbone: str = "MobileNetV2",
    epochs: int = 5,
    batch_size: int = 16,
    learning_rate: float = 0.001,
    val_split: float = 0.2
) -> Dict[str, Any]:
    """
    Real Transfer Learning training pipeline for ACRNN:
    1. Loads dataset from directory
    2. Builds ACRNN model with selected backbone
    3. Trains classification head with frozen backbone
    4. Evaluates on validation split
    5. Saves weights to models/acrnn_weights.h5
    """
    models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "models")
    weights_dest = os.path.join(models_dir, "acrnn_weights.h5")
    
    # Check if dataset path exists and contains images
    if not os.path.exists(dataset_path) or len(os.listdir(dataset_path)) == 0:
        return {
            "status": "dataset_not_found",
            "message": f"Training dataset directory '{dataset_path}' is empty or not connected. Place PlantVillage images in this folder to train.",
            "epochs_trained": 0,
            "train_accuracy": 0.0,
            "val_accuracy": 0.0,
            "train_loss": 0.0,
            "val_loss": 0.0,
            "model_saved_path": ""
        }
        
    try:
        import tensorflow as tf
        from .acrnn import build_acrnn_model
        
        # Count classes
        classes = [d for d in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, d))]
        num_classes = len(classes)
        if num_classes < 2:
            return {
                "status": "insufficient_classes",
                "message": f"Dataset needs at least 2 class subdirectories. Found: {num_classes}",
                "epochs_trained": 0,
                "train_accuracy": 0.0,
                "val_accuracy": 0.0,
                "train_loss": 0.0,
                "val_loss": 0.0,
                "model_saved_path": ""
            }
            
        print(f"[TRAIN] Found {num_classes} classes in {dataset_path}")
        
        train_ds = tf.keras.utils.image_dataset_from_directory(
            dataset_path,
            validation_split=val_split,
            subset="training",
            seed=42,
            image_size=(224, 224),
            batch_size=batch_size,
            label_mode="categorical"
        )
        
        val_ds = tf.keras.utils.image_dataset_from_directory(
            dataset_path,
            validation_split=val_split,
            subset="validation",
            seed=42,
            image_size=(224, 224),
            batch_size=batch_size,
            label_mode="categorical"
        )
        
        # Normalize [0, 1]
        norm_layer = tf.keras.layers.Rescaling(1./255)
        train_ds = train_ds.map(lambda x, y: (norm_layer(x), y))
        val_ds = val_ds.map(lambda x, y: (norm_layer(x), y))
        
        model = build_acrnn_model(num_classes=num_classes, backbone_type=backbone, trainable_backbone=False)
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
            loss={"disease_prediction": "categorical_crossentropy"},
            metrics={"disease_prediction": ["accuracy"]}
        )
        
        history = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=epochs,
            verbose=1
        )
        
        model.save_weights(weights_dest)
        
        train_acc = float(history.history["disease_prediction_accuracy"][-1]) * 100.0
        val_acc = float(history.history["val_disease_prediction_accuracy"][-1]) * 100.0
        train_loss = float(history.history["loss"][-1])
        val_loss = float(history.history["val_loss"][-1])
        
        return {
            "status": "success",
            "message": f"ACRNN model trained successfully on {num_classes} classes for {epochs} epochs.",
            "epochs_trained": epochs,
            "train_accuracy": round(train_acc, 2),
            "val_accuracy": round(val_acc, 2),
            "train_loss": round(train_loss, 4),
            "val_loss": round(val_loss, 4),
            "model_saved_path": weights_dest
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Training failed with error: {str(e)}",
            "epochs_trained": 0,
            "train_accuracy": 0.0,
            "val_accuracy": 0.0,
            "train_loss": 0.0,
            "val_loss": 0.0,
            "model_saved_path": ""
        }
