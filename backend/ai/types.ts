export interface ExtractRolesRequest {
  editalText: string;
}

export interface ExtractRolesResponse {
  roles: string[];
}

export interface GeneratePlanRequest {
  editalText: string;
  role: string;
}

export interface Subject {
  id: string;
  name: string;
  order: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  order: number;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  name: string;
  order: number;
  estimatedCount?: number;
}

export interface GeneratePlanResponse {
  subjects: Subject[];
}

export interface EstimateCardsRequest {
  subjects: Subject[];
}

export interface EstimateCardsResponse {
  subjects: Subject[];
}

export interface GenerateFlashcardsRequest {
  subjectName: string;
  topicName: string;
  subtopicName: string;
  quantity: number;
}

export interface Flashcard {
  question: string;
  answer: string;
  importanceRank: number;
}

export interface GenerateFlashcardsResponse {
  flashcards: Flashcard[];
}
