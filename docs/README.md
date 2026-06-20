# LearningLaunch Documentation

Complete documentation for the LearningLaunch early-learning platform (ages 4–5).

**Repository:** [github.com/raddadengineer/LearningLaunch](https://github.com/raddadengineer/LearningLaunch)

## Quick links

| Topic | Description |
|-------|-------------|
| [Words](./words/README.md) | Phonics word practice — levels, seed data, admin CRUD |
| [Stories](./stories/README.md) | Phonics story books — authoring, seeding, reader features |
| [Sight Words](./sight-words/README.md) | High-frequency word drills by level |
| [Math](./math/README.md) | Counting and addition activities |
| [Phonics](./phonics/README.md) | Phonics maps, vowel contrast, phoneme sounds |
| [Voice & TTS](./voice/README.md) | Kokoro, Web Speech API, AI reading coach |
| [Parents & Admin](./parents/README.md) | Dashboard, grown-ups settings, progress |
| [Architecture](./architecture/README.md) | Project layout, data flow, tech stack |
| [API Reference](./api/README.md) | REST endpoints |
| [Deployment](./deployment/README.md) | Docker, Portainer, production notes |

## App routes

| Route | Who | Purpose |
|-------|-----|---------|
| `/` | Kid | Home — activity picker |
| `/select-user` | All | Choose child profile |
| `/reading` | Kid | Word / phonics practice |
| `/books` | Kid | Story library |
| `/books/:id` | Kid | Interactive book reader |
| `/sight-words` | Kid | Sight word practice |
| `/vowel-contrast` | Kid | Vowel contrast picker (defaults to A) |
| `/vowel-contrast/a` | Kid | Short A vs Long A practice |
| `/vowel-contrast/i` | Kid | Short I vs Long I practice |
| `/math` | Kid | Counting & addition |
| `/parent-dashboard` | Parent | Progress charts & achievements |
| `/parent-settings` | Parent | Voice, progress, word management |
| `/users` | Parent | Manage child profiles |
| `/admin` | Parent | Redirects to `/parent-settings?tab=words` |

## Content locations (source of truth)

```
shared/
├── phonics.ts              # Word → phonics chunk map
├── phoneme-sounds.ts       # Chunk → spoken phoneme hints
├── reading-words.ts        # Canonical word seed data (levels 1–6)
├── phonics/
│   ├── short-long-a.ts     # Vowel contrast content (Short A / Long A)
│   ├── short-long-i.ts     # Vowel contrast content (Short I / Long I)
│   └── vowel-contrast-types.ts
└── stories/
    ├── cat-in-the-hat.ts
    ├── the-big-pig.ts
    ├── the-dog-on-the-log.ts
    ├── the-lad-and-the-bag.ts
    ├── the-hen-in-the-pen.ts
    ├── the-big-fish.ts
    ├── the-cake-at-the-lake.ts
    └── the-kite-in-the-sky.ts

server/storage.ts           # Seeds words, stories, sight words, math into Postgres
client/src/lib/page-help.ts # Spoken help text for kid pages (🦉 help button)
client/src/lib/words.ts     # Legacy static word lists (superseded by API/DB)
client/src/data/words.json  # Legacy JSON export
```

Runtime content is stored in **PostgreSQL** and seeded on first startup. See each topic folder for how to add or edit content.

## Getting started

```bash
git clone https://github.com/raddadengineer/LearningLaunch.git
cd LearningLaunch
npm install
npm run dev
```

Open **http://localhost:5000**. For Docker deployment, see [Deployment](./deployment/README.md) and [README-Docker.md](../README-Docker.md).

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server (Vite + Express) |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run check` | TypeScript check |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run docker:up` | Build & start local Docker stack |
| `npm run docker:hub:up` | Pull published image from Docker Hub |
| `npm run docker:push` | Build & push multi-arch image |
