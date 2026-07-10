/** Grapheme/phonics chunk → speakable phoneme sound for AI TTS coaching */
const CHUNK_SOUNDS: Record<string, string> = {
  A: "ah", B: "buh", C: "kuh", D: "duh", E: "eh", F: "fff",
  G: "guh", H: "huh", I: "ih", J: "juh", K: "kuh", L: "lll",
  M: "mmm", N: "nnn", O: "ah", P: "puh", Q: "kwuh", R: "rrr",
  S: "sss", T: "tuh", U: "uh", V: "vvv", W: "wuh", X: "ks",
  Y: "yuh", Z: "zzz",
  SH: "sh", CH: "ch", TH: "th", CK: "kuh", NG: "ng", PH: "fff",
  OO: "oo", EE: "ee", OA: "oh", OU: "ow", OW: "ow", OY: "oy",
  AI: "ay", AY: "ay", EA: "ee", IE: "eye", EI: "ay",
  IR: "er", OR: "or", AR: "ar", UR: "er", ER: "er",
  AU: "aw", AW: "aw", OI: "oy", UI: "oo",
  BL: "bl", BR: "br", CL: "cl", CR: "cr", DR: "dr", FL: "fl",
  FR: "fr", GL: "gl", GR: "gr", PL: "pl", PR: "pr", SC: "sk",
  SK: "sk", SL: "sl", SM: "sm", SN: "sn", SP: "sp", ST: "st",
  SW: "sw", TR: "tr", TW: "tw", WH: "wh", WR: "r",
  LL: "ll", SS: "ss", TT: "tt", FF: "ff", BB: "buh",
  KE: "kuh", LE: "ll", SE: "sss", NE: "nn", TE: "tuh", GE: "juh",
  MP: "mp", LP: "lp", ND: "nd", NT: "nt", NK: "nk", MB: "mb",
  SCH: "sk", TCH: "ch", DGE: "j",
  AS: "az", TLE: "ull", GON: "gon", CTION: "shun", TION: "shun",
  EL: "ell", PHANT: "fant", RAFFE: "raff", BOW: "boh", IRTH: "birth",
  DAY: "day", COM: "kom", PU: "puh", TER: "ter", AND: "and",
  WICH: "wich", OOT: "oot", ALL: "all", ACK: "ack", PACK: "pack",
  UN: "un", SHINE: "shine", UT: "ut", FLY: "fly",
  OUN: "own", TAIN: "tain", UM: "um", ELLA: "ella",
  AIR: "air", ANE: "ane", TRO: "tro", NAUT: "nawt",
  HEL: "hell", COP: "kop", KAN: "kan", ROO: "roo",
  AL: "al", LI: "lee", TOR: "tor", VOL: "vol", CA: "ka",
  NO: "noh", TEL: "tell", SCO: "sko", PE: "peh",
  PRIN: "prin", CESS: "sess", SURE: "shur", BIT: "bit",
  DER: "der", CIL: "sill", ARD: "ard", DEN: "den",
  KEY: "kee", PLE: "pull", LOW: "loh", NET: "net",
  OCKET: "ocket", DOC: "dok", LIZ: "liz",
  SAUR: "sawr", DINO: "dino", BUT: "but",
};

/** Core phoneme sounds with pre-recorded audio clips (Levels 1–3) */
export const CORE_PHONEME_SOUNDS = [
  "buh", "kuh", "duh", "fff", "guh", "huh", "juh", "lll", "mmm", "nnn",
  "puh", "rrr", "sss", "tuh", "vvv", "wuh", "zzz",
  "ah", "eh", "ih", "uh", "ee", "oo",
  "sh", "ch", "th", "ng",
  "bl", "br", "cl", "cr", "dr", "fl", "fr", "gr", "pl", "pr", "sk", "sl", "st", "tr",
] as const;

