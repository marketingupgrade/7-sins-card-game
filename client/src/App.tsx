/**
 * App Root - Routes and theme configuration
 * Dark theme for cyberpunk aesthetic.
 * Routes: Home (lobby), Lobby (pre-game), GameBoard (gameplay)
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import TutorialOverlay from "./components/TutorialOverlay";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import GameBoard from "./pages/GameBoard";
import PromoVideo from "./pages/PromoVideo";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/lobby/:gameId" component={Lobby} />
      <Route path="/game/:gameId" component={GameBoard} />
      <Route path="/promo" component={PromoVideo} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
