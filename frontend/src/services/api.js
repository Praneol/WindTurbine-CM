import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 10000,
});

export const getLatestSensorData = async () => {
  const response = await api.get("/api/sensors/latest");
  return response.data;
};

export const getTurbineStatus = async () => {
  const response = await api.get("/api/turbines/status");
  return response.data;
};

export const getSensorHistory = async () => {
  const response = await api.get("/api/sensors/history");
  return response.data;
};

export const getLatestAlert = async () => {
  const response = await api.get("/api/alerts/latest");
  return response.data;
};

export const getAlertHistory = async () => {
  const response = await api.get("/api/alerts/history");
  return response.data;
};

export const getLatestPrediction = async () => {
  const response = await api.get("/api/predictions/latest");
  return response.data;
};

export const getDashboardSnapshot = async () => {
  const response = await api.get("/api/dashboard/snapshot");
  return response.data;
};

export const getLatestHardwareData = async () => {
  const response = await api.get("/api/hardware/latest");
  return response.data;
};

export const getHardwarePrediction = async () => {
  const response = await api.get("/api/hardware/prediction");
  return response.data;
};

export default api;