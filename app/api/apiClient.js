// import { useAuthStore } from "../../store/useAuthStore"
import axios from "axios";
export const apiClient = axios.create({
  baseUrl: "http://localhost:5000",
});

// apiClient.interceptors.request.use(config => {
//   const token = useAuthStore.getState().token;

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }

//   return config;
// })
