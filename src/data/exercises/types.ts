export interface CodeExerciseData {
  id: string;
  prompt: string;
  hints?: string[];
  acceptedAnswers: string[];
  usePattern?: boolean;
  patterns?: RegExp[];
  explanation: string;
  starterCode?: string;
}
