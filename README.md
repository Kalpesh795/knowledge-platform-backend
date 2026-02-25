# Knowledge Platform – Backend

Backend API for the **Knowledge Sharing Platform with AI Assist**. Built with Node.js, Express, and MySQL.

---

## 1. Approach

### Architecture overview

- **REST API** over HTTP/JSON.
- **MVC-style structure**: routes → controllers → models; shared middleware (e.g. JWT auth).
- **Database**: MySQL for users and articles; JWT for stateless auth.
- **AI**: Optional OpenAI integration for improve/summary/tag-suggestions; mock responses when no API key is set.

```
Client (React)  →  Express (CORS, JSON)  →  Auth middleware (JWT)  →  Routes
                                                                  →  Controllers  →  Models  →  MySQL
                                                                  →  AI service   →  OpenAI (or mock)
```

### Folder structure

```
knowledge-platform-backend/
├── app.js                 # Entry: Express app, CORS, JSON, route mounting
├── db.js                  # MySQL connection (dotenv)
├── .env.example           # Template for environment variables
├── middleware/
│   └── authMiddleware.js  # JWT verify + optionalAuth
├── models/
│   ├── userModel.js       # User CRUD (findByEmail, findById, create)
│   └── articleModel.js    # Article CRUD, list with search/filter, author check
├── controllers/
│   ├── authController.js  # signup, login, logout, me
│   ├── articleController.js  # create, list, getById, getMyArticles, update, delete
│   └── aiController.js    # improve, summary, suggestTags
├── routes/
│   ├── authRoutes.js      # POST /signup, /login, /logout; GET /me
│   ├── articleRoutes.js   # GET /categories, /, /me, /:id; POST /; PUT/DELETE /:id
│   └── aiRoutes.js        # POST /improve, /summary, /suggest-tags
└── services/
    └── aiService.js       # OpenAI calls or mock for improve, summary, suggestTags
```

### Key design decisions

- **JWT in Authorization header**: Stateless auth; no server-side session store. Logout = client discards token.
- **Author-only edit/delete**: `articleModel.checkAuthor(articleId, userId)` before update/delete.
- **AI**: Single `aiService` with optional `OPENAI_API_KEY`; same API surface for real or mock responses.
- **Search/filter**: Handled in `articleModel.findAll` via query params (search term, category).

---

## 2. AI Usage (Mandatory section)

- **Tools used**: Cursor AI and ChatGPT for reference.
- **Where AI helped**:
  - **Code generation**: Express route/controller/model skeleton, auth middleware, JWT sign/verify flow.
  - **API design**: REST endpoints and request/response shapes for auth, articles, and AI.
  - **SQL**: Table usage and query patterns for users/articles (refined for our schema).
  - **Boilerplate**: `aiService` structure (OpenAI + mock fallback), env-based config.
- **What was reviewed/corrected manually**:
  - Security: password hashing (bcrypt), not logging secrets, authorisation checks on every edit/delete.
  - Error handling and status codes (400, 401, 403, 404, 500).
  - MySQL callback style and `result.insertId` usage in signup.
  - Route order (e.g. `/me` before `/:id`) and input validation.
  - Tested using Postman
  - Adjusted to follow REST API best practices


“Used Cursor AI to generate initial Express boilerplate and AI service structure; then reviewed and corrected auth middleware, authorisation logic, and error handling manually.”

---

## 3. Setup instructions

### Prerequisites

- Node.js (v18+ recommended)
- MySQL server
- (Optional) OpenAI API key for real AI features

### Environment variables

Copy `.env.example` to `.env` and set:

| Variable          | Description                    | Example                    |
|-------------------|--------------------------------|----------------------------|
| `PORT`            | Server port                    | `5000`                     |
| `DB_HOST`         | MySQL host                     | `localhost`                |
| `DB_USER`         | MySQL user                     | `root`                     |
| `DB_PASSWORD`     | MySQL password                 | `root`                     |
| `DB_NAME`         | Database name                  | `knowledge_platform`       |
| `JWT_SECRET`      | Secret for signing JWTs        | (long random string)        |
| `OPENAI_API_KEY`  | Optional; for real AI          | `sk-...`                   |

### Backend setup

1. Create the database and tables (run your `DB.sql` or equivalent):

   ```sql
   CREATE DATABASE knowledge_platform;
   USE knowledge_platform;
   -- run your users + articles table creation
   ```

2. Install dependencies and start:

   ```bash
   npm install
   node app.js
   ```

   Server runs at `http://localhost:5000` (or the port in `PORT`). API base path: `/api` (e.g. `POST /api/auth/login`, `GET /api/articles`).

---

## API summary

- **Auth**: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` (Bearer token).
- **Articles**: `GET /api/articles/categories`, `GET /api/articles?search=&category=`, `GET /api/articles/me`, `GET /api/articles/:id`, `POST /api/articles`, `PUT /api/articles/:id`, `DELETE /api/articles/:id`.
- **AI**: `POST /api/ai/improve`, `POST /api/ai/summary`, `POST /api/ai/suggest-tags` (all require auth).