/** Extended sounds for Levels 4–5 and vowel teams */
export const EXTENDED_PHONEME_SOUNDS = [
  "ay", "eye", "er", "or", "ar", "aw", "oy", "ow", "oh",
  "sm", "sn", "sp", "sw", "tw", "wh",
  "mp", "nd", "nt", "nk", "mb", "ll", "ss",
  "kwuh", "yuh", "j", "ks",
  "un", "al", "all", "ack", "ell", "air", "own", "shun",
] as const;

export const ALL_PHONEME_SOUNDS = [
  ...CORE_PHONEME_SOUNDS,
  ...EXTENDED_PHONEME_SOUNDS,
] as const;

/** Single-letter + high-use digraph sounds prefer human-recorded clips when present */
export const HUMAN_CORE_PHONEME_SOUNDS = [
  "buh", "kuh", "duh", "fff", "guh", "huh", "juh", "lll", "mmm", "nnn",
  "puh", "rrr", "sss", "tuh", "vvv", "wuh", "zzz",
  "ah", "eh", "ih", "uh", "ee", "oo",
  "sh", "ch", "th", "ng", "kwuh", "yuh", "ks",
] as const;

export type PhonemeCategory = "stop" | "continuant" | "vowel" | "digraph" | "blend" | "extended";

const PHONEME_CATEGORIES: Record<string, PhonemeCategory> = {
  buh: "stop", kuh: "stop", duh: "stop", guh: "stop", juh: "stop", puh: "stop", tuh: "stop",
  fff: "continuant", lll: "continuant", mmm: "continuant", nnn: "continuant",
  rrr: "continuant", sss: "continuant", vvv: "continuant", wuh: "continuant", zzz: "continuant",
  huh: "continuant",
  ah: "vowel", eh: "vowel", ih: "vowel", uh: "vowel", ee: "vowel", oo: "vowel",
  sh: "digraph", ch: "digraph", th: "digraph", ng: "digraph",
  bl: "blend", br: "blend", cl: "blend", cr: "blend", dr: "blend", fl: "blend",
  fr: "blend", gr: "blend", pl: "blend", pr: "blend", sk: "blend", sl: "blend",
  st: "blend", tr: "blend",
  ay: "vowel", eye: "vowel", er: "vowel", or: "vowel", ar: "vowel", aw: "vowel",
  oy: "vowel", ow: "vowel", oh: "vowel",
  sm: "blend", sn: "blend", sp: "blend", sw: "blend", tw: "blend", wh: "blend",
  mp: "extended", nd: "extended", nt: "extended", nk: "extended", mb: "extended",
  ll: "extended", ss: "extended", kwuh: "extended", yuh: "extended", j: "extended", ks: "extended",
  un: "extended", al: "extended", all: "extended", ack: "extended", ell: "extended",
  air: "extended", own: "extended", shun: "extended",
};

/** Kokoro/macOS input text tuned for isolated phonics sounds (not word prosody) */
export const PHONEME_GENERATION_PROMPTS: Record<string, string> = {
  // Stops — minimal schwa
  buh: "b", puh: "p", tuh: "t", kuh: "k", duh: "d", guh: "g", juh: "j",
  // Continuants — elongated hold
  fff: "fffff", sss: "sssss", mmm: "mmmmm", nnn: "nnnnn", lll: "lllll",
  rrr: "rrrrr", vvv: "vvvvv", zzz: "zzzzz", huh: "huhhh", wuh: "wuh",
  // Vowels — pure stretch
  ah: "aaa", eh: "ehhh", ih: "ihhh", uh: "uhhh", ee: "eeee", oo: "oooo",
  ay: "ayyy", eye: "eye", er: "errr", or: "orrr", ar: "arrr", aw: "awww",
  oy: "oyyy", ow: "owww", oh: "ohhh",
  // Digraphs
  sh: "shhhh", ch: "ch", th: "thth", ng: "nggg",
  // Blends
  bl: "bll", br: "brr", cl: "cll", cr: "crr", dr: "drr", fl: "fll",
  fr: "frr", gr: "grr", pl: "pll", pr: "prr", sk: "skk", sl: "sll",
  st: "stt", tr: "trr", sm: "smm", sn: "snn", sp: "spp", sw: "sww",
  tw: "tww", wh: "whh",
  // Extended / endings
  mp: "mp", nd: "nd", nt: "nt", nk: "nk", mb: "mb", ll: "lll", ss: "sss",
  kwuh: "kw", yuh: "yuh", j: "j", ks: "ks",
  un: "un", al: "al", all: "alll", ack: "ack", ell: "ell", air: "air",
  own: "own", shun: "shun",
};

