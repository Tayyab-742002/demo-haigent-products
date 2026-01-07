"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "#1a1a2e",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          color: "#ffffff",
        },
        className: "sonner-toast",
      }}
    />
  );
}
