import type { BookPageTeachingMeta } from "@shared/schema";

export const THE_KITE_IN_THE_SKY_STORY = {
  title: "The Kite in the Sky",
  level: 3,
  phonicsFocus: "Long I — Magic E (bike, ride), Y (fly, sky), and -igh (high, light, night)",
  sightWordsList: ["THE", "A", "IT", "IS", "HE", "HAS", "WANTS", "AT", "LOOK"],
  description:
    "A Long I contrast story — hear Short I in kid, then Long I in kite, sky, bike, ride, and -igh words!",
  coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Kite_flying_in_Bali_-_Indonesia.jpg",
  comprehensionQuestions: [
    { question: "What color was the kite?", answer: "White" },
    { question: "Does the kid have a bike or a car?", answer: "A bike" },
    { question: "Where did the kite fly?", answer: "In the sky / high up" },
  ],
  readingActivity: {
    title: "Smile Stretch",
    description:
      "Long I needs a big smile! Tap each word — Kid = small quick mouth, Ride = huge cheese smile!",
    words: ["kite", "sky", "bike", "ride", "white", "light", "night", "high"],
    parentTip:
      "Every Long I word gets a big smile stretch. Short I in kid and big stays quick and small. Try the full I Sounds practice for Magic E pairs like kit → kite!",
    linkPath: "/vowel-contrast/i",
    linkLabel: "Open Short I vs Long I Practice 🪁",
  },
  pages: [
    {
      pageNumber: 1,
      text: "The kite is high.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Kite_flying_in_Bali_-_Indonesia.jpg",
      teachingMeta: {
        parentNote:
          "Long I with -igh! H-i-gh — the letters igh team up to say 'Iii-high.' Point to the kite in the sky!",
        phonicsHints: ["K-i-te", "H-igh"],
        focusWords: ["KITE", "HIGH"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 2,
      text: "It flies in the sky.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Sky-3.jpg",
      teachingMeta: {
        parentNote:
          "Long I with Y! Fl-y and sk-y — Y at the end can say 'Iii.' IT and THE are sight words.",
        phonicsHints: ["Fl-y", "Sk-y"],
        focusWords: ["FLIES", "SKY"],
        actionHint: "☁️ Point up to the sky as you read!",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 3,
      text: "A kid has a bike.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/Left_side_of_Cycling_road_-_Helsinki_May_2019.jpg",
      teachingMeta: {
        parentNote:
          "Contrast page! K-i-d is Short I (quick 'ih'). B-i-ke is Long I (Magic E — 'Iii-bike'). Hear them in the same sentence!",
        phonicsHints: ["K-i-d", "B-i-ke"],
        focusWords: ["KID", "BIKE"],
        actionHint: "👂 Kid = small mouth. Bike = big smile!",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 4,
      text: "He wants to ride.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/Left_side_of_Cycling_road_-_Helsinki_May_2019.jpg",
      teachingMeta: {
        parentNote:
          "R-i-de — Magic E again! HE and WANTS are sight words. Ask: Did the I say its name?",
        phonicsHints: ["B-i-ke", "R-i-de"],
        focusWords: ["BIKE", "RIDE"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 5,
      text: "The kite is white.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Kite_flying_in_Bali_-_Indonesia.jpg",
      teachingMeta: {
        parentNote:
          "W-h-i-te — Magic E makes Long I! Compare to Short I in kid on page 3.",
        phonicsHints: ["K-i-te", "Wh-i-te"],
        focusWords: ["KITE", "WHITE"],
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 6,
      text: "It is a fun sight.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Kite_flying_in_Bali_-_Indonesia.jpg",
      teachingMeta: {
        parentNote:
          "S-i-ght — the -igh pattern again, like high! IS and A are sight words.",
        phonicsHints: ["H-igh", "S-igh-t"],
        focusWords: ["HIGH", "SIGHT"],
        readTogether: true,
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 7,
      text: "Look at the light!",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/The_Sun_in_white_light.jpg",
      teachingMeta: {
        parentNote:
          "L-i-gh-t — -igh pattern! LOOK and AT are sight words. Smile stretch on light!",
        phonicsHints: ["L-igh-t"],
        focusWords: ["LIGHT"],
        actionHint: "😁 Big smile when you say light!",
      } satisfies BookPageTeachingMeta,
    },
    {
      pageNumber: 8,
      text: "It is a big night.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg",
      teachingMeta: {
        parentNote:
          "Read together! B-i-g is Short I. N-i-gh-t is Long I (-igh). Celebrate — they read Long I words!",
        phonicsHints: ["B-i-g", "N-igh-t"],
        focusWords: ["BIG", "NIGHT"],
        readTogether: true,
        actionHint: "🌙 Smile stretch on night — quick ih on big!",
      } satisfies BookPageTeachingMeta,
    },
  ],
};
