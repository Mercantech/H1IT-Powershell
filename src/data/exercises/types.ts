export interface CodeExerciseData {
  id: string;
  prompt: string;
  hint?: string;
  acceptedAnswers: string[];
  usePattern?: boolean;
  patterns?: RegExp[];
  explanation: string;
  starterCode?: string;
}
