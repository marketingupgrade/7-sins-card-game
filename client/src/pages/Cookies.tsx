/**
 * Cookie Policy Page
 * 
 * We don't use cookies. That's the policy.
 * Dark gothic branding, mobile responsive.
 */

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import EmberField from "@/components/EmberField";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
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
            The Shortest Policy Ever Written
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
                WE DON'T USE COOKIES.
              </h2>
              <p className="text-sm text-white/50 leading-relaxed max-w-lg mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                That's it. That's the cookie policy. No tracking cookies. No analytics cookies.
                No advertising cookies. No third-party cookies. No first-party cookies.
                No cookies of any kind. You can close this tab now.
              </p>
            </div>
          </section>

          {/* Still reading? */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              STILL READING?
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Alright, since you're still here, let's be thorough.
              </p>
            </div>
          </section>

          {/* What Are Cookies */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              I. WHAT ARE COOKIES?
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
                We don't use any of them. Not a single one.
              </p>
            </div>
          </section>

          {/* Local Storage vs Cookies */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              II. LOCAL STORAGE IS NOT COOKIES
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                We do use your browser's <strong className="text-white/60">localStorage</strong> to store game preferences
                (like your chosen username and sound settings). This is technically different from cookies:
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
                Under the{" "}
                <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32002L0058" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                  EU ePrivacy Directive
                </a>,
                localStorage used strictly for functionality (not tracking) is generally exempt from consent requirements.
                Ours is purely functional.
              </p>
            </div>
          </section>

          {/* No Cookie Banner */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              III. WHY NO COOKIE BANNER?
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Because we don't use cookies. Cookie consent banners are required when websites use non-essential cookies
                (tracking, analytics, advertising). Since we use exactly zero cookies, there's nothing to consent to.
              </p>
              <p>
                You're welcome. We hate those banners too.
              </p>
            </div>
          </section>

          {/* Future */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              IV. WILL THIS CHANGE?
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                No. We have no plans to add cookies, tracking, or analytics. Not now. Not in the future.
                This game exists for the love of gaming, not for harvesting data.
              </p>
              <p>
                If for some extraordinary reason this policy ever changes, we'll update this page.
                But honestly? Don't hold your breath.
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
