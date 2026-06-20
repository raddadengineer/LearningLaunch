import type { BookPageTeachingMeta } from "@shared/schema";

export const THE_LAD_AND_THE_BAG_STORY = {
  title: "The Lad and the Bag",
  level: 2,
  phonicsFocus: "Short A — more words! (lad, bag, van, nap, tap)",
  vowelHighlight: "a",
  sightWordsList: ["A", "THE", "IS", "ON", "HAS", "TO", "IN", "HAD"],
  description: "A second Short A story with new words — lad, bag, van, nap, and tap!",
  coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
  comprehensionQuestions: [
    { question: "Who has the bag?", answer: "The lad" },
    { question: "Where was the bag sitting?", answer: "On the van" },
    { question: "What did the lad do at the end?", answer: "He had a nap in the van" },
  ],
  readingActivity: {
    title: "Word Family Game",
    description: "Tap each word, then think of rhymes! What rhymes with bag? Tag! What rhymes with van? Can!",
    words: ["bag", "tag", "van", "can", "nap", "lad"],
    parentTip: "Try: 'If we have a bag, what else could be in a bag? A tag!' 'The lad is in a van. What else can go in a van? A can!'",
  },
  pages: [
    {
      pageNumber: 1,
      text: "A lad has a bag.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
      teachingMeta: {
        parentNote: "Encourage the 'ah' sound for every A. LAD means a boy. HAS is a sight word — read it without sounding out.",
        phonicsHints: ["L-a-d", "B-a-g"],
        focusWords: ["LAD", "BAG"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 2,
      text: "The bag is on a van.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/11/Freightliner_M2_106_6x4_2014_%2814240376744%29.jpg",
      teachingMeta: {
        parentNote: "ON and IS are sight words. Point out V-a-n — same -an family as can and ran!",
        phonicsHints: ["B-a-g", "V-a-n"],
        focusWords: ["BAG", "VAN"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 3,
      text: "A cat ran to the bag.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg",
      teachingMeta: {
        parentNote: "TO is a sight word. R-a-n — they know RAN from the first story! CAT is Short A too.",
        phonicsHints: ["C-a-t", "R-a-n", "B-a-g"],
        focusWords: ["CAT", "RAN", "BAG"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 4,
      text: "Tap, tap, tap!",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Set_of_fourteen_side_chairs_MET_DP110780.jpg",
      teachingMeta: {
        parentNote: "Read together! Tap your hands on the table as you say each TAP. Multisensory learning!",
        phonicsHints: ["T-a-p"],
        focusWords: ["TAP"],
        readTogether: true,
        actionHint: "👏 Tap your hands as you read each word!",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 5,
      text: "The lad had a nap in the van.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
      teachingMeta: {
        parentNote: "Read together! HAD and IN are sight words. N-a-p — new Short A word!",
        phonicsHints: ["L-a-d", "N-a-p", "V-a-n"],
        focusWords: ["LAD", "NAP", "VAN"],
        readTogether: true,
      } satisfies BookPageTeachingMeta,
    },
  ],
};
