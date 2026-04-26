# CodeKang Web

CodeKang Web is the frontend application for the CodeKang platform. It provides the authentication flow, onboarding, repository connection experience, dashboard, reviews surface, reporting views, and account/settings UI for the broader GitHub AI automation system.

Built with Next.js App Router, React 19, TypeScript, Tailwind CSS v4, and Firebase Authentication.

## Overview

This app sits in front of the CodeKang backend gateway and is responsible for:

- user sign-in with Google, GitHub, and email OTP
- GitHub OAuth callback handling
- onboarding users and linking source-control providers
- connecting repositories to the platform
- browsing connected repositories, pull requests, and issues
- organization-aware dashboard views
- account, billing, integrations, security, and support screens

The frontend expects the platform gateway API to be available, typically at `http://localhost:3000/api/v1`.

## Stack

- Next.js `16.2.4`
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- Firebase Web SDK
- `lucide-react` and `react-icons`

## Key Areas

### Authentication

- `/in/login`
- `/auth/callback`
- `/auth/callback/github`

Supported flows:

- Google sign-in through Firebase
- GitHub direct OAuth code exchange through the platform API
- email OTP sign-in through the gateway auth endpoints

### Onboarding

- `/onboarding`
- `/onboarding/repos`

The onboarding flow lets users:

- connect GitHub, GitLab, or Bitbucket accounts
- select repositories to connect to CodeKang
- complete onboarding and enter the dashboard

GitHub is the primary repo-selection path today. The repo picker is implemented around GitHub repositories, while other provider flows are more limited.

### Dashboard

- `/dashboard`
- `/dashboard/reviews`
- `/dashboard/reports`
- `/dashboard/integrations`
- `/dashboard/billing`
- `/dashboard/notifications`
- `/dashboard/repositories/[repoId]`
- `/dashboard/repositories/[repoId]/review/[prId]`

The dashboard combines live gateway-backed data with product UI surfaces for repository activity, review workflows, and account management.

### Settings

- `/settings`
- `/settings/general`
- `/settings/notifications`
- `/settings/security`
- `/settings/sessions`
- `/settings/api-keys`
- `/settings/secrets`
- `/settings/integrations`
- `/settings/billing`
- `/settings/members`
- `/settings/audit-log`
- `/settings/support`

### Public / Marketing

- `/in/pricing`
- `/in/faq`
- `/in/contact`

## Project Structure

```text
codekang-web/
├── app/                 # App Router routes, layouts, providers, globals
├── component/           # Dashboard and shared UI components
├── lib/                 # Auth helpers, Firebase setup, org context, theme
├── public/              # Static assets
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Environment Variables

The app reads its configuration from standard Next.js `NEXT_PUBLIC_*` variables.

Required:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Usually required depending on your Firebase project setup:

- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

Typical local values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-oauth-client-id

NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

The root repository already includes related examples in [.env.example](../.env.example).

## Local Development

Prerequisites:

- Node.js `20+`
- npm `10+`
- the CodeKang backend gateway running locally
- Firebase web app credentials
- GitHub OAuth client configuration for the callback route

Install dependencies:

```bash
cd codekang-web
npm install
```

Start the dev server:

```bash
npm run dev
```

The app runs on:

```text
http://localhost:3010
```

## Backend Dependency

Most authenticated flows depend on the root platform services:

- gateway: `http://localhost:3000/api/v1`
- auth microservice behind the gateway
- repos and organizations endpoints behind the gateway

If the backend is not running, login, onboarding, repo loading, organization loading, and most dashboard actions will fail.

## Available Scripts

```bash
npm run dev     # Start Next.js dev server on port 3010
npm run build   # Create a production build
npm run start   # Start production server on port 3010
npm run lint    # Run ESLint
```

## Notes

- Authentication tokens are stored in `localStorage`.
- The app uses an organization context to scope repo views inside the dashboard.
- Some pages are fully wired to backend data, while some settings and reporting surfaces are still presentation-heavy product UI.
- A legacy `/auth/callback` handler still exists for older redirect-based auth flows, but the GitHub callback route is the active dedicated OAuth path.

## Related Projects

- root platform overview: [../README.md](../README.md)
- backend gateway and microservices: `apps/gateway`, `apps/auth`, `apps/repos`, `apps/ai-agent`
- autonomous worker: `apps/automous-ai`
