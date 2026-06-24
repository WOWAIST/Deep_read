export interface Document {
  url: string;
  title: string;
  content: string;
}

export interface DocumentChunk {
  id: string;
  order: number;
  content: string;
  heading?: string;
}

export interface Vocabulary {
  term: string;
  meaning: string;
  practicalExample: string;
}

export interface LearningQuestion {
  question: string;
  intent: string;
  difficulty: number;
}

export interface EvaluationResult {
  understood: boolean;
  level: "correct" | "partial" | "incorrect";
  feedback: string;
  nextQuestion?: string;
}

export interface AnalyzeResponse {
  chunks: DocumentChunk[];
  vocabulary: Vocabulary[];
}

export interface QuestionResponse {
  questions: LearningQuestion[];
}

export interface SummaryResponse {
  keyConcepts: string[];
  mustKnowTerms: Vocabulary[];
  practicalScenarios: string[];
  recommendedDocs: string[];
}
