import axios from "axios";
import { useAuthStore } from "../../../store/useAuthStore";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => { // "Before sending any request, run this function first.
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

// This is why you don't manually write:

// api.get("/chat", {
//   headers: {
//     Authorization: `Bearer ${token}`
//   }
// });

// for every request. The interceptor does it automatically for all requests.

// https://chatbotbackend-production-dc6c.up.railway.app