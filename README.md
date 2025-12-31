# AI Chat Support Widget

A production-ready AI customer support chat widget built with **Node.js**, **React**, and the **Anthropic Claude API**. Designed for e-commerce platforms to handle common support queries like shipping, returns, and hours.

![SaaS UI](https://via.placeholder.com/800x400?text=SaaS+Chat+Widget+Preview)

## 🚀 Key Features

*   **🤖 AI-Powered**: Uses **Claude 3 Haiku** for intelligent, context-aware responses.
*   **📱 Fully Responsive**: Optimized for Mobile, Tablet, and Desktop (Full-screen on mobile).
*   **💾 Persistent Chat**: Saves conversation history in `localStorage`, resuming seamlessly on reload.
*   **🔒 Secure by Default**:
    *   **Strict CORS**: Configurable allowed origins.
    *   **Rate Limiting**: Prevents abuse (e.g., 20 requests/minute).
    *   **Input Validation**: Strict Zod schemas for all API payloads.
*   **🔊 Interactive**: Optimistic UI updates with custom sound effects (Web Audio API).

---

## 🏗️ Architecture

The project has been refactored from an MVP into a clean, layered architecture for maintainability and scalability.

### Backend (`/backend`)
*   **Structure**:
    *   `src/server.ts`: Entry point restricted to app setup and middleware.
    *   `src/services/`: Business logic (Chat rules, LLM integration, Persistence).
    *   `src/controllers/`: Request handling and Input Validation.
    *   `src/routes/`: API route definitions.
    *   `src/config/`: Environment variables (`env.ts`) and LLM settings.
    *   `prisma/schema.prisma`: SQLite database schema.

### Frontend (`/frontend`)
*   **Tech Stack**: React 18 (Vite), TypeScript, pure CSS.
*   **Key Components**:
    *   `ChatWidget.tsx`: Main widget containing state, UI, and audio logic.
    *   `utils/sound.ts`: Synthesized sound effects (typing, send, receive).
*   **Styling**: Responsive, CSS-variable driven design with a "Professional SaaS" aesthetic.

---

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
1.  Navigate to the backend:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables (create `.env`):
    ```env
    DATABASE_URL="file:./dev.db"
    ANTHROPIC_API_KEY="your-api-key-here"
    CORS_ORIGIN="http://localhost:5173"
    PORT=3000
    ```
4.  Initialize Database:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  Start Server:
    ```bash
    npm run dev
    ```
    Runs on `http://localhost:3000`.

### 2. Frontend Setup
1.  Navigate to the frontend:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables (create `.env`):
    ```env
    VITE_API_BASE_URL="http://localhost:3000"
    ```
4.  Start Development Server:
    ```bash
    npm run dev
    ```
    Runs on `http://localhost:5173`.

---

## 🚀 Deployment Guide (Render)

### Backend Service (Web Service)
1.  **Build Command**: `npm install && npx prisma generate && tsc`
2.  **Start Command**: `node dist/server.js`
3.  **Environment Variables**:
    *   `DATABASE_URL`: Your connection string (or use a disk for SQLite if permitted).
    *   `ANTHROPIC_API_KEY`: Your real API Key.
    *   `CORS_ORIGIN`: **Crucial!** Set this to your frontend URL (e.g., `https://myapp.vercel.app`).
    *   `node_version`: `20` (recommended).

### Frontend (Static Site)
1.  **Build Command**: `npm run build`
2.  **Publish Directory**: `dist`
3.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: Your deployed Backend URL (e.g., `https://my-backend.onrender.com`).

---

## 🤖 LLM Strategy

*   **Model**: `claude-3-haiku-20240307` (Fast & Cheap).
*   **Context**: Sends the last **10 messages** to balance context window vs. token costs.
*   **System Prompt**: Injected with store policies (Shipping, Returns) to demonstrate RAG-like behavior.

---

## ⚖️ Trade-offs & Future Improvements

1.  **Database**: Using SQLite (easy local dev). Production should use PostgreSQL.
2.  **Auth**: Currently open access. Production needs Auth (JWT/Supabase) to identify users.
3.  **Real-time**: Polling/REST used for simplicity. Future: WebSockets for typing indicators.
