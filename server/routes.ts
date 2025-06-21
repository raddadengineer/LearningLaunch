import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
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
      const { userId, activityType, level, completedItems, stars } = req.body;
      const progress = await storage.updateProgress(userId, activityType, level, completedItems, stars);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
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

  const httpServer = createServer(app);
  return httpServer;
}
