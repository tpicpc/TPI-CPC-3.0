"use client";

import { HomeDataProvider } from "@/contexts/HomeDataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <HomeDataProvider>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster position="top-right" />
          </TooltipProvider>
        </HomeDataProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
