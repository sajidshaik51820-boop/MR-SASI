import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Layers, 
  Flame, 
  ArrowDown, 
  Sliders, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BarChart, 
  Code,
  Info,
  ChevronRight
} from "lucide-react";
import { getModelInfo, trainModel, evaluateModel } from "../services/api";

const ARCHITECTURE_BLOCKS = [
  {
    id: "input",
    title: "1. Input Image",
    shape: "(224, 224, 3)",
    tag: "Tensor",
    color: "border-slate-700 bg-slate-900/60",
    desc: "RGB foliar photograph captured via smartphone camera, field sensor, or drone orthomosaic.",
    math: "x \\in \\mathbb{R}^{224 \\times 224 \\times 3}",
    code: "inputs = layers.Input(shape=(224, 224, 3), name='crop_image_input')"
  },
  {
    id: "cv",
    title: "2. OpenCV Preprocessing",
    shape: "LAB CLAHE + Gaussian",
    tag: "Computer Vision",
    color: "border-teal-500/40 bg-teal-950/20",
    desc: "OpenCV pipeline applying noise reduction (Gaussian blur), contrast enhancement via CLAHE in LAB color space, and min-max normalization to [0.0, 1.0].",
    math: "I_{norm} = \\frac{I - \\min(I)}{\\max(I) - \\min(I)}",
    code: "clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))\ncl = clahe.apply(l_channel)"
  },
  {
    id: "transfer",
    title: "3. Transfer Learning Backbone",
    shape: "MobileNetV2 (ImageNet)",
    tag: "Deep CNN",
    color: "border-emerald-500/40 bg-emerald-950/20",
    desc: "Pretrained Convolutional Neural Network on ImageNet. Reuses rich hierarchical low-level visual features (edges, textures, colors) with frozen base weights.",
    math: "F_{conv} = f_{backbone}(x; \\theta_{ImageNet})",
    code: "base_cnn = MobileNetV2(include_top=False, weights='imagenet', input_tensor=inputs)\nbase_cnn.trainable = False"
  },
  {
    id: "spatial_map",
    title: "4. Spatial Feature Extraction",
    shape: "(7, 7, 1280)",
    tag: "Feature Map",
    color: "border-emerald-500/40 bg-emerald-950/20",
    desc: "Output convolutional tensor preserving 49 spatial grid locations across the leaf blade with 1280 deep channels per location.",
    math: "F \\in \\mathbb{R}^{7 \\times 7 \\times 1280}",
    code: "conv_features = base_cnn.output # (batch, 7, 7, 1280)"
  },
  {
    id: "sequence",
    title: "5. Spatial Sequence Reshape",
    shape: "(49, 1280)",
    tag: "Sequence",
    color: "border-cyan-500/40 bg-cyan-950/20",
    desc: "Reshapes the 2D spatial grid into a 1D sequence of 49 spatial patch embeddings, preparing spatial relationships for sequential recurrent modeling.",
    math: "S = \\text{Reshape}(F) \\in \\mathbb{R}^{49 \\times 1280}",
    code: "seq_features = layers.Reshape((49, 1280), name='spatial_feature_sequence')(conv_features)"
  },
  {
    id: "recurrent",
    title: "6. Bidirectional GRU (RNN)",
    shape: "(49, 256)",
    tag: "Context RNN",
    color: "border-cyan-500/40 bg-cyan-950/20",
    desc: "Bidirectional Gated Recurrent Unit captures spatial continuity and long-range contextual relationships across neighboring leaf patches in forward and backward passes.",
    math: "h_i = [\\overrightarrow{GRU}(s_i); \\overleftarrow{GRU}(s_i)]",
    code: "recurrent_out = layers.Bidirectional(layers.GRU(128, return_sequences=True))(seq_features)"
  },
  {
    id: "attention",
    title: "7. Attention Mechanism",
    shape: "(256,) Context + (49, 1) Weights",
    tag: "Soft Attention",
    color: "border-amber-500/40 bg-amber-950/20",
    desc: "Learnable attention layer computes alignment scores across the 49 leaf regions, focusing heavily on diseased necrotic spots and dampening healthy background.",
    math: "\\alpha_i = \\frac{\\exp(u^T \\tanh(W h_i + b))}{\\sum_j \\exp(u^T \\tanh(W h_j + b))}, \\quad c = \\sum_i \\alpha_i h_i",
    code: "context_vector, attention_weights = ACRNNAttention(name='acrnn_attention')(recurrent_out)"
  },
  {
    id: "classifier",
    title: "8. ACRNN Classification Head",
    shape: "Dense(128) -> Dense(27, Softmax)",
    tag: "Classifier",
    color: "border-purple-500/40 bg-purple-950/20",
    desc: "Dropout regularization (0.35) followed by dense projection and softmax layer generating probability distribution over 27 crop disease classes.",
    math: "y = \\text{softmax}(W_c c + b_c)",
    code: "outputs = layers.Dense(27, activation='softmax', name='disease_prediction')(dense_2)"
  }
];

