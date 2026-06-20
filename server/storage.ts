import {
  users, userProgress, readingWords, readingBooks, readingBookPages, sightWords, mathActivities, achievements,
  type User, type UserProgress, type ReadingWord, type ReadingBook, type ReadingBookPage, type SightWord,
  type ReadingBookWithPages, type ReadingBookSummary,
  type MathActivity, type Achievement,
  type InsertUser, type InsertUserProgress, type InsertReadingWord, type InsertMathActivity, type InsertAchievement
} from "@shared/schema";
import { getPhonicsForWord } from "@shared/phonics";
import { CAT_IN_THE_HAT_STORY } from "@shared/stories/cat-in-the-hat";
import { THE_BIG_PIG_STORY } from "@shared/stories/the-big-pig";
import { THE_DOG_ON_THE_LOG_STORY } from "@shared/stories/the-dog-on-the-log";
import { THE_LAD_AND_THE_BAG_STORY } from "@shared/stories/the-lad-and-the-bag";
import { THE_HEN_IN_THE_PEN_STORY } from "@shared/stories/the-hen-in-the-pen";
import { THE_BIG_FISH_STORY } from "@shared/stories/the-big-fish";
import { THE_CAKE_AT_THE_LAKE_STORY } from "@shared/stories/the-cake-at-the-lake";
import { db as dbPromise } from "./db-switch";
const db = await dbPromise;
import { eq, desc, asc } from "drizzle-orm";

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
    if (existingMath.length === 0) {
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

    const refreshedWords = await this.getAllReadingWords();
    const shortEWords = [
      { word: "HEN", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hen_at_Lourmarin.jpg", level: 1 },
      { word: "PEN", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Pencils_hb.jpg", level: 1 },
      { word: "BED", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Bed_from_the_1870s.jpg", level: 1 },
      { word: "FED", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Chicken_feed_in_a_bowl.jpg", level: 1 },
    ];
    for (const wordData of shortEWords) {
      if (!refreshedWords.some(w => w.word === wordData.word)) {
        const phonics = getPhonicsForWord(wordData.word);
        await db.insert(readingWords).values({ ...wordData, phonics });
      }
    }

    const shortIWords = [
      { word: "SWIM", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg", level: 1 },
      { word: "HID", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/L%C3%A5da_-_Livrustkammaren_-_107142.tif/lossy-page1-8178px-L%C3%A5da_-_Livrustkammaren_-_107142.tif.jpg", level: 1 },
    ];
    for (const wordData of shortIWords) {
      if (!refreshedWords.some(w => w.word === wordData.word)) {
        const phonics = getPhonicsForWord(wordData.word);
        await db.insert(readingWords).values({ ...wordData, phonics });
      }
    }

    const longAWords = [
      { word: "CAP", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chapeaux_en_peau_de_castor.jpg", level: 1 },
      { word: "CAPE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chapeaux_en_peau_de_castor.jpg", level: 2 },
      { word: "LAKE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Lake_mapourika_NZ.jpeg", level: 2 },
      { word: "BAKE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/Pound_layer_cake.jpg", level: 2 },
      { word: "MATE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg", level: 2 },
      { word: "GATE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Usamljeni_jasen_-_panoramio_%28cropped%29.jpg", level: 2 },
    ];
    for (const wordData of longAWords) {
      if (!refreshedWords.some(w => w.word === wordData.word)) {
        const phonics = getPhonicsForWord(wordData.word);
        await db.insert(readingWords).values({ ...wordData, phonics });
      }
    }
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
    const wordsByLevel = [
      // Level 1: CVC words
      [
        { word: "CAT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg", level: 1 },
        { word: "DOG", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg", level: 1 },
        { word: "PIG", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pig_farm_Vampula_1.jpg", level: 1 },
        { word: "BUG", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Insects_-_Neoptera_-_Paleoptera_-_Apterygota.jpg", level: 1 },
        { word: "SUN", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/The_Sun_in_white_light.jpg", level: 1 },
        { word: "BAT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/77/Big-eared-townsend-fledermaus.jpg", level: 1 },
        { word: "HAT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chapeaux_en_peau_de_castor.jpg", level: 1 },
        { word: "BOX", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/L%C3%A5da_-_Livrustkammaren_-_107142.tif/lossy-page1-8178px-L%C3%A5da_-_Livrustkammaren_-_107142.tif.jpg", level: 1 },
        { word: "FOX", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_%28cropped%29.jpg", level: 1 },
        { word: "MUG", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Mug_of_Tea.JPG", level: 1 },
        { word: "LOG", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Felling_a_gumtree_c1884-1917_Powerhouse_Museum.jpg", level: 1 },
        { word: "RAT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/44/Brown_Rat_%28Rattus_norvegicus%29.jpg", level: 1 }
      ],
      // Level 2: 4-letter words
      [
        { word: "FISH", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg", level: 2 },
        { word: "DUCK", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Bucephala-albeola-010.jpg", level: 2 },
        { word: "FROG", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Red-eyed_Leaf_Frog_%2849661076226%29.jpg", level: 2 },
        { word: "BIRD", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Bird_Diversity_2013.png", level: 2 },
        { word: "TREE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Usamljeni_jasen_-_panoramio_%28cropped%29.jpg", level: 2 },
        { word: "BOOK", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg", level: 2 },
        { word: "BALL", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg", level: 2 },
        { word: "BEAR", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Ours_brun_parcanimalierpyrenees_1.jpg", level: 2 },
        { word: "BOAT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Motorboat_at_Kankaria_lake.JPG", level: 2 },
        { word: "MOON", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg", level: 2 },
        { word: "STAR", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Star_cluster_Pismis_24_and_NGC_6357.jpg", level: 2 },
        { word: "CAKE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/Pound_layer_cake.jpg", level: 2 }
      ],
      // Level 3: 5-letter words
      [
        { word: "HOUSE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Katsura_Imperial_Villa_in_Spring.jpg", level: 3 },
        { word: "APPLE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Pink_lady_and_cross_section.jpg", level: 3 },
        { word: "TRAIN", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/50/%D0%9F%D0%BE%D0%B5%D0%B7%D0%B4_%D0%BD%D0%B0_%D1%84%D0%BE%D0%BD%D0%B5_%D0%B3%D0%BE%D1%80%D1%8B_%D0%A8%D0%B0%D1%82%D1%80%D0%B8%D1%89%D0%B5._%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D0%B5%D0%B6%D1%81%D0%BA%D0%B0%D1%8F_%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C.jpg", level: 3 },
        { word: "HORSE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Nokota_Horses_cropped.jpg", level: 3 },
        { word: "MOUSE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0d/%D0%9C%D1%8B%D1%88%D1%8C_2.jpg", level: 3 },
        { word: "CHAIR", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Set_of_fourteen_side_chairs_MET_DP110780.jpg", level: 3 },
        { word: "CLOUD", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1d/ISS-40_Thunderheads_near_Borneo.jpg", level: 3 },
        { word: "SHEEP", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Flock_of_sheep.jpg", level: 3 },
        { word: "SNAKE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/60/Trimeresurus_sabahi_fucatus%2C_Banded_pit_viper_-_Takua_Pa_District%2C_Phang-nga_Province_%2846710893582%29.jpg", level: 3 },
        { word: "TIGER", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Bengal_tiger_%28Panthera_tigris_tigris%29_female_3_crop.jpg", level: 3 },
        { word: "GRASS", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/77/Poa_annua.jpg", level: 3 },
        { word: "TRUCK", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/11/Freightliner_M2_106_6x4_2014_%2814240376744%29.jpg", level: 3 }
      ],
      // Level 4: 6-7 letter words
      [
        { word: "FLOWER", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/38/Magnolia_grandiflora_-_flower_1.jpg", level: 4 },
        { word: "RABBIT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Oryctolagus_cuniculus_Rcdo.jpg", level: 4 },
        { word: "MONKEY", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dc/BrownSpiderMonkey_%28edit2%29.jpg", level: 4 },
        { word: "SPIDER", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/26/Araneae3.jpg", level: 4 },
        { word: "PENCIL", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Pencils_hb.jpg", level: 4 },
        { word: "ORANGE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Oranges_-_whole-halved-segment.jpg", level: 4 },
        { word: "DRAGON", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/St_Catherine%2C_St_George_and_the_Dragon_%28M%C3%A4staren_fr%C3%A5n_Kappenberg%29_-_Nationalmuseum_-_18337_%28brightened%29%2C_draken.png", level: 4 },
        { word: "TURTLE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/21/Turtle_diversity.jpg", level: 4 },
        { word: "LIZARD", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Hemidactylus_platyurus_%28Flat-tailed_House_Gecko%29_on_white_background%2C_focus_stacking.jpg", level: 4 },
        { word: "CASTLE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/Panor%C3%A1mica_Oto%C3%B1o_Alc%C3%A1zar_de_Segovia.jpg", level: 4 },
        { word: "ROCKET", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Soyuz_TMA-9_launch.jpg", level: 4 },
        { word: "DOCTOR", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/The_Doctor_Luke_Fildes_crop.jpg", level: 4 }
      ],
      // Level 5: 8+ letter words
      [
        { word: "ELEPHANT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/African_Bush_Elephant.jpg", level: 5 },
        { word: "DINOSAUR", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Sinosauropteryxfossil.jpg", level: 5 },
        { word: "BUTTERFLY", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Fesoj_-_Papilio_machaon_%28by%29.jpg", level: 5 },
        { word: "MOUNTAIN", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg", level: 5 },
        { word: "UMBRELLA", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/M0354_000727-005_1.jpg", level: 5 },
        { word: "AIRPLANE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/36/United_Airlines_Boeing_777-200_Meulemans.jpg", level: 5 },
        { word: "ASTRONAUT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Bruce_McCandless_II_during_EVA_in_1984.jpg", level: 5 },
        { word: "HELICOPTER", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/78/LAPD_Bell_206_Jetranger.jpg", level: 5 },
        { word: "KANGAROO", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/df/Forester_kangaroo_%28Macropus_giganteus_tasmaniensis%29_juvenile_hopping_Esk_Valley.jpg", level: 5 },
        { word: "ALLIGATOR", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Chinese%2Bamerican_alligators.png", level: 5 },
        { word: "VOLCANO", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/48/Augustine_volcano_Jan_24_2006_-_Cyrus_Read.jpg", level: 5 },
        { word: "TELESCOPE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ac/100inchHooker.jpg", level: 5 }
      ]
    ];

    for (const levelWords of wordsByLevel) {
      for (const wordData of levelWords) {
        const phonics = getPhonicsForWord(wordData.word);
        await db.insert(readingWords).values({ ...wordData, phonics });
      }
    }
  }

  async seedLevel6Sentences() {
    const sentences = [
      { word: "THE CAT SAT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg", level: 6 },
      { word: "I SEE A DOG", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg", level: 6 },
      { word: "THE SUN IS HOT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/The_Sun_in_white_light.jpg", level: 6 },
      { word: "A BIG RED BUS", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/11/Freightliner_M2_106_6x4_2014_%2814240376744%29.jpg", level: 6 },
      { word: "THE BIRD CAN FLY", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Bird_Diversity_2013.png", level: 6 },
      { word: "I LIKE MY BOOK", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg", level: 6 },
      { word: "THE FROG CAN JUMP", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Red-eyed_Leaf_Frog_%2849661076226%29.jpg", level: 6 },
      { word: "WE GO TO SCHOOL", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/Panor%C3%A1mica_Oto%C3%B1o_Alc%C3%A1zar_de_Segovia.jpg", level: 6 },
      { word: "THE FISH CAN SWIM", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg", level: 6 },
      { word: "I LOVE MY MOM", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Pink_lady_and_cross_section.jpg", level: 6 },
      { word: "THE MOON IS BRIGHT", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg", level: 6 },
      { word: "A HAPPY KID PLAYS", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg", level: 6 },
    ];

    for (const sentence of sentences) {
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

  async seedStoryBook(story: typeof CAT_IN_THE_HAT_STORY | typeof THE_BIG_PIG_STORY | typeof THE_DOG_ON_THE_LOG_STORY | typeof THE_LAD_AND_THE_BAG_STORY | typeof THE_HEN_IN_THE_PEN_STORY | typeof THE_BIG_FISH_STORY | typeof THE_CAKE_AT_THE_LAKE_STORY) {
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
        { word: "DID", level: 2, sentence: "The fox did hop.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_%28cropped%29.jpg" },
        { word: "HAD", level: 2, sentence: "The lad had a nap in the van.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg" },
        { word: "TEN", level: 2, sentence: "Ten hens in the pen.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Chicken_coop_with_chickens.jpg" },
        { word: "SAID", level: 2, sentence: "Mom said hello.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Pink_lady_and_cross_section.jpg" },
        { word: "LOOK", level: 2, sentence: "Look at the star!", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Star_cluster_Pismis_24_and_NGC_6357.jpg" },
        { word: "COME", level: 2, sentence: "Come and play with me.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg" },
        { word: "PLAY", level: 2, sentence: "I like to play.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Many_balls.jpg" },
        { word: "RUN", level: 2, sentence: "The dog can run.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg" },
        { word: "UP", level: 2, sentence: "The sun comes up.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/The_Sun_in_white_light.jpg" },
        { word: "BIG", level: 2, sentence: "That is a big tree.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Usamljeni_jasen_-_panoramio_%28cropped%29.jpg" },
        { word: "RED", level: 2, sentence: "The apple is red.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Pink_lady_and_cross_section.jpg" },
      ],
      // Level 3: More sight words
      [
        { word: "WHERE", level: 3, sentence: "Where is my hat?", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chapeaux_en_peau_de_castor.jpg" },
        { word: "HELP", level: 3, sentence: "Can you help me?", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/The_Doctor_Luke_Fildes_crop.jpg" },
        { word: "JUMP", level: 3, sentence: "The frog can jump.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Red-eyed_Leaf_Frog_%2849661076226%29.jpg" },
        { word: "MAKE", level: 3, sentence: "I can make a cake.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/Pound_layer_cake.jpg" },
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
    ];

    for (const activity of activities) {
      await db.insert(mathActivities).values(activity);
    }
  }
}

export const storage = new DatabaseStorage();