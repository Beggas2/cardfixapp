export interface Report {
  id: string;
  userId: string;
  contestId?: string;
  title: string;
  type: string;
  reportData: any;
  generatedAt: Date;
}

export interface GenerateReportRequest {
  contestId?: string;
  type: 'progress' | 'performance' | 'comparison' | 'detailed';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface GenerateReportResponse {
  report: Report;
}

export interface ListReportsResponse {
  reports: Report[];
}

export interface ProgressReportData {
  totalCards: number;
  reviewedCards: number;
  correctAnswers: number;
  accuracy: number;
  studyStreak: number;
  totalStudyTime: number;
  subjectProgress: {
    subjectName: string;
    totalCards: number;
    reviewedCards: number;
    accuracy: number;
  }[];
  dailyProgress: {
    date: string;
    cardsReviewed: number;
    timeSpent: number;
    accuracy: number;
  }[];
}
