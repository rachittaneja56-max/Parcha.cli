<div align="center">

```text
  _____               _             ___  _____ 
 |  __ \             | |           / _ \| ____|
 | |__) |_ _ _ __ ___| |__   __ _ | (_) | |__  
 |  ___/ _` | '__/ __| '_ \ / _` | \__, |___ \ 
 | |  | (_| | | | (__| | | | (_| |   / / ___) |
 |_|   \__,_|_|  \___|_| |_|\__,_|  /_/ |____/ 
```

**The Developer-Centric Form Builder SaaS.**
<br>
No bloat. Keyboard-first. Fully customizable. Built for the modern web.

---

**[View Live App](https://parcha95.rachittaneja.in/)** | **[View API Docs](https://repoapi-production-2f38.up.railway.app/docs)**

</div>

---

## Why Parcha 95?

Most form builders are clunky, slow, and designed for marketing teams. **Parcha 95** is built differently. We wanted a form builder that felt like an IDE: extremely fast, strictly typed, keyboard-friendly, and beautifully designed. Whether you want a retro Windows 95 aesthetic, a hacker-style terminal UI, or a clean modern SaaS look, Parcha 95 gives you the tools to build it in seconds.

---

## End-to-End User Flow

Parcha 95 is designed to be frictionless. Here is the exact path a user takes when interacting with the platform:

1. **Discovery & Onboarding:**
   - A user lands on the homepage and can interact with the live 3D form previews or trigger the `rm -rf` kernel panic easter egg.
   - They register for an account (native email/password or Google OAuth). The backend handles secure cookie-based session management (`parcha_session`).
   - If using native auth, they receive a verification email handled by our out-of-band token lifecycle.

2. **The Command Center (Dashboard):**
   - Upon logging in, users are greeted by the Command Center.
   - High-level analytics are aggregated instantly across all their forms (Total Views, Total Responses, Average Completion Rate).
   - They click "Create Form" to spawn a fresh workspace.

3. **Building the Form (The IDE Experience):**
   - The user enters the Form Builder, a 4-panel interface powered by `@dnd-kit`.
   - They drag and drop fields onto the canvas. Every change is tracked in local state and automatically debounced to the server via tRPC—no manual "Save" button required.
   - They configure advanced settings like honeypot protection, webhooks, or password requirements.
   - With a single click, they change the visual rendering engine to their preferred theme (Terminal, Windows 95, VS Code, Standard).

4. **Public Distribution:**
   - The user marks the form as "Public" and shares the unique `f/slug` link.
   - Respondents open the form. The `trackView` endpoint increments the analytics counter in real time (protected by sliding-window rate limits in Upstash Redis).
   - The respondent completes the form. Client-side Zod validation ensures the data is perfect before submission.

5. **Real-Time Telemetry & Insights:**
   - Back in the builder, the creator opens the "Analytics" tab.
   - A Node.js EventEmitter fires a WebSocket event, instantly pushing the new submission to the client without a page refresh.
   - The creator can view time-series bar charts, pie charts for dropdown selections, and even export the entire payload as a raw CSV blob for Excel.

---

## Core Features (The A to Z Breakdown)

### Form Builder & Management
* **Drag-and-Drop Canvas:** Seamlessly reorder form fields using a buttery smooth `@dnd-kit` powered interface.
* **Auto-Save Architecture:** An IDE-like debounced auto-save system. No "Save" buttons required.
* **Visibility Controls:** Toggle forms between Public (anyone can view) and Unlisted (hidden from galleries).
* **Zod-Powered Validation:** Strict schema validation on the frontend before data ever hits the server.
* **Custom Webhooks:** Fire HTTP POST requests to any external URL whenever a form is submitted.

### The 4 UI Themes Engine
Give your forms a unique personality with a single click. Our custom rendering engine supports:
* **Terminal:** A hacker-style monospace interface with pure green text on a dark background.
* **Windows 95:** A highly nostalgic, pixel-perfect 90s aesthetic with classic gray borders and sunken inputs.
* **VS Code:** An IDE-style interface featuring syntax-highlighted inputs and line numbers.
* **Standard:** A beautifully clean, modern, and high-converting SaaS look.

### Analytics & Real-Time Data
* **Live WebSocket Updates:** A Node.js EventEmitter powers real-time WebSockets. Watch responses and page views update instantly on your dashboard without refreshing.
* **Deep Insights:** Automatically calculated Conversion Rates, Bounce Rates, and Average Completion Times.
* **Visualizations:** Pie charts for select fields and 7-day volume bar charts.
* **Export Anything:** Client-side generation of CSV blobs to export all your response data instantly.

### Admin Command Center (RBAC)
* **Strict Role-Based Access:** Dedicated `adminProcedure` tRPC routes ensure only authorized admins can access the backend.
* **Global Telemetry:** A high-level view of total users, forms, and system health.
* **Moderation Queue:** Admins can Archive (soft-delete), Publish, or Unpublish any form on the platform.
* **Secondary Verification Gates:** Destructive actions require the admin to re-enter their password.

### Security & Optimizations
* **Upstash Redis Rate Limiting:** Sliding-window rate limits block abuse and DDoS attempts on form submissions.
* **Redis Caching:** Form schemas and responses are aggressively cached in Redis for sub-millisecond read times.
* **Honeypot Fields:** Invisible fields catch and silently block bot submissions.
* **Account Security:** Patched against account takeover vulnerabilities with secure bcrypt password hashing.

### Easter Eggs & Polish
* **Kernel Panic (`rm -rf`):** Type `rm -rf` anywhere on the landing page to trigger a full-screen system meltdown animation.
* **Fake Stripe Gateway:** Click the "Get Pro" pricing button to experience a fully functional, interactive mock payment modal.
* **3D Tilt Cards:** Hover over the form previews on the landing page Hero section for a dynamic 3D tilt effect.

---

## System Architecture & Folder Structure

Parcha 95 is built on a highly modular **Turborepo** architecture. This allows us to share code (like Zod schemas and database types) across the entire stack without duplication, ensuring 100% end-to-end type safety.

```text
Parcha 95/
├── apps/
│   ├── web/               # Next.js App Router (Frontend UI, Landing, Dashboard)
│   └── api/               # Express Server (Hosts tRPC API, WebSockets, Docs)
├── packages/
│   ├── database/          # Drizzle ORM models, schemas, and migrations
│   ├── services/          # Core Business Logic (Auth, Emails, Responses, Analytics)
│   ├── trpc/              # API Layer (Routers, Context, Middlewares, OpenAPI gen)
│   ├── validators/        # Shared Zod schemas (Input validation for UI & Backend)
│   ├── redis/             # Upstash Redis utilities (Caching, IP extraction)
│   └── logger/            # Winston-based centralized logging
```

---

## Database Schema

We use **PostgreSQL** heavily optimized with **Drizzle ORM**. Our core entity relationships:

* **`usersTable`**: Manages authentication and RBAC. (`id`, `email`, `passwordHash`, `fullName`, `role: "admin" | "user"`, `emailVerified`).
* **`formsTable`**: The core form entity. (`id`, `creatorId`, `title`, `slug`, `schema` (JSONB), `theme`, `status`, `visibility`, `password`).
* **`responsesTable`**: Stores individual submissions. (`id`, `formId`, `payload` (JSONB), `timeToComplete`, `country`, `submittedAt`).
* **`analyticsTable`**: A 1:1 mapped table to `formsTable` acting as a high-performance counter. (`formId`, `views`, `submissions`, `avgTimeToComplete`).
* **`tokensTable`**: Manages out-of-band email lifecycles. (`token`, `email`, `type: "verification" | "password_reset"`).

---

## API Routes & OpenAPI Docs

Our backend is powered by **tRPC**, providing seamless RPC calls to the frontend. However, to maintain a public API presence for third-party integrations, we dynamically generate a fully compliant OpenAPI spec.

### The tRPC Routers
* **`authRouter`**: `register`, `login`, `logout`, `verifyEmail`, `googleCallback`, `me`.
* **`formRouter`**: `create`, `updateSchema`, `updateSettings`, `getMyForms`, `getPublicForms`, `getFormById`.
* **`responseRouter`**: `submit` (validates schema & honeypot), `trackView`, `getResponses`.
* **`analyticsRouter`**: `getDashboardStats`, `getAllResponses`, and **Websocket Subscriptions** (`onNewSubmission`, `onNewView`).
* **`adminRouter`**: `getTelemetry`, `getRecentForms`, `moderateForm`.

### Interactive Scalar API Docs
We automatically convert our tRPC definitions into an OpenAPI JSON spec using `trpc-to-openapi`. 
To provide a beautiful, interactive developer experience, we integrate **Scalar** (`@scalar/express-api-reference`). The OpenAPI spec is directly injected into the Scalar rendering engine on the server, completely eliminating client-side CORS issues or proxy routing failures in production.

*You can view the live, interactive API documentation here: [https://repoapi-production-2f38.up.railway.app/docs](https://repoapi-production-2f38.up.railway.app/docs)*

---

## Tech Stack

| Category | Technology |
|---|---|
| **Monorepo** | Turborepo |
| **Frontend** | Next.js App Router, React, TailwindCSS, shadcn/ui |
| **Backend API** | Express, tRPC, Node.js EventEmitters (WebSockets) |
| **Database & ORM** | PostgreSQL, Drizzle ORM |
| **Caching & Rate Limiting** | Upstash Redis |
| **Validation** | Zod |
| **API Documentation** | Scalar |

---

## Demo Credentials

Want to test the RBAC features or skip registration? Use these demo accounts:

**Admin Account**
* Email: `admin@parcha95.com`
* Password: `parcha2026`

**Creator Account**
* Email: `demo@parcha95.com`
* Password: `parcha2026`

---

## Local Setup Instructions

Want to run Parcha 95 on your own machine? Follow these simple steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rachittaneja56-max/Parcha.cli.git
   cd Parcha.cli
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Duplicate the `.env.example` files in `apps/web` and `apps/api` and fill in your Postgres and Redis URLs.

4. **Push the Database Schema:**
   ```bash
   pnpm db:push
   ```

5. **Seed the Database:**
   *(Optional but recommended to populate the demo accounts and forms)*
   ```bash
   pnpm db:seed
   ```

6. **Run the Development Server:**
   ```bash
   pnpm dev
   ```

You're ready to go! The web app will be running on `localhost:3000` and the API on `localhost:8000`.
