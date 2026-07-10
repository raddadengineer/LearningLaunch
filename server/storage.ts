import {
  users, userProgress, readingWords, readingBooks, readingBookPages, sightWords, mathActivities, achievements,
  type User, type UserProgress, type ReadingWord, type ReadingBook, type ReadingBookPage, type SightWord,
  type ReadingBookWithPages, type ReadingBookSummary,
  type MathActivity, type Achievement,
  type InsertUser, type InsertUserProgress, type InsertReadingWord, type InsertMathActivity, type InsertAchievement,
  type UserPreferences,
} from "@shared/schema";
import { getPhonicsForWord } from "@shared/phonics";
import {
  ALL_READING_WORD_SEEDS,
  EXPANDED_VOCAB_MARKER,
  READING_SENTENCES_LEVEL_6,
  READING_WORDS_BY_LEVEL,
} from "@shared/reading-words";
import { CAT_IN_THE_HAT_STORY } from "@shared/stories/cat-in-the-hat";
import { THE_BIG_PIG_STORY } from "@shared/stories/the-big-pig";
import { THE_DOG_ON_THE_LOG_STORY } from "@shared/stories/the-dog-on-the-log";
import { THE_LAD_AND_THE_BAG_STORY } from "@shared/stories/the-lad-and-the-bag";
import { THE_HEN_IN_THE_PEN_STORY } from "@shared/stories/the-hen-in-the-pen";
import { THE_BIG_FISH_STORY } from "@shared/stories/the-big-fish";
import { THE_CAKE_AT_THE_LAKE_STORY } from "@shared/stories/the-cake-at-the-lake";
import { THE_KITE_IN_THE_SKY_STORY } from "@shared/stories/the-kite-in-the-sky";
import { db as dbPromise } from "./db-switch";
const db = await dbPromise;
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  updateUserPreferences(id: number, prefs: Partial<UserPreferences>): Promise<User>;
  updateUserStars(id: number, stars: number): Promise<User>;
  updateUserLastActive(id: number): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getProgressByType(userId: number, activityType: string): Promise<UserProgress[]>;
  updateProgress(userId: number, activityType: string, level: number, completedItems: any[], stars: number, totalItems?: number): Promise<UserProgress>;
  clearUserProgress(userId: number): Promise<void>;
  clearUserProgressByType(userId: number, activityType: string): Promise<void>;

  // Reading methods
  getReadingWords(level: number): Promise<ReadingWord[]>;
  getAllReadingWords(): Promise<ReadingWord[]>;
  addReadingWord(word: { word: string; imageUrl: string; level: number }): Promise<ReadingWord>;
  updateReadingWord(id: number, word: { word: string; imageUrl: string; level: number }): Promise<ReadingWord>;
  deleteReadingWord(id: number): Promise<void>;

  // Book methods
  getBooks(): Promise<ReadingBookSummary[]>;
  getBookWithPages(id: number): Promise<ReadingBookWithPages | undefined>;

  // Sight word methods
  getSightWords(level: number): Promise<SightWord[]>;
  getAllSightWords(): Promise<SightWord[]>;

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
      await this.seedLevel6Sentences();
    } else {
      // Check for old abstract vocabulary to trigger an upgrade
      const hasOldVocab = existingWords.some(w => w.word === "FUN" || w.word === "JUMP" || w.word === "FAVORITE");
      if (hasOldVocab) {
        console.log("Upgrading reading vocabulary list to new concrete noun dataset...");
        // Delete the old default words. 
        // We know old defaults included FUN, JUMP, PLAY, etc.
        // Easiest is to clear the table and reseed, but to preserve custom words,
        // we'll just delete the old specific words if needed.
        // For simplicity and to ensure a clean slate for the foundational levels, 
        // we'll remove words that were part of the old defaults by their known names.
        const oldWords = ["CAT", "DOG", "SUN", "BAT", "HAT", "CAN", "RUN", "FUN", "BUS", "CUP", "PEN", "BED",
          "FISH", "BIRD", "TREE", "BOOK", "BALL", "PLAY", "JUMP", "HELP", "CAKE", "DUCK", "FROG", "MILK", "RAIN", "STAR", "MOON",
          "HOUSE", "PLANT", "WATER", "APPLE", "TRAIN", "BEACH", "HORSE", "BREAD", "PIZZA", "MUSIC", "SMILE", "CHAIR",
          "FLOWER", "BRIDGE", "GARDEN", "CASTLE", "RABBIT", "BRANCH", "SPIDER", "SWITCH", "SCHOOL", "SUMMER", "ORANGE", "JUNGLE",
          "ELEPHANT", "DINOSAUR", "BUTTERFLY", "MOUNTAIN", "SANDWICH", "UMBRELLA", "COMPUTER", "AIRPLANE", "BIRTHDAY", "FAVORITE", "HOSPITAL", "UNIVERSE"];

        for (const oldWord of oldWords) {
          const wordsToDelete = existingWords.filter(w => w.word === oldWord);
          for (const w of wordsToDelete) {
            await this.deleteReadingWord(w.id);
          }
        }
        await this.seedReadingWords();
        console.log("Vocabulary upgrade complete.");
      }

      const refreshedWords = await this.getAllReadingWords();
      const hasLevel6 = refreshedWords.some(w => w.level === 6);
      if (!hasLevel6) {
        console.log("Seeding Level 6 simple sentences...");
        await this.seedLevel6Sentences();
      }
    }

    const existingMath = await this.getAllMathActivities();
    if (existingMath.length < 50) {
      await db.delete(mathActivities);
      await this.seedMathActivities();
    }

    await this.backfillPhonics();

    const existingBooks = await db.select().from(readingBooks);
    if (existingBooks.length === 0) {
      await this.seedReadingBooks();
    } else {
      const hasCatInHat = existingBooks.some(b => b.title === CAT_IN_THE_HAT_STORY.title);
      if (!hasCatInHat) {
        console.log("Adding The Cat in the Hat phonics story...");
        await this.seedStoryBook(CAT_IN_THE_HAT_STORY);
      }
      const hasBigPig = existingBooks.some(b => b.title === THE_BIG_PIG_STORY.title);
      if (!hasBigPig) {
        console.log("Adding The Big Pig phonics story...");
        await this.seedStoryBook(THE_BIG_PIG_STORY);
      }
      const hasDogOnLog = existingBooks.some(b => b.title === THE_DOG_ON_THE_LOG_STORY.title);
      if (!hasDogOnLog) {
        console.log("Adding The Dog on the Log phonics story...");
        await this.seedStoryBook(THE_DOG_ON_THE_LOG_STORY);
      }
      const hasLadAndBag = existingBooks.some(b => b.title === THE_LAD_AND_THE_BAG_STORY.title);
      if (!hasLadAndBag) {
        console.log("Adding The Lad and the Bag phonics story...");
        await this.seedStoryBook(THE_LAD_AND_THE_BAG_STORY);
      }
      const hasHenInPen = existingBooks.some(b => b.title === THE_HEN_IN_THE_PEN_STORY.title);
      if (!hasHenInPen) {
        console.log("Adding The Hen in the Pen phonics story...");
        await this.seedStoryBook(THE_HEN_IN_THE_PEN_STORY);
      }
      const hasBigFish = existingBooks.some(b => b.title === THE_BIG_FISH_STORY.title);
      if (!hasBigFish) {
        console.log("Adding The Big Fish phonics story...");
        await this.seedStoryBook(THE_BIG_FISH_STORY);
      }
      const hasCakeAtLake = existingBooks.some(b => b.title === THE_CAKE_AT_THE_LAKE_STORY.title);
      if (!hasCakeAtLake) {
        console.log("Adding The Cake at the Lake phonics story...");
        await this.seedStoryBook(THE_CAKE_AT_THE_LAKE_STORY);
      }
      const hasKiteInSky = existingBooks.some(b => b.title === THE_KITE_IN_THE_SKY_STORY.title);
      if (!hasKiteInSky) {
        console.log("Adding The Kite in the Sky phonics story...");
        await this.seedStoryBook(THE_KITE_IN_THE_SKY_STORY);
      }
    }

    const existingSightWords = await db.select().from(sightWords);
    if (existingSightWords.length === 0) {
      await this.seedSightWords();
    } else {
      const hasWith = existingSightWords.some(w => w.word === "WITH");
      if (!hasWith) {
        await db.insert(sightWords).values({
          word: "WITH",
          level: 2,
          sentence: "The kid sat with the pig.",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pig_farm_Vampula_1.jpg",
        });
      }
      const hasHas = existingSightWords.some(w => w.word === "HAS");
      if (!hasHas) {
        await db.insert(sightWords).values({
          word: "HAS",
          level: 2,
          sentence: "A lad has a bag.",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
        });
      }
      const hasDid = existingSightWords.some(w => w.word === "DID");
      if (!hasDid) {
        await db.insert(sightWords).values({
          word: "DID",
          level: 2,
          sentence: "The fox did hop.",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_%28cropped%29.jpg",
        });
      }
      const hasHad = existingSightWords.some(w => w.word === "HAD");
      if (!hasHad) {
        await db.insert(sightWords).values({
          word: "HAD",
          level: 2,
          sentence: "The lad had a nap in the van.",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
        });
      }
      const hasTen = existingSightWords.some(w => w.word === "TEN");
      if (!hasTen) {
        await db.insert(sightWords).values({
          word: "TEN",
          level: 2,
          sentence: "Ten hens in the pen.",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Chicken_coop_with_chickens.jpg",
        });
      }
    }

    await this.migrateExpandedReadingVocabulary();
  }

  async migrateExpandedReadingVocabulary() {
    const existing = await this.getAllReadingWords();
    if (existing.some(w => w.word === EXPANDED_VOCAB_MARKER)) return;

    console.log("Adding expanded reading vocabulary (add-only migration)...");
    for (const entry of ALL_READING_WORD_SEEDS) {
      if (!existing.some(w => w.word === entry.word)) {
        const phonics = getPhonicsForWord(entry.word);
        await db.insert(readingWords).values({ ...entry, phonics });
      }
    }
    console.log("Expanded reading vocabulary migration complete.");
  }

  async backfillPhonics() {
    const allWords = await this.getAllReadingWords();
    for (const word of allWords) {
      const phonics = word.phonics as string[] | null;
      if (!phonics || phonics.length === 0) {
        const chunks = getPhonicsForWord(word.word);
        if (chunks.length > 0) {
          await db.update(readingWords)
            .set({ phonics: chunks })
            .where(eq(readingWords.id, word.id));
        }
      }
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

  async updateUserPreferences(id: number, prefs: Partial<UserPreferences>): Promise<User> {
    const existing = await this.getUser(id);
    if (!existing) throw new Error("User not found");
    const merged: UserPreferences = {
      ...(existing.preferences ?? {}),
      ...prefs,
    };
    const [user] = await db.update(users)
      .set({ preferences: merged })
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

  async getSessionTime(userId: number): Promise<number> {
    // Calculate session time based on progress activity
    const progress = await this.getUserProgress(userId);
    const totalCompletedItems = progress.reduce((sum, p) => {
      const count = Array.isArray(p.completedItems) ? p.completedItems.length : 0;
      return sum + count;
    }, 0);

    // Estimate 2-3 minutes per completed activity
    return totalCompletedItems * 2.5;
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

  async updateProgress(userId: number, activityType: string, level: number, completedItems: any[], stars: number, totalItems?: number): Promise<UserProgress> {
    // Try to find existing progress
    const [existingProgress] = await db.select().from(userProgress)
      .where(eq(userProgress.userId, userId))
      .where(eq(userProgress.activityType, activityType))
      .where(eq(userProgress.level, level));

    if (existingProgress) {
      const updateData: { completedItems: any[]; stars: number; totalItems?: number } = { completedItems, stars };
      if (totalItems !== undefined) {
        updateData.totalItems = totalItems;
      }
      const [updated] = await db.update(userProgress)
        .set(updateData)
        .where(eq(userProgress.id, existingProgress.id))
        .returning();
      return updated;
    } else {
      const resolvedTotalItems = totalItems ?? (
        activityType === "reading" ? 12 :
        activityType === "books" ? 5 :
        activityType === "sight-words" ? 12 : 5
      );
      const [newProgress] = await db.insert(userProgress)
        .values({ userId, activityType, level, completedItems, stars, totalItems: resolvedTotalItems })
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

  async addReadingWord(wordData: { word: string; imageUrl: string; level: number; phonics?: string[] }): Promise<ReadingWord> {
    const phonics = wordData.phonics ?? getPhonicsForWord(wordData.word);
    const [newWord] = await db.insert(readingWords)
      .values({ ...wordData, phonics })
      .returning();
    return newWord;
  }

  async updateReadingWord(id: number, wordData: { word: string; imageUrl: string; level: number; phonics?: string[] }): Promise<ReadingWord> {
    const phonics = wordData.phonics ?? getPhonicsForWord(wordData.word);
    const [updatedWord] = await db.update(readingWords)
      .set({ ...wordData, phonics })
      .where(eq(readingWords.id, id))
      .returning();
    if (!updatedWord) throw new Error("Word not found");
    return updatedWord;
  }

  async deleteReadingWord(id: number): Promise<void> {
    await db.delete(readingWords).where(eq(readingWords.id, id));
  }

  async getBooks(): Promise<ReadingBookSummary[]> {
    const books = await db.select().from(readingBooks).orderBy(asc(readingBooks.level));
    const summaries: ReadingBookSummary[] = [];
    for (const book of books) {
      const pages = await db.select().from(readingBookPages).where(eq(readingBookPages.bookId, book.id));
      summaries.push({ ...book, pageCount: pages.length });
    }
    return summaries;
  }

  async getBookWithPages(id: number): Promise<ReadingBookWithPages | undefined> {
    const [book] = await db.select().from(readingBooks).where(eq(readingBooks.id, id));
    if (!book) return undefined;
    const pages = await db.select().from(readingBookPages)
      .where(eq(readingBookPages.bookId, id))
      .orderBy(asc(readingBookPages.pageNumber));
    return { ...book, pages };
  }

  async getSightWords(level: number): Promise<SightWord[]> {
    return await db.select().from(sightWords).where(eq(sightWords.level, level));
  }

  async getAllSightWords(): Promise<SightWord[]> {
    return await db.select().from(sightWords).orderBy(asc(sightWords.level));
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
    for (const levelWords of READING_WORDS_BY_LEVEL) {
      for (const wordData of levelWords) {
        const phonics = getPhonicsForWord(wordData.word);
        await db.insert(readingWords).values({ ...wordData, phonics });
      }
    }
  }

  async seedLevel6Sentences() {
    for (const sentence of READING_SENTENCES_LEVEL_6) {
      const phonics = getPhonicsForWord(sentence.word);
      await db.insert(readingWords).values({ ...sentence, phonics });
    }
  }

  async seedReadingBooks() {
    const hatImg = "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chapeaux_en_peau_de_castor.jpg";
    const bookImg = "https://upload.wikimedia.org/wikipedia/commons/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg";
    const dogImg = "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg";

    const booksData = [
      {
        title: CAT_IN_THE_HAT_STORY.title,
        level: CAT_IN_THE_HAT_STORY.level,
        coverImageUrl: CAT_IN_THE_HAT_STORY.coverImageUrl,
        description: CAT_IN_THE_HAT_STORY.description,
        phonicsFocus: CAT_IN_THE_HAT_STORY.phonicsFocus,
        vowelHighlight: CAT_IN_THE_HAT_STORY.vowelHighlight,
        sightWordsList: CAT_IN_THE_HAT_STORY.sightWordsList,
        comprehensionQuestions: CAT_IN_THE_HAT_STORY.comprehensionQuestions,
        pages: CAT_IN_THE_HAT_STORY.pages,
      },
      {
        title: THE_BIG_PIG_STORY.title,
        level: THE_BIG_PIG_STORY.level,
        coverImageUrl: THE_BIG_PIG_STORY.coverImageUrl,
        description: THE_BIG_PIG_STORY.description,
        phonicsFocus: THE_BIG_PIG_STORY.phonicsFocus,
        vowelHighlight: THE_BIG_PIG_STORY.vowelHighlight,
        sightWordsList: THE_BIG_PIG_STORY.sightWordsList,
        comprehensionQuestions: THE_BIG_PIG_STORY.comprehensionQuestions,
        pages: THE_BIG_PIG_STORY.pages,
      },
      {
        title: THE_DOG_ON_THE_LOG_STORY.title,
        level: THE_DOG_ON_THE_LOG_STORY.level,
        coverImageUrl: THE_DOG_ON_THE_LOG_STORY.coverImageUrl,
        description: THE_DOG_ON_THE_LOG_STORY.description,
        phonicsFocus: THE_DOG_ON_THE_LOG_STORY.phonicsFocus,
        vowelHighlight: THE_DOG_ON_THE_LOG_STORY.vowelHighlight,
        sightWordsList: THE_DOG_ON_THE_LOG_STORY.sightWordsList,
        comprehensionQuestions: THE_DOG_ON_THE_LOG_STORY.comprehensionQuestions,
        readingActivity: THE_DOG_ON_THE_LOG_STORY.readingActivity,
        pages: THE_DOG_ON_THE_LOG_STORY.pages,
      },
      {
        title: THE_LAD_AND_THE_BAG_STORY.title,
        level: THE_LAD_AND_THE_BAG_STORY.level,
        coverImageUrl: THE_LAD_AND_THE_BAG_STORY.coverImageUrl,
        description: THE_LAD_AND_THE_BAG_STORY.description,
        phonicsFocus: THE_LAD_AND_THE_BAG_STORY.phonicsFocus,
        vowelHighlight: THE_LAD_AND_THE_BAG_STORY.vowelHighlight,
        sightWordsList: THE_LAD_AND_THE_BAG_STORY.sightWordsList,
        comprehensionQuestions: THE_LAD_AND_THE_BAG_STORY.comprehensionQuestions,
        readingActivity: THE_LAD_AND_THE_BAG_STORY.readingActivity,
        pages: THE_LAD_AND_THE_BAG_STORY.pages,
      },
      {
        title: THE_HEN_IN_THE_PEN_STORY.title,
        level: THE_HEN_IN_THE_PEN_STORY.level,
        coverImageUrl: THE_HEN_IN_THE_PEN_STORY.coverImageUrl,
        description: THE_HEN_IN_THE_PEN_STORY.description,
        phonicsFocus: THE_HEN_IN_THE_PEN_STORY.phonicsFocus,
        vowelHighlight: THE_HEN_IN_THE_PEN_STORY.vowelHighlight,
        sightWordsList: THE_HEN_IN_THE_PEN_STORY.sightWordsList,
        comprehensionQuestions: THE_HEN_IN_THE_PEN_STORY.comprehensionQuestions,
        readingActivity: THE_HEN_IN_THE_PEN_STORY.readingActivity,
        pages: THE_HEN_IN_THE_PEN_STORY.pages,
      },
      {
        title: THE_BIG_FISH_STORY.title,
        level: THE_BIG_FISH_STORY.level,
        coverImageUrl: THE_BIG_FISH_STORY.coverImageUrl,
        description: THE_BIG_FISH_STORY.description,
        phonicsFocus: THE_BIG_FISH_STORY.phonicsFocus,
        vowelHighlight: THE_BIG_FISH_STORY.vowelHighlight,
        sightWordsList: THE_BIG_FISH_STORY.sightWordsList,
        comprehensionQuestions: THE_BIG_FISH_STORY.comprehensionQuestions,
        readingActivity: THE_BIG_FISH_STORY.readingActivity,
        pages: THE_BIG_FISH_STORY.pages,
      },
      {
        title: THE_CAKE_AT_THE_LAKE_STORY.title,
        level: THE_CAKE_AT_THE_LAKE_STORY.level,
        coverImageUrl: THE_CAKE_AT_THE_LAKE_STORY.coverImageUrl,
        description: THE_CAKE_AT_THE_LAKE_STORY.description,
        phonicsFocus: THE_CAKE_AT_THE_LAKE_STORY.phonicsFocus,
        sightWordsList: THE_CAKE_AT_THE_LAKE_STORY.sightWordsList,
        comprehensionQuestions: THE_CAKE_AT_THE_LAKE_STORY.comprehensionQuestions,
        readingActivity: THE_CAKE_AT_THE_LAKE_STORY.readingActivity,
        pages: THE_CAKE_AT_THE_LAKE_STORY.pages,
      },
      {
        title: THE_KITE_IN_THE_SKY_STORY.title,
        level: THE_KITE_IN_THE_SKY_STORY.level,
        coverImageUrl: THE_KITE_IN_THE_SKY_STORY.coverImageUrl,
        description: THE_KITE_IN_THE_SKY_STORY.description,
        phonicsFocus: THE_KITE_IN_THE_SKY_STORY.phonicsFocus,
        sightWordsList: THE_KITE_IN_THE_SKY_STORY.sightWordsList,
        comprehensionQuestions: THE_KITE_IN_THE_SKY_STORY.comprehensionQuestions,
        readingActivity: THE_KITE_IN_THE_SKY_STORY.readingActivity,
        pages: THE_KITE_IN_THE_SKY_STORY.pages,
      },
      {
        title: "My Red Hat",
        level: 2,
        coverImageUrl: hatImg,
        description: "Learn colors and 4-letter words with a fun hat story.",
        pages: [
          { pageNumber: 1, text: "I see a hat.", imageUrl: hatImg },
          { pageNumber: 2, text: "The hat is red.", imageUrl: hatImg },
          { pageNumber: 3, text: "I like my hat.", imageUrl: hatImg },
          { pageNumber: 4, text: "The red hat is on my head.", imageUrl: hatImg },
          { pageNumber: 5, text: "I love my red hat!", imageUrl: hatImg },
        ],
      },
      {
        title: "I Like My Book",
        level: 3,
        coverImageUrl: bookImg,
        description: "A short story about reading your very own book.",
        pages: [
          { pageNumber: 1, text: "I have a book.", imageUrl: bookImg },
          { pageNumber: 2, text: "I like my book.", imageUrl: bookImg },
          { pageNumber: 3, text: "I read my book.", imageUrl: bookImg },
          { pageNumber: 4, text: "My book is about a dog.", imageUrl: dogImg },
          { pageNumber: 5, text: "The dog can run.", imageUrl: dogImg },
          { pageNumber: 6, text: "I love to read my book!", imageUrl: bookImg },
        ],
      },
    ];

    for (const { pages, ...bookData } of booksData) {
      const [book] = await db.insert(readingBooks).values(bookData).returning();
      for (const page of pages) {
        await db.insert(readingBookPages).values({ ...page, bookId: book.id });
      }
    }
  }

  async seedStoryBook(story: typeof CAT_IN_THE_HAT_STORY | typeof THE_BIG_PIG_STORY | typeof THE_DOG_ON_THE_LOG_STORY | typeof THE_LAD_AND_THE_BAG_STORY | typeof THE_HEN_IN_THE_PEN_STORY | typeof THE_BIG_FISH_STORY | typeof THE_CAKE_AT_THE_LAKE_STORY | typeof THE_KITE_IN_THE_SKY_STORY) {
    const [book] = await db.insert(readingBooks).values({
      title: story.title,
      level: story.level,
      coverImageUrl: story.coverImageUrl,
      description: story.description,
      phonicsFocus: story.phonicsFocus,
      vowelHighlight: "vowelHighlight" in story ? story.vowelHighlight : undefined,
      sightWordsList: story.sightWordsList,
      comprehensionQuestions: story.comprehensionQuestions,
      readingActivity: "readingActivity" in story ? story.readingActivity : undefined,
    }).returning();
    for (const page of story.pages) {
      await db.insert(readingBookPages).values({ ...page, bookId: book.id });
    }
  }

  async seedSightWords() {
    const wordsByLevel = [
      // Level 1: First sight words (Dolch pre-primer core)
      [
        { word: "THE", level: 1, sentence: "The cat is here.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg" },
        { word: "A", level: 1, sentence: "I see a dog.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg" },
        { word: "I", level: 1, sentence: "I like to play.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg" },
        { word: "IS", level: 1, sentence: "The sun is hot.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/The_Sun_in_white_light.jpg" },
        { word: "IT", level: 1, sentence: "It is a big red ball.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg" },
        { word: "IN", level: 1, sentence: "The cat is in the box.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/L%C3%A5da_-_Livrustkammaren_-_107142.tif/lossy-page1-8178px-L%C3%A5da_-_Livrustkammaren_-_107142.tif.jpg" },
        { word: "ON", level: 1, sentence: "The hat is on my head.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chapeaux_en_peau_de_castor.jpg" },
        { word: "AT", level: 1, sentence: "Look at the bird.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Bird_Diversity_2013.png" },
        { word: "MY", level: 1, sentence: "This is my book.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg" },
        { word: "WE", level: 1, sentence: "We go to school.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/Panor%C3%A1mica_Oto%C3%B1o_Alc%C3%A1zar_de_Segovia.jpg" },
        { word: "TO", level: 1, sentence: "I go to the park.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Usamljeni_jasen_-_panoramio_%28cropped%29.jpg" },
        { word: "GO", level: 1, sentence: "Let's go play!", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg" },
      ],
      // Level 2: Common sight words
      [
        { word: "YOU", level: 2, sentence: "Can you see the moon?", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg" },
        { word: "SEE", level: 2, sentence: "I see a fish.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg" },
        { word: "CAN", level: 2, sentence: "The bird can fly.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Bird_Diversity_2013.png" },
        { word: "AND", level: 2, sentence: "The cat and dog play.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg" },
        { word: "HAS", level: 2, sentence: "A lad has a bag.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg" },
        { word: "WITH", level: 2, sentence: "The kid sat with the pig.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pig_farm_Vampula_1.jpg" },
        { word: "SAID", level: 2, sentence: "Mom said hello.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Pink_lady_and_cross_section.jpg" },
        { word: "LOOK", level: 2, sentence: "Look at the star!", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Star_cluster_Pismis_24_and_NGC_6357.jpg" },
        { word: "COME", level: 2, sentence: "Come and play with me.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg" },
        { word: "PLAY", level: 2, sentence: "I like to play.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg" },
      ],
      // Level 3: More sight words
      [
        { word: "WHERE", level: 3, sentence: "Where is my hat?", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chapeaux_en_peau_de_castor.jpg" },
        { word: "HELP", level: 3, sentence: "Can you help me?", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/The_Doctor_Luke_Fildes_crop.jpg" },
        { word: "FIND", level: 3, sentence: "Can you find the cat?", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg" },
        { word: "HERE", level: 3, sentence: "Come here please.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg" },
        { word: "AWAY", level: 3, sentence: "The bird flew away.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Bird_Diversity_2013.png" },
        { word: "DOWN", level: 3, sentence: "Sit down please.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Set_of_fourteen_side_chairs_MET_DP110780.jpg" },
        { word: "LITTLE", level: 3, sentence: "The little pig is cute.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pig_farm_Vampula_1.jpg" },
        { word: "ONE", level: 3, sentence: "I have one apple.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Pink_lady_and_cross_section.jpg" },
        { word: "TWO", level: 3, sentence: "I see two ducks.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Bucephala-albeola-010.jpg" },
        { word: "THREE", level: 3, sentence: "I have three balls.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg" },
      ],
    ];

    for (const levelWords of wordsByLevel) {
      for (const wordData of levelWords) {
        await db.insert(sightWords).values(wordData);
      }
    }
  }

  async seedMathActivities() {
    const activities: { type: string; level: number; question: string; answer: number; objects: string[] }[] = [
      // Counting level 1
      { type: "counting", level: 1, question: "How many apples do you see?", answer: 3, objects: ["🍎", "🍎", "🍎"] },
      { type: "counting", level: 1, question: "How many cars do you see?", answer: 4, objects: ["🚗", "🚗", "🚗", "🚗"] },
      { type: "counting", level: 1, question: "How many stars do you see?", answer: 5, objects: ["⭐", "⭐", "⭐", "⭐", "⭐"] },
      { type: "counting", level: 1, question: "How many flowers do you see?", answer: 2, objects: ["🌸", "🌸"] },
      { type: "counting", level: 1, question: "How many balloons do you see?", answer: 6, objects: ["🎈", "🎈", "🎈", "🎈", "🎈", "🎈"] },
      // Counting level 2
      { type: "counting", level: 2, question: "How many ducks do you see?", answer: 7, objects: ["🦆", "🦆", "🦆", "🦆", "🦆", "🦆", "🦆"] },
      { type: "counting", level: 2, question: "How many fish do you see?", answer: 8, objects: ["🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟"] },
      { type: "counting", level: 2, question: "How many trees do you see?", answer: 4, objects: ["🌳", "🌳", "🌳", "🌳"] },
      { type: "counting", level: 2, question: "How many hearts do you see?", answer: 9, objects: ["❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️"] },
      { type: "counting", level: 2, question: "How many moons do you see?", answer: 3, objects: ["🌙", "🌙", "🌙"] },
      // Addition level 3
      { type: "addition", level: 3, question: "2 + 1 = ?", answer: 3, objects: ["2", "+", "1"] },
      { type: "addition", level: 3, question: "1 + 2 = ?", answer: 3, objects: ["1", "+", "2"] },
      { type: "addition", level: 3, question: "3 + 1 = ?", answer: 4, objects: ["3", "+", "1"] },
      { type: "addition", level: 3, question: "2 + 2 = ?", answer: 4, objects: ["2", "+", "2"] },
      { type: "addition", level: 3, question: "1 + 1 = ?", answer: 2, objects: ["1", "+", "1"] },
      // Addition level 4
      { type: "addition", level: 4, question: "3 + 2 = ?", answer: 5, objects: ["3", "+", "2"] },
      { type: "addition", level: 4, question: "4 + 1 = ?", answer: 5, objects: ["4", "+", "1"] },
      { type: "addition", level: 4, question: "2 + 3 = ?", answer: 5, objects: ["2", "+", "3"] },
      { type: "addition", level: 4, question: "5 + 2 = ?", answer: 7, objects: ["5", "+", "2"] },
      { type: "addition", level: 4, question: "3 + 3 = ?", answer: 6, objects: ["3", "+", "3"] },
      // Addition level 5
      { type: "addition", level: 5, question: "4 + 4 = ?", answer: 8, objects: ["4", "+", "4"] },
      { type: "addition", level: 5, question: "5 + 3 = ?", answer: 8, objects: ["5", "+", "3"] },
      { type: "addition", level: 5, question: "6 + 2 = ?", answer: 8, objects: ["6", "+", "2"] },
      { type: "addition", level: 5, question: "7 + 1 = ?", answer: 8, objects: ["7", "+", "1"] },
      { type: "addition", level: 5, question: "4 + 5 = ?", answer: 9, objects: ["4", "+", "5"] },
      // Addition level 6
      { type: "addition", level: 6, question: "6 + 5 = ?", answer: 11, objects: ["6", "+", "5"] },
      { type: "addition", level: 6, question: "7 + 4 = ?", answer: 11, objects: ["7", "+", "4"] },
      { type: "addition", level: 6, question: "8 + 3 = ?", answer: 11, objects: ["8", "+", "3"] },
      { type: "addition", level: 6, question: "9 + 2 = ?", answer: 11, objects: ["9", "+", "2"] },
      { type: "addition", level: 6, question: "5 + 6 = ?", answer: 11, objects: ["5", "+", "6"] },
      // Subtraction level 1
      { type: "subtraction", level: 1, question: "3 - 1 = ?", answer: 2, objects: ["3", "-", "1"] },
      { type: "subtraction", level: 1, question: "4 - 2 = ?", answer: 2, objects: ["4", "-", "2"] },
      { type: "subtraction", level: 1, question: "5 - 1 = ?", answer: 4, objects: ["5", "-", "1"] },
      { type: "subtraction", level: 1, question: "2 - 1 = ?", answer: 1, objects: ["2", "-", "1"] },
      { type: "subtraction", level: 1, question: "4 - 1 = ?", answer: 3, objects: ["4", "-", "1"] },
      // Subtraction level 2
      { type: "subtraction", level: 2, question: "6 - 3 = ?", answer: 3, objects: ["6", "-", "3"] },
      { type: "subtraction", level: 2, question: "7 - 2 = ?", answer: 5, objects: ["7", "-", "2"] },
      { type: "subtraction", level: 2, question: "5 - 3 = ?", answer: 2, objects: ["5", "-", "3"] },
      { type: "subtraction", level: 2, question: "8 - 4 = ?", answer: 4, objects: ["8", "-", "4"] },
      { type: "subtraction", level: 2, question: "9 - 5 = ?", answer: 4, objects: ["9", "-", "5"] },
      // Subtraction level 3
      { type: "subtraction", level: 3, question: "10 - 4 = ?", answer: 6, objects: ["10", "-", "4"] },
      { type: "subtraction", level: 3, question: "12 - 5 = ?", answer: 7, objects: ["12", "-", "5"] },
      { type: "subtraction", level: 3, question: "11 - 3 = ?", answer: 8, objects: ["11", "-", "3"] },
      { type: "subtraction", level: 3, question: "9 - 7 = ?", answer: 2, objects: ["9", "-", "7"] },
      { type: "subtraction", level: 3, question: "10 - 6 = ?", answer: 4, objects: ["10", "-", "6"] },
      // Mixed level 1 (Progressively harder)
      { type: "mixed", level: 1, question: "2 + 2 = ?", answer: 4, objects: ["2", "+", "2"] },
      { type: "mixed", level: 1, question: "4 - 1 = ?", answer: 3, objects: ["4", "-", "1"] },
      { type: "mixed", level: 1, question: "5 + 3 = ?", answer: 8, objects: ["5", "+", "3"] },
      { type: "mixed", level: 1, question: "7 - 4 = ?", answer: 3, objects: ["7", "-", "4"] },
      { type: "mixed", level: 1, question: "6 + 5 = ?", answer: 11, objects: ["6", "+", "5"] },
      // Mixed level 2 (Progressively harder)
      { type: "mixed", level: 2, question: "8 - 3 = ?", answer: 5, objects: ["8", "-", "3"] },
      { type: "mixed", level: 2, question: "7 + 6 = ?", answer: 13, objects: ["7", "+", "6"] },
      { type: "mixed", level: 2, question: "12 - 5 = ?", answer: 7, objects: ["12", "-", "5"] },
      { type: "mixed", level: 2, question: "9 + 4 = ?", answer: 13, objects: ["9", "+", "4"] },
      { type: "mixed", level: 2, question: "15 - 6 = ?", answer: 9, objects: ["15", "-", "6"] },
    ];

    for (const activity of activities) {
      await db.insert(mathActivities).values(activity);
    }
  }
}

export const storage = new DatabaseStorage();