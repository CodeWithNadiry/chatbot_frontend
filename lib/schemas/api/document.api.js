import api from "./apiClient";

export const documentAPI = {
  getAll: async () => {
    const res = await api.get("/documents");
    return res.data.documents;
  },

  upload: async (payload) => {
    const res = await api.post("/documents/upload", payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};