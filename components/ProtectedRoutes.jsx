"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoutes({ children }) {
  const [hydrated, setHydrated] = useState(false)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
  } , [])
  
  useEffect(() => {
    if (!hydrated) return; // restoring persisted state into memory.

    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router, hydrated]);


  return children;
}