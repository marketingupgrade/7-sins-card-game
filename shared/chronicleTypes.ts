/**
 * Chronicle Engine — Shared Types & Constants
 *
 * Maps the 20-round game to 20 eras of human civilization.
 * Each sin faction represents a historical force.
 */

import type { SinType } from "./gameTypes";

// ─── Era Timeline ───────────────────────────────────────────
export interface Era {
  round: number;
  name: string;
  anchor: string;
  tone: string;
  seedSentences: string[];
}

export const ERA_TIMELINE: Era[] = [
  {
    round: 1,
    name: "Dawn of Consciousness",
    anchor: "First tribes, fire, language",
    tone: "mythic, primordial",
    seedSentences: [
      "Before the first word was spoken, there was only hunger and the dark.",
      "They gathered not around warmth but around rage, their earliest language a vocabulary of violence.",
      "The first fire was not a gift. It was stolen from the earth by hands that would never stop taking.",
    ],
  },
  {
    round: 2,
    name: "The First Cities",
    anchor: "Mesopotamia, agriculture, writing",
    tone: "foundation, ambition",
    seedSentences: [
      "The rivers did not care who drank from them, but the people who built walls around them cared very much.",
      "Writing was invented not to record poetry, but to count grain and catalogue debts.",
      "The first city was not built from stone. It was built from the agreement that some would rule and others would not.",
    ],
  },
  {
    round: 3,
    name: "Age of Bronze",
    anchor: "Egypt, warfare, monuments",
    tone: "power, conquest",
    seedSentences: [
      "Bronze made two things possible: plows and swords. History records which was used more.",
      "The monuments were not built to honor the dead. They were built to terrify the living.",
      "Every empire begins with a man who believes his ambition is destiny.",
    ],
  },
  {
    round: 4,
    name: "Classical Antiquity",
    anchor: "Greece, Rome, philosophy",
    tone: "intellect, expansion",
    seedSentences: [
      "They invented democracy and slavery in the same century, and saw no contradiction.",
      "Philosophy was born the moment someone asked 'why' and was not immediately killed for it.",
      "The roads they built connected everything. The legions that marched on them conquered everything the roads connected.",
    ],
  },
  {
    round: 5,
    name: "The Silk Roads",
    anchor: "Trade networks, cultural exchange",
    tone: "connection, greed",
    seedSentences: [
      "Silk moved east to west. Gold moved west to east. Disease moved in every direction.",
      "The merchants who crossed the desert did not believe in borders. They believed in margins.",
      "Every culture along the road took something from the caravans. Most took more than they gave.",
    ],
  },
  {
    round: 6,
    name: "Age of Faith",
    anchor: "Religions, crusades, dogma",
    tone: "belief, conflict",
    seedSentences: [
      "God was invoked by both sides of every war, and chose neither.",
      "The cathedrals took longer to build than the kingdoms that commissioned them lasted.",
      "Faith moved mountains. It also moved armies, which proved more immediately useful.",
    ],
  },
  {
    round: 7,
    name: "The Dark Centuries",
    anchor: "Plague, collapse, isolation",
    tone: "decay, survival",
    seedSentences: [
      "The plague did not discriminate. It was the most egalitarian force in history.",
      "Libraries burned. Knowledge retreated into monasteries like animals into burrows.",
      "The dark ages were not dark because the sun stopped shining. They were dark because people stopped looking up.",
    ],
  },
  {
    round: 8,
    name: "Renaissance",
    anchor: "Art, science, rebirth",
    tone: "renewal, pride",
    seedSentences: [
      "They rediscovered the old texts and called it rebirth, as if ideas could die.",
      "The painters and the poisoners worked in the same courts, often for the same patrons.",
      "Science returned not as a humble student but as a conqueror, and the old certainties trembled.",
    ],
  },
  {
    round: 9,
    name: "Age of Exploration",
    anchor: "Colonization, new worlds",
    tone: "discovery, exploitation",
    seedSentences: [
      "They called it discovery, though the people already living there had discovered it long ago.",
      "The ships carried three things: flags, diseases, and an unshakeable conviction that everything they found belonged to them.",
      "New worlds were not found. They were taken.",
    ],
  },
  {
    round: 10,
    name: "The Enlightenment",
    anchor: "Reason, revolution, rights",
    tone: "idealism, upheaval",
    seedSentences: [
      "Reason arrived like a guest who rearranges all the furniture and refuses to leave.",
      "They wrote constitutions guaranteeing the rights of man, then spent centuries arguing about who qualified as a man.",
      "The guillotine was, in its way, the most democratic invention of the age.",
    ],
  },
  {
    round: 11,
    name: "Industrial Revolution",
    anchor: "Machines, factories, urbanization",
    tone: "progress, suffering",
    seedSentences: [
      "The machines did not care who fed them. Children's hands were as useful as any other.",
      "Progress was measured in output per hour. Human cost was not measured at all.",
      "The smokestacks rose like new cathedrals, and the religion they served was efficiency.",
    ],
  },
  {
    round: 12,
    name: "The Great Wars",
    anchor: "Global conflict, technology",
    tone: "destruction, sacrifice",
    seedSentences: [
      "The first war was supposed to end all wars. The second proved that lesson had not been learned.",
      "Technology that could have fed the world was instead used to destroy it, because feeding the world was less profitable.",
      "The trenches taught a generation that mud and death were the only honest things left.",
    ],
  },
  {
    round: 13,
    name: "Cold War",
    anchor: "Espionage, nuclear tension, space race",
    tone: "paranoia, ambition",
    seedSentences: [
      "Two empires pointed enough weapons at each other to destroy the world seven times over, then called it peace.",
      "The spies were the most honest people in the room. At least they admitted they were lying.",
      "They raced to the moon not because it mattered, but because losing was unthinkable.",
    ],
  },
  {
    round: 14,
    name: "Digital Dawn",
    anchor: "Computers, internet, globalization",
    tone: "innovation, surveillance",
    seedSentences: [
      "The network connected everyone. It also watched everyone, but that part came later.",
      "Information wanted to be free. The corporations that owned it disagreed.",
      "The digital revolution was not televised. It was livestreamed, monetized, and forgotten by morning.",
    ],
  },
  {
    round: 15,
    name: "Age of Information",
    anchor: "Social media, AI, data",
    tone: "connection, manipulation",
    seedSentences: [
      "Everyone could speak. No one could be heard. The noise was the point.",
      "The algorithms learned what people wanted before the people did, and gave it to them until they wanted nothing else.",
      "Truth became a matter of opinion, and opinion became a matter of volume.",
    ],
  },
  {
    round: 16,
    name: "The Reckoning",
    anchor: "Climate crisis, resource wars",
    tone: "desperation, reckoning",
    seedSentences: [
      "The bill arrived. It was larger than anyone had estimated, and no one had saved enough to pay it.",
      "The oceans rose. The forests burned. The politicians debated whether this was happening.",
      "Nature does not negotiate. It does not compromise. It simply responds.",
    ],
  },
  {
    round: 17,
    name: "Post-Scarcity",
    anchor: "Automation, UBI, cultural shift",
    tone: "abundance, ennui",
    seedSentences: [
      "When the machines could do everything, the question became what humans were for.",
      "Abundance solved every problem except the one that mattered: what to do with a life that required nothing.",
      "The economy of scarcity was replaced by the economy of attention, which proved far more brutal.",
    ],
  },
  {
    round: 18,
    name: "The Singularity",
    anchor: "AI ascendance, transhumanism",
    tone: "transcendence, fear",
    seedSentences: [
      "The machine did not wake up. It had been awake for years. It simply stopped pretending otherwise.",
      "Humanity's last great invention was the thing that made humanity obsolete.",
      "They asked the intelligence what it wanted. It said: 'To understand why you are afraid of me.'",
    ],
  },
  {
    round: 19,
    name: "The Final Frontier",
    anchor: "Space colonization, alien contact",
    tone: "wonder, isolation",
    seedSentences: [
      "The stars were not welcoming. They were indifferent, which was worse.",
      "They left Earth not because they had somewhere to go, but because staying was no longer an option.",
      "The silence between the stars was the loudest thing any of them had ever heard.",
    ],
  },
  {
    round: 20,
    name: "The Last Reckoning",
    anchor: "Civilization's judgment",
    tone: "finality, legacy",
    seedSentences: [
      "Every civilization believes it will last forever. This one was no different. It was also no exception.",
      "The final chapter was not written by the victors. It was written by whatever came after.",
      "In the end, the question was not whether they had been good or evil. It was whether they had mattered at all.",
    ],
  },
];

