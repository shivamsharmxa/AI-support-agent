# AI Chat Support Widget (MVP)

A minimal, professional AI customer support chat widget built with Node.js, React, and the Anthropic Claude API. Designed for e-commerce platforms to handle common support queries like shipping, returns, and hours.

![SaaS UI](https://via.placeholder.com/800x400?text=SaaS+Chat+Widget+Preview)

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### Step 1: Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see Configuration section below).
4. Initialize the SQLite database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`.

### Step 2: Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`.

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# AI Provider (Anthropic Claude)
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

> **Note**: Get your API Key from [console.anthropic.com](https://console.anthropic.com/).

---

## 🏗️ Architecture Overview

This MVP follows a simple client-server architecture, purposely avoiding over-engineering to focus on readability and core functionality.

### Backend (`/backend`)
*   **Tech Stack**: Node.js, Express, TypeScript, Prisma (SQLite).
*   **Structure**:
    *   `src/server.ts`: Single-file entry point containing all logic (API routes, AI integration, Error handling) for simplicity.
    *   `prisma/schema.prisma`: Defines `Conversation` and `Message` models.
*   **Key Decision**: Consolidated routes and controllers into one file to reduce boilerplate for this specific MVP scale.

### Frontend (`/frontend`)
*   **Tech Stack**: React 18 (Vite), TypeScript, Pure CSS.
*   **Components**:
    *   `ChatWidget.tsx`: Self-contained widget handling state, UI, API calls, and Audio.
    *   `App.tsx`: Landing page with Hero section.
    *   `utils/sound.ts`: Web Audio API implementation for interaction sounds (no external assets).
*   **Design**: Custom CSS variables for a "Professional SaaS" aesthetic (Intercom-like), focusing on typography, whitespace, and subtle animations.

---

## 🤖 LLM Notes

*   **Provider**: **Anthropic Claude API**
*   **Model**: `claude-3-haiku-20240307` (Selected for low latency and cost-efficiency).
*   **Prompting Strategy**:
    *   **System Prompt**: Injected with store-specific knowledge (Shipping times, Return policy, Support hours) to ensure accurate domain answers.
    *   **Context Window**: We send the **last 10 messages** of the conversation history to the API. This provides conversation continuity ("Context Awareness") without consuming excessive tokens.
    *   **Fallback**: If the API fails or is rate-limited, the backend returns a friendly pre-defined error message.

---

## ⚖️ Trade-offs & "If I had more time..."

To deliver a robust MVP within a limited timeframe, certain trade-offs were made:

1.  **Database**: Used **SQLite** for zero-config local development.
    *   *If more time:* Switch to **PostgreSQL** for production deployment.
2.  **State Management**: Used React **local state** (`useState`).
    *   *If more time:* Implement **React Context** or **TanStack Query** for better cache management.
3.  **Real-time**: Used **Optimistic UI updates** + standard HTTP requests.
    *   *If more time:* Implement **WebSockets (Socket.io)** for typing indicators from the agent side and **Server-Sent Events (SSE)** for streaming AI responses token-by-token.
4.  **Security**: No authentication/rate-limiting implemented.
    *   *If more time:* Add JWT Authentication, Rate Limiting (Redis), and Request Validation (Zod).
5.  **Code Structure**: Monolithic `server.ts`.
    *   *If more time:* Refactor into proper Controller-Service-Repository pattern as the codebase grows.
