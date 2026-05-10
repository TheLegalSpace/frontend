# The Legal Space — Frontend API Utilities Documentation

> **For collaborators.** This document covers every utility created for API communication, authentication, caching, and data fetching in the frontend. Read this before touching anything in `services/`, `context/`, or `hooks/`.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Environment Setup](#environment-setup)
4. [Services](#services)
   - [api.ts — Axios Instance](#1-servicesapits--axios-instance)
   - [auth.service.ts — Auth API Calls](#2-servicesauthservicets--auth-api-calls)
   - [profile.service.ts — Profile API Calls](#3-servicesprofileservicets--profile-api-calls)
5. [Context](#context)
   - [AuthContext.tsx — Global Auth State](#4-contextauthcontexttsx--global-auth-state)
6. [Hooks](#hooks)
   - [useProfile.ts — Profile Data & Mutations](#5-hooksuseproflets--profile-data--mutations)
   - [usePracticeAreas.ts — Practice Areas](#6-hooksuseplacticeareas--practice-areas)
7. [Providers](#providers)
   - [providers.tsx — App-Wide Wrappers](#7-appproviders--app-wide-wrappers)
8. [Base URL & API Prefix](#base-url--api-prefix)
9. [Auth Flow Diagram](#auth-flow-diagram)
10. [Quick Reference Cheatsheet](#quick-reference-cheatsheet)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Project Overview

The frontend communicates with the backend at:

```
https://legalspace.onrender.com/api/v1
```

All API calls are centralised through a single Axios instance (`services/api.ts`) so token injection, auto-refresh, and error handling are handled in one place — not scattered across components.

**Stack used:**
- `axios` — HTTP client
- `@tanstack/react-query` — server state caching
- React Context — global auth state
- Next.js App Router (`"use client"` where needed)

---

## Directory Structure

```
frontend/
├── services/
│   ├── api.ts                  ← Axios instance + interceptors
│   ├── auth.service.ts         ← Auth API methods
│   └── profile.service.ts      ← Profile API methods
├── context/
│   └── AuthContext.tsx         ← Global user state (login/logout)
├── hooks/
│   ├── useProfile.ts           ← useMe, useUpdateMe hooks
│   └── usePracticeAreas.ts     ← usePracticeAreas hook
└── app/
    ├── providers.tsx            ← QueryClient + AuthProvider wrapper
    └── layout.tsx               ← providers.tsx used here
```

---

## Environment Setup

Add this to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://legalspace.onrender.com
```

> **Note:** The `/api/v1` prefix is included in each service method — do not add it to the base URL.

---

## Services

### 1. `services/api.ts` — Axios Instance

**What it does:**
- Creates a single shared Axios instance with the base URL and default headers
- Attaches the `Authorization: Bearer <token>` header to every outgoing request automatically
- On a `401 Unauthorized` response, it automatically attempts to refresh the access token using the stored refresh token, then retries the original request
- If the refresh also fails, it clears all stored tokens and redirects to `/signin`
- Guards all `localStorage` and `window` access with `typeof window !== "undefined"` so it is safe in server-side rendering (Next.js SSR)

**You should never call `api` directly in components.** Use the service files or hooks instead. The only exception is one-off calls not covered by any service.

```ts
// ✅ Correct — use it inside a service or hook
import { api } from "@/services/api";
const response = await api.get("/api/v1/some-endpoint");

// ❌ Wrong — do not import and call directly inside a component
```

**Token storage keys used:**

| Key | Value |
|---|---|
| `accessToken` | JWT access token |
| `refreshToken` | JWT refresh token |
| `user` | JSON string of the user object |

---

### 2. `services/auth.service.ts` — Auth API Calls

**What it does:** Wraps all authentication-related API endpoints as typed methods.

**Import:**
```ts
import { authService } from "@/services/auth.service";
```

**Available Methods:**

#### `authService.login(payload)`
```ts
const { data } = await authService.login({
  authProvider: "email",
  email: "user@example.com",
  password: "securePass123",
});
// data.accessToken, data.refreshToken, data.user
```

#### `authService.registerUser(payload)`
```ts
await authService.registerUser({
  authProvider: "email",
  fullName: "Adaeze Okafor",
  email: "adaeze@example.com",
  password: "securePass123",
});
```

#### `authService.registerLawyer(payload)`
```ts
await authService.registerLawyer({
  authProvider: "email",
  fullName: "Tunde Lawal",
  email: "tunde@example.com",
  password: "securePass123",
  scn: "SCN123456",
  callToBarYear: 2018,
  nbaBranch: "Lagos Branch",
  practiceAreaIds: ["<uuid>"],
  feeRangeMin: 50000,
  feeRangeMax: 500000,
  locationCity: "Lagos",
  locationCountry: "Nigeria",
});
```

#### `authService.registerFirm(payload)`
```ts
await authService.registerFirm({
  authProvider: "email",
  firmName: "Olaniwun Ajayi LP",
  email: "contact@olaniwun.com",
  password: "securePass123",
  rcNumber: "RC123456",
  firmEstablishmentYear: 1990,
  practiceAreaIds: ["<uuid>"],
  feeRangeMin: 200000,
  feeRangeMax: 5000000,
  locationCity: "Lagos",
});
```

#### `authService.logout()`
```ts
await authService.logout();
```
> Use `useAuth().logout()` from context instead — it also clears state and redirects.

#### `authService.forgotPassword(email)`
```ts
await authService.forgotPassword("adaeze@example.com");
```

#### `authService.resetPassword(token, newPassword)`
```ts
await authService.resetPassword("reset-token-from-email", "newSecure123");
```

#### `authService.deleteAccount()`
```ts
await authService.deleteAccount();
```
> Requires auth. Soft-deletes the account and wipes the Supabase identity.

---

### 3. `services/profile.service.ts` — Profile API Calls

**What it does:** Wraps all profile-related API endpoints. All methods require the user to be authenticated.

**Import:**
```ts
import { profileService } from "@/services/profile.service";
```

**Available Methods:**

#### `profileService.getMe()`
```ts
const { data } = await profileService.getMe();
```

#### `profileService.getById(accountId)`
```ts
const { data } = await profileService.getById("some-account-uuid");
// Anonymity masking is applied by the backend
```

#### `profileService.updateMe(payload)`
```ts
await profileService.updateMe({
  bio: "Lawyer | Goal-Oriented",
  locationCity: "Lagos",
  phone: "+2348012345678",
});
```

#### `profileService.uploadAvatar(file)`
```ts
// file is a File object from an <input type="file">
await profileService.uploadAvatar(file);
```

#### `profileService.uploadCover(file)`
```ts
await profileService.uploadCover(file);
```

#### `profileService.toggleAnonymous(isAnonymous)`
```ts
// Only for USER role
await profileService.toggleAnonymous(true);
```

#### `profileService.updatePracticeAreas(practiceAreaIds)`
```ts
// Only for LAWYER and FIRM roles
await profileService.updatePracticeAreas(["uuid-1", "uuid-2"]);
```

#### `profileService.getConnections(accountId, page?, limit?)`
```ts
const { data } = await profileService.getConnections("account-uuid", 1, 20);
```

#### `profileService.getArticles(accountId, page?, limit?)`
```ts
const { data } = await profileService.getArticles("account-uuid", 1, 20);
```

---

## Context

### 4. `context/AuthContext.tsx` — Global Auth State

**What it does:**
- Stores the logged-in `user` object in React state
- Exposes `login()` and `logout()` methods that handle token storage automatically
- Restores the user from `localStorage` on page refresh
- Makes auth state available to any component via the `useAuth()` hook — no prop drilling

**Wrap your app with `AuthProvider` in `app/providers.tsx`** (already done — do not add it again).

**Hook: `useAuth()`**

```tsx
import { useAuth } from "@/context/AuthContext";

export default function SomeComponent() {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <p>Role: {user.role}</p>  {/* USER | LAWYER | FIRM | ADMIN */}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**`login()` — call this on your login form submit:**
```tsx
const { login } = useAuth();

const handleSubmit = async () => {
  try {
    await login({
      authProvider: "email",
      email: formEmail,
      password: formPassword,
    });
    // user is now set globally, redirect as needed
    router.push("/dashboard");
  } catch (err) {
    // handle error
  }
};
```

**Returned values:**

| Value | Type | Description |
|---|---|---|
| `user` | `User \| null` | The logged-in user, or null if not authenticated |
| `isLoading` | `boolean` | True while restoring session from localStorage on mount |
| `login(payload)` | `async function` | Calls auth API, saves tokens, sets user state |
| `logout()` | `async function` | Calls logout API, clears tokens, redirects to /signin |

---

## Hooks

These hooks use React Query under the hood — they cache results, deduplicate requests, and auto-refresh stale data.

### 5. `hooks/useProfile.ts` — Profile Data & Mutations

#### `useMe()` — Get the current user's profile
```tsx
import { useMe } from "@/hooks/useProfile";

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useMe();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile</p>;

  return <p>{profile.fullName}</p>;
}
```
> Cached for **5 minutes**. Only one network request fires even if multiple components call `useMe()` at the same time.

#### `useUpdateMe()` — Update the current user's profile
```tsx
import { useUpdateMe } from "@/hooks/useProfile";

export default function EditProfileForm() {
  const { mutate: updateMe, isPending } = useUpdateMe();

  const handleSave = () => {
    updateMe({ bio: "New bio", locationCity: "Abuja" });
    // Cache for ["profile", "me"] is automatically invalidated after success
    // so useMe() will refetch fresh data
  };

  return (
    <button onClick={handleSave} disabled={isPending}>
      {isPending ? "Saving..." : "Save"}
    </button>
  );
}
```

---

### 6. `hooks/usePracticeAreas.ts` — Practice Areas

```tsx
import { usePracticeAreas } from "@/hooks/usePracticeAreas";

export default function PracticeAreaSelect() {
  const { data: areas, isLoading } = usePracticeAreas();

  if (isLoading) return <p>Loading...</p>;

  return (
    <select>
      {areas.map((area) => (
        <option key={area.id} value={area.id}>{area.name}</option>
      ))}
    </select>
  );
}
```
> Cached for **1 hour** — matches the backend's own 1h cache on this endpoint.

---

## Providers

### 7. `app/providers.tsx` — App-Wide Wrappers

**What it does:** Wraps the entire app with:
1. `QueryClientProvider` — enables React Query caching globally
2. `AuthProvider` — enables `useAuth()` globally

This is already applied in `app/layout.tsx`. **Do not add it again anywhere.**

```tsx
// app/layout.tsx — already set up, do not modify
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Default React Query settings (set in providers.tsx):**

| Setting | Value | Meaning |
|---|---|---|
| `staleTime` | 5 minutes | Data is considered fresh for 5 min; no refetch during this window |
| `retry` | 1 | Failed requests retry once before throwing an error |

---

## Base URL & API Prefix

| Variable | Value |
|---|---|
| Base URL (env) | `https://legalspace.onrender.com` |
| API prefix | `/api/v1` |
| Full example | `https://legalspace.onrender.com/api/v1/auth/login` |

The `/api/v1` prefix is included in every service method call — it is **not** part of the env variable.

---

## Auth Flow Diagram

```
User submits login form
        │
        ▼
useAuth().login(payload)
        │
        ▼
authService.login() → POST /api/v1/auth/login
        │
        ▼
Save accessToken, refreshToken, user → localStorage
Set user in AuthContext state
        │
        ▼
Any component calling useAuth() gets updated user instantly

─────────────────────────────────────────────

Any API call (via services/api.ts)
        │
        ▼
Interceptor attaches: Authorization: Bearer <accessToken>
        │
        ▼
  Response 401?
   ├── No  → return response normally
   └── Yes → POST /api/v1/auth/refresh with refreshToken
               │
               ├── Success → save new tokens, retry original request
               └── Fail    → clear localStorage, redirect to /signin
```

---

## Quick Reference Cheatsheet

```ts
// Auth
const { user, login, logout, isLoading } = useAuth();

// Login
await login({ authProvider: "email", email, password });

// Logout
await logout();

// Get my profile (cached)
const { data, isLoading } = useMe();

// Update my profile (invalidates cache on success)
const { mutate: updateMe } = useUpdateMe();
updateMe({ bio: "...", locationCity: "Lagos" });

// Practice areas (cached 1h)
const { data: areas } = usePracticeAreas();

// One-off authenticated request
import { api } from "@/services/api";
const { data } = await api.get("/api/v1/some-endpoint");
```

---

## Common Mistakes to Avoid

| Mistake | Why it's wrong | Correct approach |
|---|---|---|
| Calling `localStorage` directly in a component | Breaks SSR in Next.js | Use `useAuth()` which handles this safely |
| Using `async` directly in `useEffect` | React doesn't support async effect callbacks | Define an inner async function and call it |
| Importing `api` in a component and calling endpoints | Bypasses caching, no deduplication | Use the relevant hook (`useMe`, `usePracticeAreas`, etc.) |
| Adding `AuthProvider` or `QueryClientProvider` in individual pages | Causes duplicate context, broken state | They are already in `app/providers.tsx` — use them via hooks only |
| Forgetting `await` on service calls | Gets a `Promise` instead of the response | Always `await` async service methods |
| Hardcoding the API URL | Breaks across environments | Always use `process.env.NEXT_PUBLIC_API_URL` |
| Storing sensitive data beyond tokens in localStorage | Security risk | Only store `accessToken`, `refreshToken`, and the `user` object |