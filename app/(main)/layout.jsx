"use client";

import { Fraunces, DM_Sans } from "next/font/google";
import "../globals.css";
import Sidebar from "../../components/Sidebar";
import ProtectedRoutes from "../../components/ProtectedRoutes";

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
  return (
    <ProtectedRoutes>
      <div className={`flex ${fraunces.variable} ${dmSans.variable}`}>
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoutes>
  );
}