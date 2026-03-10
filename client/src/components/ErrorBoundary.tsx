/**
 * ErrorBoundary - When the game itself sins
 * Even the code has anger issues sometimes.
 */

import { cn } from "@/lib/utils";
import { Skull, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-arena noise-overlay">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 text-center">
            <Skull
              size={48}
              className="text-wrath mb-6 flex-shrink-0 drop-shadow-[0_0_12px_oklch(0.6_0.28_25/0.4)]"
            />

            <h2
              className="text-xl mb-2 text-foreground font-bold tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              WELL, THAT BROKE
            </h2>

            <p
              className="text-sm text-muted-foreground/60 mb-4"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              The game crashed. Even the code has its limits. Unlike your poor decisions.
            </p>

            <p
              className="text-base mb-6"
              style={{
                fontFamily: "'Creepster', cursive",
                color: "oklch(0.82 0.16 195)",
                textShadow: "0 0 10px oklch(0.82 0.16 195 / 0.5)",
              }}
            >
              "The void consumed the arena. How dramatic."
            </p>

            <div className="p-4 w-full rounded-xl bg-background/60 border border-border/30 overflow-auto mb-6 text-left">
              <pre className="text-xs text-muted-foreground/60 whitespace-break-spaces" style={{ fontFamily: "monospace" }}>
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl",
                "text-white font-bold text-sm uppercase tracking-wider",
                "hover:opacity-90 cursor-pointer transition-all"
              )}
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: "linear-gradient(135deg, oklch(0.55 0.25 25), oklch(0.45 0.22 15))",
                border: "1px solid oklch(0.6 0.28 25 / 0.5)",
              }}
            >
              <RotateCcw size={16} />
              TRY AGAIN (OPTIMISTIC)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
