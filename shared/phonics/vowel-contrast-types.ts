export type VowelWord = {
  word: string;
  meaning: string;
};

export type VowelPair = {
  short: VowelWord;
  long: VowelWord;
  pattern: "magic-e" | "vowel-team";
};

export type VowelContrastContent = {
  vowel: "a" | "i";
  title: string;
  emoji: string;
  nameRuleTip: string;
  magicEIntro: string;
  vowelTeamIntro: string;
  vowelTeamNote?: string;
  shortLabel: string;
  shortSound: string;
  shortEmoji: string;
  longLabel: string;
  longSound: string;
  longClipKey: string;
  longEmoji: string;
  stretchIntro: string;
  stretchShortCue: string;
  stretchLongCue: string;
  storyHint: string;
  magicEPairs: VowelPair[];
  vowelTeamPairs: VowelPair[];
  soundSortWords: { word: string; sound: "short" | "long" }[];
  stretchPairs: VowelPair[];
};
