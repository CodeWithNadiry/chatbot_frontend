import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,

      login: (data) =>
        set({
          token: data.token,
          user: data.user,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
        }),

      setHasHydrated: (state) =>
        set({
          hasHydrated: state,
        }),
    }),
    {
      name: "auth-storage",

      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      },
    }
  )
);