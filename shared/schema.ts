import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  totalStars: integer("total_stars").notNull().default(0),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(), // 'reading' or 'math'
  level: integer("level").notNull(),
  completedItems: jsonb("completed_items").notNull().default([]),
  totalItems: integer("total_items").notNull(),
  stars: integer("stars").notNull().default(0),
});

export const readingWords = pgTable("reading_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  level: integer("level").notNull(),
  imageUrl: text("image_url"),
});

export const mathActivities = pgTable("math_activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'counting' or 'addition'
  level: integer("level").notNull(),
  question: text("question").notNull(),
  answer: integer("answer").notNull(),
  objects: jsonb("objects").notNull(), // array of objects to count
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  earnedAt: text("earned_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, totalStars: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertReadingWordSchema = createInsertSchema(readingWords).omit({ id: true });
export const insertMathActivitySchema = createInsertSchema(mathActivities).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });

export type User = typeof users.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type ReadingWord = typeof readingWords.$inferSelect;
export type MathActivity = typeof mathActivities.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertReadingWord = z.infer<typeof insertReadingWordSchema>;
export type InsertMathActivity = z.infer<typeof insertMathActivitySchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
