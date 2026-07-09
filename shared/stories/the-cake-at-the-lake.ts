import type { BookPageTeachingMeta } from "@shared/schema";

export const THE_CAKE_AT_THE_LAKE_STORY = {
  title: "The Cake at the Lake",
  level: 3,
  phonicsFocus: "Long A with Magic E — contrast Short A (cap) vs Long A (cape, cake, lake)",
  sightWordsList: ["THE", "A", "HAS", "IT", "IS", "HE", "BY", "FOR", "HIS", "SEES", "WANTS"],
  description:
    "A vowel contrast story — hear Short A (ah) in cap, then Long A (Aaa) when Magic E appears in cape, cake, and lake.",
  coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/Pound_layer_cake.jpg",
  comprehensionQuestions: [
    { question: "What does the cat have at first?", answer: "A cap" },
    { question: "What does the cat want instead of a cap?", answer: "A cape" },
    { question: "Where is the big cake?", answer: "By the lake" },
  ],
  readingActivity: {
    title: "Magic E Contrast",
    description:
      "Tap each word, then try the Magic E trick: cap → cape! Short A says 'ah'; Long A says its name when E is silent at the end.",
    words: ["cap", "cape", "cake", "lake", "bake", "gate"],
    parentTip:
      "Cover the silent E with your finger on cap, then reveal it for cape. Ask: Did the A change from 'ah' to 'Aaa'? Try the full Word Family practice for all Magic E pairs and games!",
    linkPath: "/vowel-contrast/a",
    linkLabel: "Open Short A vs Long A Practice ✨",
  },
  pages: [
    {
      pageNumber: 1,
      text: "The cat has a cap.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chapeaux_en_peau_de_castor.jpg",
      teachingMeta: {
        parentNote:
          "Short A contrast page! C-a-p says 'cap' with the quick 'ah' sound — same Short A they know from cat and hat.",
        phonicsHints: ["C-a-t", "C-a-p"],
        focusWords: ["CAT", "CAP"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 2,
      text: "But it wants a cape!",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg",
      teachingMeta: {
        parentNote:
          "Magic E moment! C-a-pe — the E is silent but makes the A say its name: 'Aaa-cape.' Compare cap and cape side by side.",
        phonicsHints: ["C-a-p", "C-a-pe"],
        focusWords: ["CAP", "CAPE"],
        actionHint: "✨ Cover the E with your finger on cap, then reveal it for cape!",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 3,
      text: "He sees a big cake.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/Pound_layer_cake.jpg",
      teachingMeta: {
        parentNote:
          "Long A again: C-a-ke. Magic E at the end! HE and SEES are sight words — read them smoothly.",
        phonicsHints: ["C-a-ke", "B-i-g"],
        focusWords: ["CAKE", "BIG"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 4,
      text: "It is by the lake.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Lake_mapourika_NZ.jpeg",
      teachingMeta: {
        parentNote:
          "L-a-ke — same Magic E pattern as cake! BY and IT are sight words. Point out: cake and lake rhyme!",
        phonicsHints: ["C-a-ke", "L-a-ke"],
        focusWords: ["CAKE", "LAKE"],
        actionHint: "👂 Cake and lake rhyme — both have Magic E!",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 5,
      text: "The cat can bake.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/Pound_layer_cake.jpg",
      teachingMeta: {
        parentNote:
          "B-a-ke — another Magic E word. CAN is a sight word. Ask: What sound does the A make now?",
        phonicsHints: ["C-a-t", "B-a-ke"],
        focusWords: ["CAT", "BAKE"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 6,
      text: "A cake for his mate.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg",
      teachingMeta: {
        parentNote:
          "Read together! M-a-te has Magic E. FOR and HIS are sight words. Celebrate — they read Long A words!",
        phonicsHints: ["C-a-ke", "M-a-te"],
        focusWords: ["CAKE", "MATE"],
        readTogether: true,
        actionHint: "🎉 Point to the silent E in cake and mate!",
      } satisfies BookPageTeachingMeta,
    },
  ],
};
