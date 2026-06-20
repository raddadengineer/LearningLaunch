# Parents, Progress & Admin

Parent-facing features are gated behind a **Grown-ups only** confirmation dialog.

## Grown-ups settings

Route: `/parent-settings` (bottom nav ⚙️ **Grown-ups**)

| Tab | URL | Features |
|-----|-----|----------|
| Voice | `/parent-settings` | Kokoro TTS, AI reading coach, phonics pace, test voice |
| Progress | `/parent-settings?tab=progress` | Per-child activity summary |
| Words | `/parent-settings?tab=words` | Admin word CRUD (add/edit/delete) |

Voice settings are **saved per child profile** in the database and reload when you switch users. Kokoro routes through the app server at `/api/speech` (configure `KOKORO_URL` on the server — see [deployment](../deployment/README.md)).

Session gate: `sessionStorage.grownUpsConfirmed` — must confirm once per browser session.

Legacy `/admin` redirects to `/parent-settings?tab=words`.

## Parent dashboard

Route: `/parent-dashboard`

- Weekly activity charts (Recharts)
- Stars earned per activity type
- Recent achievements
- Links back to kid activities

Component: `client/src/components/parent-progress-summary.tsx` (also embedded in settings Progress tab)

## User management

Route: `/users`

- Create, edit, delete child profiles
- Each profile has name, age, total stars, and voice `preferences`
- `localStorage.currentUserId` tracks the active child

```typescript
users {
  id, name, age, totalStars,
  preferences: jsonb  // kokoroEnabled, aiReadingCoachEnabled, phonicsPace, kokoroVoiceId
}
```

## Progress model

```typescript
userProgress {
  userId, activityType, level,
  completedItems: jsonb,  // array of completed item IDs/indices
  totalItems, stars, updatedAt
}
```

Activity types:

| Type | Activity |
|------|----------|
| `reading` | Word practice levels 1–6 |
| `sight-words` | Sight word levels 1–3 |
| `math` | Counting/addition levels |
| `books` | Story completion (where tracked) |

### Clearing progress

API endpoints (useful for testing or reset):

- `DELETE /api/user/:id/progress` — clear all progress for a child
- `DELETE /api/user/:id/progress/:type` — clear one activity type

## Achievements

Stored in `achievements` table with title, description, icon, and earned date.

API: `GET /api/user/:id/achievements`

## Admin word management

Component: `client/src/components/admin-word-management.tsx`

- Lists all reading words from `/api/reading/words/all`
- Add / edit / delete via REST API
- Image search helper for finding URLs
- Changes persist in PostgreSQL immediately

## Star system

- Stars accumulate on `users.totalStars`
- Awarded per level completion and activity milestones
- Updated via `PATCH /api/user/:id/stars` and progress POST

## Kid vs parent navigation

Bottom nav (kids): Home, Stories, Words, Math, Grown-ups

Additional Home tiles (not in bottom nav):

| Tile | Route |
|------|-------|
| Sight Words | `/sight-words` |
| A Sounds | `/vowel-contrast/a` |
| I Sounds | `/vowel-contrast/i` |

Parent dashboard is linked from Home via a subtle parent link component.

## Spoken help (🦉)

Every kid activity page includes an owl **Help** button that reads aloud context-specific instructions via TTS. Copy lives in `client/src/lib/page-help.ts`; the button is `KidHelpButton` in `kid-ui.tsx`. Help text adapts to the current screen (setup vs play, comprehension quiz, vowel tab, etc.).
