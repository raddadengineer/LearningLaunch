export interface WordData {
  id: number;
  word: string;
  level: number;
  imageUrl: string;
  phonics?: string[];
}

export const level1Words: WordData[] = [
  { id: 1, word: "CAT", level: 1, imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", phonics: ["C", "A", "T"] },
  { id: 2, word: "DOG", level: 1, imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d", phonics: ["D", "O", "G"] },
  { id: 3, word: "SUN", level: 1, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", phonics: ["S", "U", "N"] },
  { id: 4, word: "BAT", level: 1, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96", phonics: ["B", "A", "T"] },
  { id: 5, word: "HAT", level: 1, imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0", phonics: ["H", "A", "T"] },
  { id: 6, word: "CAN", level: 1, imageUrl: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c", phonics: ["C", "A", "N"] },
  { id: 7, word: "RUN", level: 1, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", phonics: ["R", "U", "N"] },
  { id: 8, word: "FUN", level: 1, imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9", phonics: ["F", "U", "N"] },
  { id: 9, word: "BUS", level: 1, imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957", phonics: ["B", "U", "S"] },
  { id: 10, word: "CUP", level: 1, imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f", phonics: ["C", "U", "P"] },
  { id: 11, word: "PEN", level: 1, imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07", phonics: ["P", "E", "N"] },
  { id: 12, word: "BED", level: 1, imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", phonics: ["B", "E", "D"] },
];

export const level2Words: WordData[] = [
  { id: 13, word: "FISH", level: 2, imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f", phonics: ["F", "I", "SH"] },
  { id: 14, word: "BIRD", level: 2, imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3", phonics: ["B", "IR", "D"] },
  { id: 15, word: "TREE", level: 2, imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", phonics: ["TR", "EE"] },
  { id: 16, word: "BOOK", level: 2, imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570", phonics: ["B", "OO", "K"] },
  { id: 17, word: "BALL", level: 2, imageUrl: "https://images.unsplash.com/photo-1594736797933-d0bd1aebf67c", phonics: ["B", "A", "LL"] },
  { id: 18, word: "PLAY", level: 2, imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9", phonics: ["PL", "A", "Y"] },
  { id: 19, word: "JUMP", level: 2, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", phonics: ["J", "U", "MP"] },
  { id: 20, word: "HELP", level: 2, imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a", phonics: ["H", "E", "LP"] },
  { id: 21, word: "CAKE", level: 2, imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13", phonics: ["C", "A", "KE"] },
  { id: 22, word: "DUCK", level: 2, imageUrl: "https://images.unsplash.com/photo-1551196007-2b6c0afbc0dd", phonics: ["D", "U", "CK"] },
  { id: 23, word: "FROG", level: 2, imageUrl: "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80", phonics: ["FR", "O", "G"] },
  { id: 24, word: "MILK", level: 2, imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b", phonics: ["M", "I", "LK"] },
  { id: 25, word: "RAIN", level: 2, imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0", phonics: ["R", "AI", "N"] },
  { id: 26, word: "STAR", level: 2, imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a", phonics: ["ST", "A", "R"] },
  { id: 27, word: "MOON", level: 2, imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b", phonics: ["M", "OO", "N"] },
];

export const level3Words: WordData[] = [
  { id: 28, word: "HOUSE", level: 3, imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be", phonics: ["H", "OU", "SE"] },
  { id: 29, word: "APPLE", level: 3, imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb", phonics: ["A", "PP", "LE"] },
  { id: 30, word: "SMILE", level: 3, imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e", phonics: ["SM", "I", "LE"] },
  { id: 31, word: "PLANE", level: 3, imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05", phonics: ["PL", "A", "NE"] },
  { id: 32, word: "TRAIN", level: 3, imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957", phonics: ["TR", "AI", "N"] },
  { id: 33, word: "BEACH", level: 3, imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", phonics: ["B", "EA", "CH"] },
  { id: 34, word: "CHAIR", level: 3, imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7", phonics: ["CH", "AI", "R"] },
  { id: 35, word: "FLOWER", level: 3, imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946", phonics: ["FL", "OW", "ER"] },
  { id: 36, word: "BREAD", level: 3, imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73", phonics: ["BR", "EA", "D"] },
  { id: 37, word: "TIGER", level: 3, imageUrl: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5", phonics: ["T", "I", "GER"] },
  { id: 38, word: "SNAKE", level: 3, imageUrl: "https://images.unsplash.com/photo-1516598540642-e8f40a09d939", phonics: ["SN", "A", "KE"] },
  { id: 39, word: "CLOCK", level: 3, imageUrl: "https://images.unsplash.com/photo-1501139083538-0139583c060f", phonics: ["CL", "O", "CK"] },
];

export const level4Words: WordData[] = [
  { id: 40, word: "DRAGON", level: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96", phonics: ["DR", "A", "GON"] },
  { id: 41, word: "CASTLE", level: 4, imageUrl: "https://images.unsplash.com/photo-1520637836862-4d197d17c43a", phonics: ["C", "AS", "TLE"] },
  { id: 42, word: "PRINCE", level: 4, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", phonics: ["PR", "IN", "CE"] },
  { id: 43, word: "BRIDGE", level: 4, imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df", phonics: ["BR", "I", "DGE"] },
  { id: 44, word: "MONKEY", level: 4, imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde", phonics: ["M", "ON", "KEY"] },
  { id: 45, word: "TURTLE", level: 4, imageUrl: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f", phonics: ["T", "UR", "TLE"] },
  { id: 46, word: "GARDEN", level: 4, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b", phonics: ["G", "AR", "DEN"] },
  { id: 47, word: "PURPLE", level: 4, imageUrl: "https://images.unsplash.com/photo-1553982012-39a2abef9cde", phonics: ["P", "UR", "PLE"] },
  { id: 48, word: "ORANGE", level: 4, imageUrl: "https://images.unsplash.com/photo-1557800636-894a64c1696f", phonics: ["OR", "AN", "GE"] },
  { id: 49, word: "YELLOW", level: 4, imageUrl: "https://images.unsplash.com/photo-1562085180-7fd3d38f8b73", phonics: ["Y", "EL", "LOW"] },
  { id: 50, word: "ROCKET", level: 4, imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7", phonics: ["R", "O", "CKET"] },
  { id: 51, word: "PLANET", level: 4, imageUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2", phonics: ["PL", "A", "NET"] },
];

export const level5Words: WordData[] = [
  { id: 52, word: "ELEPHANT", level: 5, imageUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7", phonics: ["EL", "E", "PHANT"] },
  { id: 53, word: "GIRAFFE", level: 5, imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0", phonics: ["G", "I", "RAFFE"] },
  { id: 54, word: "RAINBOW", level: 5, imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a", phonics: ["R", "AIN", "BOW"] },
  { id: 55, word: "BIRTHDAY", level: 5, imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3", phonics: ["B", "IRTH", "DAY"] },
  { id: 56, word: "COMPUTER", level: 5, imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6", phonics: ["COM", "PU", "TER"] },
  { id: 57, word: "SANDWICH", level: 5, imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f", phonics: ["S", "AND", "WICH"] },
  { id: 58, word: "FOOTBALL", level: 5, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96", phonics: ["F", "OOT", "BALL"] },
  { id: 59, word: "BACKPACK", level: 5, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62", phonics: ["B", "ACK", "PACK"] },
  { id: 60, word: "SUNSHINE", level: 5, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", phonics: ["S", "UN", "SHINE"] },
  { id: 61, word: "BUTTERFLY", level: 5, imageUrl: "https://images.unsplash.com/photo-1444927714506-8492d94b5ba0", phonics: ["B", "UT", "TER", "FLY"] },
  { id: 62, word: "TREASURE", level: 5, imageUrl: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0", phonics: ["TR", "EA", "SURE"] },
  { id: 63, word: "PRINCESS", level: 5, imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e", phonics: ["PRIN", "CESS"] },
];

export function getWordsByLevel(level: number): WordData[] {
  switch (level) {
    case 1:
      return level1Words;
    case 2:
      return level2Words;
    case 3:
      return level3Words;
    case 4:
      return level4Words;
    case 5:
      return level5Words;
    default:
      return [];
  }
}

export function getAllWords(): WordData[] {
  return [...level1Words, ...level2Words, ...level3Words, ...level4Words, ...level5Words];
}

export function getRandomWord(level?: number): WordData {
  const words = level ? getWordsByLevel(level) : getAllWords();
  return words[Math.floor(Math.random() * words.length)];
}
