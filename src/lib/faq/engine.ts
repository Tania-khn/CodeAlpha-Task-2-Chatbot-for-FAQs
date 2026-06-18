import { FAQ_DATASET } from './dataset';
import {
  trainVectorizer,
  type FaqEntry,
  type MatchResult,
  matchFaq,
} from '@/lib/nlp';

/**
 * A module-level singleton vectorizer state.
 *
 * We pre-train once on the FAQ dataset at first import. This is cheap
 * (~25 documents, vocabulary < 1000 terms) and lets every API request
 * share the same trained state without re-paying the training cost.
 */
let _state: ReturnType<typeof trainVectorizer> | null = null;

function getState() {
  if (!_state) _state = trainVectorizer(FAQ_DATASET);
  return _state;
}

export function listFaqs(): FaqEntry[] {
  return FAQ_DATASET;
}

export function listCategories(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const f of FAQ_DATASET) {
    if (!seen.has(f.category)) {
      seen.add(f.category);
      out.push(f.category);
    }
  }
  return out;
}

/**
 * Run the chatbot matching pipeline.
 * Returns the top-K FAQ matches with cosine-similarity scores and shared terms.
 */
export function answerQuestion(
  query: string,
  topK = 3,
): MatchResult[] {
  return matchFaq(query, getState(), topK);
}
