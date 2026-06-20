# API Reference

Base URL: same origin as the app (e.g. `http://localhost:5000` in dev, `http://localhost:3456` in Docker).

All responses are JSON unless noted.

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | `{ status, timestamp, uptime }` |

## Users

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/users` | — | List all child profiles |
| POST | `/api/users` | `{ name, age }` | Create profile |
| GET | `/api/user/:id` | — | Get profile (updates last active) |
| PUT | `/api/users/:id` | `{ name?, age? }` | Update profile |
| DELETE | `/api/users/:id` | — | Delete profile |
| POST | `/api/user/:id/activate` | — | Touch last active |
| PATCH | `/api/user/:id/stars` | `{ stars }` | Set total stars |
| PATCH | `/api/user/:id/preferences` | `{ kokoroEnabled?, aiReadingCoachEnabled?, phonicsPace?, kokoroVoiceId? }` | Merge voice preferences |

## Speech (Kokoro proxy)

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/speech` | `{ input, voice?, speed?, response_format? }` | `audio/mpeg` binary |
| GET | `/api/speech/health` | — | `{ available, upstream }` |

Upstream URL from server env `KOKORO_URL` (default `http://localhost:8880/v1/audio/speech`).

## Phoneme clip generation

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/phonemes/status` | — | `{ clips, expected, kokoroAvailable, upstream }` |
| POST | `/api/phonemes/generate` | `{ force?, voice? }` | `{ backend, generated, skipped, failed, outputDir }` |

Also available in **Grown-ups → Voice → Generate phoneme clips**, or via `npm run generate:phonemes`.

## Progress

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/user/:id/progress` | — | All progress rows |
| GET | `/api/user/:id/progress/:type` | — | Progress for one type (`reading`, `math`, `sight-words`, …) |
| POST | `/api/progress` | `{ userId, activityType, level, completedItems, stars, totalItems? }` | Upsert progress |
| DELETE | `/api/user/:id/progress` | — | Clear all progress |
| DELETE | `/api/user/:id/progress/:type` | — | Clear one activity type |

## Reading words

| Method | Path | Body / Query | Description |
|--------|------|--------------|-------------|
| GET | `/api/reading/words` | `?level=1` optional | List words |
| GET | `/api/reading/words/all` | — | All words |
| POST | `/api/reading/words` | `{ word, imageUrl, level }` | Add word |
| PUT | `/api/reading/words/:id` | `{ word, imageUrl, level }` | Update word |
| DELETE | `/api/reading/words/:id` | — | Delete word |

## Books

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/books` | List books with page counts |
| GET | `/api/books/:id` | Full book + pages |

## Sight words

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/api/sight-words` | `?level=1` optional | List sight words |

## Math

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/api/math/activities` | `?type=counting&level=1` | Filtered activities |
| GET | `/api/math/activities` | — | All activities |

## Achievements

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/:id/achievements` | List achievements for a child |

## Client usage

The frontend uses TanStack Query with query keys matching paths, e.g.:

```typescript
useQuery({ queryKey: ["/api/reading/words", level], ... })
useQuery({ queryKey: ["/api/user", currentUserId], ... })
```

Mutations use `apiRequest()` from `client/src/lib/queryClient.ts`.

## Error responses

- `400` — missing required fields
- `404` — user or book not found
- `500` — server error with `{ message }` or `{ error }`
