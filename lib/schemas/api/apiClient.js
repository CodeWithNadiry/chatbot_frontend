import axios from "axios";
import { useAuthStore } from "../../../store/useAuthStore";

const api = axios.create({
  baseURL: "https://chatbotbackend-production-dc6c.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore().getState().token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;