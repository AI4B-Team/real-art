import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Round 1 — Core pages
import ImagePage from "./pages/ImagePage";
import CreatorPage from "./pages/CreatorPage";
import ExplorePage from "./pages/ExplorePage";
import CollectionsPage from "./pages/CollectionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Index />} />

          {/* Round 1 — Core */}
          <Route path="/image/:id" element={<ImagePage />} />
          <Route path="/creator/:id" element={<CreatorPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/photos" element={<ExplorePage />} />
          <Route path="/videos" element={<ExplorePage />} />
          <Route path="/music" element={<ExplorePage />} />
          <Route path="/trending" element={<ExplorePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
