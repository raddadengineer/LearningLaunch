export interface WordData {
  id: number;
  word: string;
  level: number;
  imageUrl: string;
  phonics?: string[];
}

export const level1Words: WordData[] = [
  { id: 1, word: "CAT", level: 1, imageUrl: "https://images.unsplash.com/photo-1571566882372-1598d88abd90", phonics: ["C", "A", "T"] },
  { id: 2, word: "DOG", level: 1, imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d", phonics: ["D", "O", "G"] },
  { id: 3, word: "SUN", level: 1, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", phonics: ["S", "U", "N"] },
  { id: 4, word: "BAT", level: 1, imageUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7", phonics: ["B", "A", "T"] },
  { id: 5, word: "HAT", level: 1, imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee", phonics: ["H", "A", "T"] },
  { id: 6, word: "CAN", level: 1, imageUrl: "https://images.unsplash.com/photo-1610736969072-b5c43d263f00", phonics: ["C", "A", "N"] },
  { id: 7, word: "RUN", level: 1, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", phonics: ["R", "U", "N"] },
  { id: 8, word: "FUN", level: 1, imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", phonics: ["F", "U", "N"] },
  { id: 9, word: "BUS", level: 1, imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e", phonics: ["B", "U", "S"] },
  { id: 10, word: "CUP", level: 1, imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b", phonics: ["C", "U", "P"] },
  { id: 11, word: "PEN", level: 1, imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07", phonics: ["P", "E", "N"] },
  { id: 12, word: "BED", level: 1, imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", phonics: ["B", "E", "D"] },
];

export const level2Words: WordData[] = [
  { id: 13, word: "FISH", level: 2, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5", phonics: ["F", "I", "SH"] },
  { id: 14, word: "BIRD", level: 2, imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3", phonics: ["B", "IR", "D"] },
  { id: 15, word: "TREE", level: 2, imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", phonics: ["TR", "EE"] },
  { id: 16, word: "BOOK", level: 2, imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570", phonics: ["B", "OO", "K"] },
  { id: 17, word: "BALL", level: 2, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96", phonics: ["B", "A", "LL"] },
  { id: 18, word: "PLAY", level: 2, imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9", phonics: ["PL", "A", "Y"] },
  { id: 19, word: "JUMP", level: 2, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", phonics: ["J", "U", "MP"] },
  { id: 20, word: "HELP", level: 2, imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a", phonics: ["H", "E", "LP"] },
  { id: 21, word: "CAKE", level: 2, imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13", phonics: ["C", "A", "KE"] },
  { id: 22, word: "DUCK", level: 2, imageUrl: "https://images.unsplash.com/photo-1551196007-2b6c0afbc0dd", phonics: ["D", "U", "CK"] },
  { id: 23, word: "FROG", level: 2, imageUrl: "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80", phonics: ["FR", "O", "G"] },
  { id: 24, word: "MILK", level: 2, imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150", phonics: ["M", "I", "LK"] },
  { id: 25, word: "RAIN", level: 2, imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0", phonics: ["R", "AI", "N"] },
  { id: 26, word: "STAR", level: 2, imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a", phonics: ["ST", "A", "R"] },
  { id: 27, word: "MOON", level: 2, imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b", phonics: ["M", "OO", "N"] },
];

export function getWordsByLevel(level: number): WordData[] {
  switch (level) {
    case 1:
      return level1Words;
    case 2:
      return level2Words;
    default:
      return [];
  }
}

export function getAllWords(): WordData[] {
  return [...level1Words, ...level2Words];
}

export function getRandomWord(level?: number): WordData {
  const words = level ? getWordsByLevel(level) : getAllWords();
  return words[Math.floor(Math.random() * words.length)];
}
