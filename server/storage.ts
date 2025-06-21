import {
  users, userProgress, readingWords, mathActivities, achievements,
  type User, type UserProgress, type ReadingWord, type MathActivity, type Achievement,
  type InsertUser, type InsertUserProgress, type InsertReadingWord, type InsertMathActivity, type InsertAchievement
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  updateUserStars(id: number, stars: number): Promise<User>;
  updateUserLastActive(id: number): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getProgressByType(userId: number, activityType: string): Promise<UserProgress[]>;
  updateProgress(userId: number, activityType: string, level: number, completedItems: any[], stars: number): Promise<UserProgress>;
  clearUserProgress(userId: number): Promise<void>;
  clearUserProgressByType(userId: number, activityType: string): Promise<void>;

  // Reading methods
  getReadingWords(level: number): Promise<ReadingWord[]>;
  getAllReadingWords(): Promise<ReadingWord[]>;
  addReadingWord(word: { word: string; imageUrl: string; level: number }): Promise<ReadingWord>;
  updateReadingWord(id: number, word: { word: string; imageUrl: string; level: number }): Promise<ReadingWord>;
  deleteReadingWord(id: number): Promise<void>;

  // Math methods
  getMathActivities(type: string, level: number): Promise<MathActivity[]>;
  getAllMathActivities(): Promise<MathActivity[]>;

  // Achievement methods
  getUserAchievements(userId: number): Promise<Achievement[]>;
  addAchievement(achievement: InsertAchievement): Promise<Achievement>;
  clearUserAchievements(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async initializeData() {
    // Initialize default reading words if they don't exist
    const existingWords = await this.getAllReadingWords();
    if (existingWords.length === 0) {
      await this.seedReadingWords();
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.lastActive));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      totalStars: 0
    }).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserStars(id: number, stars: number): Promise<User> {
    const [user] = await db.update(users)
      .set({ totalStars: stars })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserLastActive(id: number): Promise<User> {
    const [user] = await db.update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    // Delete user progress first
    await db.delete(userProgress).where(eq(userProgress.userId, id));
    // Delete achievements
    await db.delete(achievements).where(eq(achievements.userId, id));
    // Delete user
    await db.delete(users).where(eq(users.id, id));
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getProgressByType(userId: number, activityType: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress)
      .where(eq(userProgress.userId, userId))
      .where(eq(userProgress.activityType, activityType));
  }

  async updateProgress(userId: number, activityType: string, level: number, completedItems: any[], stars: number): Promise<UserProgress> {
    // Try to find existing progress
    const [existingProgress] = await db.select().from(userProgress)
      .where(eq(userProgress.userId, userId))
      .where(eq(userProgress.activityType, activityType))
      .where(eq(userProgress.level, level));

    if (existingProgress) {
      const [updated] = await db.update(userProgress)
        .set({ completedItems, stars })
        .where(eq(userProgress.id, existingProgress.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(userProgress)
        .values({ userId, activityType, level, completedItems, stars, totalItems: 10 })
        .returning();
      return newProgress;
    }
  }

  async clearUserProgress(userId: number): Promise<void> {
    await db.delete(userProgress).where(eq(userProgress.userId, userId));
  }

  async clearUserProgressByType(userId: number, activityType: string): Promise<void> {
    await db.delete(userProgress)
      .where(eq(userProgress.userId, userId))
      .where(eq(userProgress.activityType, activityType));
  }

  async getReadingWords(level: number): Promise<ReadingWord[]> {
    return await db.select().from(readingWords).where(eq(readingWords.level, level));
  }

  async getAllReadingWords(): Promise<ReadingWord[]> {
    return await db.select().from(readingWords);
  }

  async addReadingWord(wordData: { word: string; imageUrl: string; level: number }): Promise<ReadingWord> {
    const [newWord] = await db.insert(readingWords)
      .values(wordData)
      .returning();
    return newWord;
  }

  async updateReadingWord(id: number, wordData: { word: string; imageUrl: string; level: number }): Promise<ReadingWord> {
    const [updatedWord] = await db.update(readingWords)
      .set(wordData)
      .where(eq(readingWords.id, id))
      .returning();
    if (!updatedWord) throw new Error("Word not found");
    return updatedWord;
  }

  async deleteReadingWord(id: number): Promise<void> {
    await db.delete(readingWords).where(eq(readingWords.id, id));
  }

  async getMathActivities(type: string, level: number): Promise<MathActivity[]> {
    return await db.select().from(mathActivities)
      .where(eq(mathActivities.type, type))
      .where(eq(mathActivities.level, level));
  }

  async getAllMathActivities(): Promise<MathActivity[]> {
    return await db.select().from(mathActivities);
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.userId, userId));
  }

  async addAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  async clearUserAchievements(userId: number): Promise<void> {
    await db.delete(achievements).where(eq(achievements.userId, userId));
  }

  async seedReadingWords() {
    const wordsByLevel = [
      // Level 1: Simple 3-letter CVC words
      [
        { word: "CAT", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", level: 1 },
        { word: "DOG", imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d", level: 1 },
        { word: "SUN", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", level: 1 },
        { word: "BAT", imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96", level: 1 },
        { word: "HAT", imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0", level: 1 },
        { word: "CAN", imageUrl: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c", level: 1 },
        { word: "RUN", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", level: 1 },
        { word: "FUN", imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9", level: 1 },
        { word: "BUS", imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957", level: 1 },
        { word: "CUP", imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f", level: 1 },
        { word: "PEN", imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07", level: 1 },
        { word: "BED", imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", level: 1 }
      ],
      // Level 2: 4-letter words
      [
        { word: "FISH", imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f", level: 2 },
        { word: "BIRD", imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3", level: 2 },
        { word: "TREE", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", level: 2 },
        { word: "BOOK", imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570", level: 2 },
        { word: "BALL", imageUrl: "https://images.unsplash.com/photo-1594736797933-d0bd1aebf67c", level: 2 },
        { word: "PLAY", imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9", level: 2 },
        { word: "JUMP", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", level: 2 },
        { word: "HELP", imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a", level: 2 },
        { word: "CAKE", imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13", level: 2 },
        { word: "DUCK", imageUrl: "https://images.unsplash.com/photo-1551196007-2b6c0afbc0dd", level: 2 },
        { word: "FROG", imageUrl: "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80", level: 2 },
        { word: "MILK", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b", level: 2 },
        { word: "RAIN", imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0", level: 2 },
        { word: "STAR", imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a", level: 2 },
        { word: "MOON", imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b", level: 2 }
      ]
    ];

    for (const levelWords of wordsByLevel) {
      for (const wordData of levelWords) {
        await db.insert(readingWords).values(wordData);
      }
    }
  }
}

export const storage = new DatabaseStorage();