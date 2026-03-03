import {
  users, userProgress, readingWords, mathActivities, achievements,
  type User, type UserProgress, type ReadingWord, type MathActivity, type Achievement,
  type InsertUser, type InsertUserProgress, type InsertReadingWord, type InsertMathActivity, type InsertAchievement
} from "@shared/schema";
import { db as dbPromise } from "./db-switch";
const db = await dbPromise;
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
        { word: "STAR", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/The_Sun_in_white_light.jpg", level: 2 },
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
        await db.insert(readingWords).values(wordData);
      }
    }
  }
}

export const storage = new DatabaseStorage();