'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  User,
  BookOpen,
  RefreshCw,
  ChevronDown,
  ArrowRight,
  MessageSquare,
  Zap,
  Shield,
  Search,
  Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { FAQ_DATASET } from '@/lib/faq/dataset';
import { BrandLockup, BrandLogo } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';

// ---------- Types ----------
interface Candidate {
  faq: { id: string; question: string; answer: string; category: string };
  score: number;
  matchedTerms: string[];
}
interface ChatResponse {
  reply: string;
  matchedFaqId: string | null;
  confidence: 'high' | 'medium' | 'low';
  score: number;
  candidates: Candidate[];
  tokens: string[];
  categories: string[];
}
interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  confidence?: 'high' | 'medium' | 'low';
  score?: number;
  candidates?: Candidate[];
  tokens?: string[];
}

// ---------- Static FAQ dataset for the side library ----------
const ALL_FAQS = FAQ_DATASET;
const ALL_CATEGORIES = Array.from(new Set(ALL_FAQS.map((f) => f.category)));

const SUGGESTED_QUESTIONS = [
  'How do I cancel my subscription?',
  'Does CloudTask integrate with Slack?',
  'Is my data encrypted?',
  'Can I get a free trial?',
  'How do I invite team members?',
  'Is there a mobile app?',
];

const FEATURES = [
  {
    icon: Search,
    title: 'TF-IDF + Cosine Similarity',
    description:
      'Every question is tokenized, stopword-filtered, Porter-stemmed, then matched against the FAQ corpus using L2-normalized TF-IDF vectors. No black-box models — fully transparent matching you can inspect.',
  },
  {
    icon: Zap,
    title: 'Sub-10ms Responses',
    description:
      'The vectorizer trains once at startup over 26 FAQs. Each query is a single sparse dot-product, so answers come back instantly — even on a cold edge worker.',
  },
  {
    icon: MessageSquare,
    title: 'Confidence-Aware Replies',
    description:
      'Each reply ships with a cosine score and a high/medium/low confidence badge. When the bot is unsure, it surfaces 2–3 candidate FAQs so the user can self-route instead of getting a wrong answer.',
  },
  {
    icon: Shield,
    title: 'Zero External NLP Deps',
    description:
      'The entire NLP pipeline — tokenizer, stopword list, Porter stemmer, TF-IDF, cosine — is hand-rolled TypeScript. No Python, no NLTK, no spaCy, no network calls to an inference API.',
  },
];

const STATS = [
  { label: 'FAQs indexed', value: String(ALL_FAQS.length) },
  { label: 'Categories', value: String(ALL_CATEGORIES.length) },
  { label: 'NLP deps', value: '0' },
  { label: 'Avg latency', value: '<10ms' },
];

// ---------- Helpers ----------
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const map = {
    high: {
      label: 'High confidence',
      className:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    medium: {
      label: 'Medium confidence',
      className:
        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    low: {
      label: 'Low confidence',
      className:
        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
  } as const;
  const c = map[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        c.className,
      )}
    >
      <Sparkles className="h-3 w-3" />
      {c.label}
    </span>
  );
}

