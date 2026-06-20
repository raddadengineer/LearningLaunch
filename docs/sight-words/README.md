# Sight Words

The **Sight Words** activity (`/sight-words`) helps children memorize high-frequency words that should be recognized instantly, not sounded out letter-by-letter.

## Levels

| Level | Theme | Example words |
|-------|-------|---------------|
| 1 | Dolch pre-primer core | THE, A, I, IS, IT, IN, ON, AT, MY, WE, TO, GO |
| 2 | Common sight words | YOU, SEE, CAN, AND, HAS, WITH, DID, HAD, TEN, SAID, LOOK, COME, PLAY, RUN, UP, BIG, RED |
| 3 | Extended set | WHERE, HELP, JUMP, MAKE, FIND, HERE, AWAY, DOWN, LITTLE, ONE, TWO, THREE |

Each sight word includes:

- **sentence** — example usage in context
- **imageUrl** — visual association (Wikimedia Commons)

## Database schema

```typescript
sightWords {
  id: serial
  word: text
  level: integer
  sentence: text
  imageUrl: text
}
```

## Seed data

Defined in `server/storage.ts` → `seedSightWords()`.

Additional sight words may be inserted incrementally in `initializeData()` when new story vocabulary is added (e.g. words from phonics stories).

## Phonics integration

Sight words also appear in `shared/phonics.ts` → `PHONICS_MAP` so the reading coach can still help when needed, but the UI emphasizes instant recognition over chunking.

Story-specific sight word sets are exported from story files, e.g.:

```typescript
// shared/stories/cat-in-the-hat.ts
export const STORY_SIGHT_WORDS = new Set(["THE", "IS", "A", ...]);
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sight-words?level=1` | Sight words for a level |
| GET | `/api/sight-words` | All sight words |

## Progress tracking

- Activity type: `sight-words`
- 12 items tracked per level (configurable in storage progress logic)
- Stars awarded on level completion
- 🦉 **Help button** — spoken instructions on setup and play screens

## Adding new sight words

1. Add to the appropriate level array in `seedSightWords()` in `server/storage.ts`
2. Add phonics entry in `shared/phonics.ts` if the word appears in stories or sentences
3. For live databases, insert via SQL or extend `initializeData()` with an incremental check (same pattern used for story-related sight words)

Example:

```typescript
{ word: "HERE", level: 3, sentence: "Come here please.", imageUrl: "https://..." }
```

## Relationship to stories

Each phonics story declares a `sightWordsList`. Those words are highlighted in the book reader and reinforced in this activity. When authoring stories, align `sightWordsList` with words children should know by heart before or after reading.
