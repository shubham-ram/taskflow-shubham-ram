import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AuthProvider>
      <App />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  </ThemeProvider>,
);
