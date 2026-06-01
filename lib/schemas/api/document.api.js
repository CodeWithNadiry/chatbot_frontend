import api from "./apiClient";

export const documentAPI = {
  getAll: async () => {
    const res = await api.get("/documents");
    return res.data.documents;
  },

  upload: async (formData) => {
  const res = await api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" } // This tells the server: “The request body contains multiple separate parts (text + files). Please parse it accordingly."
  });

  return res.data;
  
},

  delete: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};
