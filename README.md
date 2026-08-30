# The Legal Space — Frontend

> Connecting Nigerians to verified lawyers and legal firms. Fast. Secure. Accessible.

The Legal Space is a platform where users find and connect with verified lawyers and law firms across Nigeria — and where legal professionals build their presence, publish articles, and grow their practice.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm / bun

### Installation

```bash
git clone https://github.com/your-org/tls-frontend.git
cd tls-frontend
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
API_URL=https://legalspace.onrender.com
```

### Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js App Router pages & layouts
│   ├── layout.tsx          # Root layout — Providers live here
│   └── providers.tsx       # QueryClient + AuthProvider
├── components/             # Shared UI components
├── context/
│   └── AuthContext.tsx     # Global auth state (user, login, logout)
├── hooks/
│   ├── useProfile.ts       # useMe, useUpdateMe
│   └── usePracticeAreas.ts # usePracticeAreas
├── services/
│   ├── api.ts              # Axios instance + interceptors
│   ├── auth.service.ts     # Auth API methods
│   └── profile.service.ts  # Profile API methods
├── docs/
│   └── API_UTILITIES_DOCS.md  # Full API & utilities guide for collaborators
└── public/
```

---

## ✨ Features (Phase 1)

- 🔐 **Auth** — Email & Google OAuth login, registration for Users, Lawyers, and Firms
- 👤 **Profiles** — Rich profiles with avatars, bios, practice areas, and fee ranges
- 🔎 **Discovery** — Find lawyers and firms by practice area, location, and fee range
- 📝 **Articles & Posts** — Lawyers publish content to build their authority
- 🤝 **Connections** — Users connect with legal professionals
- ⭐ **Reviews** — Verified reviews on lawyer and firm profiles
- 🕵️ **Anonymous Mode** — Users can browse and post anonymously

---

## 🧰 Tech Stack

| Layer        | Technology              |
| ------------ | ----------------------- |
| Framework    | Next.js 14 (App Router) |
| Language     | TypeScript              |
| HTTP Client  | Axios                   |
| Server State | TanStack React Query    |
| Auth State   | React Context           |
| Styling      | Tailwind CSS            |
| Icons        | Lucide React            |
| Images       | Next.js Image           |

---

## 🔑 Key Concepts for Collaborators

### Auth

Auth is managed globally via `useAuth()` — never handle tokens manually in components.

```tsx
const { user, login, logout, isLoading } = useAuth();
```

### Data Fetching

All data fetching goes through React Query hooks — they cache results and deduplicate requests.

```tsx
const { data: profile, isLoading } = useMe();
const { data: areas } = usePracticeAreas();
```

### API Calls

Never call `api` directly in components. Use the service files or hooks.

```tsx
// ✅ Use a hook
const { data } = useMe();

// ✅ Use a service (inside a hook or handler)
const { data } = await profileService.getMe();

// ❌ Don't call api directly in components
const { data } = await api.get("/api/v1/profile/me");
```

---

## 📚 Documentation

Full guide for all API utilities, hooks, services, and context:

👉 **[docs/API_UTILITIES_DOCS.md](./docs/API_UTILITIES_DOCS.md)**

Covers:

- Every service method with usage examples
- Auth flow with token refresh diagram
- React Query hooks and caching behaviour
- Common mistakes to avoid

---

## 🌍 API

**Base URL:** `https://legalspace.onrender.com`  
**Prefix:** `/api/v1`

Key endpoint groups:

| Group          | Base Path                |
| -------------- | ------------------------ |
| Auth           | `/api/v1/auth`           |
| Profile        | `/api/v1/profile`        |
| Practice Areas | `/api/v1/practice-areas` |
| Follows        | `/api/v1/follows`        |

---

## 🤝 Contributing

1. Branch off `main` — use `feature/your-feature-name`
2. Read [docs/API_UTILITIES_DOCS.md](./docs/API_UTILITIES_DOCS.md) before writing any API calls
3. Use existing hooks and services — don't reinvent the wheel
4. Open a PR with a clear description of what changed and why

---

## 📦 Deploy

The easiest way to deploy is via [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Remember to add `API_URL` to your Vercel environment variables.

---

<p align="center">Built with  for access to justice in Nigeria</p>
