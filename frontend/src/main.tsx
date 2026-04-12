import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import App from "./App";
import "./index.css";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      position="top-right"
      theme={resolvedTheme as "light" | "dark" | undefined}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <TooltipProvider>
      <AuthProvider>
        <App />
        <ThemedToaster />
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>,
);
