import { create } from "zustand";

export const useConversationStore = create((set) => ({
  pendingMessages: null,      // { conversationId, messages }
  setPendingMessages: (data) => set({ pendingMessages: data }),
  clearPendingMessages: () => set({ pendingMessages: null }),
}));