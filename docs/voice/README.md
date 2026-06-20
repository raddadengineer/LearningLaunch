# Voice & Text-to-Speech

LearningLaunch uses voice feedback throughout reading, math, and navigation. Kokoro neural TTS routes through a same-origin server proxy; browser speech is the fallback. Every activity page also has a **Help** button that speaks instructions from `client/src/lib/page-help.ts`.

## Backends

| Backend | When used | Quality |
|---------|-----------|---------|
| **Kokoro via `/api/speech`** | Enabled in grown-ups settings | High-quality neural TTS |
| **Web Speech API** | Kokoro disabled or proxy unreachable | Browser built-in voices |

Implementation: `client/src/lib/speech.ts`

## Kokoro setup

1. Run [Kokoro-FastAPI](https://github.com/remsky/Kokoro-FastAPI) locally or on your network (default port **8880**)
2. Set server env `KOKORO_URL` (see [deployment](../deployment/README.md))
3. In the app: **Grown-ups** → **Voice** tab (`/parent-settings`)
4. Enable **Kokoro High-Quality Voices**
5. Choose a voice ID (e.g. `af_heart`, `af_bella`)
6. **Save Settings** → **Test Voice Setup**

The browser calls `POST /api/speech` on the app server — not Kokoro directly — avoiding CORS and Docker networking issues.

### Per-child preferences (database)

Voice settings sync per child profile via `users.preferences` jsonb:

| Field | Default | Purpose |
|-------|---------|---------|
| `kokoroEnabled` | `false` | Use Kokoro proxy for whole-word TTS |
| `aiReadingCoachEnabled` | `true` | Guided phonics coaching |
| `phonicsPace` | `"slow"` | Pause between phoneme sounds |
| `kokoroVoiceId` | `"af_heart"` | Voice sent to proxy |

Hydrated to localStorage on profile switch (`client/src/lib/voice-preferences.ts`).

## Speech functions

| Function | Use |
|----------|-----|
| `speak(text, options)` | General TTS — navigation, prompts, math questions |
| `speakWord(word)` | Whole word pronunciation |
| `speakLetters(word)` | Letter-by-letter with phoneme clips |
| `speakPhonics(chunks)` | Phonics chunk sequence with blend pass |
| `speakPhonemeSound(sound)` | Single clip by sound key (`ah`, `ay`, …) |
| `speakVowelStretch(short, long)` | Short then long vowel clip sequence |
| `playChunkSound(chunk)` | Single phoneme clip (or TTS fallback) |
| `testPhonemeClips()` | Parent test: buh → oo → kuh → book |

## Pre-recorded phoneme clips

Isolated letter/chunk sounds use static audio in `client/public/audio/phonemes/` (`.mp3` preferred, `.wav` fallback). Mapped in `shared/phoneme-sounds.ts`.

- **74 sounds** — core (Levels 1–3) + extended vowel teams, blends, endings (Levels 4–5)
- **Fallback** — unmapped chunks use TTS with elongated continuants
- **Whole words & coach prompts** — Kokoro proxy or Web Speech API

Regenerate clips:

```bash
npm run generate:phonemes              # skip existing
npm run generate:phonemes -- --force    # overwrite all
```

Or in **Grown-ups → Voice** → **Generate phoneme clips** (calls `POST /api/phonemes/generate`).

Kokoro produces MP3 (best quality). macOS `say` + `afconvert` produces WAV as fallback.

## AI Reading Coach

- Pre-recorded phoneme clips per chunk (TTS fallback)
- Visual highlight on active chunk box during playback
- Blend pass with shrinking gaps, then whole word
- Short coach cues ("Sound it out!", "Now blend!")

## Phonics pace

| Setting | Pause between sounds | Blend gaps |
|---------|---------------------|------------|
| Slow (default) | 700 ms | 500 → 120 ms |
| Normal | 450 ms | 350 → 80 ms |

## Fallback behavior

1. Kokoro enabled → `POST /api/speech` → upstream Kokoro
2. On error → `window.speechSynthesis`
3. Phoneme clips → try `.mp3` then `.wav`; then TTS
4. New speech cancels previous audio

## Voice settings component

`client/src/components/voice-settings-form.tsx` — used in `/parent-settings` Voice tab. Saves via `PATCH /api/user/:id/preferences`.
