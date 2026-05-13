import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

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

      isLoggedIn: () => !!get().token,
    }),
    {
      name: "auth-storage",
    }
  )
);