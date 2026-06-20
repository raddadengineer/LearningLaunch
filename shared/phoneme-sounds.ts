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
  "kwuh", "yuh", "j",
  "un", "al", "all", "ack", "ell", "air", "own", "shun",
] as const;

export const ALL_PHONEME_SOUNDS = [
  ...CORE_PHONEME_SOUNDS,
  ...EXTENDED_PHONEME_SOUNDS,
] as const;

const PHONEME_AUDIO_EXTENSIONS = [".mp3", ".wav"] as const;

/** Speakable sound keys that have clip files (mp3 preferred, wav fallback at playback) */
export const PHONEME_AUDIO: Record<string, string> = Object.fromEntries(
  ALL_PHONEME_SOUNDS.map((sound) => [
    sound,
    `/audio/phonemes/${sound}${PHONEME_AUDIO_EXTENSIONS[0]}`,
  ]),
);

/** Elongate continuant sounds for TTS fallback when no clip exists */
const CONTINUANT_ELONGATION: Record<string, string> = {
  fff: "fffff",
  sss: "sssss",
  mmm: "mmmmm",
  nnn: "nnnnn",
  lll: "lllll",
  rrr: "rrrrr",
  vvv: "vvvvv",
  zzz: "zzzzz",
};

export function chunkToPhonemeSound(chunk: string): string {
  const upper = chunk.toUpperCase().trim();
  if (!upper) return "";
  if (CHUNK_SOUNDS[upper]) return CHUNK_SOUNDS[upper];
  if (upper.length === 1) return CHUNK_SOUNDS[upper] ?? upper.toLowerCase();
  return upper.toLowerCase();
}

export function phonemeSoundForTts(sound: string): string {
  return CONTINUANT_ELONGATION[sound] ?? sound;
}

export function getPhonemeAudioUrls(sound: string): string[] {
  if (!sound || !ALL_PHONEME_SOUNDS.includes(sound as typeof ALL_PHONEME_SOUNDS[number])) {
    return [];
  }
  return PHONEME_AUDIO_EXTENSIONS.map((ext) => `/audio/phonemes/${sound}${ext}`);
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
