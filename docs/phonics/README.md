# Phonics System

LearningLaunch uses a shared phonics layer so words, stories, sight words, and the reading coach all speak the same "sound language."

## Core files

| File | Purpose |
|------|---------|
| `shared/phonics.ts` | `PHONICS_MAP` — word → phonics chunks; `getPhonicsForWord()`, `getPhonicsForSentence()` |
| `shared/phoneme-sounds.ts` | Maps chunks to phoneme sounds, audio clip registry, and TTS fallbacks |
| `shared/phonics/short-long-a.ts` | Vowel contrast content — Short A vs Long A |
| `shared/phonics/short-long-i.ts` | Vowel contrast content — Short I vs Long I |
| `shared/phonics/vowel-contrast-types.ts` | TypeScript types for vowel contrast UI |

## Phonics chunks

Words are split into decodable chunks, not always single letters:

```
CAT  → ["C", "A", "T"]
FISH → ["F", "I", "SH"]
BOOK → ["B", "OO", "K"]
ELEPHANT → ["EL", "E", "PHANT"]
```

When a word is missing from `PHONICS_MAP`, the system falls back to splitting by individual letters.

## Adding phonics for a new word

Edit `PHONICS_MAP` in `shared/phonics.ts`:

```typescript
export const PHONICS_MAP: Record<string, string[]> = {
  // ...
  FROG: ["FR", "O", "G"],
};
```

Words added via the admin UI get phonics automatically via `getPhonicsForWord()` at insert time. Custom multi-letter chunks still require a map entry.

## Vowel contrast activity

Routes:

| Route | Content |
|-------|---------|
| `/vowel-contrast` | Picker — defaults to A Sounds |
| `/vowel-contrast/a` | Short A vs Long A (`SHORT_A_LONG_A`) |
| `/vowel-contrast/i` | Short I vs Long I (`SHORT_I_LONG_I`) |

Reachable from Home tiles (**A Sounds** / **I Sounds**) or linked from phonics stories.

Each vowel module (`shared/phonics/short-long-a.ts`, `short-long-i.ts`) provides:

- **Word pairs** — Magic E and vowel-team short/long contrasts
- **Games** — Magic Wand, Sound Sort, Stretch Test
- **Story hints** — link back to a matching phonics book

### A Sounds (`SHORT_A_LONG_A`)

- Magic E pairs — cap/cape, can/cane, mad/made, etc.
- Vowel team pairs — back/bake, man/main, pan/pain
- Linked from **The Cake at the Lake** (`linkPath: "/vowel-contrast/a"`)

### I Sounds (`SHORT_I_LONG_I`)

- Magic E pairs — kit/kite, fin/fine, bit/bite, etc.
- Vowel team pairs — fill/fly, sick/high, hill/light, etc.
- Linked from **The Big Fish** and **The Kite in the Sky** (`linkPath: "/vowel-contrast/i"`)

### Adding a new vowel contrast module

1. Create `shared/phonics/short-long-{vowel}.ts` following `vowel-contrast-types.ts` (see `short-long-i.ts` as a template)
2. Add the export to `VOWEL_CONTENT` in `client/src/pages/vowel-contrast.tsx`
3. Add a Home tile or story `readingActivity.linkPath` (e.g. `/vowel-contrast/o`)
4. Add a phonics story that reinforces the vowel pattern

## Reading coach integration

When **AI Reading Coach** is enabled (voice settings):

- `speakPhonics()` and `speakChunkCoach()` play pre-recorded clips from `client/public/audio/phonemes/`
- Unmapped chunks fall back to TTS with elongated continuant sounds
- Chunk boxes highlight in sync with each sound on `/reading` and `/books/:id`
- Blend pass replays chunks with shrinking gaps before the whole word
- Toggle and pace stored in `users.preferences` (synced per child; hydrated to localStorage on switch)
- Vowel contrast Game C uses isolated clips: short (`ah`/`ih`) vs long (`ay`/`eye`) via `speakPhonemeSound()`

### Phoneme clip inventory

**74 sounds** in `client/public/audio/phonemes/`:

- **Core (41):** consonants, vowels, digraphs, common blends (Levels 1–3)
- **Extended (33):** vowel teams (`ay`, `eye`, `er`, `or`, …), blends (`sm`, `sp`, …), endings (`mp`, `nd`, …)

Playback tries `.mp3` then `.wav`. Story syllable fragments (`PHANT`, `SAUR`, …) remain TTS-only.

Regenerate:

```bash
npm run generate:phonemes
npm run generate:phonemes -- --force
```

## Story integration

Stories use phonics in two ways:

1. **`phonicsFocus`** — displayed on the book card and reader header
2. **`teachingMeta.phonicsHints`** — parent-facing hints per page (e.g. `"C-a-t"`)
3. **`vowelHighlight`** — highlights the target vowel letter in page text

## Backfill on startup

`server/storage.ts` → `backfillPhonics()` updates existing database words that have empty phonics arrays, using the current `PHONICS_MAP`.
