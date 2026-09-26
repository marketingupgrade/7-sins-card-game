/**
 * Main entry point - tRPC + React Query providers
 * Wraps the App with tRPC and QueryClient providers for server communication.
 */

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

// A deploy replaces every hashed chunk. Anyone with a tab open from before
// it then gets "Failed to fetch dynamically imported module" the moment they
// open a lazy route or launch a game. Reload once to pick up the new build.
// Game state lives in Supabase, so a reload loses nothing. The timestamp
// guard stops a reload loop if the chunk is genuinely unreachable.
window.addEventListener("vite:preloadError", (event) => {
  const KEY = "7s-chunk-reload-at";
  let last = 0;
  try { last = Number(sessionStorage.getItem(KEY)) || 0; } catch {}
  if (Date.now() - last < 30_000) return; // already tried — let the page's own error UI show
  try { sessionStorage.setItem(KEY, String(Date.now())); } catch {}
  event.preventDefault();
  window.location.reload();
});

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
