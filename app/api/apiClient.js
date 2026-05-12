// import { useAuthStore } from "../../store/useAuthStore"
import axios from "axios";
export const apiClient = axios.create({
  baseUrl: "https://chatbotbackend-production-dc6c.up.railway.app",
});

// apiClient.interceptors.request.use(config => {
//   const token = useAuthStore.getState().token;

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }

//   return config;
// })
