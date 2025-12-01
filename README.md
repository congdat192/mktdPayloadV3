# WordPress to Next.js Migration Project

## 🎯 Project Overview

Migration of WordPress website to modern tech stack:
- **Backend**: Payload CMS (Headless CMS)
- **Database**: Supabase (PostgreSQL + Storage)
- **Custom Admin UI**: Next.js with beautiful UI/UX
- **Storefront**: Next.js (App Router) with SEO optimization
- **Deploy**: Vercel + VPS Vietnam

---

## 📁 Project Structure

```
.
├── payload-v3/            # Unified App (Payload CMS + Custom Admin UI)
├── storefront/            # Public website (Next.js)
├── backup-v2/             # Archived v2 code
├── migration-scripts/     # WordPress data migration tools
└── README.md              # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (for database)
- npm or pnpm package manager

### 1. Setup Payload v3 (Unified App)

```bash
cd payload-v3

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local and fill in your Supabase credentials
# DATABASE_URI=postgresql://...
# PAYLOAD_SECRET=your-secret-key
# NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Run development server
npm run dev

# Access:
# - Payload Admin: http://localhost:3000/admin
# - Custom Dashboard: http://localhost:3000/dashboard
# - API: http://localhost:3000/api
```

### 2. Setup Storefront

```bash
cd storefront

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Run development server
npm run dev

# Access at: http://localhost:3002
```

---

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy database URL from Settings → Database

### Step 2: Run Payload

```bash
cd payload-v3
npm run dev
```

Payload will automatically create all necessary tables in your Supabase database when it starts for the first time.

### Step 3: Create First Admin User

Visit `http://localhost:3000/admin` and create your first admin user through the Payload UI.

---

## 📊 Data Migration from WordPress

### Step 1: Export WordPress Data

```bash
# Option A: Use WP All Export plugin
# Option B: Use WP-CLI
wp post list --format=json > posts.json
wp product list --format=json > products.json
```

### Step 2: Run Migration Scripts

```bash
cd migration-scripts

# Install dependencies
npm install

# Configure .env with WordPress API credentials

# Run migration
npm run migrate:all

# Or migrate specific entities
npm run migrate:categories
npm run migrate:posts
npm run migrate:products
```

---

## 🎨 Custom Admin UI Features

✅ **Authentication**: Login/logout with Payload auth
✅ **Dashboard**: Overview stats and quick actions
✅ **Posts Management**: Create, edit, delete blog posts
✅ **Products Management**: Manage WooCommerce products
✅ **Media Library**: Upload and manage images
✅ **Categories**: Organize content
✅ **SEO Fields**: Meta titles, descriptions, OG tags
✅ **Rich Text Editor**: TipTap WYSIWYG editor
✅ **Responsive Design**: Works on mobile/tablet

---

## 🌐 Storefront Features

✅ **Homepage**: Hero section + latest posts
✅ **Blog**: `/blog` - All posts with pagination
✅ **Blog Post**: `/blog/[slug]` - Individual post
✅ **Products**: `/san-pham` -  Product listing (if WooCommerce)
✅ **Product Detail**: `/san-pham/[slug]` - Single product
✅ **SEO Optimized**: Meta tags, structured data, sitemap
✅ **Performance**: ISR, image optimization, code splitting

---

## 🔧 Development Workflow

### Running Services Locally

**Terminal 1 - Payload v3 (Backend + Admin UI):**
```bash
cd payload-v3 && npm run dev
```

**Terminal 2 - Storefront:**
```bash
cd storefront && npm run dev
```

**Access:**
- Payload Admin: http://localhost:3000/admin
- Custom Dashboard: http://localhost:3000/dashboard
- Storefront: http://localhost:3002
- API: http://localhost:3000/api

---

## 📦 Building for Production

### Payload CMS

```bash
cd payload-cms
npm run build
npm run serve
```

### Admin UI

```bash
cd custom-admin-ui
npm run build
npm start
```

### Storefront

```bash
cd storefront
npm run build
npm start
```

---

## 🚢 Deployment

### Option A: Vercel (All services)

1. **Deploy Storefront:**
   ```bash
   cd storefront
   vercel deploy
   ```

2. **Deploy Admin UI:**
   ```bash
   cd custom-admin-ui
   vercel deploy
   ```

3. **Deploy Payload:**
   ```bash
   cd payload-cms
   vercel deploy
   ```

### Option B: VPS Vietnam (Payload + Admin)

1. **Setup Docker Compose:**
   ```yaml
   version: '3'
   services:
     payload:
       build: ./payload-cms
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: ${DATABASE_URL}
     
     admin:
       build: ./custom-admin-ui
       ports:
         - "3001:3001"
   ```

2. **Deploy:**
   ```bash
   docker-compose up -d
   ```

3. **Deploy Storefront to Vercel** for global CDN

---

## 🧪 Testing

### Test Payload API

```bash
# Get all posts
curl http://localhost:3000/api/posts

# Get single post
curl http://localhost:3000/api/posts/[id]

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

---

## 📝 Next Steps

### Phase 1 ✅ (Completed)
- [x] Setup project structure
- [x] Configure Payload CMS
- [x] Create Custom Admin UI boilerplate
- [x] Create Storefront boilerplate

### Phase 2 (Next)
- [ ] Setup Supabase database
- [ ] Test Payload with real data
- [ ] Build admin UI components (forms, tables, editors)
- [ ] Create WordPress migration scripts

### Phase 3 (Future)
- [ ] Build storefront pages (blog, products)
- [ ] SEO optimization
- [ ] Performance testing
- [ ] Deploy to production

---

## 🆘 Troubleshooting

### Payload won't start
- Check `DATABASE_URL` in `.env`
- Make sure Supabase database is accessible
- Check Node.js version (requires 18+)

### Admin UI can't connect to Payload
- Verify `NEXT_PUBLIC_PAYLOAD_URL` in `.env.local`
- Check Payload is running on port 3000
- Check CORS settings in `payload.config.ts`

### Migration fails
- Verify WordPress API is accessible
- Check WordPress REST API is enabled
- Ensure migration script has correct credentials

---

## 📚 Documentation Links

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TipTap Editor](https://tiptap.dev)
- [Shadcn/ui](https://ui.shadcn.com)

---

## 👥 Support

For questions or issues:
1. Check the implementation plan (`implementation_plan.md`)
2. Review task checklist (`task.md`)
3. Contact project maintainer

---

**Built with ❤️ using Next.js, Payload CMS, and Supabase**
