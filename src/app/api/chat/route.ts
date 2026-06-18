import { NextResponse } from 'next/server';
import { answerQuestion, listCategories } from '@/lib/faq/engine';
import {
  CONFIDENCE_HIGH,
  CONFIDENCE_LOW,
  preprocess,
  type MatchResult,
} from '@/lib/nlp';

/**
 * POST /api/chat
 *
 * Body: { "message": "user question text" }
 * Response:
 *   {
 *     "reply": "string — the chatbot's response text",
 *     "matchedFaqId": "string | null",
 *     "confidence": "high | medium | low",
 *     "score": number,            // top cosine similarity
 *     "candidates": MatchResult[], // top-K matches with scores
 *     "tokens": string[]          // preprocessed query tokens, for debug UI
 *   }
 *
 * Matching strategy:
 *   1. Preprocess the query (tokenize → stopword removal → Porter stem).
 *   2. TF-IDF vectorize the query against the FAQ corpus's precomputed IDF.
 *   3. Take cosine similarity to every FAQ document.
 *   4. If top score ≥ 0.35, reply with that FAQ's answer directly (high).
 *      If top score ≥ 0.20, reply with the answer but mention there are
 *      other candidate matches (medium).
 *      Otherwise, surface a clarifying prompt listing 3 best candidates
 *      so the user can pick (low).
 */
export async function POST(req: Request) {
  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const message = (body.message ?? '').trim();
  if (!message) {
    return NextResponse.json(
      { error: 'Missing "message" field' },
      { status: 400 },
    );
  }

  const tokens = preprocess(message);
  if (tokens.length === 0) {
    return NextResponse.json({
      reply:
        "I couldn't pick out any keywords from your question. Could you rephrase it with a few more specifics? For example: 'How do I cancel my plan?'",
      matchedFaqId: null,
      confidence: 'low',
      score: 0,
      candidates: [] as MatchResult[],
      tokens: [] as string[],
      categories: listCategories(),
    });
  }

  const candidates = answerQuestion(message, 3);

  if (candidates.length === 0) {
    return NextResponse.json({
      reply:
        "I don't have any FAQs that match your question yet. Try browsing the FAQ library on the right, or rephrase with keywords like 'pricing', 'cancel', 'SSO', or 'Slack'.",
      matchedFaqId: null,
      confidence: 'low',
      score: 0,
      candidates: [],
      tokens,
      categories: listCategories(),
    });
  }

  const top = candidates[0];
  let reply: string;
  let confidence: 'high' | 'medium' | 'low';

  if (top.score >= CONFIDENCE_HIGH) {
    confidence = 'high';
    reply = top.faq.answer;
  } else if (top.score >= CONFIDENCE_LOW) {
    confidence = 'medium';
    reply =
      `${top.faq.answer}\n\n` +
      `_(This is my best guess — confidence: medium. If this isn't what you meant, take a look at the other candidates on the right.)_`;
  } else {
    confidence = 'low';
    const list = candidates
      .map((c, i) => `${i + 1}. ${c.faq.question}`)
      .join('\n');
    reply =
      `I'm not 100% sure which question you're asking. Here are the closest matches I found:\n\n${list}\n\n` +
      `Try rephrasing your question, or click one of the suggestions above to see its answer directly.`;
  }

  return NextResponse.json({
    reply,
    matchedFaqId: confidence === 'low' ? null : top.faq.id,
    confidence,
    score: Number(top.score.toFixed(4)),
    candidates: candidates.map((c) => ({
      faq: c.faq,
      score: Number(c.score.toFixed(4)),
      matchedTerms: c.matchedTerms,
    })),
    tokens,
    categories: listCategories(),
  });
}

/** Simple GET health-check that also reports the FAQ library size. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'CloudTask FAQ Chatbot API is running.',
    endpoints: { POST: '/api/chat' },
  });
}
