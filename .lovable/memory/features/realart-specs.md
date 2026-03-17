8 REAL ART spec PDFs uploaded. Implement sequentially 1→8.

Spec 1 - Data Layer: DONE — unified collectionStore, boardStore shim, commentStore, linkStore, affiliateNetwork
Spec 2 - Navigation: Navbar user dropdown, QuickViewPanel two-panel, SaveToBoardModal
Spec 3 - Collections: DONE — Full collections system with access gates, VisBadge, FeaturedCard, CommunityCard, AccessModal (code+pay), CollectionFormModal (type/price/community), ShareModal, MergeModal, MyCollectionCard context menu, archive/unarchive, CollectionDetailPage private gate
Spec 4 - Account Page: 10 sections (profile/security/connected/appearance/privacy/comments/templates/earnings/ads/delete)
Spec 5 - Dashboard: 7 sections (overview/media/collections/earnings/ads/notifications/settings)
Spec 6 - Content Pages: BlogPage reader modal, ChallengeDetailPage submission, PromptLibraryPage pack detail, CommunityDetailPage feed tab
Spec 7 - Creator Discovery: CreatorPage follow persist, LeaderboardPage user highlight, ExplorePage empty state, TopicPage QuickView, CreatorsPage sort
Spec 8 - Upload & Image: UploadPage localStorage fallback, ImagePage download anchor, QuickViewPanel download/share wiring
Sidebar+Media standalone spec: DONE — Sidebar reorder (Dashboard→Explore→Media→Collections→Communities→Challenges→divider→Ads→Earnings), removed My Collections & Leaderboard from sidebar, Tooltips replaced with title attr, DashboardPage navItems updated, Media standalone filter added
Smart Routing + Welcome spec: DONE — WelcomePage 3-step onboarding, SignUpPage sets ra_new_user=1 & navigates to /welcome, Index smart routing, UploadPage increments ra_uploads
CreatePage spec: DONE — AI creation studio (Image/Video/Audio tabs), Navbar split into separate Create+Upload buttons, /create route now points to CreatePage
OnboardSync spec: DONE — WelcomePage dispatches ra_onboard_updated + auto-detects via sessionStorage, AppSidebar onboarding widget (countdown, dismiss X, progress steps, cross-tab sync), UploadPage/CollectionsPage/ExplorePage set sessionStorage markers, UploadPage localStorage fallback publish
