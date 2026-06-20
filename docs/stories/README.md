# Stories (Phonics Books)

The **Stories** activity (`/books`, `/books/:id`) provides leveled phonics story books with parent teaching notes, comprehension questions, and linked reading activities.

## Built-in phonics stories

Each story is a TypeScript module under `shared/stories/`. On startup, `server/storage.ts` seeds missing books into the database.

| File | Title | Level | Phonics focus |
|------|-------|-------|---------------|
| `cat-in-the-hat.ts` | The Cat in the Hat | 1 | Short A (cat, hat, mat) |
| `the-big-pig.ts` | The Big Pig | 1 | Short I (pig, sit, bin) |
| `the-dog-on-the-log.ts` | The Dog on the Log | 1 | Short O (dog, log, hop) |
| `the-lad-and-the-bag.ts` | The Lad and the Bag | 2 | Short A — more words (lad, bag, van, nap) |
| `the-hen-in-the-pen.ts` | The Hen in the Pen | 2 | Short E (hen, pen, red, bed) |
| `the-big-fish.ts` | The Big Fish | 2 | Short I — more words (fish, swim, hid, sit) → links to I Sounds |
| `the-cake-at-the-lake.ts` | The Cake at the Lake | 3 | Long A / Magic E (cap vs cape, cake, lake) → links to A Sounds |
| `the-kite-in-the-sky.ts` | The Kite in the Sky | 3 | Long I — Magic E, Y, and -igh (kite, sky, bike, high) → links to I Sounds |

### Additional seeded books (inline in storage)

These are defined directly in `seedReadingBooks()` rather than separate story files:

- **My Red Hat** (level 2) — colors and 4-letter words
- **I Like My Book** (level 3) — reading motivation story

## Story file format

Create a new file at `shared/stories/my-story.ts`:

```typescript
import type { BookPageTeachingMeta } from "@shared/schema";

export const MY_STORY = {
  title: "My Story Title",
  level: 1,
  phonicsFocus: "Short A (like in cat, hat)",
  vowelHighlight: "a",                    // optional — highlights vowel in reader
  sightWordsList: ["THE", "A", "IS", "ON"],
  description: "One-line summary for the library card.",
  coverImageUrl: "https://upload.wikimedia.org/...",
  comprehensionQuestions: [
    { question: "Who is on the mat?", answer: "The cat" },
  ],
  readingActivity: {                      // optional — linked follow-up activity
    title: "Sound Hunt",
    description: "Find Short A words around the house.",
    words: ["CAT", "HAT", "MAT"],
    parentTip: "Point to objects as you say each word.",
    linkPath: "/vowel-contrast/a",
    linkLabel: "Try A Sounds",
  },
  pages: [
    {
      pageNumber: 1,
      text: "The cat is fat.",
      imageUrl: "https://upload.wikimedia.org/...",
      teachingMeta: {
        parentNote: "Point to each word as the child reads.",
        phonicsHints: ["C-a-t", "F-a-t"],
        focusWords: ["CAT", "FAT"],
        readTogether: false,              // optional — suggest echo reading
        actionHint: "Hop like a frog!",   // optional
      } satisfies BookPageTeachingMeta,
    },
    // ... more pages
  ],
};
```

## Registering a new story

1. Add the story file under `shared/stories/`
2. Import it in `server/storage.ts`:
   ```typescript
   import { MY_STORY } from "@shared/stories/my-story";
   ```
3. Add a migration-style check in `initializeData()` (same pattern as existing stories):
   ```typescript
   const hasMyStory = existingBooks.some(b => b.title === MY_STORY.title);
   if (!hasMyStory) {
     await this.seedStoryBook(MY_STORY);
   }
   ```
4. Optionally add it to the `booksData` array in `seedReadingBooks()` for fresh installs
5. Add sight words and phonics entries used in the story to `shared/phonics.ts`

## Database schema

```typescript
readingBooks {
  id, title, level, coverImageUrl, description,
  phonicsFocus, vowelHighlight,
  sightWordsList: string[],
  comprehensionQuestions: { question, answer }[],
  readingActivity?: { title, description, words, parentTip?, linkPath?, linkLabel? }
}

readingBookPages {
  id, bookId, pageNumber, text, imageUrl,
  teachingMeta?: { parentNote?, phonicsHints?, focusWords?, readTogether?, actionHint? }
}
```

## Book reader features

- Page-by-page navigation with images
- Vowel highlighting when `vowelHighlight` is set
- Sight word badges from `sightWordsList`
- Parent teaching panel per page (`teachingMeta`)
- Comprehension quiz at the end
- Optional linked activity (e.g. vowel contrast at `/vowel-contrast/a` or `/vowel-contrast/i`)
- 🦉 **Help button** — spoken page instructions via TTS
- TTS reads each page aloud (Kokoro or browser fallback)

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | List all books (with page counts) |
| GET | `/api/books/:id` | Full book with pages |

## Progress tracking

Story completion is tracked through the book reader. Stars and progress sync to the parent dashboard.