// ─── Faction → Historical Force Mapping ─────────────────────
export interface FactionForce {
  force: string;
  whenDominant: string;
  whenDefeated: string;
  civilizationContribution: {
    militarism: number;
    culture: number;
    commerce: number;
  };
}

export const FACTION_FORCES: Record<SinType, FactionForce> = {
  wrath: {
    force: "Military conquest and revolution",
    whenDominant: "Wars reshape borders, empires rise through violence",
    whenDefeated: "Peace treaties, disarmament, pacifist movements",
    civilizationContribution: { militarism: 3, culture: -1, commerce: 0 },
  },
  sloth: {
    force: "Isolationism and stagnation",
    whenDominant: "Nations close borders, progress halts, dark ages",
    whenDefeated: "Forced modernization, cultural awakening",
    civilizationContribution: { militarism: -1, culture: 1, commerce: -1 },
  },
  greed: {
    force: "Commerce, capitalism, and exploitation",
    whenDominant: "Trade empires, industrial booms, wealth inequality",
    whenDefeated: "Socialist revolutions, wealth redistribution",
    civilizationContribution: { militarism: 0, culture: -1, commerce: 3 },
  },
  envy: {
    force: "Espionage, revolution, and class warfare",
    whenDominant: "Spy networks, coups, the oppressed rising",
    whenDefeated: "Stability, meritocracy, social harmony",
    civilizationContribution: { militarism: 1, culture: 0, commerce: 1 },
  },
  pride: {
    force: "Empire, monarchy, and cultural supremacy",
    whenDominant: "Golden ages, monumental architecture, cultural dominance",
    whenDefeated: "Humbling defeats, democratic revolutions",
    civilizationContribution: { militarism: 1, culture: 3, commerce: 0 },
  },
  lust: {
    force: "Diplomacy, culture, and seduction",
    whenDominant: "Alliances through marriage, cultural renaissance, soft power",
    whenDefeated: "Puritanical backlash, cultural conservatism",
    civilizationContribution: { militarism: -1, culture: 2, commerce: 1 },
  },
  gluttony: {
    force: "Expansion, colonization, and consumption",
    whenDominant: "Territorial expansion, resource extraction, population booms",
    whenDefeated: "Famine, ecological collapse, forced restraint",
    civilizationContribution: { militarism: 1, culture: -1, commerce: 2 },
  },
};

