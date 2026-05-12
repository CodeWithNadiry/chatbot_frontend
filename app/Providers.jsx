"use client";

import {  QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }) {

  return (
    <QueryClientProvider>{children}</QueryClientProvider>
  );
}
