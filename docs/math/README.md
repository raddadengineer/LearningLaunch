# Math Activities

The **Math** activity (`/math`) teaches counting and basic addition with emoji visual objects and voice feedback.

## Activity types

| Type | Levels | Description |
|------|--------|-------------|
| `counting` | 1–2 | Count displayed emoji objects and pick the number |
| `addition` | 3–6 | Simple sums with visual number chips |

## Levels by type

### Counting

| Level | Example question | Answer range |
|-------|------------------|--------------|
| 1 | How many apples do you see? 🍎🍎🍎 | 2–6 |
| 2 | How many ducks do you see? 🦆×7 | 3–9 |

### Addition

| Level | Example | Sums |
|-------|---------|------|
| 3 | 2 + 1 = ? | sums ≤ 4 |
| 4 | 3 + 2 = ? | sums ≤ 7 |
| 5 | 4 + 4 = ? | sums ≤ 9 |
| 6 | 6 + 5 = ? | sums ≤ 11 |

## Seed data

All math activities are defined in `server/storage.ts` → `seedMathActivities()`.

Example entry:

```typescript
{
  type: "counting",
  level: 1,
  question: "How many apples do you see?",
  answer: 3,
  objects: ["🍎", "🍎", "🍎"]
}
```

Addition entries use numeric strings in `objects`:

```typescript
{
  type: "addition",
  level: 3,
  question: "2 + 1 = ?",
  answer: 3,
  objects: ["2", "+", "1"]
}
```

## Database schema

```typescript
mathActivities {
  id: serial
  type: text       // "counting" | "addition"
  level: integer
  question: text
  answer: integer
  objects: jsonb   // string[] — emojis or number tokens
}
```

## Adding new activities

1. Append entries to the `activities` array in `seedMathActivities()`
2. For existing databases, insert directly via SQL or add a migration check in `initializeData()` (math only seeds when the table is empty)

There is no admin UI for math yet — edit seed data or use the API/database directly.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/math/activities?type=counting&level=1` | Filtered activities |
| GET | `/api/math/activities` | All activities |

## Progress tracking

- Activity type: `math`
- Separate progress rows per level
- Countdown timer and star rewards on completion
- Visible on parent dashboard under math progress

## UI behavior

- Children pick **Counting** or **Addition**, then a level
- Multiple-choice answers with animated feedback
- Questions are spoken aloud via TTS
- Wrong answers encourage retry; correct answers advance with celebration animation
- 🦉 **Help button** — spoken instructions on setup and play screens
