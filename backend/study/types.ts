export type CardStatus = "NOT_SEEN" | "WRONG" | "DIFFICULT" | "GOOD";

export interface Subject {
  id: string;
  name: string;
  order: number;
  contestId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  name: string;
  order: number;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtopic {
  id: string;
  name: string;
  order: number;
  estimatedCount: number;
  topicId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  importanceRank: number;
  subtopicId: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  contestId: string;
  flashcardId: string;
  status: CardStatus;
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate?: Date;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudyPlanRequest {
  contestId: string;
  subjects: {
    name: string;
    order: number;
    topics: {
      name: string;
      order: number;
      subtopics: {
        name: string;
        order: number;
        estimatedCount?: number;
      }[];
    }[];
  }[];
}

export interface StudyPlanResponse {
  subjects: (Subject & {
    topics: (Topic & {
      subtopics: Subtopic[];
    })[];
  })[];
}

export interface GenerateFlashcardsRequest {
  subtopicId: string;
  flashcards: {
    question: string;
    answer: string;
    importanceRank: number;
  }[];
}

export interface ReviewCardRequest {
  flashcardId: string;
  rating: CardStatus;
}

export interface TodaysCardsResponse {
  cards: (UserProgress & {
    flashcard: Flashcard;
  })[];
}
