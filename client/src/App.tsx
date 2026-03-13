/**
 * App Root - Routes and theme configuration
 * Dark theme for gothic cathedral aesthetic.
 * Routes: Home, Lobby, GameBoard, Collection, BalanceAnalysis, MatchupMatrix, GameRules, Profile
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
import SigilMenu from "./components/SigilMenu";
import { MusicToggle } from "./components/MusicToggle";

// Lazy-load TutorialOverlay to defer framer-motion from critical path
const TutorialOverlay = lazy(() => import("./components/TutorialOverlay"));

// Lazy-load all page routes for code splitting
const Home = lazy(() => import("./pages/Home"));
const Lobby = lazy(() => import("./pages/Lobby"));
const GameBoard = lazy(() => import("./pages/GameBoard"));
const Profile = lazy(() => import("./pages/Profile"));
const Collection = lazy(() => import("./pages/Collection"));
const BalanceAnalysis = lazy(() => import("./pages/BalanceAnalysis"));
const MatchupMatrix = lazy(() => import("./pages/MatchupMatrix"));
const GameRules = lazy(() => import("./pages/GameRules"));
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
 * Hidden during active gameplay (game board) to avoid clutter.
 */
function GlobalControls() {
  const [isGamePage] = useRoute("/game/:gameId");
  const [isLobbyPage] = useRoute("/lobby/:gameId");

  // Hide on game board (already has its own controls)
  if (isGamePage || isLobbyPage) return null;

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-1">
      <MusicToggle />
      <SigilMenu />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/lobby/:gameId" component={Lobby} />
        <Route path="/game/:gameId" component={GameBoard} />
        <Route path="/collection" component={Collection} />
        <Route path="/balance" component={BalanceAnalysis} />
        <Route path="/matchups" component={MatchupMatrix} />
        <Route path="/rules" component={GameRules} />
        <Route path="/profile" component={Profile} />
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
