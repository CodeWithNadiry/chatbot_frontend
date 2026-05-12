import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useModalStore = create(
  persist(
    (set) => ({
      activeModal: null,

      openModal: (modalName) => {
        set({
          activeModal: modalName,
        });
      },

      closeModal: () => {
        set({
          activeModal: null,
        });
      },
    }),
    {
      name: "modal-storage",
    }
  )
);