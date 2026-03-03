# Learning Launch (KidLearn) 🚀

A modern, highly engaging early-learning platform designed specifically for young children (ages 4-5) to practice fundamental Reading and Math skills.

## ✨ Features

- **Reading Activities:** Word and letter recognition with satisfying visual feedback and verbal pronunciation.
- **Math Activities:** Counting and basic addition challenges featuring playful visual objects.
- **Kid-Friendly UI/UX:** Features a bright, vibrant color palette, chunky "pressable" 3D-style buttons, and large readable typography (`Nunito`, `Balsamiq Sans`, `Fredoka`).
- **Interactive Animations:** Powered by **Framer Motion**, the app includes bouncy staggered entrances, satisfying hover scales, and fun completion state confetti/animations.
- **Parent Dashboard:** A comprehensive view of the child's learning progress, including weekly activity charts, stars earned, and recent achievements.

## 🎙️ High-Quality Voice Support (Kokoro-FastAPI)

The application supports seamless integration with [Kokoro-FastAPI](https://github.com/remsky/Kokoro-FastAPI) for incredibly natural, high-quality text-to-speech. This is crucial for early readers to hear the correct pronunciation of words and letters.

**How to set up Kokoro:**
1. Run your local Kokoro-FastAPI server (e.g., via Docker on port 8880).
2. Open the App and navigate to the **Parent Dashboard** (`/parent-dashboard`).
3. Scroll down to the **Voice Settings** section.
4. Check **Enable Kokoro High-Quality Voices**.
5. Set your API URL (default: `http://localhost:8880/v1/audio/speech`) and Voice ID (e.g., `af_heart` or `af_bella`).
6. Click **Save Settings** and use the **Test Voice Setup** button to confirm it works!

*Note: The app includes a resilient fallback system. If Kokoro is disabled or unreachable, it will automatically switch back to the best available browser Web Speech API voice.*

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
1. Clone the repository and install the dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The app will be available at `http://localhost:5000` (or the port specified in your terminal).

### 🐳 Docker & Portainer Deployment

To easily deploy this application to a home lab server or VPS:

1. **Docker Compose:** Use the provided `docker-compose.yml` for a standard Docker Compose deployment.
2. **Portainer:** For GUI-based management, we have provided a ready-to-use `portainer-stack.yml` file. 
   - Open Portainer -> Stacks -> Add stack
   - Copy the contents of `portainer-stack.yml` into the Web editor
   - Review/update the environment variable values if desired
   - Deploy!
   
*For detailed Docker instructions, see [README-Docker.md](./README-Docker.md).*

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Wouter (Routing)
- **State Management & Data Fetching:** TanStack React Query
- **UI Components:** Radix UI primitives with custom styling
- **Backend:** Node.js, Express (for API endpoints)
- **Database Architecture:** Currently abstracted via `@shared/schema` (supporting MemStorage or Postgres)
