# MERN User Identification System

Full-stack authentication app with MongoDB, Express, React, and Node.js.

## Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)

## Setup

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your `MONGO_URL` and a strong `JWT_SECRET`.

```bash
npm install
npm start
```

API runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Routes

| Method | Path | Auth |
| ------ | ---- | ---- |
| POST | `/api/auth/signup` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | JWT |

Frontend: `/signup`, `/login`, `/dashboard` (protected).
