import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@/index.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthProvider";
import { BranchProvider } from "@/contexts/BranchContext";
import { router } from "@/routes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BranchProvider>
        <RouterProvider router={router} />
        <Toaster
          richColors
          closeButton
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Prompt', sans-serif",
            },
            className: "!w-auto !min-w-0 !max-w-[400px]"
          }}
        />
      </BranchProvider>
    </AuthProvider>
  </React.StrictMode>
);
