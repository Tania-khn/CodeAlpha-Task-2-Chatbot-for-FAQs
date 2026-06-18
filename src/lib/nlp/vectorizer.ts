/**
 * TF-IDF vectorizer + cosine similarity matcher.
 *
 * Pipeline:
 *   1. Build a vocabulary across all FAQ documents.
 *   2. Compute IDF for each term using the smoothed formula
 *        idf(t) = ln( (1 + N) / (1 + df(t)) ) + 1
 *      (the +1 smoothing prevents division-by-zero and matches sklearn's
 *      `TfidfVectorizer(smooth_idf=True)`.)
 *   3. For each FAQ doc, compute a TF-IDF vector with L2 normalization.
 *   4. At query time, compute the query's TF-IDF vector and return the cosine
 *      similarity (which, after L2 normalization, is just the dot product).
 *
 * Cosine similarity is the right metric here because FAQ questions are short
 * (sparse vectors) and we care about the *angle* between term distributions,
 * not their magnitude.
 */

import { preprocess } from './preprocess';

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords?: string[];
}

export interface MatchResult {
  faq: FaqEntry;
  score: number; // cosine similarity, 0..1
  matchedTerms: string[]; // terms shared with the query (for explainability)
}

interface VectorizerState {
  vocabulary: Map<string, number>; // term -> index
  idf: Float64Array; // idf per term index
  docVectors: Float64Array[]; // L2-normalized TF-IDF vectors per FAQ
  docTokenSets: Set<string>[]; // token set per FAQ, for matchedTerms reporting
  faqs: FaqEntry[];
}

/**
 * Compute a term-frequency map for a token list.
 * Returns a Map<term, count>.
 */
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

/** Build vocabulary + IDF from a corpus of token lists. */
function buildVocabulary(corpusTokens: string[][]): {
  vocabulary: Map<string, number>;
  idf: Float64Array;
} {
  const df = new Map<string, number>();
  for (const tokens of corpusTokens) {
    const seen = new Set(tokens);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const N = corpusTokens.length;
  const vocabulary = new Map<string, number>();
  const idfArr: number[] = [];
  let idx = 0;
  for (const [term, dfreq] of df) {
    vocabulary.set(term, idx);
    // smoothed IDF, sklearn-style
    const idf = Math.log((1 + N) / (1 + dfreq)) + 1;
    idfArr[idx] = idf;
    idx++;
  }
  return { vocabulary, idf: Float64Array.from(idfArr) };
}

/** Compute an L2-normalized TF-IDF vector from tokens, given vocab + idf. */
function vectorize(
  tokens: string[],
  vocabulary: Map<string, number>,
  idf: Float64Array,
): { vector: Float64Array; tokenSet: Set<string> } {
  const vec = new Float64Array(vocabulary.size);
  const tf = termFrequency(tokens);
  for (const [term, count] of tf) {
    const idx = vocabulary.get(term);
    if (idx === undefined) continue;
    vec[idx] = count * idf[idx];
  }
  // L2 normalize
  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return { vector: vec, tokenSet: new Set(tokens) };
}

/**
 * Train a TF-IDF vectorizer over a FAQ corpus.
 * Training is cheap (O(sum of tokens)) and should be done once at startup.
 */
export function trainVectorizer(faqs: FaqEntry[]): VectorizerState {
  // Preprocess every FAQ question. If keywords are supplied, fold them in
  // (they act as extra "anchor" tokens that boost matching for related
  // surface forms).
  const corpusTokens = faqs.map((f) => {
    const qTokens = preprocess(f.question);
    const kTokens = (f.keywords ?? []).flatMap((k) => preprocess(k));
    return [...qTokens, ...kTokens];
  });

  const { vocabulary, idf } = buildVocabulary(corpusTokens);

  const docVectors: Float64Array[] = [];
  const docTokenSets: Set<string>[] = [];
  for (const tokens of corpusTokens) {
    const { vector, tokenSet } = vectorize(tokens, vocabulary, idf);
    docVectors.push(vector);
    docTokenSets.push(tokenSet);
  }

  return { vocabulary, idf, docVectors, docTokenSets, faqs };
}

/**
 * Match a user question against the trained corpus.
 * Returns the top-K FAQ entries sorted by descending cosine similarity.
 */
export function matchFaq(
  query: string,
  state: VectorizerState,
  topK = 3,
): MatchResult[] {
  const qTokens = preprocess(query);
  if (qTokens.length === 0) return [];
  const { vector: qVec, tokenSet: qTokenSet } = vectorize(
    qTokens,
    state.vocabulary,
    state.idf,
  );

  const results: MatchResult[] = [];
  for (let i = 0; i < state.docVectors.length; i++) {
    const dv = state.docVectors[i];
    // cosine similarity = dot product (both vectors are L2-normalized)
    let dot = 0;
    for (let j = 0; j < qVec.length; j++) dot += qVec[j] * dv[j];
    if (dot <= 0) continue;
    // Build matchedTerms: tokens shared between query and FAQ.
    const shared: string[] = [];
    for (const t of qTokenSet) if (state.docTokenSets[i].has(t)) shared.push(t);

    results.push({
      faq: state.faqs[i],
      score: dot,
      matchedTerms: shared,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

/**
 * Decide whether the top match is "confident enough" to answer with directly.
 * Below the threshold, the chatbot should fall back to a clarifying prompt
 * that lists candidate FAQs.
 *
 * Empirically, on short FAQ questions, cosine ≥ 0.35 indicates a strong match
 * and ≥ 0.20 indicates a reasonable candidate worth surfacing.
 */
export const CONFIDENCE_HIGH = 0.35;
export const CONFIDENCE_LOW = 0.2;
