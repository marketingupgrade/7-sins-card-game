/**
 * Terms & Conditions Page
 * 
 * Accurate terms reflecting the game's current features:
 * - Email/OAuth login, Supabase DB, saved decks, user accounts
 * - AI artwork, sound assets, analytics
 * Dark gothic branding, mobile responsive.
 */

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import EmberField from "@/components/EmberField";

export default function Terms() {
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
            The Sacred Covenant
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white/90 tracking-wider mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            TERMS & CONDITIONS
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
            <div className="rounded-xl p-6 border border-white/8 bg-white/[0.02]">
              <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                TL;DR
              </h2>
              <p className="text-sm text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                This game is free to play. You can create an account to save decks and track your games,
                or play as a guest with limited features. We believe games should be for fun, not extraction.
                We use minimal analytics to improve the game. Card artwork
                is AI-generated. Don't be a jerk in the comments. That's the gist.
              </p>
            </div>
          </section>

          {/* The Game */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              I. THE GAME
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                7 Deadly Sins Card Game is a free, browser-based multiplayer card game featuring seven sin factions,
                each with unique cards, passives, and strategies. The game includes real-time multiplayer via Supabase,
                bot opponents, a deck builder, balance analysis tools, lore articles, and a tutorial system.
              </p>
              <p>
                No payment is required to play. No subscription will ever be required. All game content — including
                all 378 cards across 7 factions, all game modes, and all features — is freely accessible.
              </p>
            </div>
          </section>

          {/* Accounts & Authentication */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              II. ACCOUNTS & AUTHENTICATION
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                You may create an account using <strong className="text-white/60">email or social login</strong> to unlock additional features
                such as saving multiple decks, persistent game history, and account management. Authentication is handled
                securely through <strong className="text-white/60">Supabase Auth</strong> — we never see or store your password.
                Your account lives on this game's own infrastructure, not through any third-party platform account.
              </p>
              <p>
                <strong className="text-white/60">Guest access</strong> is available with limited features: you can play
                games, use the deck builder (limited to 1 saved deck via localStorage), and browse all content without
                creating an account.
              </p>
              <p>
                When you sign in, we store your user ID, display name, and email address in our database to
                associate your saved decks and game data with your account. You can request deletion of your account
                data at any time.
              </p>
            </div>
          </section>

          {/* AI-Generated Artwork Disclaimer */}
          <section>
            <div className="rounded-xl p-6 border border-wrath/15 bg-wrath/[0.03]">
              <h2 className="text-lg font-bold text-wrath/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                III. AI-GENERATED ARTWORK DISCLAIMER
              </h2>
              <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
                <p>
                  The card artwork in this game was generated using AI image generation models, including but not limited to
                  models from <strong className="text-white/60">Midjourney</strong>, <strong className="text-white/60">DALL-E (OpenAI)</strong>,
                  and <strong className="text-white/60">Stable Diffusion</strong>. These images were created through text-to-image
                  prompts and do not intentionally reproduce, copy, or derive from any specific copyrighted work, trademark,
                  or intellectual property of any third party.
                </p>
                <p>
                  The creator of this game makes no claim of exclusive copyright over AI-generated imagery, in accordance with
                  current legal guidance from the{" "}
                  <a href="https://www.copyright.gov/ai/ai_policy_statement.pdf" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                    U.S. Copyright Office
                  </a>{" "}
                  and the{" "}
                  <a href="https://www.europarl.europa.eu/topics/en/article/20230601STO93804/eu-ai-act-first-regulation-on-artificial-intelligence" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                    EU AI Act
                  </a>.
                </p>
                <p>
                  <strong className="text-white/60">Limitation of Liability:</strong> If any generated image unintentionally resembles
                  existing copyrighted material, trademarks, or the likeness of any real person, this is purely coincidental and
                  not the result of deliberate reproduction. The creator assumes no liability for such resemblances. If you believe
                  any artwork infringes on your intellectual property rights, please contact us at{" "}
                  <a href="mailto:sinners@7sinscardgame.com" className="text-amber-400/60 hover:text-amber-400 underline">sinners@7sinscardgame.com</a>
                  {" "}and we will promptly review and remove the content in question.
                </p>
                <p>
                  <strong className="text-white/60">No Warranty of Originality:</strong> Due to the nature of AI image generation,
                  the creator cannot guarantee that generated images are entirely free from similarity to existing works in training
                  datasets. The images are provided "as-is" for entertainment purposes within this free, non-commercial game.
                </p>
              </div>
            </div>
          </section>

          {/* Sound & Music */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              IV. SOUND, MUSIC & ICON ASSETS
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                All music, sound effects, and icon assets are sourced from{" "}
                <a href="https://opengameart.org" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                  OpenGameArt.org
                </a>{" "}
                and are used under their respective Creative Commons licenses (CC0, CC-BY 3.0, CC-BY 4.0).
                Full attribution is provided in the footer of the homepage.
              </p>
            </div>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              V. USER CONDUCT
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                The discussion section on the Balance Analysis page allows you to post comments. Be decent.
                Don't post hate speech, spam, or anything you wouldn't want your grandmother to read.
                We reserve the right to remove comments that violate basic human decency.
              </p>
              <p>
                In-game usernames are stored with your account (if signed in) or in localStorage (if guest).
                Pick whatever name you want — just keep it civil.
              </p>
            </div>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              VI. DATA STORAGE & HOSTING
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Game data (user accounts, saved decks, game logs) is stored in a{" "}
                <strong className="text-white/60">Supabase</strong> (PostgreSQL) database{" "}
                <strong className="text-white/60">hosted in the EU</strong>. Real-time multiplayer
                communication uses Supabase Realtime channels. The application is hosted on{" "}
                <strong className="text-white/60">Vercel</strong>. Supabase is open-source, so you can verify
                exactly what powers your data at{" "}
                <a href="https://github.com/supabase/supabase" target="_blank" rel="noopener noreferrer" className="text-white/50 underline hover:text-white/70 transition-colors">
                  github.com/supabase
                </a>.
              </p>
              <p>
                Static assets (card artwork, icons) are served via CDN. No user-uploaded content is stored —
                the game does not support file uploads.
              </p>
            </div>
          </section>

          {/* Donations */}
          <section>
            <div className="rounded-xl p-6 border border-greed-glow/15 bg-greed-glow/[0.03]">
              <h2 className="text-lg font-bold text-greed-glow/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                VII. DONATIONS
              </h2>
              <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
                <p>
                  My friends forced me to add a donation link. I resisted. They insisted. So here it is.
                </p>
                <p>
                  This game is and will always be completely free. You owe nothing. But if you're feeling generous
                  and want to <a href="https://buymeacoffee.com/jojovh" target="_blank" rel="noopener noreferrer" className="text-amber-400/80 hover:text-amber-300 underline underline-offset-2 transition-colors">buy me a coffee</a> — hey, whatever floats your boat. Happy gaming!
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              VIII. DISCLAIMER
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                This game is provided "as-is" without warranty of any kind. The creator is not responsible for any
                emotional damage caused by losing to Lust's compound effects, Wrath's vengeance passive, or
                Gluttony eating your entire hand.
              </p>
              <p>
                Play at your own risk. Side effects may include: excessive strategizing, heated debates about
                faction balance, and an unhealthy obsession with compound multipliers.
              </p>
            </div>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-4">
          <Link href="/privacy" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Privacy Policy
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
