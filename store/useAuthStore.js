import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      token: null,
      user: null,

      login: (data) => {
        set({
          isLoggedIn: true,
          token: data.token,
          user: data.user,
        });
      },

      logout: () => {
        set({
          isLoggedIn: false,
          token: null,
          user: null,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);