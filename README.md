# BlogSpace — Full-Stack Blog Application

A modern, production-ready blog platform built with React, Node.js, Express, and MongoDB.

## Features

- **User Authentication** — Register, Login, JWT-based auth
- **Blog Posts** — Create, edit, delete posts with cover images
- **Categories & Tags** — Organize posts by category and tags
- **Search & Filter** — Real-time search and category filtering
- **Comments** — Nested replies (one level deep)
- **Likes** — Toggle like on posts
- **User Profiles** — Avatar upload, bio, password change
- **Pagination** — Server-side pagination
- **Responsive** — Mobile-first design with TailwindCSS
- **Image Uploads** — Cover images and avatars via Multer

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios, TailwindCSS |
| Backend | Node.js, Express.js, JWT, Multer |
| Database | MongoDB Atlas via Mongoose ODM |

## Local Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd blog-app

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure backend environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Start both servers (in separate terminals)
cd ../backend && npm run dev
cd ../frontend && npm run dev
```

Frontend: `http://localhost:5173` | Backend API: `http://localhost:5000`

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `NODE_ENV` | Environment mode | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/me` | Yes | Get current user |

### Posts
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/posts` | No | List posts (paginated, filterable) |
| GET | `/api/posts/:id` | No | Get single post |
| POST | `/api/posts` | Yes | Create post |
| PUT | `/api/posts/:id` | Yes | Update post (author/admin) |
| DELETE | `/api/posts/:id` | Yes | Delete post (author/admin) |
| POST | `/api/posts/:id/like` | Yes | Toggle like |

### Comments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/comments/:postId` | No | Get comments for a post |
| POST | `/api/comments/:postId` | Yes | Create comment/reply |
| DELETE | `/api/comments/:id` | Yes | Delete comment (author/admin) |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/:id` | No | Get public profile |
| PUT | `/api/users/profile` | Yes | Update own profile |

## Deployment Guide

### Azure Backend (App Service)
1. Create a Node.js App Service on Azure
2. Set environment variables in Configuration → Application Settings
3. Deploy via GitHub Actions or Azure CLI
4. Start command: `node server.js`

### Azure Frontend (Static Web App)
1. Create a Static Web App on Azure
2. Connect to GitHub repository
3. Build command: `npm run build`
4. Output directory: `dist`
5. App location: `frontend`

## Screenshots

_Screenshots coming soon_
