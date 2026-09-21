const API_BASE = "/api";

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend server unreachable");
  return res.json();
}

export async function preprocessImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/preprocess`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Preprocessing failed" }));
    throw new Error(err.detail || "Preprocessing failed");
  }
  return res.json();
}

export async function predictCrop(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Prediction failed" }));
    throw new Error(err.detail || "Prediction failed");
  }
  return res.json();
}

export async function analyzeRemoteSensing(file, indexType = "VARI") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("index_type", indexType);
  const res = await fetch(`${API_BASE}/remote-sensing`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Remote sensing analysis failed" }));
    throw new Error(err.detail || "Remote sensing analysis failed");
  }
  return res.json();
}

export async function getHistory(limit = 50) {
  const res = await fetch(`${API_BASE}/history?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to load scan history");
  return res.json();
}

export async function deleteHistoryItem(scanId) {
  const res = await fetch(`${API_BASE}/history/${scanId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete record");
  return res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to clear history");
  return res.json();
}

export async function getModelInfo() {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) throw new Error("Failed to fetch model info");
  return res.json();
}

export async function getCrops() {
  const res = await fetch(`${API_BASE}/crops`);
  if (!res.ok) throw new Error("Failed to load crops list");
  return res.json();
}

export async function getCropDetail(cropName) {
  const res = await fetch(`${API_BASE}/crops/${encodeURIComponent(cropName)}`);
  if (!res.ok) throw new Error(`Failed to load crop details for ${cropName}`);
  return res.json();
}

export async function getGrowthFramework(cropName) {
  const res = await fetch(`${API_BASE}/growth-stages/${encodeURIComponent(cropName)}`);
  if (!res.ok) throw new Error(`Failed to load growth framework for ${cropName}`);
  return res.json();
}

export async function getPestManagement() {
  const res = await fetch(`${API_BASE}/pest-management`);
  if (!res.ok) throw new Error("Failed to load pest management data");
  return res.json();
}

export async function getDiseases() {
  const res = await fetch(`${API_BASE}/diseases`);
  if (!res.ok) throw new Error("Failed to load diseases directory");
  return res.json();
}

export async function trainModel(config) {
  const res = await fetch(`${API_BASE}/train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Training request failed" }));
    throw new Error(err.detail || "Training failed");
  }
  return res.json();
}

export async function evaluateModel(datasetPath = "datasets/plantvillage") {
  const res = await fetch(`${API_BASE}/evaluate?dataset_path=${encodeURIComponent(datasetPath)}`);
  if (!res.ok) throw new Error("Evaluation request failed");
  return res.json();
}
