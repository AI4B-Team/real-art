import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Round 1 — Core
import ImagePage from "./pages/ImagePage";
import CreatorPage from "./pages/CreatorPage";
import ExplorePage from "./pages/ExplorePage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionDetailPage from "./pages/CollectionDetailPage";
import CreateCollectionPage from "./pages/CreateCollectionPage";

// Round 2 — Community
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityDetailPage from "./pages/CommunityDetailPage";
import ChallengesPage from "./pages/ChallengesPage";
import ChallengeDetailPage from "./pages/ChallengeDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";

// Round 3 — Creator Tools
import UploadPage from "./pages/UploadPage";
import CreateGalleryPage from "./pages/CreateGalleryPage";
import PromptLibraryPage from "./pages/PromptLibraryPage";
import AffiliatesPage from "./pages/AffiliatesPage";

// Round 4 — Company
import AboutPage from "./pages/AboutPage";
import LicensePage from "./pages/LicensePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import BlogPage from "./pages/BlogPage";

// Round 5 — Auth + Dashboard
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdsPage from "./pages/AdsPage";

import CreatorsPage from "./pages/CreatorsPage";
import BoardsPage from "./pages/BoardsPage";
import BoardDetailPage from "./pages/BoardDetailPage";
import TopicPage from "./pages/TopicPage";

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

          {/* Round 1 — Core browse */}
          <Route path="/image/:id" element={<ImagePage />} />
          <Route path="/creator/:id" element={<CreatorPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/photos" element={<ExplorePage />} />
          <Route path="/videos" element={<ExplorePage />} />
          <Route path="/music" element={<ExplorePage />} />
          <Route path="/trending" element={<ExplorePage />} />
          <Route path="/3d-art" element={<ExplorePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/create" element={<CreateCollectionPage />} />
          <Route path="/collections/:id" element={<CollectionDetailPage />} />

          {/* Round 2 — Community */}
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/communities/:id" element={<CommunityDetailPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/boards/:id" element={<BoardDetailPage />} />
          <Route path="/topic/:slug" element={<TopicPage />} />

          {/* Round 3 — Creator Tools */}
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/create-gallery" element={<CreateGalleryPage />} />
          <Route path="/prompts" element={<PromptLibraryPage />} />
          <Route path="/prompt-packs" element={<PromptLibraryPage />} />
          <Route path="/affiliates" element={<AffiliatesPage />} />
          <Route path="/vaults" element={<Navigate to="/create-gallery" replace />} />
          <Route path="/style-transfer" element={<Navigate to="/explore" replace />} />

          {/* Round 4 — Company */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/license" element={<LicensePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/blog" element={<BlogPage />} />

          {/* Round 5 — Auth + Dashboard */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ads" element={<AdsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
