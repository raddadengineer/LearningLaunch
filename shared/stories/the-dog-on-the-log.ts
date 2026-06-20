import type { BookPageTeachingMeta } from "@shared/schema";

export const THE_DOG_ON_THE_LOG_STORY = {
  title: "The Dog on the Log",
  level: 1,
  phonicsFocus: "Short O (like in dog, log, hop)",
  vowelHighlight: "o",
  sightWordsList: ["THE", "IS", "A", "ON", "SAW", "DID"],
  description: "A Short O CVC story — practice dog, log, fox, hop, and more!",
  coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
  comprehensionQuestions: [
    { question: "Was the dog hot or cold?", answer: "The dog was hot" },
    { question: "Where did the dog sit?", answer: "On a log" },
    { question: "What did the fox do?", answer: "The fox did hop" },
  ],
  readingActivity: {
    title: "Sound Hunt",
    description: "Draw three things from the story that have the Short O sound!",
    words: ["dog", "log", "fox"],
    parentTip: "While your child draws, say: That's right! D-o-g... Dog! You found another O word!",
  },
  pages: [
    {
      pageNumber: 1,
      text: "The dog is hot.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
      teachingMeta: {
        parentNote: "Point to each word. Practice the Short O sound: ŏ. Dog, Log, and Hop are all CVC words — same pattern!",
        phonicsHints: ["D-o-g", "H-o-t"],
        focusWords: ["DOG", "HOT"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 2,
      text: "The dog sat on a log.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Felling_a_gumtree_c1884-1917_Powerhouse_Museum.jpg",
      teachingMeta: {
        parentNote: "ON is a sight word. SAT has Short A; LOG has Short O. Notice the rhyme: dog, log!",
        phonicsHints: ["D-o-g", "S-a-t", "L-o-g"],
        focusWords: ["DOG", "SAT", "LOG"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 3,
      text: "A fox saw the dog.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_%28cropped%29.jpg",
      teachingMeta: {
        parentNote: "Point out F-o-x. SAW is a sight word. If they can read dog, they can read log and fox!",
        phonicsHints: ["F-o-x", "D-o-g"],
        focusWords: ["FOX", "DOG"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 4,
      text: "The fox did hop.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_%28cropped%29.jpg",
      teachingMeta: {
        parentNote: "DID is a new sight word. H-o-p — same O pattern as dog and log!",
        phonicsHints: ["F-o-x", "H-o-p"],
        focusWords: ["FOX", "HOP"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 5,
      text: "Hop, dog, hop!",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
      teachingMeta: {
        parentNote: "Read together! All three words rhyme: hop, dog... well, dog and hop share the O sound. Have fun!",
        phonicsHints: ["H-o-p", "D-o-g"],
        focusWords: ["HOP", "DOG"],
        readTogether: true,
      } satisfies BookPageTeachingMeta,
    },
  ],
};
