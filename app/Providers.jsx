"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    // Pass the client instance as a prop
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
