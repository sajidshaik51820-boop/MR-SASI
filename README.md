# SMART CROP DISEASE DETECTION USING DEEP LEARNING

> **Major Capstone Project | B.Tech Computer Science & Engineering**  
> **Academic Guide:** Mrs. N. Rama Devi  
> **Project Team:** Ch. Kusuma Priya, D. Pujitha, G. Sasi Charan, G. Revathi  

---

## 1. Project Title
**SMART CROP DISEASE DETECTION USING DEEP LEARNING (ACRNN)**

---

## 2. Abstract
Agriculture forms the economic and nutritional bedrock of human civilization. However, crop diseases and foliar pathogens inflict catastrophic worldwide yield losses surpassing 30% annually. Traditional agricultural pathology depends upon periodic physical scouting by domain experts—a method that is labor-exhaustive, subjective, and practically impossible across large acreage before severe infection spread.

This project delivers an intelligent, real-time agricultural diagnostic web application powered by **ACRNN (Attentive Convolutional Recurrent Neural Network)**. The architecture integrates Transfer Learning (**MobileNetV2**) for deep spatial feature extraction, a **Bidirectional GRU** recurrent layer to capture contextual spatial dependencies across leaf patches, and a **Soft-Attention Mechanism** that focuses dynamically on necrotic lesion boundaries while suppressing healthy background tissue. In addition to leaf-level diagnosis across 27 crop disease categories, the application processes **Drone (UAV)** and **Sentinel-2 satellite** remote sensing imagery through visible vegetative indices (**VARI** and **ExG**). The platform provides farmers with sub-second disease classification, visual attention heatmaps, quantitative canopy stress maps, and agronomic decision-support recommendations.

---

## 3. Problem Statement
1. **Late Pathogen Detection:** Foliar diseases such as *Phytophthora infestans* (Late Blight) reproduce exponentially under favorable microclimates; delayed identification leads to irreversible crop damage.
2. **Scouting Limitations:** Large-scale commercial farms lack sufficient pathology personnel for continuous manual leaf inspection.
3. **Symptom Confusion:** Different pathogens (e.g., bacterial spot vs. early blight vs. chlorosis) exhibit overlapping visual characteristics that mislead non-expert farmers.
4. **Lack of Explainability:** Conventional deep learning black-box classifiers output confidence scores without illustrating *where* or *why* the model made its decision, eroding grower trust.

---

## 4. Proposed Solution
An end-to-end multi-modal deep learning platform combining:
- **Computer Vision Preprocessing (OpenCV):** Multi-stage contrast enhancement (CLAHE in LAB color space), Gaussian noise reduction, and tensor normalization.
- **ACRNN Model Architecture:** Transfer Learning with MobileNetV2 + Spatial Reshape + Bidirectional GRU + Soft-Attention + Softmax Classifier.
- **Explainable AI (XAI):** Real attention heatmaps and contour-overlaid lesion localization highlighting the exact diseased spots.
- **Remote Sensing Canopy Health (UAV/Satellite):** Visible Atmospherically Resistant Index (VARI) and Excess Green (ExG) algorithms mapping field-scale vegetative vigor and localized stress pockets.
- **Agronomic Decision Support:** Automated cultural, biological, and chemical intervention guidance tailored to the identified pathogen.
- **Persistent Telemetry Repository:** Built-in SQLite database logging historical scans, confidence metrics, and epidemiological distributions.

---

## 5. Project Objectives
1. Implement a complete, working deep learning inference pipeline with zero fake random values.
2. Design and implement the ACRNN (Attentive Convolutional Recurrent Neural Network) architecture with an explicit learnable soft-attention layer.
3. Construct a real 4-stage OpenCV preprocessing visualization pipeline (Original $\to$ Resized $\to$ CLAHE Enhanced $\to$ Normalized Tensor).
4. Provide remote sensing support for Drone orthomosaics and Satellite canopy imagery using authentic visible vegetation indices.
5. Provide a responsive, modern web UI built with React, Vite, Tailwind CSS, Lucide icons, and Chart.js.
6. Provide Google Colab notebook and local training/evaluation scripts with Scikit-learn confusion matrices and classification reports.

---

