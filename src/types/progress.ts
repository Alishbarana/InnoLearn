 // src/types/progress.ts
export interface Activity {
  id: string;
  topic: string;
  score: number;
  date: string;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  icon: string;
}

export interface UserProgress {
  totalTopics: number;
  completedTopics: number;
  averageScore: number;
  streak: number;
  recentActivities: Activity[];
  achievements: Achievement[];
  weeklyProgress: number[];
}