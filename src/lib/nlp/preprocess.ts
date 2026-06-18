/**
 * NLP preprocessing pipeline:
 *   raw text → lowercase → strip punctuation → tokenize → stopword removal → stem
 *
 * Each FAQ question and each incoming user question goes through this same
 * pipeline so that surface-form variations ("How do I cancel my plan?" vs
 * "can I cancel a subscription") collapse to comparable token sequences.
 */

import { porterStemmer } from './porter-stemmer';

/**
 * A curated English stopword list. Combines the classic NLTK English stopword
 * list with a few common chat-style fillers ("hi", "hello", "hey", "please",
 * "thanks", "ok", "okay", "yes", "no", "yea", "yeah").
 */
export const STOPWORDS = new Set<string>([
  // Classic NLTK English stopwords
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're",
  "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he',
  'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it',
  "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and',
  'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
  'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't',
  'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd',
  'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn',
  "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't",
  'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn',
  "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't",
  'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won',
  "won't", 'wouldn', "wouldn't",
  // Chat-style fillers
  'hi', 'hello', 'hey', 'yo', 'sup', 'please', 'pls', 'plz', 'thanks',
  'thank', 'thx', 'ty', 'ok', 'okay', 'k', 'sure', 'yeah', 'yea', 'yep',
  'nope', 'uh', 'um', 'like', 'kinda', 'sorta',
]);

const TOKEN_PATTERN = /[a-z0-9]+/g;

/** Tokenize, lowercase, strip punctuation in one pass. */
export function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  const matches = lower.match(TOKEN_PATTERN);
  return matches ?? [];
}

/** Apply stopword removal + Porter stemming to a raw token list. */
export function normalize(tokens: string[]): string[] {
  const out: string[] = [];
  for (const tok of tokens) {
    if (tok.length < 2) continue;
    if (STOPWORDS.has(tok)) continue;
    if (/^\d+$/.test(tok) && tok.length < 3) continue; // drop bare "1", "5"
    out.push(porterStemmer(tok));
  }
  return out;
}

/**
 * Full pipeline: raw text → normalized stemmed tokens.
 * Use this for both FAQ entries (offline) and incoming user questions (online).
 */
export function preprocess(text: string): string[] {
  return normalize(tokenize(text));
}
