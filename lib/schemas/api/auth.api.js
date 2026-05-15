import api from "./apiClient";

export const authAPI = {
  login: async (payload) => {
    const res = await api.post("/auth/login", payload);
    return res.data;
  },

  signup: async (payload) => {
    const res = await api.post("/auth/signup", payload);
    return res.data;
  },
};