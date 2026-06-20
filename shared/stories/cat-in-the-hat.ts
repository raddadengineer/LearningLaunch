import type { BookPageTeachingMeta } from "@shared/schema";

export const CAT_IN_THE_HAT_STORY = {
  title: "The Cat in the Hat",
  level: 1,
  phonicsFocus: "Short A (like in cat, hat, mat)",
  vowelHighlight: "a",
  sightWordsList: ["THE", "IS", "A", "TO", "AND", "HAS", "ON", "SAW"],
  description: "A Short A phonics story — sound out cat, hat, mat, rat, and more!",
  coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg",
  comprehensionQuestions: [
    { question: "Who was on the mat?", answer: "The cat and the rat" },
    { question: "What did the cat have?", answer: "A hat" },
    { question: "Did the rat run away or stay?", answer: "The rat ran to the mat and sat with the cat" },
  ],
  pages: [
    {
      pageNumber: 1,
      text: "The cat is fat.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg",
      teachingMeta: {
        parentNote: "Point to each word as you read. Ask: What sound does each letter make in CAT?",
        phonicsHints: ["C-a-t", "F-a-t"],
        focusWords: ["CAT", "FAT"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 2,
      text: "The cat has a hat.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chapeaux_en_peau_de_castor.jpg",
      teachingMeta: {
        parentNote: "Point out the Short A sound in HAT.",
        phonicsHints: ["C-a-t", "H-a-t"],
        focusWords: ["CAT", "HAT"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 3,
      text: "The cat sat on a mat.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Woven_mat.jpg",
      teachingMeta: {
        parentNote: "Blend S-a-t and M-a-t together slowly.",
        phonicsHints: ["S-a-t", "M-a-t"],
        focusWords: ["SAT", "MAT"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 4,
      text: "A rat saw the cat.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/44/Brown_Rat_%28Rattus_norvegicus%29.jpg",
      teachingMeta: {
        parentNote: "Point out R-a-t. THE is a sight word — read it without sounding out.",
        phonicsHints: ["R-a-t"],
        focusWords: ["RAT"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 5,
      text: "The rat ran to the mat.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Woven_mat.jpg",
      teachingMeta: {
        parentNote: "Point out R-a-n. TO is a sight word.",
        phonicsHints: ["R-a-n", "R-a-t", "M-a-t"],
        focusWords: ["RAN", "RAT", "MAT"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 6,
      text: "The cat and the rat sat on the mat.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg",
      teachingMeta: {
        parentNote: "Read this page together! Use the echo button if your child gets stuck.",
        phonicsHints: ["C-a-t", "R-a-t", "S-a-t", "M-a-t"],
        focusWords: ["CAT", "RAT", "SAT", "MAT"],
        readTogether: true,
      } satisfies BookPageTeachingMeta,
    },
  ],
};

export const STORY_SIGHT_WORDS = new Set(
  CAT_IN_THE_HAT_STORY.sightWordsList.map((w) => w.toUpperCase())
);
