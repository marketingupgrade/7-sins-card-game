/**
 * Privacy Policy Page
 * 
 * Honest, no-BS privacy policy. We don't collect anything.
 * Dark gothic branding, mobile responsive.
 */

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import EmberField from "@/components/EmberField";

export default function Privacy() {
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
                We don't collect your data. We don't track you. We don't use analytics. We don't set tracking cookies.
                We don't sell anything because there's nothing to sell. This is the shortest privacy policy you'll ever read
                that actually means what it says.
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
                <strong className="text-white/60">Nothing.</strong> Seriously. No email addresses. No names. No IP logging.
                No device fingerprinting. No behavioral tracking. No analytics scripts. No pixels. No beacons.
                No third-party trackers of any kind.
              </p>
            </div>
          </section>

          {/* Local Storage */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              II. LOCAL BROWSER STORAGE
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                The game stores a small amount of data in your browser's local storage to make the game work.
                This includes:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Player ID:</strong> A randomly generated identifier so the game knows which seat is yours during a match. This is generated locally in your browser and never sent to any server for tracking purposes.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Username:</strong> The display name you choose for in-game sessions. Stored locally so you don't have to re-enter it every time.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span><strong className="text-white/60">Sound/Music preferences:</strong> Whether you've muted the music or sound effects.</span>
                </li>
              </ul>
              <p>
                All of this stays on your device. You can clear it anytime by clearing your browser data.
                We never access, transmit, or store this information on our servers.
              </p>
            </div>
          </section>

          {/* Discussion Comments */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              III. DISCUSSION COMMENTS
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                The Balance Analysis page has a discussion section where you can post comments. When you post a comment,
                the following is stored on our server:
              </p>
              <ul className="list-none space-y-2 ml-2">
                <li className="flex gap-2">
                  <span className="text-white/20 shrink-0">&mdash;</span>
                  <span>The display name you chose (which can be anything — we don't verify it)</span>
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
                No email, no IP address, no account information is stored alongside comments.
                Comments are public and visible to all visitors.
              </p>
            </div>
          </section>

          {/* Third Parties */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              IV. THIRD PARTIES
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                We do not share data with third parties because we do not collect data from you.
                We do not use Google Analytics, Facebook Pixel, Hotjar, Mixpanel, or any other
                analytics or tracking service. Not now. Not in the future.
              </p>
              <p>
                The game is hosted on <strong className="text-white/60">Vercel</strong>, which may process standard
                server logs (IP addresses in access logs) as part of their hosting infrastructure. This is standard
                web hosting behavior and is governed by{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                  Vercel's Privacy Policy
                </a>.
                We do not access or use these logs.
              </p>
            </div>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              V. CHILDREN'S PRIVACY
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Since we don't collect any personal data from anyone, we also don't collect data from children.
                The game is free to play for all ages, though the dark gothic theme and card game complexity
                may be more suitable for older players.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              VI. YOUR RIGHTS
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
                you have the right to access, correct, delete, and port your personal data.
                Since we don't collect any personal data, there's nothing to access, correct, delete, or port.
              </p>
              <p>
                If you've posted a discussion comment and want it removed, you can delete it yourself using the
                delete button on your comment, or contact us and we'll handle it.
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
                If you have questions about this privacy policy (though we're not sure what you'd ask — we literally
                collect nothing), feel free to reach out through the discussion section on the Balance Analysis page.
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
