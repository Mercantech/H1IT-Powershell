import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';
import { z } from 'zod';

const reviewSchema = z.object({
  exerciseId: z.string(),
  prompt: z.string().min(1),
  studentAnswer: z.string().min(1),
  acceptedAnswers: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  hint: z.string().optional(),
});

const aiResponseSchema = z.object({
  correct: z.boolean(),
  feedback: z.string().min(1),
});

const app = express();
const port = Number(process.env.PORT ?? 3000);
const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

app.use(cors({ origin: false }));
app.use(express.json({ limit: '32kb' }));

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/exercise/review', async (req, res) => {
  const ip = req.ip ?? 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'For mange forespørgsler. Prøv igen om et øjeblik.' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'AI-feedback er ikke konfigureret (mangler OPENAI_API_KEY).' });
    return;
  }

  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ugyldig forespørgsel.' });
    return;
  }

  const { exerciseId, prompt, studentAnswer, acceptedAnswers, explanation, hint } =
    parsed.data;

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `Du er en venlig og præcis PowerShell-underviser for elever på Serverautomatisering I (16862) — H1 IT / Infrastruktur og Cyber.
Evaluer elevens svar på dansk og giv konstruktiv feedback.

Regler:
- Accepter semantisk korrekte svar selvom parameterrækkefølge, mellemrum eller citationstegn varierer.
- Accepter gyldige aliaser og korte former hvis de er korrekte i PowerShell.
- Hvis svaret er næsten rigtigt, marker som correct=true og forklar eventuelle forbedringer.
- Hvis svaret er forkert, marker correct=false og forklar hvad der mangler — uden at afsløre hele facit med det samme.
- Hold feedback kort (2-4 sætninger), pædagogisk og opmuntrende.
- Svar KUN med valid JSON: {"correct": boolean, "feedback": "tekst på dansk"}`;

  const userPrompt = `Øvelse (id: ${exerciseId}):
${prompt}

Elevens svar:
${studentAnswer}

${acceptedAnswers?.length ? `Eksempler på acceptable svar (ikke nødvendigvis eneste løsning):\n${acceptedAnswers.map((a) => `- ${a}`).join('\n')}` : ''}
${explanation ? `\nFacit-forklaring (til din vurdering, del ikke ordret):\n${explanation}` : ''}
${hint ? `\nHint til øvelsen:\n${hint}` : ''}`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(502).json({ error: 'Tomt svar fra AI.' });
      return;
    }

    const json = JSON.parse(content) as unknown;
    const aiResult = aiResponseSchema.safeParse(json);
    if (!aiResult.success) {
      res.status(502).json({ error: 'Ugyldigt svarformat fra AI.' });
      return;
    }

    res.json({
      correct: aiResult.data.correct,
      feedback: aiResult.data.feedback,
      source: 'ai' as const,
    });
  } catch (error) {
    console.error('OpenAI review failed:', error);
    res.status(502).json({ error: 'Kunne ikke hente AI-feedback lige nu.' });
  }
});

app.listen(port, () => {
  console.log(`Exercise API listening on port ${port}`);
});
