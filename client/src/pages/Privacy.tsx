/**
 * Privacy Policy Page
 * 
 * Accurate privacy policy reflecting:
 * - Email/OAuth login, Supabase DB, user accounts
 * - Minimal analytics (Umami), session cookies
 * - No third-party tracking, no ad networks
 * Dark gothic branding, mobile responsive.
 */

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import EmberField from "@/components/EmberField";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Privacy() {
  usePageMeta({
    title: "Privacy Policy",
    description: "Privacy policy for the 7 Deadly Sins Card Game. Learn how we collect, use, and protect your personal data.",
    canonicalPath: "/privacy",
  });

  return (
    <div className="min-h-screen bg-[var(--color-page-bg-deep)] relative overflow-hidden">
      <EmberField count={12} />
      <div className="absolute inset-0 noise-overlay pointer-events-none" style={{ zIndex: 1 }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-heading)" }}>Back to Cathedral</span>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Your Secrets Are Safe
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white/90 tracking-wider mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            PRIVACY POLICY
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/15" />
            <div className="w-1 h-1 rotate-45 bg-white/15" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/15" />
          </div>
          <p className="text-[10px] text-white/20 mt-4" style={{ fontFamily: "var(--font-body)" }}>
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10">

          {/* TL;DR */}
          <section>
            <div className="rounded-xl p-6 border border-sloth/15 bg-sloth/[0.03]">
              <h2 className="text-lg font-bold text-sloth/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                TL;DR
              </h2>
              <p className="text-sm text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                Games should be for fun, not extraction. If you play as a guest, we store almost nothing — just a temporary player ID in your browser.
                If you create an account, we store your user ID, name, and email to manage your account and saved decks.
                We use privacy-friendly analytics (no personal tracking). We don't sell data. We don't use ad networks.
                We don't use Google Analytics or Facebook Pixel. Your data exists to make the game work, not to make money.
              </p>
            </div>
          </section>

          {/* What We Collect */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              I. WHAT WE COLLECT
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                <strong className="text-white/60">Guest players (no account):</strong> We do not collect personal data from
                guest players. Your browser stores a temporary player ID and preferences (username, sound settings) in
                localStorage. This data never leaves your device.
              </p>
              <p>
                <strong className="text-white/60">Signed-in users:</strong> When you create an account or sign in, we receive and
                store the following:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">User ID:</strong> A unique identifier for your account</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Display name:</strong> Your chosen username</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Email address:</strong> Used for account identification only</span>
                </li>
              </ul>
              <p>
                This data is stored in our <strong className="text-white/60">Supabase (PostgreSQL) database hosted in the EU</strong> and is used solely to manage your account,
                associate your saved decks, and display your name in-game. We chose Supabase for its transparency and open-source foundation.
              </p>
            </div>
          </section>

          {/* Game Data */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              II. GAME DATA
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                When you play games (signed in), the following is stored server-side:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Saved decks:</strong> Your custom deck configurations (card selections, deck names, faction choices)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Game logs:</strong> Match actions (card plays, passes, consumes) for game state management during active matches</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Game results:</strong> Win/loss records associated with your account</span>
                </li>
              </ul>
              <p>
                Guest game data is stored temporarily in Supabase during the active match and is not permanently
                associated with any identity.
              </p>
            </div>
          </section>

          {/* Local Storage */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              III. LOCAL BROWSER STORAGE
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                The game stores data in your browser's localStorage for functionality:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Player ID:</strong> A randomly generated identifier for game sessions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Username:</strong> Your chosen display name</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Sound/music preferences:</strong> Mute states for audio</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Guest deck data:</strong> If not signed in, one saved deck is stored locally</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Tutorial progress:</strong> Which tutorial steps you've completed</span>
                </li>
              </ul>
              <p>
                All localStorage data stays on your device. You can clear it anytime via your browser settings.
              </p>
            </div>
          </section>

          {/* Analytics */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              IV. ANALYTICS
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                We use <strong className="text-white/60">privacy-friendly, cookie-free analytics</strong> to understand
                basic usage patterns (page views, visitor counts). This analytics service:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>Does <strong className="text-white/60">not</strong> use cookies or set any tracking identifiers</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>Does <strong className="text-white/60">not</strong> collect personal data or IP addresses</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>Does <strong className="text-white/60">not</strong> track users across websites</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>Is compliant with GDPR, CCPA, and PECR without requiring consent</span>
                </li>
              </ul>
              <p>
                We do <strong className="text-white/60">not</strong> use Google Analytics, Facebook Pixel, Hotjar, Mixpanel,
                or any other invasive analytics or tracking service.
              </p>
            </div>
          </section>

          {/* Discussion Comments */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              V. DISCUSSION COMMENTS
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                The Balance Analysis page has a discussion section. When you post a comment, the following is stored:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>Your display name (from your account or chosen as guest)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>The text content of your comment</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>A timestamp of when it was posted</span>
                </li>
              </ul>
              <p>
                Comments are public and visible to all visitors.
              </p>
            </div>
          </section>

          {/* Third Parties */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              VI. THIRD-PARTY SERVICES
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                The game uses the following third-party services:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Supabase Auth:</strong> For user authentication (email, social login). Governed by <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">Supabase's Privacy Policy</a>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Supabase:</strong> For database hosting and real-time multiplayer. Data is stored on Supabase's EU-based infrastructure (PostgreSQL). Supabase is open-source and you can review their practices at <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">supabase.com/privacy</a>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Vercel:</strong> For application hosting. Standard server logs may be processed per{" "}
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                      Vercel's Privacy Policy
                    </a>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Google Fonts:</strong> For typography (Cinzel, EB Garamond). Google may log font requests per their privacy policy.</span>
                </li>
              </ul>
              <p>
                We do not share your data with advertising networks, data brokers, or any other third parties
                beyond those listed above.
              </p>
            </div>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              VII. CHILDREN'S PRIVACY
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                This game is not directed at children under 13. We do not knowingly collect personal data from
                children under 13. The dark gothic theme and strategic complexity are designed for older audiences.
                If you believe a child under 13 has provided personal data through account creation, please contact
                us at{" "}<a href="mailto:sinners@7sinscardgame.com" className="text-amber-400/60 hover:text-amber-400 underline">sinners@7sinscardgame.com</a>{" "}and we will promptly delete it.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              VIII. YOUR RIGHTS
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Under the{" "}
                <a href="https://gdpr.eu/" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                  EU General Data Protection Regulation (GDPR)
                </a>{" "}
                and the{" "}
                <a href="https://oag.ca.gov/privacy/ccpa" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                  California Consumer Privacy Act (CCPA)
                </a>,
                you have the right to:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Access</strong> your personal data (account info, saved decks, game history)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Delete</strong> your account and all associated data</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Export</strong> your data in a portable format</span>
                </li>
              </ul>
              <p>
                To exercise these rights, contact us at{" "}
                <a href="mailto:sinners@7sinscardgame.com" className="text-amber-400/60 hover:text-amber-400 underline">sinners@7sinscardgame.com</a>.
                We will respond within 30 days.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              IX. CONTACT
            </h2>
            <div className="text-sm text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                If you have questions about this privacy policy or want to exercise your data rights,
                reach out at{" "}
                <a href="mailto:sinners@7sinscardgame.com" className="text-amber-400/60 hover:text-amber-400 underline">sinners@7sinscardgame.com</a>.
                We read everything.
              </p>
            </div>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-4">
          <Link href="/terms" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Terms & Conditions
          </Link>
          <span className="text-white/10">&middot;</span>
          <Link href="/cookies" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Cookie Policy
          </Link>
          <span className="text-white/10">&middot;</span>
          <Link href="/" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
