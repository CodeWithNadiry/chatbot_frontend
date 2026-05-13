"use client";

import { Fraunces, DM_Sans } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import "../globals.css";
import Sidebar from "../../components/Sidebar";
import ProtectedRoutes from "../../components/ProtectedRoutes";
import { useAuthStore } from "../../store/useAuthStore";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600"],
});

export default function MainLayout({ children }) {
  const { token, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token && !isAuthPage) {
      router.replace("/login");
    }
  }, [hasHydrated, token, isAuthPage, router]);

  if (!hasHydrated) return null;

  return (
    <ProtectedRoutes>
      <div className={`flex ${fraunces.variable} ${dmSans.variable}`}>
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoutes>
  );
}