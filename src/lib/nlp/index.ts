export { preprocess, tokenize, normalize, STOPWORDS } from './preprocess';
export { porterStemmer } from './porter-stemmer';
export {
  trainVectorizer,
  matchFaq,
  CONFIDENCE_HIGH,
  CONFIDENCE_LOW,
  type FaqEntry,
  type MatchResult,
} from './vectorizer';
