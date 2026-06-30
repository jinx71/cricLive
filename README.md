# CricLive 🏏

> **Portfolio app #9 of 12** — MERN stack, pinned to 2021–2022 versions.
> **Engineering lesson:** smart server-side caching around free-tier rate limits.

CricLive is a live cricket scores app that mirrors a real-world constraint every junior full-stack engineer eventually runs into: the upstream data API is good, but its free tier won't survive being hit by every client. The solution lives entirely on the backend — a `node-cache` layer with per-endpoint TTLs, inflight de-duplication, and a deterministic mock fallback when the API key is missing or the upstream errors out.

The client polls naively (every 20s for live scores) — and that's the point. The backend absorbs the load.

---

## ✨ Features

- **Live, upcoming, and finished matches** — tabbed view with auto-refresh polling
- **Detailed match pages** — full scorecard with batting and bowling tables, toss info, venue, status
- **Series listing & info** — search, tournament metadata, fixture lists
- **Points tables** — ICC WTC and bilateral series standings
- **Player search & profiles** — career stats grouped by format (Test/ODI/T20)
- **JWT auth** — register, login, persistent session
- **Personal dashboard** — followed matches + favorite teams surfaced together
- **Cache diagnostics page** — live hit/miss stats, TTL config, flush button (proves the lesson visually)
- **Cache-source badges** — every API view shows whether data came from `cache hit`, `live fetch`, or `mock` so the caching layer is never invisible
- **Mock mode** — full UX works without an API key; you can explore everything against a deterministic dataset
- **Mobile-first, accessible UI** — semantic HTML, keyboard focus rings, ARIA where needed
- **Loading / empty / error states everywhere** — no silent blank screens

---

## 🧰 Tech stack (pinned to 2021–2022)

### Backend (`server/`)
- **Node.js 16** + **Express 4.18.1**
- **MongoDB** via **Mongoose 6.5.x**
- **JWT** (`jsonwebtoken@8.5.1`) + **bcryptjs**
- **node-cache 5.x** — the heart of the caching layer
- **axios 0.27.2** — server → CricketData.org
- **express-validator 6.14.x**, **helmet 6**, **morgan 1.10**, **express-rate-limit 6**, **cors 2.8.5**, **dotenv 16**

### Frontend (`client/`)
- **React 17.0.2** + **react-dom 17.0.2**
- **Create React App 5.0.1** (`react-scripts@5`)
- **react-router-dom 6.3.x**
- **react-query 3.39.x** — server-state, polling, cache invalidation
- **axios 0.27.2**
- **Tailwind CSS 3.1.x** + PostCSS + Autoprefixer
- **dayjs**, **react-toastify**

### Tooling
- **nodemon 2.0.x**, **concurrently 7.x**

---

## 🗂️ Project structure

```
criclive/
├── client/                       # React + Tailwind
│   ├── public/
│   ├── src/
│   │   ├── api/                  # axios client + endpoint wrappers
│   │   ├── components/           # design-system + cricket UI
│   │   ├── context/              # AuthContext
│   │   ├── pages/                # route-level views (12)
│   │   ├── utils/                # format helpers
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
├── server/                       # Express + Mongoose
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/          # auth, cricket
│   │   ├── middleware/           # auth, errorHandler, notFound
│   │   ├── models/User.js
│   │   ├── routes/               # authRoutes, cricketRoutes
│   │   ├── services/             # cricketService.js (cache+API),
│   │   │                         # cricketMock.js (fallback dataset)
│   │   ├── utils/                # asyncHandler, apiResponse
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── package.json                  # root: concurrently runner
└── .gitignore
```

---

## 🚀 Getting started

### Prerequisites
- Node.js **16.x** (CRA 5 + the pinned versions need this)
- MongoDB running locally (or an Atlas connection string) — **optional**, the app boots without it; auth routes will simply be unavailable
- A CricketData.org API key — **optional**, the app runs in mock mode without one

### 1. Install everything
```bash
npm run install:all
```
(equivalent to `npm install` in the root, `client/`, and `server/`)

### 2. Set up environment
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/criclive
JWT_SECRET=replace-with-a-long-random-string
CRICKETDATA_API_KEY=        # leave blank for mock mode
```

### 3. Run dev (both client + server)
From the repo root:
```bash
npm run dev
```
- API → http://localhost:5000/api
- Web → http://localhost:3000

To run them separately:
```bash
npm run server
npm run client
```

---

## 🌐 Environment variables

### `server/.env`
| Var | Required | Default | Notes |
|---|---|---|---|
| `PORT` | no | 5000 | API port |
| `NODE_ENV` | no | development | |
| `MONGO_URI` | no | — | Skipped if missing; auth disabled but proxy still works |
| `JWT_SECRET` | for auth | — | Long random string |
| `JWT_EXPIRES_IN` | no | `7d` | |
| `CLIENT_ORIGIN` | no | `http://localhost:3000` | CORS allow-origin |
| `CRICKETDATA_API_KEY` | no | — | **Leave blank for mock mode** |
| `CRICKETDATA_BASE_URL` | no | `https://api.cricapi.com/v1` | |
| `CACHE_TTL_LIVE` | no | 20 | seconds |
| `CACHE_TTL_MATCHES` | no | 120 | seconds |
| `CACHE_TTL_MATCH_INFO` | no | 60 | seconds |
| `CACHE_TTL_SERIES` | no | 600 | seconds |
| `CACHE_TTL_PLAYERS` | no | 86400 | seconds |