## 6. Key Features
- **Live Camera & Drag-and-Drop Scanner:** Direct webcam streaming with snapshot capture and file drag-and-drop supporting JPG, JPEG, and PNG formats up to 20MB.
- **Instant Verified Preset Samples:** Preloaded evaluation presets (Healthy Tomato, Early Blight, Late Blight, Yellow Leaf Curl) for immediate demonstration without requiring local files.
- **Side-by-Side OpenCV Stage Cards:** Visualizes all 4 actual image preprocessing steps with image dimensions, mean brightness, contrast, and Laplacian sharpness score.
- **Explainable Attention Heatmaps:** Generates pure JET colormap heatmaps and blended leaf overlays outlining high-attention necrotic clusters.
- **Vegetative Stress Zonation:** Discrete green/yellow/red canopy zoning and continuous stress heatmaps with canopy coverage percentages.
- **Interactive Architecture Explorer:** Clickable flow diagrams of all ACRNN layers with mathematical formulas and Keras implementation code.
- **Continuous Edge Monitoring:** Live video downlink simulation updating telemetry HUD with frame-by-frame health status.
- **Persistent Analytics Dashboard:** Metric KPI cards, disease distribution doughnut charts, confidence bar charts, and recent scan logs backed by SQLite.

---

## 7. Architecture Overview

```
                      +------------------------------------------+
                      |         INPUT IMAGE (224x224x3)          |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |       OPENCV PREPROCESSING PIPELINE       |
                      |  - Resize (224x224)                      |
                      |  - Gaussian Filter (Noise Reduction)     |
                      |  - CLAHE (LAB Luminance Equalization)    |
                      |  - Tensor Normalization [0.0, 1.0]       |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |    TRANSFER LEARNING BACKBONE (CNN)      |
                      |  - MobileNetV2 (ImageNet Pretrained)     |
                      |  - Spatial Feature Map: (7, 7, 1280)     |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |         SPATIAL SEQUENCE RESHAPE         |
                      |  - 49 Spatial Patches x 1280 Channels    |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |     CONTEXTUAL RECURRENT LAYER (RNN)     |
                      |  - Bidirectional GRU (128 units x 2)     |
                      |  - Inter-patch Context: (49, 256)        |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |        ATTENTION MECHANISM (XAI)         |
                      |  - Learnable Soft Attention Scoring      |
                      |  - Context Vector: (256,)                |
                      |  - Attention Map: (49, 1) -> (7, 7)      |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |      CLASSIFICATION & DECISION HEAD      |
                      |  - Dropout(0.35) -> Dense(128, ReLU)     |
                      |  - Dense(27, Softmax) Disease Prediction |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |  OUTPUT: Prediction + Confidence +       |
                      |  Attention Overlay + Agronomic Advice    |
                      +------------------------------------------+
```

---

## 8. ACRNN (Attentive Convolutional Recurrent Neural Network) Explanation
Standard CNNs treat images as independent spatial receptive fields without modeling long-range relational structure across distant leaf patches. ACRNN overcomes this by unifying three neural paradigms:
1. **Convolutional Feature Extraction (CNN):** MobileNetV2 extracts rich hierarchical low-level textures, chlorotic borders, and lesion patterns, yielding a $7 \times 7 \times 1280$ feature map.
2. **Recurrent Contextual Modeling (BiGRU):** The 49 spatial patches are treated as a sequential chain. A Bidirectional Gated Recurrent Unit (BiGRU) processes the patches in both forward and backward spatial paths, capturing inter-patch spatial dependencies (e.g., how lesions spread across secondary leaf veins).
3. **Soft Attention Mechanism:** Computes alignment weights $\alpha_i$ for each spatial patch:
   $$\alpha_i = \frac{\exp(u^T \tanh(W h_i + b))}{\sum_{j=1}^{49} \exp(u^T \tanh(W h_j + b))}$$
   $$c = \sum_{i=1}^{49} \alpha_i h_i$$
   where $h_i \in \mathbb{R}^{256}$ is the BiGRU hidden representation for patch $i$, and $c \in \mathbb{R}^{256}$ is the resulting context vector. The attention weights $\alpha$ are upsampled via bicubic interpolation in OpenCV to generate explainable visual heatmaps.

---

## 9. Transfer Learning Explanation
Training deep neural networks from random initialization on agricultural datasets often results in overfitting due to limited sample diversity. Our approach leverages **Transfer Learning**:
1. Base weights from MobileNetV2 trained on 1.4 million natural images (ImageNet) are loaded.
2. The feature extraction layers are initially frozen to preserve low-level edge and texture filters.
3. Custom sequence, attention, and dense classification layers are initialized on top.
4. During fine-tuning, top convolutional blocks can be unfrozen at a low learning rate ($10^{-5}$) to adapt filters specifically to plant foliar morphology.

---

