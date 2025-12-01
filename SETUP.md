# 🚀 Quick Setup Guide

## Prerequisites

Before starting, make sure you have:
- ✅ Node.js 18+ installed (`node -v`)
- ✅ npm or pnpm package manager
- ✅ Supabase account (free tier is fine)
- ✅ Git installed

---

## Step 1: Install Dependencies (All Projects)

Open **3 separate terminals** and run:

### Terminal 1: Payload CMS
```bash
cd payload-cms
npm install
```

### Terminal 2: Custom Admin UI
```bash
cd custom-admin-ui
npm install
```

### Terminal 3: Storefront
```bash
cd storefront
npm install
```

**⏱️ This will take 3-5 minutes**

---

## Step 2: Setup Supabase Database

### A. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New project"
3. Fill in:
   - **Name**: `wp-migration` (or your choice)
   - **Database Password**: (save this!)
   - **Region**: Singapore (closest to Vietnam)
4. Wait for database to be ready (~2 minutes)

### B. Get Database URL

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual password

---

## Step 3: Configure Environment Variables

### A. Payload CMS

```bash
cd payload-cms
cp .env.example .env
```

Edit `.env` and fill in:
```bash
# Replace with your Supabase connection string
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres

# Generate a random secret (use: openssl rand -base64 32)
PAYLOAD_SECRET=your-random-secret-key-here

PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

### B. Custom Admin UI

```bash
cd custom-admin-ui
cp .env.local.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3000
NEXTAUTH_SECRET=another-random-secret
NEXTAUTH_URL=http://localhost:3001
```

### C. Storefront

```bash
cd storefront
cp .env.local.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_SITE_NAME=Your Site Name
```

---

## Step 4: Start Development Servers

### Terminal 1: Payload CMS (Backend)
```bash
cd payload-cms
npm run dev
```

**✅ Success**: You should see:
```
🚀 Payload CMS Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://localhost:3000
🔧 Admin: http://localhost:3000/admin
📡 API: http://localhost:3000/api
```

**First time**: Visit http://localhost:3000/admin and create your first admin user.

---

### Terminal 2: Custom Admin UI
```bash
cd custom-admin-ui
npm run dev
```

**✅ Success**: Open http://localhost:3001

---

### Terminal 3: Storefront
```bash
cd storefront
npm run dev
```

**✅ Success**: Open http://localhost:3002

---

## Step 5: Verify Everything Works

### Test Checklist:

- [ ] **Payload Admin**: http://localhost:3000/admin
  - Can you login with the admin user you created?
  - Can you see Posts, Products, Categories in the sidebar?

- [ ] **Payload API**: http://localhost:3000/api/posts
  - Returns `{"docs":[],"totalDocs":0,...}` (empty array is OK)

- [ ] **Custom Admin UI**: http://localhost:3001
  - Homepage loads with "Custom Admin Panel"

- [ ] **Storefront**: http://localhost:3002
  - Homepage loads with hero section

---

## 🎉 You're Done!

Your development environment is ready. Next steps:

1. **Create some test content** in Payload Admin (http://localhost:3000/admin)
   - Create a category
   - Create a post
   - Upload an image

2. **Explore Custom Admin UI** (we'll build this next)
   - Login page
   - Dashboard
   - Posts management

3. **Test Storefront** (we'll connect to Payload API)
   - Display posts from Payload
   - Blog post detail pages

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check your `DATABASE_URL` in `payload-cms/.env`
- Make sure Supabase database is active
- Try the connection string in a PostgreSQL client

### "Port 3000 already in use"
- Kill the process: `lsof -ti:3000 | xargs kill -9`
- Or change port in package.json

### Dependencies installation fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try `npm install --legacy-peer-deps`

---

## 📝 Quick Reference

| Service | URL | Port |
|---------|-----|------|
| Payload API | http://localhost:3000/api | 3000 |
| Payload Admin (backup) | http://localhost:3000/admin | 3000 |
| Custom Admin UI | http://localhost:3001 | 3001 |
| Storefront | http://localhost:3002 | 3002 |

---

**Ready to continue?** Check `README.md` for next steps or run through the implementation plan!
