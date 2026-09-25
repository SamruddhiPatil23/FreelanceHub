# FreelanceHub — Deployment Guide

Three pieces to deploy: the database (MongoDB Atlas), the backend (Render),
and the frontend (Vercel).

## 1. MongoDB Atlas Setup

1. Go to mongodb.com/cloud/atlas and create a free account.
2. Create a new free-tier (M0) cluster.
3. Under Database Access, add a new database user with a username and
   password (save these — you'll need them in the connection string).
4. Under Network Access, add an IP whitelist entry. For a college
   submission, 0.0.0.0/0 (allow from anywhere) is simplest — Render's IPs
   change, so this avoids connection failures. In production you would
   restrict this.
5. Click Connect on your cluster -> Drivers -> copy the connection
   string. It looks like:
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/freelancehub?retryWrites=true&w=majority
6. Replace <username>/<password> with your database user's credentials,
   and make sure /freelancehub (the database name) is included before the ?.

Verify it works locally first: paste this connection string into
backend/.env as MONGO_URI, run npm run dev, and confirm the console
prints "MongoDB Connected: ...". Don't move to Render until this works.

## 2. Backend Deployment (Render)

1. Push your backend/ folder to a GitHub repository (a backend folder
   inside your project repo is fine — Render lets you set a root directory).
2. Go to render.com -> New -> Web Service -> connect your repo.
3. Configure:
   - Root Directory: backend
   - Build Command: npm install
   - Start Command: npm start
   - Instance Type: Free
4. Under Environment Variables, add:
   - MONGO_URI = your Atlas connection string from step 1
   - JWT_SECRET = a long random string (generate one with
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   - PORT = 5000 (Render sets its own PORT automatically, but the app
     falls back to process.env.PORT either way — no code change needed)
5. Deploy. Once live, Render gives you a URL like
   https://freelancehub-backend.onrender.com
6. Test it: visit https://<your-render-url>/ in a browser — you should see
   "FreelanceHub API is running...".

Note on the free tier: Render's free web services spin down after 15
minutes of inactivity and take 30-60 seconds to wake up on the next request.
This is normal — mention it in your viva/demo if the first request is slow.

## 3. Frontend Deployment (Vercel)

1. Before deploying, update the frontend's API base URL so it points to your
   live Render backend instead of localhost:5000. In
   frontend/src/api/axiosInstance.js, change:

   export const BACKEND_URL = "http://localhost:5000";

   to your Render URL:

   export const BACKEND_URL = "https://freelancehub-backend.onrender.com";

2. Push your frontend/ folder to GitHub (same repo, different root
   directory, is fine).
3. Go to vercel.com -> Add New -> Project -> import your repo.
4. Configure:
   - Root Directory: frontend
   - Framework Preset: Vite (Vercel auto-detects this)
   - Build Command: npm run build (default)
   - Output Directory: dist (default for Vite)
5. Deploy. Vercel gives you a URL like https://freelancehub.vercel.app

## 4. CORS — the one thing that trips people up

The backend's cors() middleware (in server.js) currently allows all
origins by default, which is fine for a college project. If you want to lock
it down once both URLs are live, replace:

  app.use(cors());

with:

  app.use(cors({ origin: "https://freelancehub.vercel.app" }));

## 5. Post-deployment checklist

- [ ] Visit the Vercel URL — the login page loads with styling intact
- [ ] Register a new account — confirms frontend can reach the Render backend
- [ ] Upload a profile picture — confirms Multer + static file serving works
  on Render (note: Render's free tier has an ephemeral filesystem —
  uploaded files are lost on redeploy/restart. This is a known limitation
  to mention if asked; a production app would use cloud storage instead)
- [ ] Full flow: post a project -> bid -> accept -> complete -> review, all
  working end-to-end on the live URLs
- [ ] Share both URLs (frontend for browsing, backend for API reference) in
  your submission
