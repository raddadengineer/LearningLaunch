import { 
  users, userProgress, readingWords, mathActivities, achievements,
  type User, type UserProgress, type ReadingWord, type MathActivity, type Achievement,
  type InsertUser, type InsertUserProgress, type InsertReadingWord, type InsertMathActivity, type InsertAchievement
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStars(id: number, stars: number): Promise<User>;

  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getProgressByType(userId: number, activityType: string): Promise<UserProgress[]>;
  updateProgress(userId: number, activityType: string, level: number, completedItems: any[], stars: number): Promise<UserProgress>;

  // Reading methods
  getReadingWords(level: number): Promise<ReadingWord[]>;
  getAllReadingWords(): Promise<ReadingWord[]>;

  // Math methods
  getMathActivities(type: string, level: number): Promise<MathActivity[]>;
  getAllMathActivities(): Promise<MathActivity[]>;

  // Achievement methods
  getUserAchievements(userId: number): Promise<Achievement[]>;
  addAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userProgress: Map<number, UserProgress>;
  private readingWords: Map<number, ReadingWord>;
  private mathActivities: Map<number, MathActivity>;
  private achievements: Map<number, Achievement>;
  private currentUserId: number;
  private currentProgressId: number;
  private currentWordId: number;
  private currentActivityId: number;
  private currentAchievementId: number;

  constructor() {
    this.users = new Map();
    this.userProgress = new Map();
    this.readingWords = new Map();
    this.mathActivities = new Map();
    this.achievements = new Map();
    this.currentUserId = 1;
    this.currentProgressId = 1;
    this.currentWordId = 1;
    this.currentActivityId = 1;
    this.currentAchievementId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      name: "Emma",
      age: 5,
      totalStars: 47
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Initialize reading words - Level 1: Simple 3-letter CVC words
    const level1Words: ReadingWord[] = [
      { id: 1, word: "CAT", level: 1, imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba" },
      { id: 2, word: "DOG", level: 1, imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d" },
      { id: 3, word: "SUN", level: 1, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4" },
      { id: 4, word: "BAT", level: 1, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96" },
      { id: 5, word: "HAT", level: 1, imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0" },
      { id: 6, word: "CAN", level: 1, imageUrl: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c" },
      { id: 7, word: "RUN", level: 1, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b" },
      { id: 8, word: "FUN", level: 1, imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9" },
      { id: 9, word: "BUS", level: 1, imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957" },
      { id: 10, word: "CUP", level: 1, imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f" },
      { id: 11, word: "PEN", level: 1, imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07" },
      { id: 12, word: "BED", level: 1, imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85" }
    ];

    // Level 2: 4-letter words with blends and digraphs
    const level2Words: ReadingWord[] = [
      { id: 13, word: "FISH", level: 2, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f" },
      { id: 14, word: "BIRD", level: 2, imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3" },
      { id: 15, word: "TREE", level: 2, imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e" },
      { id: 16, word: "BOOK", level: 2, imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570" },
      { id: 17, word: "BALL", level: 2, imageUrl: "https://images.unsplash.com/photo-1594736797933-d0bd1aebf67c" },
      { id: 18, word: "PLAY", level: 2, imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9" },
      { id: 19, word: "JUMP", level: 2, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b" },
      { id: 20, word: "HELP", level: 2, imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a" },
      { id: 21, word: "CAKE", level: 2, imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13" },
      { id: 22, word: "DUCK", level: 2, imageUrl: "https://images.unsplash.com/photo-1551196007-2b6c0afbc0dd" },
      { id: 23, word: "FROG", level: 2, imageUrl: "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80" },
      { id: 24, word: "MILK", level: 2, imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b" },
      { id: 25, word: "RAIN", level: 2, imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0" },
      { id: 26, word: "STAR", level: 2, imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a" },
      { id: 27, word: "MOON", level: 2, imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b" }
    ];

    // Level 3: 5-letter words and long vowel sounds
    const level3Words: ReadingWord[] = [
      { id: 28, word: "HOUSE", level: 3, imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be" },
      { id: 29, word: "APPLE", level: 3, imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb" },
      { id: 30, word: "SMILE", level: 3, imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e" },
      { id: 31, word: "PLANE", level: 3, imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05" },
      { id: 32, word: "TRAIN", level: 3, imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957" },
      { id: 33, word: "BEACH", level: 3, imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" },
      { id: 34, word: "CHAIR", level: 3, imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7" },
      { id: 35, word: "FLOWER", level: 3, imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946" },
      { id: 36, word: "BREAD", level: 3, imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73" },
      { id: 37, word: "TIGER", level: 3, imageUrl: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5" },
      { id: 38, word: "SNAKE", level: 3, imageUrl: "https://images.unsplash.com/photo-1516598540642-e8f40a09d939" },
      { id: 39, word: "CLOCK", level: 3, imageUrl: "https://images.unsplash.com/photo-1501139083538-0139583c060f" }
    ];

    // Level 4: Complex consonant blends and compound words
    const level4Words: ReadingWord[] = [
      { id: 40, word: "DRAGON", level: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96" },
      { id: 41, word: "CASTLE", level: 4, imageUrl: "https://images.unsplash.com/photo-1520637836862-4d197d17c43a" },
      { id: 42, word: "PRINCE", level: 4, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" },
      { id: 43, word: "BRIDGE", level: 4, imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df" },
      { id: 44, word: "MONKEY", level: 4, imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" },
      { id: 45, word: "TURTLE", level: 4, imageUrl: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f" },
      { id: 46, word: "GARDEN", level: 4, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b" },
      { id: 47, word: "PURPLE", level: 4, imageUrl: "https://images.unsplash.com/photo-1553982012-39a2abef9cde" },
      { id: 48, word: "ORANGE", level: 4, imageUrl: "https://images.unsplash.com/photo-1557800636-894a64c1696f" },
      { id: 49, word: "YELLOW", level: 4, imageUrl: "https://images.unsplash.com/photo-1562085180-7fd3d38f8b73" },
      { id: 50, word: "ROCKET", level: 4, imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7" },
      { id: 51, word: "PLANET", level: 4, imageUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2" }
    ];

    // Level 5: Advanced words and sight words
    const level5Words: ReadingWord[] = [
      { id: 52, word: "ELEPHANT", level: 5, imageUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7" },
      { id: 53, word: "GIRAFFE", level: 5, imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0" },
      { id: 54, word: "RAINBOW", level: 5, imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a" },
      { id: 55, word: "BIRTHDAY", level: 5, imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3" },
      { id: 56, word: "COMPUTER", level: 5, imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6" },
      { id: 57, word: "SANDWICH", level: 5, imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f" },
      { id: 58, word: "FOOTBALL", level: 5, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96" },
      { id: 59, word: "BACKPACK", level: 5, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62" },
      { id: 60, word: "SUNSHINE", level: 5, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4" },
      { id: 61, word: "BUTTERFLY", level: 5, imageUrl: "https://images.unsplash.com/photo-1444927714506-8492d94b5ba0" },
      { id: 62, word: "TREASURE", level: 5, imageUrl: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0" },
      { id: 63, word: "PRINCESS", level: 5, imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e" }
    ];

    [level1Words, level2Words, level3Words, level4Words, level5Words].forEach(levelWords => {
      levelWords.forEach(word => this.readingWords.set(word.id, word));
    });
    this.currentWordId = 64;

    // Initialize math activities
    const countingActivities: MathActivity[] = [
      { id: 1, type: "counting", level: 1, question: "How many apples do you see?", answer: 3, objects: ["🍎", "🍎", "🍎"] },
      { id: 2, type: "counting", level: 1, question: "How many cars do you see?", answer: 4, objects: ["🚗", "🚗", "🚗", "🚗"] },
      { id: 3, type: "counting", level: 1, question: "How many stars do you see?", answer: 5, objects: ["⭐", "⭐", "⭐", "⭐", "⭐"] },
      { id: 4, type: "counting", level: 1, question: "How many flowers do you see?", answer: 2, objects: ["🌸", "🌸"] },
      { id: 5, type: "counting", level: 1, question: "How many balloons do you see?", answer: 6, objects: ["🎈", "🎈", "🎈", "🎈", "🎈", "🎈"] }
    ];

    const additionActivities: MathActivity[] = [
      { id: 6, type: "addition", level: 1, question: "2 + 1 = ?", answer: 3, objects: ["2", "+", "1"] },
      { id: 7, type: "addition", level: 1, question: "1 + 2 = ?", answer: 3, objects: ["1", "+", "2"] },
      { id: 8, type: "addition", level: 1, question: "3 + 1 = ?", answer: 4, objects: ["3", "+", "1"] },
      { id: 9, type: "addition", level: 1, question: "2 + 2 = ?", answer: 4, objects: ["2", "+", "2"] },
      { id: 10, type: "addition", level: 1, question: "1 + 1 = ?", answer: 2, objects: ["1", "+", "1"] }
    ];

    countingActivities.forEach(activity => this.mathActivities.set(activity.id, activity));
    additionActivities.forEach(activity => this.mathActivities.set(activity.id, activity));
    this.currentActivityId = 11;

    // Initialize progress for multiple reading levels
    const readingProgress1: UserProgress = {
      id: 1,
      userId: 1,
      activityType: "reading",
      level: 1,
      completedItems: [1, 2, 3, 4, 5, 6, 7, 8],
      totalItems: 12,
      stars: 3
    };

    const readingProgress2: UserProgress = {
      id: 3,
      userId: 1,
      activityType: "reading",
      level: 2,
      completedItems: [13, 14, 15],
      totalItems: 15,
      stars: 1
    };

    const readingProgress3: UserProgress = {
      id: 4,
      userId: 1,
      activityType: "reading",
      level: 3,
      completedItems: [],
      totalItems: 12,
      stars: 0
    };

    const mathProgress: UserProgress = {
      id: 2,
      userId: 1,
      activityType: "math",
      level: 1,
      completedItems: [1, 2, 3],
      totalItems: 5,
      stars: 2
    };

    this.userProgress.set(1, readingProgress1);
    this.userProgress.set(2, mathProgress);
    this.userProgress.set(3, readingProgress2);
    this.userProgress.set(4, readingProgress3);
    this.currentProgressId = 5;

    // Initialize achievements
    const userAchievements: Achievement[] = [
      { id: 1, userId: 1, title: "First Word!", description: "Read your first word", icon: "🌟", earnedAt: new Date().toISOString() },
      { id: 2, userId: 1, title: "5 Words Read", description: "Read 5 different words", icon: "📚", earnedAt: new Date().toISOString() },
      { id: 3, userId: 1, title: "Count to 10", description: "Successfully counted to 10", icon: "🔢", earnedAt: new Date().toISOString() },
      { id: 4, userId: 1, title: "Daily Goal", description: "Completed daily learning goal", icon: "⭐", earnedAt: new Date().toISOString() }
    ];

    userAchievements.forEach(achievement => this.achievements.set(achievement.id, achievement));
    this.currentAchievementId = 5;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, totalStars: 0 };
    this.users.set(id, user);
    return user;
  }

  async updateUserStars(id: number, stars: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, totalStars: stars };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(progress => progress.userId === userId);
  }

  async getProgressByType(userId: number, activityType: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      progress => progress.userId === userId && progress.activityType === activityType
    );
  }

  async updateProgress(userId: number, activityType: string, level: number, completedItems: any[], stars: number): Promise<UserProgress> {
    const existingProgress = Array.from(this.userProgress.values()).find(
      progress => progress.userId === userId && progress.activityType === activityType && progress.level === level
    );

    if (existingProgress) {
      const updatedProgress = { ...existingProgress, completedItems, stars };
      this.userProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      const id = this.currentProgressId++;
      // Calculate total items based on activity type and level
      let totalItems = 5; // default for math
      if (activityType === "reading") {
        if (level === 1) totalItems = 12;
        else if (level === 2) totalItems = 15;
        else if (level === 3) totalItems = 12;
        else if (level === 4) totalItems = 12;
        else if (level === 5) totalItems = 12;
      }
      
      const newProgress: UserProgress = {
        id,
        userId,
        activityType,
        level,
        completedItems,
        totalItems,
        stars
      };
      this.userProgress.set(id, newProgress);
      return newProgress;
    }
  }

  async getReadingWords(level: number): Promise<ReadingWord[]> {
    return Array.from(this.readingWords.values()).filter(word => word.level === level);
  }

  async getAllReadingWords(): Promise<ReadingWord[]> {
    return Array.from(this.readingWords.values());
  }

  async getMathActivities(type: string, level: number): Promise<MathActivity[]> {
    return Array.from(this.mathActivities.values()).filter(
      activity => activity.type === type && activity.level === level
    );
  }

  async getAllMathActivities(): Promise<MathActivity[]> {
    return Array.from(this.mathActivities.values());
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(achievement => achievement.userId === userId);
  }

  async addAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentAchievementId++;
    const achievement: Achievement = { ...insertAchievement, id };
    this.achievements.set(id, achievement);
    return achievement;
  }
}

export const storage = new MemStorage();
