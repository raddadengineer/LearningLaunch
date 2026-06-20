export const HELP_WELCOME =
  "Tap Let's Go to pick your name and start playing!";

export const HELP_USER_SELECTION =
  "Tap your name to start! Or tap Add a Friend to make a new profile.";

export const HELP_HOME =
  "Tap a picture to pick a game! Use the buttons at the bottom to go Home, Stories, Words, or Math.";

export const HELP_BOOKS =
  "Tap a book to read it! The house button goes back home.";

export const HELP_BOOK_READER =
  "Tap any word to hear it! Use the arrows to turn pages. The house button goes back to your books.";

export const HELP_BOOK_COMPREHENSION =
  "Read each question and think about the story. Tap Show Answer if you need a hint!";

export const HELP_READING_SETUP =
  "Pick a level, then tap Start! The house button goes home.";

export const HELP_READING_PLAY =
  "Tap the letters to hear each sound. Tap Sound It Out for help, or Hear Word to hear the whole word.";

export const HELP_SIGHT_WORDS_SETUP =
  "Pick a level and tap Start! The house button goes home.";

export const HELP_SIGHT_WORDS_PLAY =
  "Tap the big word to hear it! Tap Hear Sentence to hear it in a sentence.";

export const HELP_MATH_SETUP =
  "Pick counting or adding, choose a level, then tap Start!";

export const HELP_MATH_PLAY =
  "Listen to the question, then tap your answer! Tap the speaker to hear it again.";

export const HELP_VOWEL_PICKER =
  "Pick A Sounds or I Sounds to practice short and long vowels!";

export const HELP_VOWEL_SETUP =
  "Tap Start to practice word pairs, or try a game!";

export const HELP_VOWEL_PAIRS =
  "Tap a word to hear it! Yellow words have a short vowel, green words have a long vowel.";

export const HELP_VOWEL_GAMES =
  "Follow the game instructions and tap the buttons to play!";

export function getVowelContrastHelp(
  phase: "picker" | "setup" | "play",
  activeTab?: "pairs" | "games",
): string {
  if (phase === "picker") return HELP_VOWEL_PICKER;
  if (phase === "setup") return HELP_VOWEL_SETUP;
  return activeTab === "games" ? HELP_VOWEL_GAMES : HELP_VOWEL_PAIRS;
}
