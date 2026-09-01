# StudySync — Production-Grade Collaborative Study Platform 🚀

StudySync is a full-stack, real-time collaborative study platform where students create study rooms, chat in real-time, share code snippets & documents, manage collaborative tasks, and compete on a live Redis-powered leaderboard.

---

## 🏛️ System Architecture

### 1. Production Cloud Architecture
```text
                       INTERNET
                          │
                          ▼
                 ┌──────────────────┐
                 │  React 18 + Vite │
                 │  (Vercel SPA)    │
                 └────────┬─────────┘
                          │
                   HTTPS / REST API
                          │
                     WebSocket
                          │
                          ▼
                 ┌──────────────────┐
                 │  Node + Express  │
                 │  (Render Docker) │
                 │  Socket.IO Engine│
                 └───────┬──┬───────┘
                         │  │
       Mongoose ODM      │  │ ioredis (Sorted Sets & Blacklist)
                         ▼  ▼
                 ┌───────────────┐  ┌───────────────┐
                 │ MongoDB Atlas │  │  Redis Cloud  │
                 │ (Persistent)  │  │  (Real-Time)  │
                 └───────────────┘  └───────────────┘
```

### 2. Local Development Architecture (Docker Compose)
```text
                     Local Browser
                          │
                          ▼ [Port 5173]
              ┌───────────────────────────┐
              │   Nginx Container         │ (Frontend)
              │   - React 18 + Vite SPA   │
              └─────────────┬─────────────┘
                            │ Reverse Proxy /api/ & /socket.io/
                            ▼ [Port 5000]
              ┌───────────────────────────┐
              │   Express Backend         │ (Node.js 18)
              │   - Socket.IO Server      │
              │   - JWT Auth & Blacklist  │
              └───────┬───────────┬───────┘
                      │           │
        Mongoose ODM  │           │ ioredis
                      ▼           ▼
              ┌──────────────┐ ┌──────────────┐
              │ MongoDB 7    │ │ Redis 7      │
              │ Container    │ │ Container    │
              └──────────────┘ └──────────────┘
```

---

## 🎯 5 Core Features

1. **Authentication & Session Security**:
   - User Registration & Login with bcrypt hashing (10 salt rounds) and 7-day JWT tokens.
   - Immediate server-side token invalidation on logout via Redis TTL-backed blacklist (`blacklist:<token>`).
2. **Study Rooms**:
   - Create, browse, search, and filter study rooms by subject (DSA, DBMS, Web Dev, OS, System Design, AI/ML).
   - Private study rooms with secret passcode authorization.
   - Room creator ownership with cascading cleanup of messages and tasks upon deletion.
3. **Real-Time Collaboration Chat (Socket.IO + MongoDB)**:
   - Handshake JWT authentication with Redis blacklist checking.
   - Message persistence in MongoDB with pagination (`/api/rooms/:roomId/messages`).
   - Formatted Code Snippets with syntax styling, line counts, and 1-click **Copy Code** button.
   - File sharing for Images (`JPEG`, `PNG`, `GIF`, `WebP` with lightbox) and PDF documents with document download cards.
   - Active typing indicators (auto-cleared after 3s) and online presence pills.
4. **Task Management & Points System**:
   - Collaborative task tracking (`TODO`, `IN_PROGRESS`, `COMPLETED`) with member assignment and priority tags.
   - **+10 points** awarded to assignee on task completion in both MongoDB and Redis.
   - Toggle-abuse protection: `pointsAwarded` boolean flag prevents duplicate points on re-completion.
5. **Real-Time Leaderboard**:
   - High-throughput ranking engine powered by Redis Sorted Sets (`leaderboard` key with `ZADD`, `ZINCRBY`, `ZREVRANGE`, `ZREVRANK`, `ZSCORE`).
   - Top 100 table and current user rank banner with MongoDB fallback and automated hourly/startup synchronization.

---

# 🚀 Production Deployment Guide

Follow this step-by-step guide to deploy StudySync to the cloud. Once deployed, the application will run 24/7 on the internet without needing Docker Desktop open on your local computer.

