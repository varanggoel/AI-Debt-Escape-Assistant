"use client";

import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/components/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      {children}
    </ThemeProvider>
  );
}
