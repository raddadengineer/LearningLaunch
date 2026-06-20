import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export type UserPreferences = {
  kokoroEnabled?: boolean;
  aiReadingCoachEnabled?: boolean;
  phonicsPace?: "slow" | "normal";
  kokoroVoiceId?: string;
};

export const userPreferencesSchema = z.object({
  kokoroEnabled: z.boolean().optional(),
  aiReadingCoachEnabled: z.boolean().optional(),
  phonicsPace: z.enum(["slow", "normal"]).optional(),
  kokoroVoiceId: z.string().max(64).optional(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  totalStars: integer("total_stars").notNull().default(0),
  preferences: jsonb("preferences").$type<UserPreferences>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(), // 'reading' or 'math'
  level: integer("level").notNull(),
  completedItems: jsonb("completed_items").notNull().default([]),
  totalItems: integer("total_items").notNull(),
  stars: integer("stars").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const readingWords = pgTable("reading_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  level: integer("level").notNull(),
  imageUrl: text("image_url"),
  phonics: jsonb("phonics").$type<string[]>().default([]),
});

export const readingBooks = pgTable("reading_books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  level: integer("level").notNull(),
  coverImageUrl: text("cover_image_url"),
  description: text("description"),
  phonicsFocus: text("phonics_focus"),
  vowelHighlight: text("vowel_highlight"),
  sightWordsList: jsonb("sight_words_list").$type<string[]>().default([]),
  comprehensionQuestions: jsonb("comprehension_questions").$type<{ question: string; answer: string }[]>().default([]),
  readingActivity: jsonb("reading_activity").$type<{
    title: string;
    description: string;
    words: string[];
    parentTip?: string;
    linkPath?: string;
    linkLabel?: string;
  }>(),
});

export type BookPageTeachingMeta = {
  parentNote?: string;
  phonicsHints?: string[];
  focusWords?: string[];
  readTogether?: boolean;
  actionHint?: string;
};

export const readingBookPages = pgTable("reading_book_pages", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  pageNumber: integer("page_number").notNull(),
  text: text("text").notNull(),
  imageUrl: text("image_url"),
  teachingMeta: jsonb("teaching_meta").$type<BookPageTeachingMeta>(),
});

export const sightWords = pgTable("sight_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  level: integer("level").notNull(),
  sentence: text("sentence").notNull(),
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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, totalStars: true, preferences: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertReadingWordSchema = createInsertSchema(readingWords).omit({ id: true });
export const insertReadingBookSchema = createInsertSchema(readingBooks).omit({ id: true });
export const insertReadingBookPageSchema = createInsertSchema(readingBookPages).omit({ id: true });
export const insertSightWordSchema = createInsertSchema(sightWords).omit({ id: true });
export const insertMathActivitySchema = createInsertSchema(mathActivities).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });

export type User = typeof users.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type ReadingWord = typeof readingWords.$inferSelect;
export type ReadingBook = typeof readingBooks.$inferSelect;
export type ReadingBookPage = typeof readingBookPages.$inferSelect;
export type SightWord = typeof sightWords.$inferSelect;
export type MathActivity = typeof mathActivities.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertReadingWord = z.infer<typeof insertReadingWordSchema>;
export type InsertReadingBook = z.infer<typeof insertReadingBookSchema>;
export type InsertReadingBookPage = z.infer<typeof insertReadingBookPageSchema>;
export type InsertSightWord = z.infer<typeof insertSightWordSchema>;
export type InsertMathActivity = z.infer<typeof insertMathActivitySchema>;

export type ReadingBookWithPages = ReadingBook & { pages: ReadingBookPage[] };
export type ReadingBookSummary = ReadingBook & { pageCount: number };
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
