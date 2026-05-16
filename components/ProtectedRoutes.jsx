"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoutes({ children }) {
  const router = useRouter();

  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      router.replace("/login");
    }
  }, [token, hasHydrated, router]);

  if (!hasHydrated) return null;

  if (!token) return null;

  return children;
}