### Step 1: Set Up MongoDB Atlas (Database)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. Under **Database Access**, create a database user (e.g. `studysync_user`) with a secure password.
3. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) so cloud providers (Render) can connect.
4. Under **Database** $\rightarrow$ **Connect** $\rightarrow$ **Drivers**, copy your connection string:
   ```text
   mongodb+srv://studysync_user:<password>@cluster0.xxxxx.mongodb.net/studysync?retryWrites=true&w=majority
   ```

### Step 2: Set Up Redis Cloud (Cache & Leaderboard)
1. Go to [redis.io/try-free](https://redis.io/try-free/) and create a free 30MB Redis Cloud database.
2. In the database configuration, copy the **Public endpoint** (e.g. `redis-12345.c1.us-central1-2.gce.cloud.redislabs.com:12345`) and your **Default user password**.
3. Construct your connection URL:
   ```text
   redis://default:<password>@<public-endpoint>
   ```

### Step 3: Optional Cloud Storage for Uploads (Cloudinary)
1. Sign up for a free account at [cloudinary.com](https://cloudinary.com).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
   *(If omitted, StudySync will safely store files locally)*.

### Step 4: Push Code to GitHub
```bash
git add .
git commit -m "feat: production deployment configuration"
git push origin main
```

### Step 5: Deploy Backend to Render (Docker Web Service)
1. Go to [render.com](https://render.com) and create a **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Set the following settings:
   - **Name**: `studysync-backend`
   - **Region**: Choose closest to you (e.g. Oregon / Singapore / Frankfurt)
   - **Language / Runtime**: `Docker`
   - **Dockerfile Path**: `server/Dockerfile`
   - **Docker Context**: `server`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Server internal port |
   | `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas URI from Step 1 |
   | `REDIS_URL` | `redis://...` | Redis Cloud URL from Step 2 |
   | `JWT_SECRET` | `your_secure_jwt_secret_min_32_characters` | Session secret |
   | `JWT_EXPIRY` | `7d` | Token expiration |
   | `CLIENT_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL (update after Step 6) |
   | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Optional: Cloudinary Cloud Name |
   | `CLOUDINARY_API_KEY` | `your_api_key` | Optional: Cloudinary API Key |
   | `CLOUDINARY_API_SECRET` | `your_api_secret` | Optional: Cloudinary API Secret |
5. Click **Create Web Service**.
6. Once deployed, copy your Render URL (e.g. `https://studysync-backend.onrender.com`).
7. Verify health: Open `https://studysync-backend.onrender.com/api/health` in your browser.

### Step 6: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New...** $\rightarrow$ **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://studysync-backend.onrender.com` (Your Render Backend URL) |
   | `VITE_SOCKET_URL` | `https://studysync-backend.onrender.com` (Your Render Backend URL) |
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL (e.g. `https://studysync.vercel.app`).

### Step 7: Finalize CORS Configuration
1. Go back to Render $\rightarrow$ `studysync-backend` $\rightarrow$ **Environment**.
2. Set `CLIENT_URL` to your exact Vercel frontend URL: `https://studysync.vercel.app`.
3. Save changes (Render will automatically redeploy).

---

## 💻 Running Locally (Local Development)

### Quick Start with Docker Compose
```bash
# Clone repository
git clone https://github.com/your-username/StudySync.git
cd StudySync

# Launch all 4 services
docker compose up -d --build

# View container status
docker compose ps
```

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001) (or proxied via `:5173/api`)
- **Health Check**: [http://localhost:5173/api/health](http://localhost:5173/api/health)

### Running Without Docker (Native Host Mode)
```bash
# 1. Start MongoDB & Redis via Homebrew
brew services start mongodb-community
brew services start redis

# 2. Start Backend Server
cd server
npm run dev

# 3. Start Frontend (in a second terminal)
cd client
npm run dev
```

---

## 📡 REST API & Socket.IO Reference

### REST Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck (Backend, Mongo, Redis status) | No |
| `POST` | `/api/auth/register` | Register new student | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/auth/me` | Current session user | Yes |
| `POST` | `/api/auth/logout` | Revoke token via Redis blacklist | Yes |
| `GET` | `/api/rooms` | List study rooms (filter by subject/search) | Yes |
| `POST` | `/api/rooms` | Create study room (public/private) | Yes |
| `GET` | `/api/rooms/:id` | Get room details & members | Yes |
| `POST` | `/api/rooms/:id/join` | Join room (with passcode if private) | Yes |
| `POST` | `/api/rooms/:id/leave` | Leave room | Yes |
| `DELETE` | `/api/rooms/:id` | Delete room (creator only) | Yes |
| `GET` | `/api/rooms/:id/tasks` | Get room tasks | Yes |
| `POST` | `/api/rooms/:id/tasks` | Create task assigned to member | Yes |
| `PATCH` | `/api/tasks/:id` | Update status (+10 pts on completion) | Yes |
| `DELETE` | `/api/tasks/:id` | Delete task | Yes |
| `GET` | `/api/rooms/:id/messages` | Paginated message history | Yes |
| `POST` | `/api/rooms/:id/upload` | Upload image/PDF document to room | Yes |
| `GET` | `/api/leaderboard` | Top 100 scholars ranking | Yes |
| `GET` | `/api/leaderboard/me` | Current user standing & rank | Yes |
| `PATCH` | `/api/users/password` | Change account password | Yes |

### Socket.IO Events
| Event Name | Direction | Payload / Description |
| :--- | :--- | :--- |
| `joinRoom` | Client $\rightarrow$ Server | `{ roomId }` — Joins isolated Socket.IO room |
| `leaveRoom` | Client $\rightarrow$ Server | `{ roomId }` — Leaves room |
| `sendMessage` | Client $\rightarrow$ Server | `{ roomId, content, type: 'TEXT'|'CODE', codeSnippet }` |
| `receiveMessage` | Server $\rightarrow$ Client | Broadcasts message to room members in real-time |
| `typing` | Client $\rightarrow$ Server | `{ roomId }` — Emits user typing status |
| `userTyping` | Server $\rightarrow$ Client | Broadcasts typing state to peers |
| `userStoppedTyping` | Server $\rightarrow$ Client | Auto-clears typing after 3s |

---

## 🎓 SDE Internship Interview Technical Q&A

<details>
<summary><strong>1. Why use Redis Sorted Sets for the Leaderboard instead of querying MongoDB?</strong></summary>

- **Time Complexity**: MongoDB requires an `O(N log N)` scan and sort on the `points` field across all users for global rankings. Redis Sorted Sets maintain a skip list / balanced search tree in memory, offering `O(log N)` for `ZADD` / `ZINCRBY` and `O(log N + M)` for `ZREVRANGE` / `ZREVRANK`.
- **High Throughput**: Under high concurrency (hundreds of users completing tasks simultaneously), querying Redis prevents expensive table scans and disk I/O on MongoDB.
- **Resilience**: MongoDB acts as the system of record. Redis is synchronized on startup and hourly to guarantee data durability.
</details>

<details>
<summary><strong>2. How does StudySync handle JWT token revocation on logout?</strong></summary>

- Traditional JWTs are stateless and remain valid until their expiration timestamp (`exp`).
- StudySync implements a **Redis Token Blacklist**: Upon logout, the token is stored in Redis (`blacklist:<token>`) with a Time-To-Live (TTL) equal to the token's remaining lifespan.
- The `authenticate` middleware and Socket.IO handshake check Redis before validating requests. Once expired, Redis automatically evicts the key, preventing unbounded memory growth.
</details>

<details>
<summary><strong>3. How does StudySync prevent point duplication abuse in tasks?</strong></summary>

- Each task document maintains a `pointsAwarded: { type: Boolean, default: false }` flag.
- Points (+10) are only awarded to the assigned user upon the **first transition** from `TODO`/`IN_PROGRESS` $\rightarrow$ `COMPLETED`.
- If a user toggles the task back to `TODO` and then to `COMPLETED` again, the server detects `pointsAwarded === true` and skips incrementing points in MongoDB and Redis.
</details>

<details>
<summary><strong>4. Why separate Frontend (Vercel) and Backend (Render Docker)?</strong></summary>

- **Static Asset Performance**: Vercel serves the compiled React Single Page Application (SPA) globally from edge CDNs with sub-second response times.
- **WebSocket Persistence**: Render keeps the Dockerized Node.js instance running continuously to maintain persistent, bidirectional WebSocket connections via Socket.IO, which serverless functions cannot do.
- **Managed Reliability**: Using MongoDB Atlas and Redis Cloud ensures persistent data is decoupled from container lifecycle restarts.
</details>
