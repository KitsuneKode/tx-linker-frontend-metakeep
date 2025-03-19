
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Transaction from "./pages/Transaction";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { logPageView } from "./lib/metakeep";

// Component to handle route changes and log page views
const RouteChangeTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Log generic page load for any route change
    logPageView('page_load', { path: location.pathname });
  }, [location]);
  
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteChangeTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/transaction/:txData" element={<Transaction />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
