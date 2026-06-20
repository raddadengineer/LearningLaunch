import type { BookPageTeachingMeta } from "@shared/schema";

export const THE_BIG_FISH_STORY = {
  title: "The Big Fish",
  level: 2,
  phonicsFocus: "Short I — more words! (fish, swim, hid, sit, big)",
  vowelHighlight: "i",
  sightWordsList: ["THE", "IS", "A", "IT", "CAN", "IN", "DID"],
  description:
    "A second Short I story with new words — fish, swim, hid, and more /ĭ/ practice beyond pig and bin.",
  coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg",
  comprehensionQuestions: [
    { question: "What animal are we talking about?", answer: "A fish" },
    { question: "Where did the kid hide the fish?", answer: "In a bin" },
    { question: "Was the fish small or big?", answer: "The fish is big" },
  ],
  readingActivity: {
    title: "Sound Swap Game",
    description:
      "Say two words — one has Short I (ih) and one does not. Can your child pick the Short I word?",
    words: ["fish", "swim", "hid", "sit", "big"],
    parentTip:
      "Try: Sit vs Seat, Bin vs Bean, Pig vs Page. Short I is a quick 'ih' — not a long E! Open I Sounds practice for Magic E pairs like kit → kite!",
    linkPath: "/vowel-contrast/i",
    linkLabel: "Open Short I vs Long I Practice 🪁",
  },
  pages: [
    {
      pageNumber: 1,
      text: "The fish is big.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg",
      teachingMeta: {
        parentNote:
          "Point to each word as the child reads. Focus on Short I as a quick 'ih' sound. F-i-sh introduces the 'sh' ending.",
        phonicsHints: ["F-i-sh", "B-i-g"],
        focusWords: ["FISH", "BIG"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 2,
      text: "It can swim in a bin.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/L%C3%A5da_-_Livrustkammaren_-_107142.tif/lossy-page1-8178px-L%C3%A5da_-_Livrustkammaren_-_107142.tif.jpg",
      teachingMeta: {
        parentNote:
          "IT and CAN are sight words. S-w-i-m blends four letters — keep Short I as the anchor sound. B-i-n helps the rhyme!",
        phonicsHints: ["S-w-i-m", "B-i-n"],
        focusWords: ["SWIM", "BIN"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 3,
      text: "A kid hid the fish.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg",
      teachingMeta: {
        parentNote: "Point out K-i-d and H-i-d — both have Short I. A new word: hid!",
        phonicsHints: ["K-i-d", "H-i-d", "F-i-sh"],
        focusWords: ["KID", "HID", "FISH"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 4,
      text: "The fish did sit.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg",
      teachingMeta: {
        parentNote: "DID is a sight word. S-i-t reviews Short I from the first pig story — but now with fish!",
        phonicsHints: ["F-i-sh", "S-i-t"],
        focusWords: ["FISH", "SIT"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 5,
      text: "Is it a big fish?",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg",
      teachingMeta: {
        parentNote: "Read together! IS and IT are very common — read them smoothly. Spot all three Short I words.",
        phonicsHints: ["F-i-sh", "B-i-g"],
        focusWords: ["FISH", "BIG"],
        readTogether: true,
      } satisfies BookPageTeachingMeta,
    },
  ],
};
