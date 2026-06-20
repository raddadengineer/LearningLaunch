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

export function chunkToPhonemeSound(chunk: string): string {
  const upper = chunk.toUpperCase().trim();
  if (!upper) return "";
  if (CHUNK_SOUNDS[upper]) return CHUNK_SOUNDS[upper];
  if (upper.length === 1) return CHUNK_SOUNDS[upper] ?? upper.toLowerCase();
  return upper.toLowerCase();
}

export function chunksToBlendScript(chunks: string[]): string {
  return chunks.map(chunkToPhonemeSound).join("... ");
}