// ---------- Main page ----------
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: 'bot',
      text:
        "Hi! I'm the CloudTask FAQ assistant. Ask me anything about pricing, features, integrations, security, or support — I'll find the closest match in our FAQ library.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFaqs, setShowFaqs] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setInput('');
      setLoading(true);

      const userMsg: Message = { id: uid(), role: 'user', text: trimmed };
      setMessages((m) => [...m, userMsg]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ChatResponse = await res.json();

        const botMsg: Message = {
          id: uid(),
          role: 'bot',
          text: data.reply,
          confidence: data.confidence,
          score: data.score,
          candidates: data.candidates,
          tokens: data.tokens,
        };
        setMessages((m) => [...m, botMsg]);
      } catch (err) {
        const botMsg: Message = {
          id: uid(),
          role: 'bot',
          text:
            "Sorry, something went wrong reaching the chatbot backend. Please try again in a moment.",
        };
        setMessages((m) => [...m, botMsg]);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: uid(),
        role: 'bot',
        text: 'Conversation cleared. What would you like to know about CloudTask?',
      },
    ]);
  };

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const filteredFaqs =
    selectedCategory === 'All'
      ? ALL_FAQS
      : ALL_FAQS.filter((f) => f.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* ---------- Header ---------- */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:opacity-90 transition-opacity"
            aria-label="Back to top"
          >
            <BrandLockup size={36} showTagline />
          </button>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToChat}
              className="gap-1.5 hidden sm:inline-flex"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Try Chatbot
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ---------- Landing hero ---------- */}
      <section className="relative overflow-hidden">
        {/* Decorative background blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-80 w-80 rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 dark:bg-cyan-500/5 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <BrandLogo size={72} className="shadow-lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Badge
              variant="outline"
              className="mb-4 gap-1.5 px-3 py-1 text-[11px] font-medium border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/5"
            >
              <Sparkles className="h-3 w-3" />
              NLP-powered · TF-IDF · Cosine Similarity
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]"
          >
            Meet{' '}
            <span
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #0d9488 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              CloudTask
            </span>{' '}
            FAQ Assistant
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            A chatbot that actually understands what you're asking. It
            tokenizes, stems, and vectorizes your question against a curated
            FAQ library — then surfaces the best match with a transparent
            confidence score.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              onClick={scrollToChat}
              className="gap-2 h-12 px-6 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md"
            >
              <MessageSquare className="h-4 w-4" />
              Launch Chatbot
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                window.open(
                  'https://github.com/vercel-labs/agent-browser',
                  '_blank',
                )
              }
              className="gap-2 h-12 px-6"
            >
              <Github className="h-4 w-4" />
              View Source
            </Button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/60 bg-background/60 backdrop-blur px-3 py-4"
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- Features section ---------- */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Built on a transparent NLP pipeline
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            No black-box model in the middle. Every step from your question to
            the answer is inspectable, debuggable, and explainable.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-border/60 bg-background/60 backdrop-blur p-5 sm:p-6 hover:border-emerald-500/40 hover:shadow-md transition-all"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-600/15 dark:from-emerald-500/20 dark:to-teal-600/20 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Chat section ---------- */}
      <section
        ref={chatSectionRef}
        className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-8 scroll-mt-20"
      >
        <div className="text-center mb-6">
          <Badge
            variant="outline"
            className="mb-3 gap-1.5 text-[11px] border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
          >
            <MessageSquare className="h-3 w-3" />
            Live Demo
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Try the chatbot
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask in your own words — the bot will find the closest FAQ.
          </p>
        </div>

        {/* Chat + Library grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* ===== Chat column ===== */}
          <section className="flex flex-col rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden min-h-[600px]">
            {/* Chat toolbar */}
            <div className="border-b border-border/60 px-4 py-2.5 flex items-center justify-between bg-background/80 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-medium">FAQ Assistant</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 ml-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  online
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetChat}
                className="gap-1.5 h-8"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">Reset</span>
              </Button>
            </div>

            {/* Message area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[calc(100vh-360px)] min-h-[400px]"
            >
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    onPickSuggestion={send}
                  />
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggested questions */}
            {messages.length <= 1 && (
              <div className="px-4 sm:px-6 pb-2 flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent hover:border-emerald-400 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <div className="border-t border-border/60 p-3 sm:p-4 bg-background">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask a question — e.g. 'Can I cancel my plan anytime?'"
                  rows={1}
                  className="min-h-[44px] max-h-32 resize-none"
                  disabled={loading}
                />
                <Button
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-11 w-11 shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
                Press <kbd className="font-mono">Enter</kbd> to send ·
                <kbd className="font-mono ml-1">Shift+Enter</kbd> for a newline
              </p>
            </div>
          </section>

          {/* ===== FAQ library column ===== */}
          <aside
            className={cn(
              'rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden flex flex-col',
              showFaqs ? 'block' : 'hidden',
              'lg:block',
            )}
          >
            <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold">FAQ Library</h2>
              <Badge variant="secondary" className="ml-auto">
                {filteredFaqs.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFaqs((v) => !v)}
                className="gap-1.5 lg:hidden h-7"
              >
                {showFaqs ? 'Hide' : 'Show'}
              </Button>
            </div>

            {/* Category filter */}
            <div className="px-4 py-3 border-b border-border/60 flex flex-wrap gap-1.5">
              {['All', ...ALL_CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={cn(
                    'text-[11px] px-2 py-1 rounded-full border transition-colors',
                    selectedCategory === c
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-background border-border hover:bg-accent',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <ScrollArea className="flex-1 max-h-[calc(100vh-360px)]">
              <Accordion type="multiple" className="px-2 py-2">
                {filteredFaqs.map((f) => (
                  <AccordionItem
                    key={f.id}
                    value={f.id}
                    className="border-border/40"
                  >
                    <AccordionTrigger className="text-sm px-2 hover:bg-accent/50 rounded-md text-left">
                      <span className="line-clamp-2">{f.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground px-2 pb-3 leading-relaxed">
                      {f.answer}
                      <div className="mt-2">
                        <Badge variant="outline" className="text-[10px]">
                          {f.category}
                        </Badge>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </aside>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="mt-auto border-t border-border/60 bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BrandLockup size={28} showTagline />
            <p className="text-[11px] text-muted-foreground">
              Built with Next.js 16 · Pure-TS NLP pipeline (Porter stemmer +
              TF-IDF + cosine similarity)
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-border/40 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
            <span>
              {ALL_FAQS.length} FAQs across {ALL_CATEGORIES.length} categories
            </span>
            <span>© {new Date().getFullYear()} CloudTask. Demo project.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------- Message bubble ----------
function MessageBubble({
  message,
  onPickSuggestion,
}: {
  message: Message;
  onPickSuggestion: (text: string) => void;
}) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
          isUser
            ? 'bg-slate-200 dark:bg-slate-800'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600',
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-slate-700 dark:text-slate-200" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      <div
        className={cn(
          'max-w-[85%] sm:max-w-[78%] space-y-2',
          isUser && 'items-end flex flex-col',
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-tr-sm'
              : 'bg-muted rounded-tl-sm',
          )}
        >
          {message.text}
        </div>

        {/* Bot metadata: confidence + score + matched terms */}
        {!isUser && message.confidence && (
          <div className="flex flex-wrap items-center gap-2 px-1">
            <ConfidenceBadge level={message.confidence} />
            {typeof message.score === 'number' && message.score > 0 && (
              <span className="text-[10px] text-muted-foreground font-mono">
                cosine = {message.score.toFixed(3)}
              </span>
            )}
            {message.tokens && message.tokens.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                tokens: {message.tokens.slice(0, 6).join(', ')}
                {message.tokens.length > 6 ? '…' : ''}
              </span>
            )}
          </div>
        )}

        {/* Alternative candidates (low/medium confidence) */}
        {!isUser &&
          message.candidates &&
          message.candidates.length > 1 &&
          message.confidence !== 'high' && (
            <div className="px-1 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                Other candidates
              </p>
              <div className="flex flex-col gap-1">
                {message.candidates.slice(1).map((c) => (
                  <button
                    key={c.faq.id}
                    onClick={() => onPickSuggestion(c.faq.question)}
                    className="text-left text-xs px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-accent hover:border-emerald-400 transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="line-clamp-1">{c.faq.question}</span>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {c.score.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    </motion.div>
  );
}
