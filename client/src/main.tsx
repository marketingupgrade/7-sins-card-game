/**
 * Main entry point - No tRPC needed for Vercel deployment
 * The app uses direct Supabase calls from the client.
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