export default function ModelPage() {
  const [activeTab, setActiveTab] = useState("architecture");
  const [selectedBlock, setSelectedBlock] = useState(ARCHITECTURE_BLOCKS[6]); // Default to Attention
  const [modelInfo, setModelInfo] = useState(null);

  // Training form state
  const [trainConfig, setTrainConfig] = useState({
    dataset_path: "datasets/plantvillage",
    backbone: "MobileNetV2",
    epochs: 5,
    batch_size: 16,
    learning_rate: 0.001,
    validation_split: 0.2
  });
  const [isTraining, setIsTraining] = useState(false);
  const [trainResult, setTrainResult] = useState(null);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  useEffect(() => {
    getModelInfo().then(setModelInfo).catch(console.error);
  }, []);

  const handleTrain = async (e) => {
    e.preventDefault();
    setIsTraining(true);
    setTrainResult(null);
    try {
      const res = await trainModel(trainConfig);
      setTrainResult(res);
    } catch (err) {
      setTrainResult({ status: "error", message: err.message });
    } finally {
      setIsTraining(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setEvalResult(null);
    try {
      const res = await evaluateModel("datasets/plantvillage");
      setEvalResult(res);
    } catch (err) {
      setEvalResult({ status: "error", message: err.message });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-10 py-6 text-left">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>DEEP LEARNING ARCHITECTURE & TRAINING</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          ACRNN Neural Network & Transfer Learning Pipeline
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Attentive Convolutional Recurrent Neural Network (ACRNN): MobileNetV2 CNN spatial feature extractor 
          coupled with a Bidirectional GRU sequence layer and custom Soft-Attention mechanism.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("architecture")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "architecture"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          ACRNN Architecture Flow
        </button>
        <button
          onClick={() => setActiveTab("train")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "train"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Model Training (Transfer Learning)
        </button>
        <button
          onClick={() => setActiveTab("eval")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "eval"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Model Evaluation (Scikit-Learn)
        </button>
      </div>

      {/* Tab 1: Architecture Interactive Explorer */}
      {activeTab === "architecture" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Flowchart Blocks */}
          <div className="lg:col-span-6 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Click Any Component to Inspect Tensor Shapes & Code:
            </h4>
            {ARCHITECTURE_BLOCKS.map((block, idx) => (
              <React.Fragment key={block.id}>
                <div
                  onClick={() => setSelectedBlock(block)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedBlock.id === block.id
                      ? "border-emerald-400 bg-slate-900 shadow-lg shadow-emerald-950/50 scale-[1.02]"
                      : `${block.color} hover:border-slate-500`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-950 text-slate-300 border border-slate-800 flex items-center justify-center text-[10px] font-mono font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-100">{block.title}</h5>
                      <span className="text-[10px] font-mono text-emerald-400">{block.shape}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {block.tag}
                  </span>
                </div>
                {idx < ARCHITECTURE_BLOCKS.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right: Selected Block Deep Dive Card */}
          <div className="lg:col-span-6">
            <div className="sticky top-24 p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
                    COMPONENT SPECIFICATION
                  </span>
                  <h3 className="text-xl font-bold text-white">{selectedBlock.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  {selectedBlock.shape}
                </span>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Purpose & Role
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedBlock.desc}</p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Mathematical Formulation
                </h5>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
                  {selectedBlock.math}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  TensorFlow / Keras Implementation Snippet
                </h5>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  {selectedBlock.code}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Model Training Interface */}
      {activeTab === "train" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Transfer Learning Training Hyperparameters
            </h3>
            <p className="text-xs text-slate-400">
              Configure parameters to initiate transfer learning on custom PlantVillage classes using the FastAPI backend.
            </p>

            <form onSubmit={handleTrain} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Dataset Directory</label>
                <input
                  type="text"
                  value={trainConfig.dataset_path}
                  onChange={(e) => setTrainConfig({ ...trainConfig, dataset_path: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">CNN Backbone</label>
                  <select
                    value={trainConfig.backbone}
                    onChange={(e) => setTrainConfig({ ...trainConfig, backbone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="MobileNetV2">MobileNetV2 (Recommended)</option>
                    <option value="EfficientNetB0">EfficientNetB0</option>
                    <option value="ResNet50">ResNet50</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Epochs</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={trainConfig.epochs}
                    onChange={(e) => setTrainConfig({ ...trainConfig, epochs: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Batch Size</label>
                  <input
                    type="number"
                    value={trainConfig.batch_size}
                    onChange={(e) => setTrainConfig({ ...trainConfig, batch_size: parseInt(e.target.value) || 8 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Learning Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={trainConfig.learning_rate}
                    onChange={(e) => setTrainConfig({ ...trainConfig, learning_rate: parseFloat(e.target.value) || 0.001 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Val Split</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="0.4"
                    value={trainConfig.validation_split}
                    onChange={(e) => setTrainConfig({ ...trainConfig, validation_split: parseFloat(e.target.value) || 0.2 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isTraining}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                {isTraining ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Training ACRNN Model in Progress...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start ACRNN Training Pipeline</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Training Feedback */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              Live Training Telemetry & Logs
            </h3>

            {trainResult ? (
              <div className={`p-5 rounded-2xl border text-xs space-y-3 ${
                trainResult.status === "success" 
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-950 border-slate-800 text-slate-300"
              }`}>
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                  {trainResult.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Status: {trainResult.status}</span>
                </div>
                <p>{trainResult.message}</p>

                {trainResult.status === "success" && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Train Accuracy</span>
                      <span className="font-mono text-emerald-400 text-base font-bold">{trainResult.train_accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Val Accuracy</span>
                      <span className="font-mono text-emerald-400 text-base font-bold">{trainResult.val_accuracy}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <Code className="w-8 h-8 mx-auto text-slate-600" />
                <p>Training data/model not connected.</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  Click 'Start ACRNN Training Pipeline' or run Google Colab notebook to train weights.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Model Evaluation (Scikit-learn) */}
      {activeTab === "eval" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-emerald-400" />
                Scikit-Learn Statistical Performance Evaluation
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Computes Precision, Recall, F1-Score, and Confusion Matrix across held-out test classes.
              </p>
            </div>
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Model...</span>
                </>
              ) : (
                <>
                  <BarChart className="w-4 h-4" />
                  <span>Run Scikit-Learn Evaluation</span>
                </>
              )}
            </button>
          </div>

          {evalResult && (
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-8 animate-fade-in">
              {/* Metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Accuracy</span>
                  <span className="text-2xl font-black text-emerald-400">{evalResult.accuracy}%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Precision (Weighted)</span>
                  <span className="text-2xl font-black text-teal-300">{evalResult.precision}%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Recall (Weighted)</span>
                  <span className="text-2xl font-black text-cyan-300">{evalResult.recall}%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">F1-Score</span>
                  <span className="text-2xl font-black text-emerald-400">{evalResult.f1_score}%</span>
                </div>
              </div>

              {/* Confusion Matrix Table */}
              {evalResult.confusion_matrix && evalResult.confusion_matrix.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Confusion Matrix (Top Evaluated Classes)
                  </h4>
                  <div className="overflow-x-auto p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <table className="text-[11px] font-mono text-center border-collapse">
                      <thead>
                        <tr>
                          <th className="p-2 text-slate-500 text-left">Actual \ Pred</th>
                          {evalResult.classes?.map((c, i) => (
                            <th key={i} className="p-2 text-slate-400 max-w-[80px] truncate" title={c}>
                              C{i+1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {evalResult.confusion_matrix.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td className="p-2 text-slate-400 font-semibold text-left max-w-[120px] truncate">
                              C{rIdx+1}: {evalResult.classes?.[rIdx] || `Class ${rIdx}`}
                            </td>
                            {row.map((val, cIdx) => (
                              <td 
                                key={cIdx} 
                                className={`p-2 border border-slate-900 ${
                                  rIdx === cIdx && val > 0
                                    ? "bg-emerald-950 text-emerald-300 font-bold"
                                    : val > 0
                                    ? "bg-rose-950/40 text-rose-300"
                                    : "text-slate-600"
                                }`}
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
