/**
 * App Root - Routes and theme configuration
 * Dark theme for cyberpunk aesthetic.
 * Routes: Home (lobby), Lobby (pre-game), GameBoard (gameplay)
 *
 * All page routes are lazy-loaded for optimal code splitting.
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import TutorialOverlay from "./components/TutorialOverlay";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TutorialProvider } from "./contexts/TutorialContext";

// Lazy-load all page routes for code splitting
const Home = lazy(() => import("./pages/Home"));
const Lobby = lazy(() => import("./pages/Lobby"));
const GameBoard = lazy(() => import("./pages/GameBoard"));
const PromoVideo = lazy(() => import("./pages/PromoVideo"));
const DeckBuilder = lazy(() => import("./pages/DeckBuilder"));
const Profile = lazy(() => import("./pages/Profile"));
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

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/lobby/:gameId" component={Lobby} />
        <Route path="/game/:gameId" component={GameBoard} />
        <Route path="/promo" component={PromoVideo} />
        <Route path="/deck-builder" component={DeckBuilder} />
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
            <Router />
            <TutorialOverlay />
          </TooltipProvider>
        </TutorialProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
