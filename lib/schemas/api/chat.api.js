import api from "./apiClient";
import { useAuthStore } from "../../../store/useAuthStore";

export const chatAPI = {
  sendQuery: async (payload) => {
    const res = await api.post("/chats/query", payload);
    return res.data;
  },

  sendQueryStream: async ({ question, conversationId, onChunk }) => {
    const token = useAuthStore.getState().token;

    const res = await fetch(
      "http://localhost:5000/chats/stream",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          conversationId,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const reader = res.body.getReader(); // "Give me access to stream chunks"
    const decoder = new TextDecoder();

    let full = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true }); // "Convert binary data into text"

      full += chunk; // "Build final complete sentence"

      onChunk?.(chunk, full); // "Update UI immediately"
    }

    return full;
  },

  getConversations: async () => {
    const res = await api.get("/chats");
    return res.data;
  },

  getConversation: async (id) => {
    const res = await api.get(`/chats/${id}`);
    return res.data;
  },
};
