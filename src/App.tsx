import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import Index from "./modules/home/pages/Index";
import NotFound from "./modules/home/pages/NotFound";
import { StyleGuidePage } from "./modules/styleguide/pages";
import { lazy, Suspense } from "react";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();
const ChatwootWidget = lazy(() => import("@/components/ChatwootWidget").then(module => ({ default: module.ChatwootWidget })));

const App = () => {
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Retrasamos la carga del chat 5 segundos para no bloquear el inicio
    const timer = setTimeout(() => {
      setShowChat(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
<Suspense fallback={null}>
  <ChatwootWidget />
</Suspense>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/styleguide" element={<StyleGuidePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
export default App;