## 10. Dataset Information
- **PlantVillage:** Foliar image dataset covering 27 active classes in Tomato, Potato, Apple, Corn, Grape, and Bell Pepper across fungal, bacterial, viral, and healthy leaves.
- **Sentinel-2 Satellite:** European Space Agency Copernicus mission featuring 13 multispectral bands (B2 Blue, B3 Green, B4 Red, B8 NIR) with a 5-day revisit cycle.
- **Drone / UAV Field Orthomosaics:** Low-altitude (30-100m) aerial photography with sub-centimeter ground sampling distance for early stress detection.
- *Authenticity Policy:* If datasets are not present locally in the `datasets/` directory, the UI explicitly displays `"Dataset not connected"` rather than fabricating false sample counts.

---

## 11. Technologies Used
- **Backend:** Python 3.12, FastAPI, Uvicorn, SQLite
- **Computer Vision:** OpenCV (`opencv-python-headless`), Pillow, NumPy
- **Machine Learning:** TensorFlow / Keras, Scikit-learn, Scipy
- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Chart.js, React-ChartJS-2

---

## 12. Installation Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ and npm

### 1. Clone or Open Project Directory
```bash
cd MR.SASI
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
cd ..
```

---

## 13. Running the Backend Server
Start the FastAPI server from the project root:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will be available at:
- **API Base:** `http://127.0.0.1:8000`
- **Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/api/health`

---

## 14. Running the Frontend Application
Start the Vite development server from the `frontend` folder:
```bash
cd frontend
npm run dev
```
Open your browser and navigate to:
- **Web App:** `http://127.0.0.1:5173`

---

## 15. Model Training Instructions
### Option A: Via Google Colab (Recommended for GPU Acceleration)
1. Open the included notebook: `notebooks/ACRNN_Crop_Disease_Colab.ipynb`.
2. Connect to a free T4 GPU runtime.
3. Run all cells to train ACRNN on PlantVillage.
4. Download the generated `acrnn_weights.h5` and place it in the `models/` directory.

### Option B: Via Web UI
1. Place PlantVillage images in `datasets/plantvillage/<class_name>/`.
2. Navigate to the **Model Architecture** page $\to$ **Model Training** tab.
3. Configure Epochs, Learning Rate, and Batch Size.
4. Click **Start ACRNN Training Pipeline**.

---

## 16. Model Evaluation
To evaluate model performance using Scikit-Learn:
- Run through Web UI: Navigate to **Model Architecture** $\to$ **Model Evaluation** tab and click **Run Scikit-Learn Evaluation**.
- View Precision, Recall, F1-Score, and the full interactive **Confusion Matrix**.

---

## 17. Prediction & Inference
1. Navigate to the **Crop Scan** page.
2. Select an image from file, capture with camera, or click an **Instant Preset Sample** (e.g., Tomato Late Blight).
3. Observe the side-by-side OpenCV 4-stage preprocessing telemetry.
4. Click **Analyze Crop Disease**.
5. Inspect the predicted disease, confidence bar, AI Attention Heatmap overlay, and recommended farmer actions.

---

## 18. Screenshots & User Interface
The application includes 7 dedicated pages:
1. **Home Page:** Hero banner, scanning animations, and comparative research analysis.
2. **Crop Scan Page:** Drag-and-drop, camera feed, OpenCV 4-stage cards, explainable attention heatmaps, and agronomic guidance.
3. **Remote Sensing Page:** Drone and Satellite VARI/ExG canopy index mapping, discrete health zonation, and continuous stress heatmaps.
4. **Dashboard:** KPI summary cards, disease distribution doughnut charts, confidence charts, and SQLite scan history table.
5. **Datasets Page:** Technical specs for PlantVillage, Sentinel-2, and UAV drone repositories with real connection indicators.
6. **Model Architecture Page:** Interactive 8-stage tensor flowchart with code snippets, training panel, and Scikit-Learn evaluation suite.
7. **Live Monitor Page:** Edge camera feed simulation with telemetry HUD updating every 3.5 seconds.
8. **About Page:** CSE department capstone details, guide credentials, abstract, and future research directions.

---

## 19. Future Scope
- **Edge TPU Deployment:** Quantizing ACRNN into TensorFlow Lite INT8 format for deployment on solar-powered tractor edge devices (Coral TPU).
- **Hyperspectral Satellite Pipelines:** Integrating PRISMA and EnMAP hyperspectral channels (200+ bands) for sub-visual chlorophyll absorption tracking.
- **Autonomous Drone Spraying:** Connecting attention heatmap GPS coordinates directly to variable-rate agricultural spray drones.

---

## 20. Project Team & Academic Credentials
- **Department:** Computer Science & Engineering (CSE)
- **Academic Guide:** Mrs. N. Rama Devi
- **Team Members:**
  - Ch. Kusuma Priya
  - D. Pujitha
  - G. Sasi Charan
  - G. Revathi
