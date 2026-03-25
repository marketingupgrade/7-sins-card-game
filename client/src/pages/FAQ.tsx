/**
 * FAQ Page — Frequently Asked Questions
 *
 * Visible FAQ page that mirrors the FAQPage schema in index.html
 * and adds additional questions for AEO/voice search optimization.
 * Each answer is written in a conversational, featured-snippet-friendly style.
 */

import { useEffect } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ChevronLeft } from "lucide-react";
import PageTransition from "@/components/PageTransition";

interface FAQItem {
  question: string;
  answer: string;
  category: "basics" | "gameplay" | "factions" | "technical";
}

const FAQ_DATA: FAQItem[] = [
  // Basics
  {
    question: "What is the 7 Deadly Sins Card Game?",
    answer: "The 7 Deadly Sins Card Game is a free-to-play strategic PvP card game where 2\u20134 players each choose one of seven sin factions\u2014Wrath, Sloth, Greed, Pride, Envy, Gluttony, and Lust\u2014and battle across 20 rounds in a gothic cathedral setting. Each faction has unique cards, a passive ability, and a distinct playstyle built around Fibonacci compound scaling mechanics.",
    category: "basics",
  },
  {
    question: "Is the 7 Deadly Sins Card Game free to play?",
    answer: "Yes, the game is completely free to play. It runs directly in your web browser with no downloads, installations, or in-app purchases required. Simply visit 7sinscardgame.com and start playing.",
    category: "basics",
  },
  {
    question: "Can I play the 7 Deadly Sins Card Game on mobile?",
    answer: "Yes, the game is fully responsive and works on any device with a modern web browser, including smartphones, tablets, laptops, and desktops. No app download is needed\u2014just open your browser and play.",
    category: "basics",
  },
  {
    question: "Do I need to create an account to play?",
    answer: "You can play practice matches against AI opponents without an account. To play multiplayer matches, save your decks, and track your stats, you can sign in with Discord, Google, or Twitch\u2014it takes just a few seconds.",
    category: "basics",
  },
  // Gameplay
  {
    question: "How many players can play the 7 Deadly Sins Card Game?",
    answer: "The game supports 1\u20134 players. You can practice solo against AI opponents, or play multiplayer matches with 2, 3, or 4 players. Each player chooses a different sin faction, so no two players can use the same faction in a match.",
    category: "gameplay",
  },
  {
    question: "How does the energy system work?",
    answer: "Players start with 2 energy and gain +1 energy per round, up to a maximum of 7. Each card has an energy cost to play. The escalating energy system creates a natural arc from early skirmishes to late-game power plays, with Fibonacci compound scaling making later rounds increasingly impactful.",
    category: "gameplay",
  },
  {
    question: "What is Fibonacci compound scaling?",
    answer: "Fibonacci compound scaling is the core mechanic that makes the game unique. When you play cards of the same type consecutively, their effects compound following a Fibonacci-like pattern (1\u00d7, 1\u00d7, 2\u00d7, 3\u00d7, 5\u00d7). This rewards strategic sequencing and creates dramatic power spikes in the late game.",
    category: "gameplay",
  },
  {
    question: "How long does a typical match last?",
    answer: "A standard match lasts 20 rounds and typically takes 10\u201315 minutes to complete. The energy system ensures games have a clear beginning, middle, and end\u2014early rounds are about positioning, mid-game is about building combos, and late rounds feature explosive compound plays.",
    category: "gameplay",
  },
  {
    question: "How do I win a match?",
    answer: "You win by being the last player standing or having the most HP when the 20 rounds are over. Each player starts with 30 HP. Reduce opponents' HP to 0 through attack cards, or outlast them with healing and defense. Different factions excel at different win conditions.",
    category: "gameplay",
  },
  // Factions
  {
    question: "What are the seven sin factions and their abilities?",
    answer: "The seven factions are: Wrath (aggressive burn, Vengeance passive reflects 2 damage when hit), Sloth (defensive fortress, Inertia passive reduces incoming damage by 1), Greed (resource manipulation, Tithe passive gains +1 energy on 3+ cost cards), Pride (combo superiority, Supremacy passive grants +2 damage at highest HP), Envy (theft and copy, Covet passive copies opponent's last played card), Gluttony (consumption healing, Feast passive heals 2 HP on card defeat), and Lust (charm control, Temptation passive forces opponent discard on charm cards).",
    category: "factions",
  },
  {
    question: "Which faction is best for beginners?",
    answer: "Wrath and Sloth are the most beginner-friendly factions. Wrath has a straightforward aggressive playstyle\u2014deal damage, trigger Vengeance, win. Sloth is equally simple but defensive\u2014reduce damage, outlast opponents. Once you're comfortable, try Greed for resource management or Pride for combo play.",
    category: "factions",
  },
  {
    question: "Can I build custom decks?",
    answer: "Yes! The Deck Builder lets you create custom decks from 140+ unique cards across all 7 factions. You can optimize energy curves, test synergies, save multiple builds, and share them with the community. Visit the Community Decks page to browse and copy top-rated builds.",
    category: "factions",
  },
  // Technical
  {
    question: "What browsers are supported?",
    answer: "The game works in all modern browsers including Chrome, Firefox, Safari, Edge, and Brave. It uses standard web technologies (HTML5, CSS3, JavaScript) and does not require Flash, Java, or any plugins.",
    category: "technical",
  },
  {
    question: "Does the game use AI?",
    answer: "Yes, the game features an AI-powered narrator that provides dynamic commentary during matches, an AI whisper system that offers strategic suggestions, and AI bot opponents for practice mode. The AI enhances the gothic atmosphere and helps new players learn strategies.",
    category: "technical",
  },
  {
    question: "Is there a mobile app?",
    answer: "There is no separate mobile app\u2014the game is a progressive web app (PWA) that works directly in your mobile browser. You can add it to your home screen for an app-like experience. This means you always have the latest version without needing to update through an app store.",
    category: "technical",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  basics: "Getting Started",
  gameplay: "Gameplay & Mechanics",
  factions: "Factions & Deck Building",
  technical: "Technical & Platform",
};

const CATEGORY_ORDER = ["basics", "gameplay", "factions", "technical"] as const;

export default function FAQ() {
  usePageMeta({
    title: "FAQ \u2014 Frequently Asked Questions",
    description: "Frequently asked questions about the 7 Deadly Sins Card Game. Learn about gameplay, factions, energy mechanics, deck building, and more.",
    canonicalPath: "/faq",
  });

  // Inject FAQPage schema dynamically (supplements the static one in index.html)
  useEffect(() => {
    let scriptTag = document.querySelector('script[data-faq-schema]');
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "application/ld+json");
      scriptTag.setAttribute("data-faq-schema", "true");
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_DATA.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
    return () => {
      const schema = document.querySelector('script[data-faq-schema]');
      if (schema) schema.remove();
    };
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--color-page-bg)] text-amber-100">
        {/* Header */}
        <header className="relative py-16 px-4 text-center border-b border-amber-900/20">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-amber-200/50 hover:text-amber-200 transition-colors mb-6 text-sm">
              <ChevronLeft className="w-4 h-4" />
              Back to Cathedral
            </Link>
            <h1 className="font-[Cinzel] text-4xl md:text-5xl text-amber-200 tracking-wider mb-4">
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <p className="text-amber-200/50 text-lg font-[Cinzel] tracking-widest uppercase">
              Everything You Need to Know
            </p>
          </div>
        </header>

        {/* FAQ Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          {CATEGORY_ORDER.map((cat) => {
            const items = FAQ_DATA.filter((f) => f.category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat} className="mb-12">
                <h2 className="font-[Cinzel] text-2xl text-amber-300 tracking-wider mb-6 pb-3 border-b border-amber-900/30">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <div className="space-y-6">
                  {items.map((faq, i) => (
                    <details
                      key={i}
                      className="group bg-black/20 border border-amber-900/20 rounded-lg overflow-hidden hover:border-amber-700/30 transition-colors"
                    >
                      <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-amber-100 font-medium text-lg select-none">
                        <span className="pr-4">{faq.question}</span>
                        <span className="text-amber-500/50 group-open:rotate-180 transition-transform duration-200 shrink-0">
                          &#9660;
                        </span>
                      </summary>
                      <div className="px-6 pb-5 text-amber-200/70 leading-relaxed border-t border-amber-900/10 pt-4">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}

          {/* CTA */}
          <div className="text-center mt-16 py-12 border-t border-amber-900/20">
            <p className="text-amber-200/50 mb-4 font-[Cinzel] tracking-wider">Still have questions?</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/how-to-play"
                className="px-6 py-3 bg-amber-600/20 border border-amber-600/40 rounded-lg text-amber-200 hover:bg-amber-600/30 transition-colors font-[Cinzel] tracking-wider"
              >
                How to Play Guide
              </Link>
              <Link
                href="/rules"
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-amber-200/70 hover:bg-white/10 transition-colors font-[Cinzel] tracking-wider"
              >
                Full Rulebook
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-amber-200/70 hover:bg-white/10 transition-colors font-[Cinzel] tracking-wider"
              >
                Strategy Blog
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-amber-900/20 text-amber-200/30 text-sm">
          &copy; {new Date().getFullYear()} 7 Deadly Sins Card Game
        </footer>
      </div>
    </PageTransition>
  );
}
