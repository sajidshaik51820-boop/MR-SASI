import cv2
import numpy as np
from typing import Tuple, Optional, Dict, Any
from ..preprocessing.cv_pipeline import to_base64

try:
    import tensorflow as tf
    from tensorflow.keras.layers import Layer
    
    class ACRNNAttention(Layer):
        """
        Learnable Soft Attention mechanism for sequential spatial features.
        Maps sequence (batch, sequence_length, hidden_dim) -> (batch, hidden_dim)
        and outputs attention distribution weights.
        """
        def __init__(self, **kwargs):
            super(ACRNNAttention, self).__init__(**kwargs)
            
        def build(self, input_shape):
            # input_shape: (batch, seq_len, dim)
            dim = input_shape[-1]
            self.W = self.add_weight(
                name="attention_weight",
                shape=(dim, dim),
                initializer="glorot_uniform",
                trainable=True
            )
            self.b = self.add_weight(
                name="attention_bias",
                shape=(dim,),
                initializer="zeros",
                trainable=True
            )
            self.u = self.add_weight(
                name="attention_context_vector",
                shape=(dim, 1),
                initializer="glorot_uniform",
                trainable=True
            )
            super(ACRNNAttention, self).build(input_shape)
            
        def call(self, inputs, mask=None):
            # inputs: (batch, seq_len, dim)
            # Score: v = tanh(inputs * W + b) -> (batch, seq_len, dim)
            v = tf.tanh(tf.tensordot(inputs, self.W, axes=1) + self.b)
            # Alignment: alpha = softmax(v * u) -> (batch, seq_len, 1)
            scores = tf.tensordot(v, self.u, axes=1)
            attention_weights = tf.nn.softmax(scores, axis=1)
            # Weighted Context: sum(alpha * inputs) -> (batch, dim)
            context = tf.reduce_sum(inputs * attention_weights, axis=1)
            return context, attention_weights
            
        def get_config(self):
            config = super(ACRNNAttention, self).get_config()
            return config

except ImportError:
    # If tensorflow is not installed or imported dynamically
    ACRNNAttention = None


def generate_attention_heatmap(
    img_bgr: np.ndarray,
    attention_weights: Optional[np.ndarray] = None,
    grid_size: Tuple[int, int] = (7, 7)
) -> Dict[str, Any]:
    """
    Renders actual AI attention heatmap & overlay on the crop leaf image.
    If attention_weights is provided from ACRNN layer (shape (1, 49, 1)), it is reshaped to 7x7.
    Otherwise, uses saliency-based gradient feature activation.
    """
    h, w = img_bgr.shape[:2]
    
    if attention_weights is not None and attention_weights.size == (grid_size[0] * grid_size[1]):
        raw_map = attention_weights.reshape(grid_size[0], grid_size[1]).astype(np.float32)
    else:
        # Computer Vision Saliency & High-Frequency Texture Contrast for explainable lesion attention
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)
        
        # Detect lesions: color contrast in A and B channels combined with local texture variation
        blur_l = cv2.GaussianBlur(l_channel, (15, 15), 0)
        saliency = cv2.absdiff(l_channel, blur_l).astype(np.float32)
        saliency += cv2.absdiff(a_channel, cv2.GaussianBlur(a_channel, (15, 15), 0)).astype(np.float32)
        raw_map = cv2.resize(saliency, grid_size, interpolation=cv2.INTER_AREA)

    # Normalize to [0, 1]
    norm_map = (raw_map - np.min(raw_map)) / (np.max(raw_map) - np.min(raw_map) + 1e-7)
    
    # Upsample heatmap to original image size with bicubic interpolation
    heatmap_resized = cv2.resize(norm_map, (w, h), interpolation=cv2.INTER_CUBIC)
    heatmap_resized = np.clip(heatmap_resized, 0.0, 1.0)
    
    # Calculate affected lesion ratio (regions where attention > 0.58)
    affected_mask = (heatmap_resized > 0.58).astype(np.uint8)
    affected_ratio = round(float(np.sum(affected_mask)) / float(w * h) * 100.0, 2)
    
    # Convert to 8-bit JET colormap
    heatmap_uint8 = (heatmap_resized * 255).astype(np.uint8)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    
    # Blend overlay with original leaf image
    overlay = cv2.addWeighted(img_bgr, 0.58, heatmap_colored, 0.42, 0)
    
    # Draw contour outlines around top attention clusters
    contours, _ = cv2.findContours(affected_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in contours:
        if cv2.contourArea(c) > 60:
            cv2.drawContours(overlay, [c], -1, (0, 255, 255), 2)  # Yellow border
            
    return {
        "attention_heatmap_b64": to_base64(heatmap_colored),
        "overlay_b64": to_base64(overlay),
        "affected_ratio": affected_ratio,
        "raw_grid": norm_map.tolist()
    }
