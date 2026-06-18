// Database client stub — not used by the FAQ chatbot.
// The chatbot stores FAQs as a static in-memory dataset (see src/lib/faq/dataset.ts)
// and runs NLP matching purely in TypeScript, so Prisma/SQLite are not required.
//
// If you want to add persistent chat history or custom FAQs later, install
// `prisma` + `@prisma/client`, restore the original PrismaClient code, and run
// `bun run db:push`.

export const db = null;
