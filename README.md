# LEND (Lending Efficiency through Networked Data)

LEND is a **Progressive Web App (PWA)** designed specifically for private micro-lenders. It digitizes the entire loan lifecycle – from borrower registration and loan creation to payment tracking and profit reporting. The system allows lenders to record payments instantly and provides real-time financial insights.

## Final Project Submission

This project is submitted for the following subjects:

- **Software Testing**
- **Software Component Design**
- **Software Requirements Specification**
- **Software Engineering Project Management**

**Submitted by BSSE-2 Team Cortisol:**

- **Venz Onver Bidaure** (Project Manager)
- **Gian Gamir Umadhay**
- **Sophia Marielle C. Mendoza**

**Live Demo:** [https://loan-business-manager-three.vercel.app](https://loan-business-manager-three.vercel.app)

---

## 🚀 Quick Start

```bash
git clone https://github.com/your-repo/loan-business-manager.git
cd loan-business-manager
npm install
```

Create `.env`:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

Run dev server: `npm run dev`  
Run Storybook: `npm run storybook`

---

## 🧪 Testing Strategy (4 Levels)

### 1. Unit Tests – Logic only
Pure math, formatting, factories, hooks. **No network/database.**  
📍 `src/utils/`, `src/strategies/`, `src/factories/`, `src/hooks/__tests__/`  
⚡ Ultra-fast – hundreds per second.

### 2. Component Tests – UI in isolation
Visual rendering + interactions. Uses **Storybook** + React Testing Library.  
📍 Stories: `src/components/stories/*.stories.tsx`  
📍 Automated tests: `src/components/**/*.test.tsx`  
🚀 Run: `npm run storybook` (interactive) or `npm run test` (headless).

### 3. Integration Tests – Code + Real Supabase
Verifies DB operations, RLS security, Edge Functions. Uses a **real test database** (clean per test).  
📍 `src/repositories/__tests__/`, `supabase/functions/__tests__/`  
🐢 Slower (0.5‑2s each) – but proves real connectivity.

### 4. End‑to‑End Tests – Full user journeys (🔜 Coming soon)
Planned with Playwright/Cypress – will simulate login → loan → payment → report.

---

## 📋 Test Commands

| Command | Runs |
|---------|------|
| `npm run test` | Unit + Component + Integration (all automated) |
| `npm run test:ui` | Vitest UI debugger |
| `npm run storybook` | Interactive component explorer |
| `npm run lint` | ESLint |

> **Note:** Integration tests require Supabase running (set `VITE_SUPABASE_URL`/`ANON_KEY`). E2E not yet implemented.

---

## 🏗️ Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind, CSS Modules  
**Backend/DB:** Supabase (Postgres, Auth, RLS, Edge Functions)  
**State:** React Context  
**Testing:** Vitest, React Testing Library, Storybook  
**Other:** Lucide Icons, Recharts

---
