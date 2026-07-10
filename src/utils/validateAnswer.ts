export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/;\s*$/, '');
}

export function validateAnswer(
  input: string,
  acceptedAnswers: string[],
  caseInsensitive = true
): boolean {
  const normalized = normalizeAnswer(input);
  return acceptedAnswers.some((answer) => {
    const normalizedAnswer = normalizeAnswer(answer);
    return caseInsensitive
      ? normalized.toLowerCase() === normalizedAnswer.toLowerCase()
      : normalized === normalizedAnswer;
  });
}

export function validatePattern(input: string, patterns: RegExp[]): boolean {
  const normalized = normalizeAnswer(input);
  return patterns.some((pattern) => pattern.test(normalized));
}
