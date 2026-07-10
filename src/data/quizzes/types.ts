export interface QuizQuestion {
  id: string;
  type: 'multiple' | 'boolean';
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation: string;
}