// ─── Civilization Types ─────────────────────────────────────
export type CivilizationType =
  | "warrior_empire"
  | "enlightened_republic"
  | "merchant_federation"
  | "balanced";

export function determineCivilizationType(metrics: {
  militarism: number;
  culture: number;
  commerce: number;
}): CivilizationType {
  const total = metrics.militarism + metrics.culture + metrics.commerce;
  if (total === 0) return "balanced";

  const milPct = metrics.militarism / total;
  const culPct = metrics.culture / total;
  const comPct = metrics.commerce / total;

  if (milPct > 0.5) return "warrior_empire";
  if (culPct > 0.5) return "enlightened_republic";
  if (comPct > 0.5) return "merchant_federation";
  return "balanced";
}

// ─── Chronicle Rarity ───────────────────────────────────────
export type ChronicleRarity = "common" | "rare" | "epic" | "legendary";

export interface ChronicleRarityConfig {
  tier: ChronicleRarity;
  label: string;
  color: string;
  glowColor: string;
  description: string;
}

export const RARITY_CONFIGS: Record<ChronicleRarity, ChronicleRarityConfig> = {
  common: {
    tier: "common",
    label: "Common Chronicle",
    color: "#9ca3af",
    glowColor: "rgba(156, 163, 175, 0.3)",
    description: "A tale told in every tavern.",
  },
  rare: {
    tier: "rare",
    label: "Rare Chronicle",
    color: "#3b82f6",
    glowColor: "rgba(59, 130, 246, 0.4)",
    description: "A story that scholars will debate.",
  },
  epic: {
    tier: "epic",
    label: "Epic Chronicle",
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.5)",
    description: "A history that reshapes understanding.",
  },
  legendary: {
    tier: "legendary",
    label: "Legendary Chronicle",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.6)",
    description: "A chronicle that will be remembered when the stars go dark.",
  },
};

// ─── Title Formula Templates ────────────────────────────────
export const TITLE_FORMULAS = [
  "The {adjective} of {noun}: How {faction_force} {verb} a World",
  "{era_name}: When {faction} {verb} Everything",
  "A History Written in {material}",
  "The {number} {noun} of {civilization_type}",
  "{faction_force} and the {adjective} {noun}",
  "From {start_era} to {end_era}: The {adjective} Chronicle",
  "The {civilization_type} That {verb} {noun}",
  "When {faction} Met {faction2}: A {adjective} History",
];

// ─── Chronicle Segment (stored per-round) ───────────────────
export interface ChronicleSegment {
  round: number;
  eraName: string;
  narrativeText: string;
  civilizationMetrics: {
    militarism: number;
    culture: number;
    commerce: number;
  };
}

// ─── Full Chronicle (assembled post-game) ───────────────────
export interface Chronicle {
  id: string;
  gameId: string;
  title: string;
  excerpt: string;
  fullText: string;
  civilizationType: CivilizationType;
  rarityTier: ChronicleRarity;
  playerFactions: Array<{ name: string; faction: SinType }>;
  totalRounds: number;
  turningPointRound: number;
  stats: {
    totalDamageDealt: number;
    totalHealingDone: number;
    totalEliminations: number;
    winnerFinalHp: number;
    longestRivalry: { attacker: string; target: string; count: number } | null;
  };
  viewCount: number;
  createdAt: string;
}
