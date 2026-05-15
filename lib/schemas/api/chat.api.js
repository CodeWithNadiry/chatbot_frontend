import api from "./apiClient";

export const chatAPI = {
  sendQuery: async (payload) => {
    const res = await api.post("/chats/query", payload);
    return res.data;
  },

  getConversations: async () => {
    const res = await api.get('/chats');
    console.log(res)
    return res.data;
  },

  getConversation: async (id) => {
    const res = await api.get(`/chats/${id}`);
    return res.data;
  },
  
};