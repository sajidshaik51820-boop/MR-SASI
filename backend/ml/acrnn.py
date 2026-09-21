import os
import json
from typing import Tuple, Dict, Any, Optional

try:
    import tensorflow as tf
    from tensorflow.keras import layers, models, regularizers
    from tensorflow.keras.applications import MobileNetV2, EfficientNetB0, ResNet50
    from .attention import ACRNNAttention
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    layers = None
    models = None

def build_acrnn_model(
    num_classes: int = 27,
    input_shape: Tuple[int, int, int] = (224, 224, 3),
    backbone_type: str = "MobileNetV2",
    trainable_backbone: bool = False
):
    """
    Builds the Attentive Convolutional Recurrent Neural Network (ACRNN):
    1. Input: (224, 224, 3)
    2. Backbone CNN: MobileNetV2 (Transfer Learning from ImageNet)
    3. Spatial Grid: (7, 7, C)
    4. Reshape to Sequence: (49, C)
    5. Contextual Recurrent Layer: Bidirectional GRU (128 units) -> (49, 256)
    6. Attention Mechanism: ACRNNAttention -> (256,) context vector + attention weights
    7. Classification Head: Dropout -> Dense(128) -> Dense(num_classes, softmax)
    """
    if not TF_AVAILABLE:
        raise RuntimeError("TensorFlow is not installed. ACRNN model cannot be initialized.")
        
    inputs = layers.Input(shape=input_shape, name="crop_image_input")
    
    # 1. Pretrained Backbone / Transfer Learning
    if backbone_type.lower() == "efficientnetb0":
        base_cnn = EfficientNetB0(include_top=False, weights="imagenet", input_tensor=inputs)
    elif backbone_type.lower() == "resnet50":
        base_cnn = ResNet50(include_top=False, weights="imagenet", input_tensor=inputs)
    else:
        # Default MobileNetV2 - fast, lightweight, ideal for agricultural edge/cloud inference
        base_cnn = MobileNetV2(include_top=False, weights="imagenet", input_tensor=inputs)
        
    base_cnn.trainable = trainable_backbone
    conv_features = base_cnn.output  # Shape: (batch, 7, 7, C)
    
    # 2. Reshape Spatial Feature Map to Sequence of Patches
    # (batch, H, W, C) -> (batch, H*W, C) = (batch, 49, C)
    _, h, w, c = conv_features.shape
    seq_features = layers.Reshape((h * w, c), name="spatial_feature_sequence")(conv_features)
    
    # 3. Recurrent Layer for Spatial-Contextual Dependencies
    # Bidirectional GRU captures spatial continuity across neighboring leaf patches
    recurrent_out = layers.Bidirectional(
        layers.GRU(128, return_sequences=True, dropout=0.2),
        name="bidirectional_gru_context"
    )(seq_features)  # Shape: (batch, 49, 256)
    
    # 4. Attention Mechanism
    # Computes soft-attention distribution over the 49 regions
    context_vector, attention_weights = ACRNNAttention(name="acrnn_spatial_attention")(recurrent_out)
    
    # 5. Classification Head
    dense_1 = layers.Dropout(0.35, name="classifier_dropout")(context_vector)
    dense_2 = layers.Dense(128, activation="relu", name="classifier_dense_128")(dense_1)
    dense_2 = layers.BatchNormalization(name="classifier_bn")(dense_2)
    outputs = layers.Dense(num_classes, activation="softmax", name="disease_prediction")(dense_2)
    
    model = models.Model(inputs=inputs, outputs=[outputs, attention_weights], name="ACRNN_Crop_Disease_Model")
    return model

def get_architecture_breakdown() -> Dict[str, Any]:
    """Returns technical architectural specifications for UI visualization."""
    return {
        "model_name": "ACRNN (Attentive Convolutional Recurrent Neural Network)",
        "input_dimensions": "224 x 224 x 3 (RGB)",
        "backbone": "MobileNetV2 (Pretrained on ImageNet)",
        "spatial_feature_map": "7 x 7 x 1280",
        "sequence_conversion": "49 patches x 1280 feature channels",
        "recurrent_layer": "Bidirectional GRU (2 x 128 = 256 hidden units)",
        "attention_layer": "Learnable Soft Attention scoring (alpha_i = softmax(w^T tanh(W h_i + b)))",
        "classification_head": "Dropout(0.35) -> Dense(128, ReLU) -> Dense(27, Softmax)",
        "total_classes": 27,
        "primary_loss": "Categorical Crossentropy",
        "optimizer": "Adam (lr=1e-4)",
        "intended_hardware": "Cloud GPU / CPU Edge"
    }