### `client/.env`
| Var | Default |
|---|---|
| `REACT_APP_API_URL` | `http://localhost:5000/api` |

---

## 🛣️ API reference

All responses use the project-standard envelope:
```json
{ "success": true, "data": <payload>, "message": null, "meta": { "source": "cache|live|mock", "fetchedAt": 1700000000000, "fallback": false, "mockMode": false } }
```

### Cricket (public)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/cricket/matches/live` | Currently in progress (TTL 20s) |
| GET | `/api/cricket/matches/upcoming` | Not yet started (TTL 2m) |
| GET | `/api/cricket/matches/finished` | Recently ended (TTL 2m) |
| GET | `/api/cricket/matches/:id` | Match info + scorecard (TTL 1m) |
| GET | `/api/cricket/series` | All series (TTL 10m) |
| GET | `/api/cricket/series/:id` | Series info + match list (TTL 10m) |
| GET | `/api/cricket/series/:id/points` | Points table (TTL 10m) |
| GET | `/api/cricket/points` | Default standings (ICC WTC) |
| GET | `/api/cricket/players?q=<name>` | Search (TTL 24h) |
| GET | `/api/cricket/players/:id` | Player profile (TTL 24h) |
| GET | `/api/cricket/cache/stats` | Cache hit/miss diagnostics |
| DELETE | `/api/cricket/cache` | Flush cache |

### Auth
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{ name, email, password }` |
| POST | `/api/auth/login` | — | `{ email, password }` |
| GET | `/api/auth/me` | Bearer | Current user |
| PUT | `/api/auth/follow-match/:id` | Bearer | Toggle |
| PUT | `/api/auth/favorite-team/:team` | Bearer | Toggle |

---

## 📚 The engineering lesson, in detail

**Problem.** Public cricket APIs cap free-tier usage at ~100–500 requests/day. With even a handful of concurrent clients polling for live scores every 20 seconds, that quota is gone in minutes.

**Solution stack** (see `server/src/services/cricketService.js`):

1. **TTL-tuned `node-cache`.** Live scores are cached for 20s, fixtures for 2m, series metadata for 10m, player profiles for 24h. Each TTL matches how quickly that data actually changes — not a one-size-fits-all number.
2. **Inflight de-duplication.** A `Map` of in-progress fetch promises ensures that 50 concurrent requests for `/matches/live` while one upstream call is open all `await` the same `Promise`. Only one request leaves the building.
3. **Per-key fallback.** If the upstream fails (rate limit, network, 5xx), the service returns the deterministic mock dataset and tags the response `meta.fallback = true`. The UI surfaces this as a badge so it's never hidden.
4. **Cache-first envelope.** Every controller reports `meta.source` (`cache`/`live`/`mock`) up the stack to the client, where the `<CacheBadge>` component renders it next to every list view. The lesson is visible, not just implemented.
5. **Self-rate-limited routes.** `express-rate-limit` caps each client at 120 req/min to our own API even before the cache layer. Two layers of defense.

**Try it.** Open `/cache` in the running app. Hit the homepage, switch tabs, open match detail. Watch hit/miss counters update. Click "Flush cache" — the next request becomes a `live fetch` (or `mock` if you have no key), and subsequent ones become `cache hit`s for the duration of their TTL.

---

## ✅ Definition of Done

- [x] `npm install` in both folders, one command boots both
- [x] `.env.example` in client and server; `.env` git-ignored
- [x] README with features, stack, setup, env vars
- [x] Mobile-first responsive layout, accessibility basics
- [x] Loading / empty / error states on every async view
- [x] Shared design system + royal blue accent
- [x] Forms validated client (manual) and server (express-validator)
- [x] Keyed API proxied through backend; rate-limited via cache + express-rate-limit
- [x] Auth + protected routes; passwords never returned
- [x] Zero console errors/warnings expected
- [x] Mock fallback so full UX works without credentials

---

## 📝 Notes & known constraints

- **No MongoDB in some sandboxed environments.** The server boots without it; only the auth routes require it.
- **JWT in `localStorage`.** Pragmatic for a portfolio app; an httpOnly cookie would be the production choice (immune to XSS exfiltration). Noted in code comments.
- **`react-scripts@5` requires Node 16.** Node 18+ may need `NODE_OPTIONS=--openssl-legacy-provider`.
- **Period-accurate stack.** React 17 is intentionally picked over React 18 for the polling-heavy real-time UX — avoids the StrictMode double-invocation gotcha with `setInterval`.
- **Tailwind 3.1 has no `line-clamp` plugin.** It's added manually in `index.css`.

---

## 🎨 Design

CricLive's accent is **royal blue** (`#1f33b0`/`#3b62f5`) with **accent gold** (`#f5b740`) for highlights, plus the **`live` red** for the pulsing live badge. Typography pairs Poppins (display) with Inter (body), both via Google Fonts. The rest of the design system — Card, Button, Badge, Spinner, EmptyState, ErrorState — is shared across the 12 portfolio apps.

---

## 📦 Build for production

```bash
cd client && npm run build
# build artifacts in client/build/

cd ../server
NODE_ENV=production node src/server.js
```

Suggested deploy: client → Netlify/Vercel; server → Render/Railway; DB → MongoDB Atlas.

---

**Built as part of a 12-app MERN portfolio** demonstrating full-stack patterns end-to-end. Next up: BriefBox (Hacker News aggregator) is portfolio app #10.
