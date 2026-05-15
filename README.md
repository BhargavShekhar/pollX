<p align="center">
  <img src="./client/public/logo.svg" width="72" alt="PollX Logo" />
</p>

<h1 align="center">PollX</h1>

<p align="center">A full-stack polling platform where users can create polls, collect responses, and view real-time analytics.</p>

## Live Demo

**[pollx.bhargavshekhar.shop](https://pollx.bhargavshekhar.shop)** · **[GitHub Repository](https://github.com/BhargavShekhar/pollX)**

---

## Features

- **Authentication** — JWT-based signup, signin and token refresh with secure httpOnly cookies
- **Poll Creation** — Create polls with multiple single-choice questions, mark questions as mandatory or optional, set expiry time, and choose between anonymous or authenticated response mode
- **Public Poll Links** — Share polls via a public link; expired polls automatically reject new responses
- **Response Collection** — Supports both anonymous (session-based) and authenticated voting with duplicate vote prevention
- **Analytics Dashboard** — Real-time dashboard for poll creators showing total responses, per-question summaries, option counts and completion rate
- **Publish Results** — Poll creators can publish final results; published polls display outcome to anyone visiting the public link
- **Live Updates** — Real-time response count and analytics updates via Socket.io WebSockets

---

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.io Client
- Sonner (toasts)
- Axios

**Backend**
- Node.js + Express 5
- TypeScript
- Socket.io
- Drizzle ORM
- Neon (PostgreSQL)
- bcryptjs
- JSON Web Tokens
- Zod (validation)

---

## Database Schema

```
users
├── id (pk)
├── name
├── email
├── password
└── refresh_token

polls
├── id (pk)
├── user_id (fk → users)
├── title
├── anonymous_vote
├── publish
└── expires_in

questions
├── id (pk)
├── poll_id (fk → polls)
├── question
└── mandatory

options
├── id (pk)
├── question_id (fk → questions)
└── option

votes
├── id (pk)
├── poll_id (fk → polls)
├── question_id (fk → questions)
├── option_id (fk → options)
├── user_id? (fk → users, null for anonymous)
└── session_id? (for anonymous votes)
```

---

## Project Structure

```
pollx/
├── client/                  # React frontend
│   ├── src/
│   │   ├── app/             # Route definitions
│   │   ├── components/      # Shared UI components
│   │   ├── services/        # API + socket service
│   │   ├── types/           # TypeScript types
│   │   └── views/           # Page components
│   └── vite.config.ts
│
└── server/                  # Express backend
    ├── src/
    │   ├── app/
    │   │   ├── auth/        # Auth routes, controllers, services
    │   │   ├── poll/        # Poll routes, controllers, services
    │   │   ├── middleware/  # Auth middleware
    │   │   └── common/      # ApiError, response helpers
    │   ├── db/              # Drizzle config, schema, migrations
    │   ├── socket/          # Socket.io initialization
    │   └── server.ts        # Entry point
    └── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pollx.git
cd pollx
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=8080
NODE_ENV=development

DATABASE_URL=your_postgresql_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

FRONTEND_URL=http://localhost:5173
```

Run migrations and start:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:8080
VITE_BACKEND_SOCKET_URL=http://localhost:8080
```

Start the dev server:

```bash
npm run dev
```

---

## API Routes

### Auth — `/api/v1/auth`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/signin` | Sign in and receive tokens |
| POST | `/refresh` | Refresh access token |
| POST | `/signout` | Sign out and invalidate token |

### Poll — `/api/v1/poll`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/create-poll` | Required | Create a poll |
| GET | `/polls` | Required | Get all polls for current user |
| GET | `/polls/:pollId` | Required | Get poll with analytics |
| DELETE | `/delete-poll` | Required | Delete a poll |
| PATCH | `/polls/:pollId/publish` | Required | Publish poll results |
| POST | `/:pollId/vote` | Optional | Submit a vote |
| GET | `/:pollId/public` | None | Get public poll (results if published) |

---

## Real-Time Architecture

Socket.io is initialized on the same HTTP server as Express, enabling WebSocket upgrades on the same port.

```
Poll Creator (Analytics page)
    └── socket.emit("join:poll", pollId)   → joins a room

Respondent submits vote
    └── POST /api/v1/poll/:pollId/vote
        └── PollService.vote()
            └── io.to(pollId).emit("vote:new", { pollId, totalVotes })

Poll Creator receives event
    └── socket.on("vote:new") → refetches poll data → UI updates
```

The analytics dashboard shows a live green indicator while a poll is active and automatically refetches data on each incoming vote event.

---

## Deployment (EC2)

```bash
# Install Node via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20 && nvm use 20

# Install pm2 and nginx
npm install -g pm2
sudo apt install nginx -y

# Build and start backend
cd server && npm install && npm run build
pm2 start dist/server.js --name pollx-backend
pm2 save && pm2 startup

# Build frontend
cd ../client && npm install && npm run build
```

Nginx config — serves frontend static files and proxies API + Socket.io to Express:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /home/ubuntu/pollx/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /socket.io {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## Environment Variables Reference

### Backend

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 8080) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `ACCESS_TOKEN_SECRET` | JWT secret for access tokens |
| `REFRESH_TOKEN_SECRET` | JWT secret for refresh tokens |
| `FRONTEND_URL` | Frontend origin for CORS |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API base URL |
| `VITE_BACKEND_SOCKET_URL` | Backend Socket.io URL (usually same as above) |