# ResumeAI — AI-Powered Resume Optimizer

> **English** | [简体中文](#简体中文)

An AI-powered resume optimization platform that enhances your resume to match job descriptions and beat ATS filters — **without fabricating any experiences, skills, or achievements**.

---

## ✨ Features

- 🎯 **ATS Keyword Optimization** — Extract JD keywords and integrate them naturally
- ✅ **Zero Fabrication Policy** — Only enhances existing content, never invents
- 📊 **Match Score Analysis** — Before/after percentage score with keyword breakdown
- 🔄 **Side-by-Side Diff View** — Every change explained with a reason
- 📄 **PDF Export** — Download professionally formatted PDF
- 🤖 **Claude AI + OpenAI Fallback** — Best-in-class language models
- 🎭 **Demo Mode** — Works without API keys for development

---

## 🏗️ Architecture

```
resume-optimizer/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── page.tsx              # Landing page
│   │   ├── optimize/page.tsx     # Main optimization flow
│   │   ├── dashboard/page.tsx    # User history
│   │   ├── result/[id]/page.tsx  # View saved result
│   │   └── api/
│   │       ├── optimize/         # Core optimization pipeline
│   │       ├── parse-resume/     # PDF text extraction
│   │       ├── parse-jd/         # JD text/URL parsing
│   │       └── generate-pdf/     # PDF generation
│   ├── components/               # React components
│   │   ├── ui/                   # Button, Card, FileUpload, Badge, Modal, Loading
│   │   ├── layout/               # Header, Footer, Sidebar
│   │   ├── JDInput.tsx           # JD paste/URL input
│   │   ├── ResumeUpload.tsx      # PDF upload
│   │   ├── OptimizationResult.tsx # Diff view + download
│   │   └── KeywordHighlight.tsx  # Keyword visualization
│   ├── lib/
│   │   ├── ai/                   # LangChain + Claude/OpenAI
│   │   │   ├── chains/           # jd-analyzer, resume-optimizer, quality-checker
│   │   │   ├── models/           # claude, openai, index
│   │   │   └── prompts/          # Carefully crafted prompts
│   │   ├── pdf/                  # parser (pdf-parse) + generator (@react-pdf)
│   │   ├── db/prisma.ts          # Prisma client singleton
│   │   ├── auth/options.ts       # NextAuth config
│   │   ├── scraper/linkedin.ts   # URL scraping
│   │   └── utils/                # keywords, diff
│   ├── hooks/                    # useOptimization, useFileUpload
│   └── types/                    # jd, resume, optimization
├── prisma/schema.prisma          # DB schema (User, Optimization)
└── public/logo.svg
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd resume-optimizer
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

### 3. Demo Mode (No API keys needed)

```bash
# Set in .env.local:
NEXT_PUBLIC_DEMO_MODE=true
npm run dev
```

### 4. Production Setup

```bash
# Set in .env.local:
ANTHROPIC_API_KEY=your_key
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=random_secret
# etc.

npm run db:push      # Push schema to DB
npm run db:generate  # Generate Prisma client
npm run dev
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| AI | LangChain.js + Anthropic Claude (primary), OpenAI GPT-4o (fallback) |
| PDF Read | pdf-parse |
| PDF Generate | @react-pdf/renderer |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Auth | NextAuth.js (Google + GitHub OAuth) |
| Storage | Supabase Storage (optional, for PDF persistence) |
| Deployment | Vercel |

---

## 🤖 AI Optimization Rules

The AI strictly follows these rules when optimizing:

**✅ ALLOWED:**
- Replace weak verbs with stronger JD-aligned verbs (`"worked on"` → `"engineered"`)
- Integrate JD keywords naturally where experience already exists
- Adjust phrasing to match JD terminology
- Reorder bullets to prioritize JD-relevant content
- Improve clarity and conciseness

**❌ NEVER:**
- Add technologies not mentioned in the original resume
- Fabricate metrics, numbers, or percentages
- Invent projects or responsibilities
- Change job titles, company names, or dates
- Add certifications or education not present

---

## 📋 Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run db:push      # Push Prisma schema to DB
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

---

## 🌐 Deployment

### Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables Required

See `.env.example` for all required variables.

---

## 简体中文

### AI 驱动的简历优化平台

本项目是一个基于 Next.js 15 + TypeScript + Tailwind CSS 构建的 AI 简历优化平台，主要功能：

- 输入职位描述（JD）或 LinkedIn 链接
- 上传简历 PDF
- 使用 Claude AI 优化简历动词/短语以匹配 JD 关键词
- **绝不捏造经历、技能或成就**
- 展示修改前后的差异对比
- 生成可下载的优化后 PDF

### 快速开始

```bash
npm install
cp .env.example .env.local
# 设置 NEXT_PUBLIC_DEMO_MODE=true 可在无 API Key 情况下演示
npm run dev
```

---

## License

MIT
