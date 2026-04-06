import { useState, useEffect, useCallback } from 'react';
import type { UserProgress, Badge } from '@/lib/index';

const STORAGE_KEY = 'bloxvocab_progress';

const POINTS_PER_LEVEL = 1000;

const DEFAULT_PROGRESS: UserProgress = {
  level: 1,
  totalPoints: 0,
  pointsToNextLevel: POINTS_PER_LEVEL,
  earnedBadges: [],
  completedExercises: [],
  completedQuizzes: [],
  streakDays: 0,
  lastActivityDate: new Date().toISOString().split('T')[0],
  statistics: {
    totalExercises: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    averageAccuracy: 0,
  },
};

const loadProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PROGRESS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
  return DEFAULT_PROGRESS;
};

const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

const calculateLevel = (points: number): { level: number; pointsToNext: number } => {
  const level = Math.floor(points / POINTS_PER_LEVEL) + 1;
  const pointsToNext = (level * POINTS_PER_LEVEL) - points;
  return { level, pointsToNext };
};

const updateStreak = (progress: UserProgress): UserProgress => {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = new Date(progress.lastActivityDate);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  let streakDays = progress.streakDays;
  if (diffDays === 0) {
    streakDays = progress.streakDays;
  } else if (diffDays === 1) {
    streakDays = progress.streakDays + 1;
  } else {
    streakDays = 1;
  }

  return {
    ...progress,
    streakDays,
    lastActivityDate: today,
  };
};

export const useGameProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const addPoints = useCallback((points: number) => {
    setProgress((prev) => {
      const newTotalPoints = prev.totalPoints + points;
      const { level, pointsToNext } = calculateLevel(newTotalPoints);
      const updated = updateStreak({
        ...prev,
        totalPoints: newTotalPoints,
        level,
        pointsToNextLevel: pointsToNext,
      });
      return updated;
    });
  }, []);

  const unlockBadge = useCallback((badgeId: string) => {
    setProgress((prev) => {
      if (prev.earnedBadges.includes(badgeId)) {
        return prev;
      }
      const updated = updateStreak({
        ...prev,
        earnedBadges: [...prev.earnedBadges, badgeId],
      });
      return updated;
    });
  }, []);

  const completeExercise = useCallback((exerciseId: string, correct: boolean) => {
    setProgress((prev) => {
      const alreadyCompleted = prev.completedExercises.includes(exerciseId);
      const newCompletedExercises = alreadyCompleted
        ? prev.completedExercises
        : [...prev.completedExercises, exerciseId];

      const newTotalExercises = alreadyCompleted
        ? prev.statistics.totalExercises
        : prev.statistics.totalExercises + 1;

      const newTotalAnswers = prev.statistics.totalAnswers + 1;
      const newCorrectAnswers = correct
        ? prev.statistics.correctAnswers + 1
        : prev.statistics.correctAnswers;
      const newAverageAccuracy = newTotalAnswers > 0
        ? (newCorrectAnswers / newTotalAnswers) * 100
        : 0;

      const updated = updateStreak({
        ...prev,
        completedExercises: newCompletedExercises,
        statistics: {
          totalExercises: newTotalExercises,
          correctAnswers: newCorrectAnswers,
          totalAnswers: newTotalAnswers,
          averageAccuracy: newAverageAccuracy,
        },
      });
      return updated;
    });
  }, []);

  const completeQuiz = useCallback((quizId: string, score: number, total: number) => {
    setProgress((prev) => {
      const alreadyCompleted = prev.completedQuizzes.includes(quizId);
      const newCompletedQuizzes = alreadyCompleted
        ? prev.completedQuizzes
        : [...prev.completedQuizzes, quizId];

      const newTotalAnswers = prev.statistics.totalAnswers + total;
      const newCorrectAnswers = prev.statistics.correctAnswers + score;
      const newAverageAccuracy = newTotalAnswers > 0
        ? (newCorrectAnswers / newTotalAnswers) * 100
        : 0;

      const updated = updateStreak({
        ...prev,
        completedQuizzes: newCompletedQuizzes,
        statistics: {
          ...prev.statistics,
          correctAnswers: newCorrectAnswers,
          totalAnswers: newTotalAnswers,
          averageAccuracy: newAverageAccuracy,
        },
      });
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isBadgeUnlocked = useCallback(
    (badgeId: string): boolean => {
      return progress.earnedBadges.includes(badgeId);
    },
    [progress.earnedBadges]
  );

  const isExerciseCompleted = useCallback(
    (exerciseId: string): boolean => {
      return progress.completedExercises.includes(exerciseId);
    },
    [progress.completedExercises]
  );

  const isQuizCompleted = useCallback(
    (quizId: string): boolean => {
      return progress.completedQuizzes.includes(quizId);
    },
    [progress.completedQuizzes]
  );

  return {
    progress,
    addPoints,
    unlockBadge,
    completeExercise,
    completeQuiz,
    resetProgress,
    isBadgeUnlocked,
    isExerciseCompleted,
    isQuizCompleted,
  };
};
