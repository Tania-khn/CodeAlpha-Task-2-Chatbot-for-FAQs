# CodeAlpha-Task-2-Chatbot-for-FAQs
**FAQ Chatbot** is an AI-powered assistant designed to answer frequently asked questions instantly and accurately. It helps users find information quickly, improving customer support and enhancing the overall user experience.

# CloudTask FAQ Assistant

An NLP-powered FAQ chatbot built with **Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui**. The chatbot uses a fully self-contained NLP pipeline (Porter stemmer + TF-IDF + cosine similarity) — **zero external NLP dependencies** (no NLTK, no spaCy, no Python).

## Features

- **Pure-TS NLP pipeline**: tokenizer, stopword removal, Porter stemmer, TF-IDF vectorizer, cosine similarity — all hand-rolled in `src/lib/nlp/`
- **26 FAQs across 6 categories**: Pricing, Account, Features, Integrations, Security, Support
- **Confidence-aware replies**: high (≥0.35 cosine) / medium (≥0.20) / low (fallback to candidates)
- **Landing page** with brand logo, hero, features grid, and stats strip
- **Dark / Light / System theme toggle** with localStorage persistence (via `next-themes`)
- **Live FAQ library** side panel with category filter + accordion
- **Responsive**: mobile-first, collapses cleanly on small screens
- **Framer Motion** animations for message bubbles and feature cards

## Tech Stack

| Layer       | Choice                                  |
| ----------- | --------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack)      |
| Language    | TypeScript 5                            |
| Styling     | Tailwind CSS 4 + shadcn/ui              |
| Theme       | next-themes                             |
| Animation   | framer-motion                           |
| Icons       | lucide-react                            |
| NLP         | Hand-rolled TypeScript (Porter, TF-IDF) |

## Prerequisites

- **Node.js 18.18+** (or 20+, 22+) — [download here](https://nodejs.org/)
- **npm 10+** (ships with Node) — or `bun` / `pnpm` if you prefer
- **VSCode** with recommended extensions:
  - [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
  - [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) — optional
  - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Setup & Run in VSCode

### 1. Install dependencies

Using **npm** (recommended for first-time setup):

```bash
npm install
```

Or using **bun** (much faster, but needs [bun installed](https://bun.sh/)):

```bash
bun install
```

Or using **pnpm**:

```bash
pnpm install
```

### 2. Start the dev server

```bash
npm run dev
```

You should see:

```
▲ Next.js 16.x (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 245ms
```

### 3. Open in browser

Visit **http://localhost:3000** — the landing page loads with the chatbot below.

## Project Structure

```
cloudtask-faq-chatbot/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # POST /api/chat — FAQ matching endpoint
│   │   ├── globals.css          # Tailwind + theme tokens (light/dark)
│   │   ├── layout.tsx           # Root layout with ThemeProvider
│   │   └── page.tsx             # Landing page + chat UI
│   ├── components/
│   │   ├── brand.tsx            # BrandLogo + BrandLockup
│   │   ├── theme-provider.tsx   # next-themes wrapper
│   │   ├── theme-toggle.tsx     # Light/Dark/System cycle button
│   │   └── ui/                  # shadcn/ui components
│   └── lib/
│       ├── faq/
│       │   ├── dataset.ts       # 26 FAQs (edit me to customize!)
│       │   └── engine.ts        # Trains TF-IDF, exposes answerQuestion()
│       ├── nlp/
│       │   ├── porter-stemmer.ts # Porter (1980) 5-step algorithm
│       │   ├── preprocess.ts     # tokenize → stopwords → stem
│       │   ├── vectorizer.ts     # TF-IDF + cosine similarity
│       │   └── index.ts
│       └── utils.ts
├── public/
│   ├── logo.svg
│   └── robots.txt
├── prisma/schema.prisma         # Not used by chatbot (kept for future)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── eslint.config.mjs
├── components.json              # shadcn/ui config
└── README.md
```

## How the NLP Matching Works

When a user asks "How do I reset my password?":

1. **Tokenize** → `["how", "do", "i", "reset", "my", "password"]`
2. **Remove stopwords** → `["reset", "password"]`
3. **Porter stem** → `["reset", "password"]` (already stems)
4. **TF-IDF vectorize** → L2-normalized vector over the FAQ corpus vocabulary
5. **Cosine similarity** vs every FAQ document vector → top match: `password-reset` FAQ with score **0.765**
6. **Confidence**: ≥0.35 = high → reply directly with the FAQ answer

The chatbot also surfaces:
- Cosine score on every reply
- Matched terms (shared tokens between query and FAQ)
- Alternative candidates when confidence is medium/low

## Customizing the FAQs

Edit `src/lib/faq/dataset.ts` and add your own entries:

```typescript
{
  id: 'my-new-faq',
  category: 'My Category',
  question: 'What is the answer to life?',
  answer: '42.',
  keywords: ['meaning', 'universe', 'everything'],  // optional anchor terms
}
```

The TF-IDF vectorizer retrains automatically on next server start.

## Available Scripts

| Command           | Action                                  |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Start dev server at `localhost:3000`    |
| `npm run build`   | Production build to `.next/`            |
| `npm run start`   | Run the production build                |
| `npm run lint`    | Run ESLint                              |


## License

MIT — free to use, modify, and distribute. Built as a demo by the Z.ai team.

## Credits

- NLP pipeline: hand-rolled TypeScript implementation of Porter (1980) stemmer and TF-IDF
- UI components: [shadcn/ui](https://ui.shadcn.com/) (New York style)
- Icons: [lucide-react](https://lucide.dev/)
- Built with [Next.js 16](https://nextjs.org/)

