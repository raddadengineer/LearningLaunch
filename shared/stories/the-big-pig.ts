import type { BookPageTeachingMeta } from "@shared/schema";

export const THE_BIG_PIG_STORY = {
  title: "The Big Pig",
  level: 1,
  phonicsFocus: "Short I (like in pig, sit, bin)",
  vowelHighlight: "i",
  sightWordsList: ["THE", "IS", "A", "HAS", "SAW", "CAN", "WITH"],
  description: "A Short I phonics story — practice pig, sit, bin, and more!",
  coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pig_farm_Vampula_1.jpg",
  comprehensionQuestions: [
    { question: "Is the pig small or big?", answer: "The pig is big" },
    { question: "What does the pig have?", answer: "A bin" },
    { question: "Who sat with the pig at the end?", answer: "The kid sat with the pig" },
  ],
  pages: [
    {
      pageNumber: 1,
      text: "The pig is big.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pig_farm_Vampula_1.jpg",
      teachingMeta: {
        parentNote: "Point to each word as the child reads. Practice the Short I sound: ih. Ask: What sound does I make in PIG?",
        phonicsHints: ["P-i-g", "B-i-g"],
        focusWords: ["PIG", "BIG"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 2,
      text: "The pig can sit.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pig_farm_Vampula_1.jpg",
      teachingMeta: {
        parentNote: "CAN is a sight word — read it without sounding out. Point out S-i-t.",
        phonicsHints: ["P-i-g", "S-i-t"],
        focusWords: ["PIG", "SIT"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 3,
      text: "The pig has a bin.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/L%C3%A5da_-_Livrustkammaren_-_107142.tif/lossy-page1-8178px-L%C3%A5da_-_Livrustkammaren_-_107142.tif.jpg",
      teachingMeta: {
        parentNote: "Blend B-i-n slowly. Use the Highlight Game to spot all the Short I words!",
        phonicsHints: ["P-i-g", "B-i-n"],
        focusWords: ["PIG", "BIN"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 4,
      text: "A kid saw the pig.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg",
      teachingMeta: {
        parentNote: "Point out K-i-d. SAW is a sight word — read it in one glance.",
        phonicsHints: ["K-i-d", "P-i-g"],
        focusWords: ["KID", "PIG"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 5,
      text: "The kid sat with the pig.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pig_farm_Vampula_1.jpg",
      teachingMeta: {
        parentNote: "Read this page together! WITH is a new sight word. Use Echo if your child gets stuck.",
        phonicsHints: ["K-i-d", "P-i-g"],
        focusWords: ["KID", "PIG"],
        readTogether: true,
      } satisfies BookPageTeachingMeta,
    },
  ],
};
