# Words (Reading / Phonics Practice)

The **Words** activity (`/reading`) teaches children to sound out vocabulary using letter boxes, phonics chunks, and optional AI reading coach feedback.

## Levels

| Level | Focus | Example words | Count |
|-------|-------|---------------|-------|
| 1 | CVC (3-letter) | BAT, BUG, BUS, CAP, CAT, CUP, DOG, FIN, FIX, FOX, HAT, HOP, HOT, LID, LOG, MAP, MAT, MUD, NET, NUT, PAN, PEN, PIG, RAT, RED, ROD, RUN, SUN, TUB, VAN | 30 |
| 2 | 4-letter words | BALL, BANK, BASE, BEAR, BIRD, BOAT, BOOK, CAKE, CAMP, CASH, CAVE, COIN, DART, DUCK, FISH, FROG, HIKE, JUMP, MOON, PARK, PLAY, RIDE, ROCK, SAVE, SHIP, STAR, SWIM, TENT, TOOL, TREE | 30 |
| 3 | 5-letter words | ALIEN, APPLE, BEACH, BOARD, BRUSH, CABIN, CATCH, CHAIR, CLOUD, DRILL, FIELD, GLOVE, GRASS, HAPPY, HORSE, HOUSE, MAGIC, MONEY, MOUSE, NIGHT, OCEAN, RIVER, SHEEP, SHELL, SMILE, SNAKE, THROW, TIGER, TRAIL, WATER | 30 |
| 4 | 6–7 letter words | ANIMAL, BATTER, BUCKET, CAMERA, CANYON, CASTLE, DOCTOR, DOLLAR, DRAGON, FLIGHT, FLOWER, FOREST, GALAXY, HAMMER, HIKING, ISLAND, LIZARD, MONKEY, NATURE, ORANGE, PARADE, PENCIL, PITCHER, PLANET, RABBIT, ROCKET, SPIDER, TICKET, TURTLE, WALLEYE | 30 |
| 5 | 8+ letter words | ADVENTURE, AIRPLANE, ALLIGATOR, ASTRONAUT, BACKPACK, BASEBALL, BLEACHERS, BUTTERFLY, CAMPFIRE, CAMPGROUND, DINOSAUR, ELEPHANT, HELICOPTER, KANGAROO, MINNESOTA, MOSQUITO, MOUNTAIN, PRINCESS, ROADTRIP, SPACESHIP, SUNGLASSES, SUNSHINE, TELESCOPE, THEMEPARK, UMBRELLA, VACATION, VOLCANO, WATERFALL, WILDERNESS, WOODLAND | 30 |
| 6 | Simple sentences | THE CAT SAT ON THE MAT, I SEE A BIG RED BUG, THE SUN IS HOT TODAY, … | 24 |

Level 6 presents full short sentences instead of single words. Images use Wikimedia Commons URLs (same as seeded word data).

**Total:** 174 items (150 words + 24 sentences).

## Database schema

```typescript
readingWords {
  id: serial
  word: text          // uppercase, e.g. "CAT" or "THE CAT SAT"
  level: integer      // 1–6
  imageUrl: text
  phonics: jsonb      // string[], e.g. ["C", "A", "T"]
}
```

Phonics chunks are auto-derived from `shared/phonics.ts` via `getPhonicsForWord()` when words are seeded or added through the API.

## Where words live in code

- **Seed data:** `shared/reading-words.ts` → imported by `server/storage.ts` (`seedReadingWords()`, `seedLevel6Sentences()`)
- **Phonics map:** `shared/phonics.ts` → `PHONICS_MAP` and `getPhonicsForWord()`
- **Legacy static lists:** `client/src/lib/words.ts` (used only if not hitting API; DB is canonical at runtime)

## Adding a new word

### Option A — Grown-ups UI (recommended for custom words)

1. Open **⚙️ Grown-ups** → **Words** tab (`/parent-settings?tab=words`)
2. Confirm the grown-ups gate
3. Log in with admin credentials (if prompted)
4. Add word, image URL, and level
5. Save — the word appears immediately in `/reading`

### Option B — Seed data (for built-in vocabulary)

1. Add the word to the appropriate level array in `shared/reading-words.ts`
2. Add phonics chunks to `PHONICS_MAP` in `shared/phonics.ts` if not already present
3. Restart the server (or rely on incremental migration in `initializeData()` for existing DBs)

Example seed entry:

```typescript
{ word: "FROG", imageUrl: "https://upload.wikimedia.org/...", level: 2 }
```

Phonics are applied automatically:

```typescript
const phonics = getPhonicsForWord(wordData.word);
await db.insert(readingWords).values({ ...wordData, phonics });
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reading/words?level=1` | Words for a level |
| GET | `/api/reading/words` | All words |
| GET | `/api/reading/words/all` | All words (alias) |
| POST | `/api/reading/words` | Add word `{ word, imageUrl, level }` |
| PUT | `/api/reading/words/:id` | Update word |
| DELETE | `/api/reading/words/:id` | Delete word |

## Progress tracking

- Activity type: `reading`
- Progress is stored per user, per level, in `user_progress`
- Stars are awarded as children complete words in a level

## UI features

- **Letter box mode** — tap individual letters
- **Phonics box mode** — tap phonics chunks (e.g. `SH`, `EE`, `P`)
- **AI reading coach** — optional guided pronunciation (toggle in voice settings)
- **Image** — visual cue for each word (Wikimedia or custom URL)
- **🦉 Help button** — spoken instructions for setup and play screens

## Image guidelines

- Prefer stable, kid-friendly URLs (Wikimedia Commons works well)
- Unsplash URLs get auto-resized query params in the reading page
- Use square or landscape images ~400×300 for best display
