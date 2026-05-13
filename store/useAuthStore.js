import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      hasHydrated: false,

      setHasHydrated: (state) => {
        set({
          hasHydrated: state,
        });
      },

      login: (data) => {
        set({
          token: data.token,
          user: data.user,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
        });
      },
    }),
    {
      name: "auth-storage",

      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      },
    }
  )
);