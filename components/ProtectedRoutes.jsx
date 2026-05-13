"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoutes({ children }) {
  const router = useRouter();

  const token = useAuthStore((state) => state.token);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.replace("/login");
    }
  }, [token, hydrated, router]);

  if (!hydrated) return null;

  if (!token) return null;

  return children;
}