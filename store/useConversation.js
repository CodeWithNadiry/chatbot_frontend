import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useConversationStore = create(
  persist(
    (set) => ({
      activeConversationId: null,
      refreshChats: false,

      setActiveConversationId: (id) => {
        set({ activeConversationId: id });
      },

      triggerRefresh: () => {
        set((state) => ({
          refreshChats: !state.refreshChats,
        }));
      },
    }),
    { name: "conversation-storage" }
  )
);