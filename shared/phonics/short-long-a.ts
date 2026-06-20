import type { VowelContrastContent } from "./vowel-contrast-types";

export type { VowelWord, VowelPair } from "./vowel-contrast-types";

export const SHORT_A_LONG_A: VowelContrastContent = {
  vowel: "a",
  title: "A Sounds",
  emoji: "✨",
  nameRuleTip:
    "In Short A words, the letter A is shy and makes a small 'ah' sound. In Long A words, A is brave and shouts its own name: 'Aaa!'",
  magicEIntro: "The silent E is like a magic wand — it makes A say its name!",
  vowelTeamIntro:
    "Sometimes AI or AY work together to make the Long A sound — no E needed!",
  vowelTeamNote: "Pan can also rhyme with pay (ay team)!",
  shortLabel: "Short A",
  shortSound: "ah",
  shortEmoji: "🎩",
  longLabel: "Long A",
  longSound: "Aaa",
  longClipKey: "ay",
  longEmoji: "🎂",
  stretchIntro: "Short A is quick like a drum beat. Long A stretches like bubblegum!",
  stretchShortCue: "A-a-a!",
  stretchLongCue: "Aaaaaaa",
  storyHint: 'Read "The Cake at the Lake" to hear Magic E in action!',
  magicEPairs: [
    { pattern: "magic-e", short: { word: "cap", meaning: "a hat" }, long: { word: "cape", meaning: "a superhero cloak" } },
    { pattern: "magic-e", short: { word: "can", meaning: "a tin can" }, long: { word: "cane", meaning: "a walking stick" } },
    { pattern: "magic-e", short: { word: "mad", meaning: "angry" }, long: { word: "made", meaning: "created something" } },
    { pattern: "magic-e", short: { word: "tap", meaning: "to hit lightly" }, long: { word: "tape", meaning: "sticky tape" } },
    { pattern: "magic-e", short: { word: "rat", meaning: "the animal" }, long: { word: "rate", meaning: "speed or score" } },
    { pattern: "magic-e", short: { word: "plan", meaning: "an idea" }, long: { word: "plane", meaning: "something that flies" } },
  ],
  vowelTeamPairs: [
    { pattern: "vowel-team", short: { word: "back", meaning: "behind you" }, long: { word: "bake", meaning: "to cook in an oven" } },
    { pattern: "vowel-team", short: { word: "man", meaning: "a grown-up boy" }, long: { word: "main", meaning: "the most important" } },
    { pattern: "vowel-team", short: { word: "pan", meaning: "for cooking" }, long: { word: "pain", meaning: "an owie feeling" } },
    { pattern: "vowel-team", short: { word: "mat", meaning: "on the floor" }, long: { word: "maid", meaning: "a helper" } },
  ],
  soundSortWords: [
    { word: "bag", sound: "short" },
    { word: "lake", sound: "long" },
    { word: "tap", sound: "short" },
    { word: "tape", sound: "long" },
    { word: "cap", sound: "short" },
    { word: "cape", sound: "long" },
    { word: "cat", sound: "short" },
    { word: "cake", sound: "long" },
    { word: "rat", sound: "short" },
    { word: "rate", sound: "long" },
    { word: "man", sound: "short" },
    { word: "main", sound: "long" },
    { word: "mat", sound: "short" },
    { word: "maid", sound: "long" },
    { word: "can", sound: "short" },
    { word: "cane", sound: "long" },
  ],
  stretchPairs: [
    { pattern: "magic-e", short: { word: "cap", meaning: "a hat" }, long: { word: "cape", meaning: "a superhero cloak" } },
    { pattern: "magic-e", short: { word: "can", meaning: "a tin can" }, long: { word: "cane", meaning: "a walking stick" } },
    { pattern: "magic-e", short: { word: "mad", meaning: "angry" }, long: { word: "made", meaning: "created something" } },
    { pattern: "magic-e", short: { word: "tap", meaning: "to hit lightly" }, long: { word: "tape", meaning: "sticky tape" } },
  ],
};

// Backward-compatible named exports
export const MAGIC_E_PAIRS = SHORT_A_LONG_A.magicEPairs;
export const VOWEL_TEAM_PAIRS = SHORT_A_LONG_A.vowelTeamPairs;
export const SOUND_SORT_WORDS = SHORT_A_LONG_A.soundSortWords;
export const STRETCH_PAIRS = SHORT_A_LONG_A.stretchPairs;
export const NAME_RULE_TIP = SHORT_A_LONG_A.nameRuleTip;
