import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema, userPreferencesSchema } from "@shared/schema";
import { countPhonemeClips, generatePhonemeClips } from "./phoneme-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Update last active time
      await storage.updateUserLastActive(userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { name, age } = req.body;
      if (!name || !age) {
        return res.status(400).json({ error: "Name and age are required" });
      }
      const user = await storage.createUser({ name, age });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      const user = await storage.updateUser(userId, userData);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.patch("/api/user/:id/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const parsed = userPreferencesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid preferences", errors: parsed.error.flatten() });
      }
      const user = await storage.updateUserPreferences(userId, parsed.data);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  app.post("/api/user/:id/activate", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.updateUserLastActive(userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to activate user" });
    }
  });

  app.patch("/api/user/:id/stars", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { stars } = req.body;
      const user = await storage.updateUserStars(userId, stars);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user stars" });
    }
  });

  // Progress routes
  app.get("/api/user/:id/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user progress" });
    }
  });

  app.get("/api/user/:id/progress/:type", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const activityType = req.params.type;
      const progress = await storage.getProgressByType(userId, activityType);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress by type" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const { userId, activityType, level, completedItems, stars, totalItems } = req.body;
      const progress = await storage.updateProgress(userId, activityType, level, completedItems, stars, totalItems);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.delete("/api/user/:id/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.clearUserProgress(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear progress" });
    }
  });

  app.delete("/api/user/:id/progress/:type", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const activityType = req.params.type;
      await storage.clearUserProgressByType(userId, activityType);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear progress by type" });
    }
  });

  // Reading routes
  app.get("/api/reading/words", async (req, res) => {
    try {
      const level = req.query.level ? parseInt(req.query.level as string) : undefined;
      const words = level ? await storage.getReadingWords(level) : await storage.getAllReadingWords();
      res.json(words);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reading words" });
    }
  });

  app.get("/api/reading/words/all", async (req, res) => {
    try {
      const words = await storage.getAllReadingWords();
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all reading words" });
    }
  });

  app.post("/api/reading/words", async (req, res) => {
    try {
      const { word, imageUrl, level } = req.body;
      if (!word || !imageUrl || !level) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const newWord = await storage.addReadingWord({ word: word.toUpperCase(), imageUrl, level });
      res.json(newWord);
    } catch (error) {
      res.status(500).json({ error: "Failed to add reading word" });
    }
  });

  app.put("/api/reading/words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { word, imageUrl, level } = req.body;
      if (!word || !imageUrl || !level) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const updatedWord = await storage.updateReadingWord(id, { word: word.toUpperCase(), imageUrl, level });
      res.json(updatedWord);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reading word" });
    }
  });

  app.delete("/api/reading/words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReadingWord(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete reading word" });
    }
  });

  // Book routes
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to get books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBookWithPages(id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to get book" });
    }
  });

  // Sight word routes
  app.get("/api/sight-words", async (req, res) => {
    try {
      const level = req.query.level ? parseInt(req.query.level as string) : undefined;
      const words = level ? await storage.getSightWords(level) : await storage.getAllSightWords();
      res.json(words);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sight words" });
    }
  });

  // Math routes
  app.get("/api/math/activities", async (req, res) => {
    try {
      const type = req.query.type as string;
      const level = req.query.level ? parseInt(req.query.level as string) : undefined;
      
      if (type && level) {
        const activities = await storage.getMathActivities(type, level);
        res.json(activities);
      } else {
        const activities = await storage.getAllMathActivities();
        res.json(activities);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get math activities" });
    }
  });

  // Achievement routes
  app.get("/api/user/:id/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user achievements" });
    }
  });

  // Health check endpoint for Docker
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime() 
    });
  });

  const kokoroUpstreamUrl = () =>
    process.env.KOKORO_URL ?? "http://192.168.10.7:8880/v1/audio/speech";

  app.get("/api/speech/health", async (_req, res) => {
    try {
      const upstream = await fetch(kokoroUpstreamUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "kokoro",
          input: "test",
          voice: process.env.KOKORO_VOICE ?? "af_heart",
          response_format: "mp3",
          speed: 1.0,
        }),
        signal: AbortSignal.timeout(5000),
      });
      res.status(upstream.ok ? 200 : 502).json({
        available: upstream.ok,
        upstream: kokoroUpstreamUrl(),
      });
    } catch {
      res.status(502).json({ available: false, upstream: kokoroUpstreamUrl() });
    }
  });

  app.post("/api/speech", async (req, res) => {
    try {
      const { input, voice, speed, response_format } = req.body ?? {};
      if (!input || typeof input !== "string") {
        return res.status(400).json({ message: "input is required" });
      }
      if (input.length > 500) {
        return res.status(400).json({ message: "input exceeds 500 characters" });
      }

      const upstream = await fetch(kokoroUpstreamUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "kokoro",
          input,
          voice: voice ?? process.env.KOKORO_VOICE ?? "af_heart",
          response_format: response_format ?? "mp3",
          speed: speed ?? 1.0,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!upstream.ok) {
        const detail = await upstream.text();
        return res.status(upstream.status).json({ message: "Kokoro TTS failed", detail });
      }

      const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";
      const audio = Buffer.from(await upstream.arrayBuffer());
      res.status(200).set("Content-Type", contentType).send(audio);
    } catch {
      res.status(502).json({ message: "Speech service unavailable" });
    }
  });

  app.get("/api/phonemes/status", async (_req, res) => {
    try {
      const clips = countPhonemeClips();
      let kokoroAvailable = false;
      try {
        const health = await fetch(kokoroUpstreamUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "kokoro",
            input: "test",
            voice: process.env.KOKORO_VOICE ?? "af_heart",
            response_format: "mp3",
            speed: 1.0,
          }),
          signal: AbortSignal.timeout(5000),
        });
        kokoroAvailable = health.ok;
      } catch {
        kokoroAvailable = false;
      }
      res.json({
        clips,
        expected: 74,
        kokoroAvailable,
        upstream: kokoroUpstreamUrl(),
      });
    } catch {
      res.status(500).json({ message: "Failed to read phoneme status" });
    }
  });

  app.post("/api/phonemes/generate", async (req, res) => {
    try {
      const { force, voice } = req.body ?? {};
      const result = await generatePhonemeClips({
        force: force === true,
        kokoroUrl: kokoroUpstreamUrl(),
        kokoroVoice: typeof voice === "string" ? voice : process.env.KOKORO_VOICE ?? "af_heart",
      });
      if (result.failed.length > 0 && result.generated.length === 0) {
        return res.status(502).json({
          message: "Phoneme generation failed",
          ...result,
        });
      }
      res.json(result);
    } catch (error) {
      res.status(502).json({
        message: error instanceof Error ? error.message : "Phoneme generation failed",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
