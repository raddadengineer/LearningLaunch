import type { BookPageTeachingMeta } from "@shared/schema";

export const THE_HEN_IN_THE_PEN_STORY = {
  title: "The Hen in the Pen",
  level: 2,
  phonicsFocus: "Short E (like in hen, pen, red, bed)",
  vowelHighlight: "e",
  sightWordsList: ["THE", "IS", "A", "IN", "ON"],
  description:
    "A Short E CVC story — practice hen, pen, red, and bed with strong rhymes and clear /ĕ/ sounds.",
  coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hen_at_Lourmarin.jpg",
  comprehensionQuestions: [
    { question: "What color is the hen?", answer: "The hen is red" },
    { question: "Where did the hen stay?", answer: "In a pen" },
    { question: "What did the hen sit on?", answer: "A bed" },
  ],
  readingActivity: {
    title: "Action Read",
    description:
      "Tap each word to hear it. Every time you read HEN, make a beak with your hands!",
    words: ["hen", "pen", "red", "bed", "fed"],
    parentTip:
      "Practice the Short E sound before you start: smile shape for /ĕ/ in hen, pen, red, bed. Hen/Pen and Red/Bed rhyme — celebrate when your child spots the pattern!",
  },
  pages: [
    {
      pageNumber: 1,
      text: "The hen is red.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hen_at_Lourmarin.jpg",
      teachingMeta: {
        parentNote:
          "Point to each word as the child reads. Encourage a wide smile mouth shape for the Short E sound (/ĕ/). When they read HEN, have them make a beak with their hands.",
        phonicsHints: ["H-e-n", "R-e-d"],
        focusWords: ["HEN", "RED"],
        actionHint: "🐔 Make a beak with your hands when you read HEN!",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 2,
      text: "The hen is in a pen.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Chicken_coop_with_chickens.jpg",
      teachingMeta: {
        parentNote:
          "IN is a sight word — read it in one glance. Point out P-e-n. Hen and pen rhyme!",
        phonicsHints: ["H-e-n", "P-e-n"],
        focusWords: ["HEN", "PEN"],
        actionHint: "🐔 Beak motion for HEN! 👂 Listen: hen and pen rhyme.",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 3,
      text: "Ten hens in the pen.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Chicken_coop_with_chickens.jpg",
      teachingMeta: {
        parentNote:
          "TEN is a new sight word. Hens has the Short E sound too. More hens — more beak motions!",
        phonicsHints: ["T-e-n", "H-e-n", "P-e-n"],
        focusWords: ["TEN", "HENS", "PEN"],
        actionHint: "🐔 Beak motion every time you read hen or hens!",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 4,
      text: "The hen sat on a bed.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Bed_from_the_1870s.jpg",
      teachingMeta: {
        parentNote:
          "SAT has Short A; B-e-d has Short E. Red and bed rhyme — another pattern to spot!",
        phonicsHints: ["H-e-n", "S-a-t", "B-e-d"],
        focusWords: ["HEN", "SAT", "BED"],
        actionHint: "🐔 Beak for HEN! 👂 Red and bed rhyme.",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 5,
      text: "Fed the hen!",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Chicken_feed_in_a_bowl.jpg",
      teachingMeta: {
        parentNote: "Read together! Point out F-e-d. The jaw drops slightly for that clear /ĕ/ sound.",
        phonicsHints: ["F-e-d", "H-e-n"],
        focusWords: ["FED", "HEN"],
        readTogether: true,
        actionHint: "🥣 Pretend to hold a bowl and feed the hen!",
      } satisfies BookPageTeachingMeta,
    },
  ],
};
