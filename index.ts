export const ROUTE_PATHS = {
  HOME: '/',
  DICTIONARY: '/dictionary',
  TRAINING: '/training',
  QUIZ: '/quiz',
  DAILY: '/daily',
  PROFILE: '/profile',
} as const;

export type RoutePath = typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS];

export const WORD_CATEGORIES = {
  SLANG: 'slang',
  TRADING: 'trading',
  MECHANICS: 'mechanics',
} as const;

export type WordCategory = typeof WORD_CATEGORIES[keyof typeof WORD_CATEGORIES];

export interface Word {
  id: string;
  english: string;
  russian: string;
  transcription: string;
  category: WordCategory;
  examples: {
    english: string;
    russian: string;
  }[];
  synonyms?: string[];
  audioUrl?: string;
}

export type ExerciseType = 
  | 'match-pair'
  | 'chat-repair'
  | 'word-builder'
  | 'fill-blanks'
  | 'image-quiz'
  | 'true-false';

export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  data: any;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
  questions: QuizQuestion[];
  reward: {
    points: number;
    badgeId?: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
}

export interface UserProgress {
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  earnedBadges: string[];
  completedExercises: string[];
  completedQuizzes: string[];
  streakDays: number;
  lastActivityDate: string;
  statistics: {
    totalExercises: number;
    correctAnswers: number;
    totalAnswers: number;
    averageAccuracy: number;
  };
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  exerciseType: ExerciseType;
  data: any;
  reward: {
    points: number;
    badgeId?: string;
  };
  expiresAt: string;
}
