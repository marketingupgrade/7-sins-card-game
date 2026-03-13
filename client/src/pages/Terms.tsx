/**
 * Terms & Conditions Page
 * 
 * No-nonsense, honest terms with AI artwork waiver.
 * Dark gothic branding, mobile responsive.
 */

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import EmberField from "@/components/EmberField";

export default function Terms() {
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
                This game is free. Forever. No login required. No tracking. No data collection. No hidden nonsense.
                Play the game, have fun, and may the best sinner win. That's it. That's the terms.
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
                7 Deadly Sins Card Game is a free, browser-based multiplayer card game. No account creation is required.
                No payment is required. No subscription will ever be required. This game was built for the love of gaming,
                and it will stay that way.
              </p>
              <p>
                You can play with friends or against bots. You can explore the card collection, read the balance analysis,
                study the matchup matrix, or just admire the art. All of it is free. All of it will remain free.
              </p>
            </div>
          </section>

          {/* No Login, No Tracking */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              II. NO LOGIN. NO TRACKING. EVER.
            </h2>
            <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                We do not require you to create an account. We do not track your behavior. We do not use analytics.
                We do not set cookies for tracking purposes. We do not sell data because we do not collect data.
              </p>
              <p>
                Your browser may store a temporary player ID locally so the game knows which seat is yours during a match.
                This never leaves your device and is not sent to any third party.
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
                  any artwork infringes on your intellectual property rights, please contact us and we will promptly review and
                  remove the content in question.
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
                Usernames chosen for in-game sessions are temporary and stored only in your browser.
                Pick whatever name you want — just keep it civil.
              </p>
            </div>
          </section>

          {/* Buy Me a Coffee */}
          <section>
            <div className="rounded-xl p-6 border border-greed-glow/15 bg-greed-glow/[0.03]">
              <h2 className="text-lg font-bold text-greed-glow/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                VI. DONATIONS
              </h2>
              <div className="text-sm text-white/40 leading-relaxed space-y-3" style={{ fontFamily: "var(--font-body)" }}>
                <p>
                  My friends forced me to add a donation link. I resisted. They insisted. So here it is.
                </p>
                <p>
                  This game is and will always be completely free. You owe nothing. But if you're feeling generous
                  and want to buy me a coffee — hey, whatever floats your boat. Happy gaming!
                </p>
                <a
                  href="https://buymeacoffee.com/placeholder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-lg bg-greed-glow/10 border border-greed-glow/20 text-greed-glow/80 hover:bg-greed-glow/15 hover:text-greed-glow transition-all text-xs tracking-wider uppercase"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.062 2.014.13l.04.005c.11.01.218.024.327.039.364.047.736.097 1.092.16.116.021.236.042.345.082.188.064.377.186.5.374.085.127.124.283.141.452.034.35.058.701.084 1.052.014.19.032.378.053.565.024.222-.06.427-.222.596-.339.351-.818.472-1.289.516-.652.06-1.31.066-1.964.043a18.3 18.3 0 01-1.721-.17c-.1-.014-.199-.03-.298-.048-.122-.022-.245-.049-.365-.078a.68.68 0 01-.519-.55c-.034-.196.06-.39.222-.52.293-.236.636-.39.987-.493.34-.1.693-.17 1.047-.214.366-.046.735-.07 1.104-.074.365-.004.73.01 1.094.04.36.03.718.077 1.073.14.354.064.702.148 1.04.26.34.11.668.254.97.44.15.09.29.2.41.33.12.13.22.28.29.45.07.17.11.35.12.54v.01c.01.19-.02.38-.08.56-.06.18-.15.35-.27.5-.12.15-.27.28-.44.38-.17.1-.35.18-.55.23-.19.05-.4.07-.6.07-.2 0-.4-.02-.59-.07-.19-.05-.37-.13-.54-.23-.17-.1-.32-.23-.44-.38-.12-.15-.21-.32-.27-.5-.06-.18-.09-.37-.08-.56v-.01c.01-.19.05-.37.12-.54.07-.17.17-.32.29-.45.12-.13.26-.24.41-.33z" />
                  </svg>
                  Buy Me a Coffee
                </a>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-lg font-bold text-white/80 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              VII. DISCLAIMER
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
