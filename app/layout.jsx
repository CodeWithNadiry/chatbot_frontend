import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
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

export const metadata = {
  title: "IntelliChat – AI Knowledge Base Chatbot",
  description:
    "IntelliChat is a document-driven AI chatbot that lets users upload files, build a knowledge base, and ask questions using intelligent retrieval-augmented generation for accurate, context-aware answers.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>
          <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
