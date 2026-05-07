/**
 * App Root - Routes and theme configuration
 * Dark theme for gothic cathedral aesthetic.
 *
 * Auth: Supabase Auth (Discord, Google, email, phone) via AuthProvider.
 * Routes: Home, Login, AuthCallback, Lobby, GameBoard, Collection,
 *         BalanceAnalysis, MatchupMatrix, GameRules, DeckBuilder,
 *         Changelog, Terms, Privacy, Cookies, Profile, Brandbook
 *
 * All page routes are lazy-loaded for optimal code splitting.
 * SigilMenu provides global navigation overlay on non-game pages.
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch, useRoute } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import { AuthProvider } from "./contexts/AuthContext";
// Lazy-load global controls to defer framer-motion from critical path
const SigilMenu = lazy(() => import("./components/SigilMenu"));
const MusicToggle = lazy(() => import("./components/MusicToggle").then(m => ({ default: m.MusicToggle })));

// Lazy-load TutorialOverlay to defer framer-motion from critical path
const TutorialOverlay = lazy(() => import("./components/TutorialOverlay"));

// Lazy-load all page routes for code splitting
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Lobby = lazy(() => import("./pages/Lobby"));
const GameBoard = lazy(() => import("./pages/GameBoard"));
const Profile = lazy(() => import("./pages/Profile"));
const Collection = lazy(() => import("./pages/Collection"));
const BalanceAnalysis = lazy(() => import("./pages/BalanceAnalysis"));
const MatchupMatrix = lazy(() => import("./pages/MatchupMatrix"));
const GameRules = lazy(() => import("./pages/GameRules"));
const DeckBuilder = lazy(() => import("./pages/DeckBuilder"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Account = lazy(() => import("./pages/Account"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Brandbook = lazy(() => import("./pages/Brandbook"));
const CommunityDecks = lazy(() => import("./pages/CommunityDecks"));
const Chronicles = lazy(() => import("./pages/Chronicles"));
const ChronicleView = lazy(() => import("./pages/ChronicleView"));
const PlayerProfile = lazy(() => import("./pages/PlayerProfile"));
const HowToPlay = lazy(() => import("./pages/HowToPlay"));
const PracticeMode = lazy(() => import("./pages/PracticeMode"));
const Campaign = lazy(() => import("./pages/Campaign"));
const CampaignFight = lazy(() => import("./pages/CampaignFight"));
const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** Minimal loading spinner shown while page chunks load */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-amber-200/60 text-sm font-[Cinzel] tracking-wider">
          ENTERING THE CATHEDRAL...
        </p>
      </div>
    </div>
  );
}

/**
 * Global top-right controls bar — Music toggle + SigilMenu
 * Hidden during active gameplay (game board) and on login/auth pages.
 */
function GlobalControls() {
  const [isGamePage] = useRoute("/game/:gameId");
  const [isLobbyPage] = useRoute("/lobby/:gameId");
  const [isLoginPage] = useRoute("/login");
  const [isAuthCallback] = useRoute("/auth/callback");

  // Hide on game board, lobby, login, and auth callback
  if (isGamePage || isLobbyPage || isLoginPage || isAuthCallback) return null;

  return (
    <Suspense fallback={null}>
      <div className="fixed top-4 right-4 z-40 flex items-center gap-1">
        <MusicToggle />
        <SigilMenu />
      </div>
    </Suspense>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/lobby/:gameId" component={Lobby} />
        <Route path="/game/:gameId" component={GameBoard} />
        <Route path="/collection" component={Collection} />
        <Route path="/balance" component={BalanceAnalysis} />
        <Route path="/matchups" component={MatchupMatrix} />
        <Route path="/rules" component={GameRules} />
        <Route path="/how-to-play" component={HowToPlay} />
        <Route path="/practice" component={PracticeMode} />
        <Route path="/campaign" component={Campaign} />
        <Route path="/campaign/:missionId" component={CampaignFight} />
        <Route path="/deck-builder" component={DeckBuilder} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/changelog" component={Changelog} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/profile" component={Profile} />
        <Route path="/account" component={Account} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/brandbook" component={Brandbook} />
        <Route path="/faq" component={FAQ} />
        <Route path="/community" component={CommunityDecks} />
        <Route path="/chronicles" component={Chronicles} />
        <Route path="/chronicle/:gameId" component={ChronicleView} />
        <Route path="/player/:gamertag" component={PlayerProfile} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TutorialProvider>
            <TooltipProvider>
              <Toaster />
              <GlobalControls />
              <Router />
              <Suspense fallback={null}>
                <TutorialOverlay />
              </Suspense>
            </TooltipProvider>
          </TutorialProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
