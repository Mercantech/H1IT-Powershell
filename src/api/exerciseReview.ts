export interface ExerciseReviewRequest {
  exerciseId: string;
  prompt: string;
  studentAnswer: string;
  acceptedAnswers?: string[];
  explanation?: string;
  hint?: string;
}

export interface ExerciseReviewResponse {
  correct: boolean;
  feedback: string;
  source: 'ai' | 'local';
}

import { authFetch } from '../auth/authFetch';

export async function reviewExerciseWithAi(
  payload: ExerciseReviewRequest
): Promise<ExerciseReviewResponse> {
  const response = await authFetch('/api/exercise/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Kunne ikke hente AI-feedback.');
  }

  return response.json() as Promise<ExerciseReviewResponse>;
}
