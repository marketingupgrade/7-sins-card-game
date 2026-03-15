/**
 * Cookie Policy Page
 * 
 * Accurate cookie policy reflecting:
 * - Session cookie from authentication (JWT)
 * - localStorage usage for game state
 * - No tracking cookies, no ad cookies
 * Dark gothic branding, mobile responsive.
 */

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import EmberField from "@/components/EmberField";

export default function Cookies() {
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
            Almost Nothing to Report
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white/90 tracking-wider mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            COOKIE POLICY
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

          {/* The Big Reveal */}
          <section>
            <div className="rounded-xl p-8 border border-sloth/15 bg-sloth/[0.03] text-center">
              <h2 className="text-2xl font-bold text-sloth/80 tracking-wider mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                ALMOST NO COOKIES.
              </h2>
              <p className="text-sm text-white/50 leading-relaxed max-w-lg mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                We use exactly one cookie — a session cookie if you sign in. No tracking cookies. No analytics cookies.
                No advertising cookies. No third-party cookies. That's it.
              </p>
            </div>
          </section>

          {/* Session Cookie */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              I. THE ONE COOKIE WE USE
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                If you sign in to your account, we set a single <strong className="text-white/60">session cookie</strong>
                {" "}containing a JWT (JSON Web Token). This cookie:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>Keeps you logged in so you don't have to re-authenticate on every page</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>Is <strong className="text-white/60">HttpOnly</strong> — JavaScript cannot read it, protecting against XSS attacks</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>Is <strong className="text-white/60">strictly functional</strong> — it exists only for authentication, not tracking</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>Is removed when you log out or when the session expires</span>
                </li>
              </ul>
              <p>
                If you don't sign in, no cookies are set at all. Guest players are entirely cookie-free.
              </p>
            </div>
          </section>

          {/* What Are Cookies */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              II. WHAT ARE COOKIES?
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Cookies are small text files that websites store on your device to remember information about you.
                They're commonly used for tracking, analytics, advertising, and session management.
                As defined by the{" "}
                <a href="https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                  UK Information Commissioner's Office (ICO)
                </a>:
              </p>
              <blockquote className="border-l-2 border-white/10 pl-4 italic text-white/30">
                "Cookies are small files placed on your device by a website when you visit it. They are widely used
                to make websites work, or work more efficiently, as well as to provide information to the owners of the site."
              </blockquote>
              <p>
                Our single session cookie falls under the "strictly necessary" category — it's required for
                the login feature to function and is exempt from consent requirements under the EU ePrivacy Directive.
              </p>
            </div>
          </section>

          {/* Local Storage vs Cookies */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              III. LOCAL STORAGE (NOT COOKIES)
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                We also use your browser's <strong className="text-white/60">localStorage</strong> to store game preferences
                and state. This is technically different from cookies:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>localStorage data is <strong className="text-white/60">never sent to our servers</strong> with requests (unlike cookies)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>It stays entirely on your device</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>It cannot be used for cross-site tracking</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>You can clear it anytime in your browser settings</span>
                </li>
              </ul>
              <p>
                We store the following in localStorage: player ID, username, sound/music preferences, guest deck data,
                and tutorial progress. All purely functional. See our{" "}
                <Link href="/privacy" className="text-white/50 underline hover:text-white/70 transition-colors">
                  Privacy Policy
                </Link>{" "}
                for full details.
              </p>
            </div>
          </section>

          {/* No Cookie Banner */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              IV. WHY NO COOKIE BANNER?
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Under the{" "}
                <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32002L0058" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                  EU ePrivacy Directive
                </a>,
                strictly necessary cookies (those required for a service the user has explicitly requested, such as login)
                are exempt from consent requirements. Since our only cookie is a session cookie for authentication,
                and we use no tracking, analytics, or advertising cookies, a cookie consent banner is not required.
              </p>
              <p>
                You're welcome. We hate those banners too.
              </p>
            </div>
          </section>

          {/* Cookie Table */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              V. COMPLETE COOKIE INVENTORY
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <div className="rounded-lg border border-white/8 overflow-hidden">
                <div className="grid grid-cols-4 gap-px bg-white/5">
                  <div className="bg-[var(--color-page-bg)] p-3 text-[10px] font-bold text-white/50 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Name</div>
                  <div className="bg-[var(--color-page-bg)] p-3 text-[10px] font-bold text-white/50 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Purpose</div>
                  <div className="bg-[var(--color-page-bg)] p-3 text-[10px] font-bold text-white/50 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Type</div>
                  <div className="bg-[var(--color-page-bg)] p-3 text-[10px] font-bold text-white/50 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Duration</div>
                </div>
                <div className="grid grid-cols-4 gap-px bg-white/5">
                  <div className="bg-[var(--color-page-bg-deep)] p-3 text-xs text-white/40 font-mono">session</div>
                  <div className="bg-[var(--color-page-bg-deep)] p-3 text-xs text-white/40">Authentication (JWT)</div>
                  <div className="bg-[var(--color-page-bg-deep)] p-3 text-xs text-white/40">Strictly necessary</div>
                  <div className="bg-[var(--color-page-bg-deep)] p-3 text-xs text-white/40">Session / expiry</div>
                </div>
              </div>
              <p className="text-white/30 text-xs italic mt-2">
                That's the entire list. One cookie. For login. That's all.
              </p>
            </div>
          </section>

          {/* Future */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              VI. WILL THIS CHANGE?
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                We have no plans to add tracking, analytics, or advertising cookies. Games should be for fun, not extraction.
                This game exists for the love of gaming, not for harvesting data. If this policy ever changes, we'll update this page and add a
                proper consent mechanism if required.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              VII. CONTACT
            </h2>
            <div className="text-sm text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Questions about cookies or data storage? Reach out at{" "}
                <a href="mailto:sinners@7sinscardgame.com" className="text-amber-400/60 hover:text-amber-400 underline">sinners@7sinscardgame.com</a>.
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
          <Link href="/privacy" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Privacy Policy
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
