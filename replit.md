# RizzUp

## Overview

RizzUp is a mobile-first AI dating assistant app built with Expo (React Native) and an Express backend. It helps users craft better dating messages through four core features:

1. **Generate Reply** — Paste a received message, pick a tone (smooth/playful/calm/savage), and get 3 AI-generated reply options
2. **Analyze Chat** — Paste a conversation to get an AI analysis of interest level, investment balance, and suggestions
3. **Get Opener** — Select a platform (Instagram/WhatsApp/Dating App/In Person) and get AI-generated conversation openers
4. **Fix My Bio** — Input hobbies and a vibe to get AI-generated dating profile bios in multiple styles

The app uses OpenAI (via Replit AI Integrations) on the backend to power all AI features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with expo-router for file-based routing
- **Navigation**: Stack-based navigation with 5 screens: index (home), reply, analyze, opener, bio
- **Styling**: Dark theme throughout using StyleSheet with a custom color system defined in `constants/colors.ts`
- **Fonts**: Poppins font family (Regular, Medium, SemiBold, Bold) loaded via `@expo-google-fonts/poppins`
- **State Management**: Local component state with useState; TanStack React Query available for server state
- **Key Libraries**: react-native-reanimated (animations), expo-haptics (tactile feedback), expo-clipboard (copy results), expo-linear-gradient (gradient backgrounds)
- **API Communication**: Custom `apiRequest` helper in `lib/query-client.ts` that constructs URLs from `EXPO_PUBLIC_DOMAIN` environment variable

### Backend (Express)

- **Framework**: Express 5 running on Node.js with TypeScript (compiled via tsx in dev, esbuild for production)
- **API Routes**: Defined in `server/routes.ts` — all endpoints are POST under `/api/`:
  - `/api/generate-reply` — generates 3 reply options given a message and tone
  - `/api/analyze-chat` — analyzes a conversation for interest signals
  - `/api/generate-bio` — creates dating profile bios
  - `/api/generate-opener` — creates conversation openers (implied from frontend)
- **AI Integration**: OpenAI SDK configured with Replit AI Integrations environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`), using model `gpt-5-mini`
- **CORS**: Custom middleware that allows Replit domains and localhost origins
- **Static Serving**: In production, serves a static landing page from `server/templates/landing-page.html`

### Replit Integration Modules

Located in `server/replit_integrations/`, these are pre-built modules that provide additional capabilities:
- **chat/**: Conversation storage with PostgreSQL (CRUD for conversations and messages)
- **audio/**: Voice chat with speech-to-text, text-to-speech, audio format detection/conversion
- **image/**: Image generation via `gpt-image-1`
- **batch/**: Batch processing with rate limiting and retries (using p-limit and p-retry)

Client-side integration files are in `.replit_integration_files/client/replit_integrations/` for audio playback and recording.

### Database

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` (users table) and `shared/models/chat.ts` (conversations and messages tables)
- **Current Storage**: The main app uses `MemStorage` (in-memory) in `server/storage.ts` for users. The chat integration module uses actual PostgreSQL via Drizzle.
- **Migrations**: Output to `./migrations/` directory, managed via `drizzle-kit push`
- **Connection**: Uses `DATABASE_URL` environment variable

### Build & Deployment

- **Dev**: Two processes — `expo:dev` for the mobile client, `server:dev` for the Express backend
- **Production Build**: `expo:static:build` creates a static web bundle via a custom build script (`scripts/build.js`), `server:build` bundles the server with esbuild
- **Production Run**: `server:prod` serves the bundled server

### Project Structure

```
app/              # Expo Router screens (file-based routing)
components/       # Shared React Native components
constants/        # Theme colors and configuration
lib/              # Client utilities (API helpers, query client)
server/           # Express backend
  routes.ts       # API route handlers
  storage.ts      # In-memory storage (users)
  index.ts        # Server entry point
  replit_integrations/  # Pre-built AI integration modules
shared/           # Shared types and schemas (used by both client and server)
  schema.ts       # Drizzle schema definitions
  models/         # Additional data models
```

## External Dependencies

### AI Services
- **OpenAI API** (via Replit AI Integrations): Powers all text generation features. Configured through `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables.

### Database
- **PostgreSQL**: Connected via `DATABASE_URL` environment variable. Used by Drizzle ORM for data persistence.

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (Replit integration)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL (Replit integration)
- `EXPO_PUBLIC_DOMAIN` — Domain for API requests from the client
- `REPLIT_DEV_DOMAIN` — Replit development domain (auto-set by Replit)

### Key npm Packages
- **expo** (~54.0.27) — Mobile app framework
- **expo-router** (~6.0.17) — File-based routing
- **express** (^5.0.1) — Backend HTTP server
- **openai** (^6.22.0) — OpenAI API client
- **drizzle-orm** (^0.39.3) — Database ORM
- **@tanstack/react-query** (^5.83.0) — Server state management
- **react-native-reanimated** (~4.1.1) — Animations
- **pg** (^8.16.3) — PostgreSQL client