const CATEGORY_GENERATION_SPEED: Record<PhonemeCategory, number> = {
  stop: 0.9,
  continuant: 0.55,
  vowel: 0.6,
  digraph: 0.7,
  blend: 0.7,
  extended: 0.75,
};

const CATEGORY_MAX_DURATION_SEC: Record<PhonemeCategory, number> = {
  stop: 1.2,
  continuant: 1.8,
  vowel: 1.5,
  digraph: 1.4,
  blend: 1.4,
  extended: 1.6,
};

const PHONEME_AUDIO_EXTENSIONS = [".mp3", ".wav"] as const;
const HUMAN_PHONEME_SUBDIR = "human";

/** Speakable sound keys that have clip files (mp3 preferred, wav fallback at playback) */
export const PHONEME_AUDIO: Record<string, string> = Object.fromEntries(
  ALL_PHONEME_SOUNDS.map((sound) => [
    sound,
    `/audio/phonemes/${sound}${PHONEME_AUDIO_EXTENSIONS[0]}`,
  ]),
);

export function getPhonemeCategory(sound: string): PhonemeCategory {
  return PHONEME_CATEGORIES[sound] ?? "extended";
}

export function getPhonemeGenerationPrompt(sound: string): string {
  return PHONEME_GENERATION_PROMPTS[sound] ?? sound;
}

export function getPhonemeGenerationSpeed(sound: string): number {
  return CATEGORY_GENERATION_SPEED[getPhonemeCategory(sound)];
}

export function getPhonemeMaxDurationSec(sound: string): number {
  return CATEGORY_MAX_DURATION_SEC[getPhonemeCategory(sound)];
}

export function isHumanCorePhoneme(sound: string): boolean {
  return HUMAN_CORE_PHONEME_SOUNDS.includes(sound as typeof HUMAN_CORE_PHONEME_SOUNDS[number]);
}

export function chunkToPhonemeSound(chunk: string): string {
  const upper = chunk.toUpperCase().trim();
  if (!upper) return "";
  if (CHUNK_SOUNDS[upper]) return CHUNK_SOUNDS[upper];
  if (upper.length === 1) return CHUNK_SOUNDS[upper] ?? upper.toLowerCase();
  return upper.toLowerCase();
}

export function phonemeSoundForTts(sound: string): string {
  return PHONEME_GENERATION_PROMPTS[sound] ?? sound;
}

export function getPhonemeAudioUrls(sound: string): string[] {
  if (!sound || !ALL_PHONEME_SOUNDS.includes(sound as typeof ALL_PHONEME_SOUNDS[number])) {
    return [];
  }
  const urls: string[] = [];
  for (const ext of PHONEME_AUDIO_EXTENSIONS) {
    urls.push(`/audio/phonemes/${sound}${ext}`);
  }
  return urls;
}

export function getPhonemeAudioUrl(chunk: string): string | null {
  const sound = chunkToPhonemeSound(chunk);
  const urls = getPhonemeAudioUrls(sound);
  return urls[0] ?? null;
}

export function hasPhonemeClip(chunk: string): boolean {
  const sound = chunkToPhonemeSound(chunk);
  return ALL_PHONEME_SOUNDS.includes(sound as typeof ALL_PHONEME_SOUNDS[number]);
}

export function chunksToBlendScript(chunks: string[]): string {
  return chunks.map(chunkToPhonemeSound).join("... ");
}
