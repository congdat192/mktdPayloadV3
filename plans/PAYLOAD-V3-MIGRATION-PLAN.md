# PAYLOAD v3 MIGRATION & CUSTOM ADMIN UI MERGE PLAN

**Created**: 2025-12-01
**Target**: Migrate from Payload v2.28.0 to v3.x + Merge Custom Admin UI into single Next.js app
**Status**: Ready for Implementation
**Estimated Time**: 3-4 hours

---

## 📋 EXECUTIVE SUMMARY

### Current Architecture (v2)
```
Project Root/
├── payload-cms/              # Payload v2.28 + Express (Port 3000)
│   ├── 7 Collections
│   └── Standalone backend
│
└── custom-admin-ui/          # Next.js 15 Admin Dashboard (Port 3001)
    └── Custom UI with shadcn/ui, TipTap, TanStack Table
```

### New Architecture (v3)
```
Project Root/
└── payload-v3/               # Unified Next.js App (Port 3000)
    ├── app/                  # Next.js App Router
    │   ├── (payload)/        # Payload Admin UI (built-in)
    │   └── dashboard/        # Custom Admin UI (merged)
    ├── collections/          # 7 Collections (migrated)
    ├── payload.config.ts     # Payload v3 Config
    └── components/           # Custom UI components
```

### Key Benefits
- ✅ Single codebase, single deployment
- ✅ Shared authentication & session
- ✅ Better TypeScript integration
- ✅ React Server Components performance
- ✅ No CORS issues
- ✅ Unified routing

---

## 🎯 MIGRATION STRATEGY

**Approach**: Fresh Install (Recommended for projects < 1 week old with no production data)

### Why Not In-Place Migration?
- Current project is < 1 day old
- No production data to preserve
- Cleaner architecture with v3 from scratch
- Avoids complex Express → Next.js refactoring

---

## 📦 PHASE 1: BACKUP & PREPARATION

### 1.1 Backup Current Collections
```bash
# Create backup directory
mkdir -p backup-v2/collections

# Copy all collections
cp -r payload-cms/src/collections/* backup-v2/collections/

# Backup config
cp payload-cms/src/payload.config.ts backup-v2/
cp payload-cms/src/server.ts backup-v2/

# Backup .env
cp payload-cms/.env backup-v2/.env.backup
```

### 1.2 Document Current Setup
Save these values from `payload-cms/.env`:
```bash
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=...
S3_ENDPOINT=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=...
S3_REGION=...
```

### 1.3 Backup Custom Admin UI
```bash
# Copy custom UI components
cp -r custom-admin-ui/components backup-v2/custom-ui/
cp -r custom-admin-ui/app/dashboard backup-v2/custom-ui/
cp -r custom-admin-ui/lib backup-v2/custom-ui/
```

---

## 🚀 PHASE 2: INSTALL PAYLOAD V3

### 2.1 Create New Payload v3 Project
```bash
# Navigate to project root
cd "/Users/congdat/Desktop/Landingpage sinh nhật"

# Create new Payload v3 app
npx create-payload-app@latest payload-v3

# Follow prompts:
# - Template: "blank" (we'll add collections manually)
# - Database: PostgreSQL
# - Package manager: npm
```

**Interactive Prompts:**
```
? Project name: payload-v3
? Choose a template: blank
? Select a database: PostgreSQL
? Would you like to use a cloud database? No (we use Supabase)
```

### 2.2 Navigate to New Project
```bash
cd payload-v3
```

### 2.3 Install Additional Dependencies
```bash
# Install Custom Admin UI dependencies
npm install \
  @hookform/resolvers \
  @radix-ui/react-accordion \
  @radix-ui/react-checkbox \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-icons \
  @radix-ui/react-label \
  @radix-ui/react-select \
  @radix-ui/react-slot \
  @radix-ui/react-tabs \
  @radix-ui/react-toggle \
  @tanstack/react-query \
  @tanstack/react-table \
  @tiptap/extension-link \
  @tiptap/extension-placeholder \
  @tiptap/pm \
  @tiptap/react \
  @tiptap/starter-kit \
  axios \
  class-variance-authority \
  clsx \
  date-fns \
  lucide-react \
  react-hook-form \
  tailwind-merge \
  tailwindcss-animate \
  zod

# Install S3 storage plugin
npm install @payloadcms/storage-s3
```

---

## ⚙️ PHASE 3: CONFIGURE PAYLOAD V3

### 3.1 Update `.env`
Create/update `.env.local` in `payload-v3/`:
```bash
# Database (Supabase PostgreSQL)
DATABASE_URI=postgresql://... # Copy from backup

# Payload
PAYLOAD_SECRET=... # Copy from backup or generate new: openssl rand -base64 32
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# S3 Storage (Supabase)
S3_ENDPOINT=... # Copy from backup
S3_ACCESS_KEY_ID=... # Copy from backup
S3_SECRET_ACCESS_KEY=... # Copy from backup
S3_BUCKET=... # Copy from backup
S3_REGION=... # Copy from backup (usually 'ap-southeast-1' for Supabase)

# Node Environment
NODE_ENV=development
```

### 3.2 Update `payload.config.ts`
Replace the default config with:

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections (we'll create these next)
import { Users } from './collections/Users'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { ProductAttributes } from './collections/ProductAttributes'
import { ProductVariations } from './collections/ProductVariations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  // Admin UI Configuration
  admin: {
    user: 'users',
    // Payload v3 admin is at /admin by default
  },

  // Collections
  collections: [
    Users,
    Posts,
    Products,
    Categories,
    Media,
    ProductAttributes,
    ProductVariations,
  ],

  // Editor
  editor: lexicalEditor(),

  // Database
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),

  // TypeScript
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // GraphQL (optional)
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },

  // Plugins
  plugins: [
    s3Storage({
      collections: {
        media: true, // Enable S3 for 'media' collection
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        endpoint: process.env.S3_ENDPOINT!,
        region: process.env.S3_REGION || 'ap-southeast-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        forcePathStyle: true, // Required for Supabase S3
      },
    }),
  ],
})
```

---

## 📁 PHASE 4: MIGRATE COLLECTIONS

### 4.1 Create Collections Directory
```bash
mkdir -p collections
```

### 4.2 Copy Collections from Backup
Copy all 7 collection files from `backup-v2/collections/` to `payload-v3/collections/`:

```bash
cp ../backup-v2/collections/*.ts ./collections/
```

### 4.3 Update Import Statements (v3 Changes)
In **each collection file**, update the import statement:

**OLD (v2):**
```typescript
import { CollectionConfig } from 'payload/types'
```

**NEW (v3):**
```typescript
import type { CollectionConfig } from 'payload'
```

### 4.4 Verify Collection Structure
Payload v3 collection schema is **mostly backward compatible**. Only minor changes needed:

**Example: `Users.ts`**
```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Enable authentication
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
}
```

**No changes needed for:**
- Field definitions
- Access control
- Hooks
- Validation

---

## 🎨 PHASE 5: MERGE CUSTOM ADMIN UI

### 5.1 Copy Custom UI Components
```bash
# Copy components from backup
cp -r ../backup-v2/custom-ui/components ./components

# Copy custom dashboard routes
cp -r ../backup-v2/custom-ui/dashboard ./app/dashboard

# Copy lib utilities
cp -r ../backup-v2/custom-ui/lib ./lib
```

### 5.2 Update API Client (`lib/payload-client.ts`)
**OLD (v2 - External API calls):**
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000',
})
```

**NEW (v3 - Local API):**
```typescript
import { getPayload } from 'payload'
import config from '@/payload.config'

// Server Component: Use Local API (faster)
export async function getProducts() {
  const payload = await getPayload({ config })
  const products = await payload.find({
    collection: 'products',
    limit: 100,
  })
  return products
}

// Client Component: Still use REST API if needed
import axios from 'axios'
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
})
```

### 5.3 Update Tailwind Config
Copy Tailwind config from `custom-admin-ui/`:
```bash
cp ../custom-admin-ui/tailwind.config.ts ./tailwind.config.ts
cp ../custom-admin-ui/postcss.config.js ./postcss.config.js
```

Update `tailwind.config.ts` content paths:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Copy your custom theme from custom-admin-ui
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

### 5.4 Update Root Layout
Edit `app/layout.tsx` to include Tailwind:
```typescript
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Product Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### 5.5 Create Dashboard Layout
Create `app/dashboard/layout.tsx`:
```typescript
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 🔐 PHASE 6: UNIFIED AUTHENTICATION

### 6.1 Shared Auth Strategy
Payload v3 + Custom UI can share authentication:

**Option A: Use Payload Auth Everywhere (Recommended)**
- Login at `/admin` (Payload UI)
- Custom dashboard checks Payload session
- Shared cookies across `/admin` and `/dashboard`

**Implementation:**
```typescript
// app/dashboard/page.tsx (Server Component)
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function DashboardPage() {
  const payload = await getPayload({ config })

  // Check authentication
  const token = cookies().get('payload-token')
  if (!token) {
    redirect('/admin/login')
  }

  // Verify token
  try {
    const user = await payload.auth({ headers: { cookie: `payload-token=${token.value}` }})
    if (!user) redirect('/admin/login')
  } catch (error) {
    redirect('/admin/login')
  }

  return <div>Dashboard</div>
}
```

**Option B: Separate Auth for Custom UI**
- Keep custom login at `/dashboard/login`
- Use custom auth logic
- More complex, not recommended

---

## 🧪 PHASE 7: TESTING & VERIFICATION

### 7.1 Start Development Server
```bash
npm run dev
```

### 7.2 Test Checklist

#### Payload Admin UI (Built-in)
- [ ] Access `/admin` → Payload Admin loads
- [ ] Create test user
- [ ] Login successfully
- [ ] View all 7 collections in sidebar
- [ ] Create/Read/Update/Delete test records in each collection
- [ ] Upload media (test S3 integration)

#### Custom Dashboard
- [ ] Access `/dashboard` → Custom UI loads
- [ ] Verify Tailwind styles work
- [ ] Test product CRUD operations
- [ ] Test category management
- [ ] Test post management
- [ ] Test TipTap editor
- [ ] Test TanStack Table (search, filter, pagination)
- [ ] Test media upload in custom UI

#### API Testing
```bash
# Test REST API
curl http://localhost:3000/api/products
curl http://localhost:3000/api/categories

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/products
```

#### Database Verification
```bash
# Check if tables were created
psql $DATABASE_URL -c "\dt"

# Should see tables for:
# - users
# - products
# - categories
# - posts
# - media
# - product_attributes
# - product_variations
```

---

## 📊 PHASE 8: UPDATE DOCUMENTATION

### 8.1 Update CONTEXT.md
Replace tech stack section:
```markdown
### Core
- **Language**: TypeScript
- **Framework**:
  - Next.js 15 (Unified App)
  - Payload CMS 3.x (Built-in)
- **Build Tool**: Next.js built-in (Turbopack)

### Architecture
- Single Next.js app at Port 3000
- Payload Admin UI: /admin
- Custom Admin UI: /dashboard
- REST API: /api/*
```

### 8.2 Update Development Commands
```markdown
### Development
- `npm run dev` → Starts unified app (Port 3000)
- Access Payload Admin: http://localhost:3000/admin
- Access Custom Dashboard: http://localhost:3000/dashboard
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: Module Resolution Errors
**Error**: `Cannot find module 'payload'`

**Fix**:
```bash
npm install
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Database Connection Failed
**Error**: `Connection refused`

**Fix**:
- Verify `DATABASE_URI` in `.env.local`
- Check Supabase database is running
- Test connection: `psql $DATABASE_URI -c "SELECT 1"`

### Issue 3: S3 Upload Fails
**Error**: `Access denied`

**Fix**:
- Verify S3 credentials in `.env.local`
- Check Supabase S3 bucket permissions
- Ensure `forcePathStyle: true` in config

### Issue 4: TypeScript Errors in Collections
**Error**: `CollectionConfig type mismatch`

**Fix**:
```typescript
// Change import
import type { CollectionConfig } from 'payload'

// Not this:
import { CollectionConfig } from 'payload/types'
```

### Issue 5: Custom UI Not Loading Styles
**Error**: Tailwind classes not applying

**Fix**:
```bash
# Ensure Tailwind is installed
npm install -D tailwindcss postcss autoprefixer

# Regenerate config
npx tailwindcss init -p

# Update content paths in tailwind.config.ts
```

### Issue 6: CORS Errors (Should Not Occur)
If you still see CORS errors, ensure you're using Local API in Server Components, not REST API.

---

## 📋 COMPLETE CHECKLIST

### Pre-Migration
- [ ] Backup all collections to `backup-v2/collections/`
- [ ] Backup `.env` file
- [ ] Backup custom UI components
- [ ] Document current database credentials

### Installation
- [ ] Create new Payload v3 app with `create-payload-app`
- [ ] Install additional dependencies
- [ ] Configure `.env.local`
- [ ] Update `payload.config.ts`

### Collections Migration
- [ ] Copy 7 collection files
- [ ] Update import statements (`payload/types` → `payload`)
- [ ] Verify Users collection (auth enabled)
- [ ] Verify Products collection
- [ ] Verify Categories collection
- [ ] Verify Posts collection
- [ ] Verify Media collection (S3 configured)
- [ ] Verify ProductAttributes collection
- [ ] Verify ProductVariations collection

### Custom UI Merge
- [ ] Copy components to `components/`
- [ ] Copy dashboard routes to `app/dashboard/`
- [ ] Copy lib utilities to `lib/`
- [ ] Update `payload-client.ts` to use Local API
- [ ] Copy Tailwind config
- [ ] Create dashboard layout
- [ ] Update root layout

### Testing
- [ ] Start dev server (`npm run dev`)
- [ ] Test Payload Admin UI at `/admin`
- [ ] Create test user and login
- [ ] Test all CRUD operations
- [ ] Test media upload (S3)
- [ ] Test custom dashboard at `/dashboard`
- [ ] Test custom UI components
- [ ] Verify database tables created
- [ ] Test API endpoints

### Documentation
- [ ] Update CONTEXT.md
- [ ] Update README.md (if exists)
- [ ] Document new architecture
- [ ] Update development commands

### Cleanup
- [ ] Archive old `payload-cms/` directory
- [ ] Archive old `custom-admin-ui/` directory
- [ ] Update git repository (if applicable)

---

## 🎯 SUCCESS CRITERIA

Migration is complete when:
1. ✅ Payload v3 admin accessible at `/admin`
2. ✅ Custom dashboard accessible at `/dashboard`
3. ✅ All 7 collections working (CRUD operations)
4. ✅ S3 media upload functional
5. ✅ Shared authentication between UIs
6. ✅ No TypeScript errors
7. ✅ All custom UI components rendering
8. ✅ TanStack Table, TipTap editor working
9. ✅ Database connected and tables created
10. ✅ Documentation updated

---

## 📚 REFERENCES

### Official Documentation
- [Payload v3 Docs](https://payloadcms.com/docs)
- [Migration Guide (v2 → v3)](https://github.com/payloadcms/payload/discussions/6929)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Payload Local API](https://payloadcms.com/docs/local-api/overview)

### Key Changes in v3
- Next.js native (no Express server needed)
- No bundler required (uses Next.js built-in)
- React Server Components support
- Improved TypeScript types
- Local API for server-side operations
- Better performance and DX

---

## 💡 POST-MIGRATION OPTIMIZATIONS

After successful migration, consider:

1. **Use Local API in Server Components**
   - Faster than REST API
   - No HTTP overhead
   - Better type safety

2. **Implement React Server Components**
   - Move data fetching to server
   - Reduce client bundle size
   - Improve initial page load

3. **Optimize Database Queries**
   - Add indexes on frequently queried fields
   - Use `select` to limit returned fields
   - Implement pagination properly

4. **Configure Production Build**
   - Update environment variables for production
   - Configure proper S3 bucket for production
   - Set up CI/CD pipeline

---

## 🚨 IMPORTANT NOTES

1. **This is a Fresh Install**, not an in-place migration
2. **No data migration needed** (project < 1 day old)
3. **Architecture changes significantly** (2 apps → 1 app)
4. **Custom UI keeps all features** (just relocated)
5. **Shared authentication** simplifies UX
6. **Better performance** with React Server Components

---

**Good luck with the migration! 🚀**

If you encounter issues not covered in this guide, refer to:
- [Payload Discord Community](https://discord.gg/payload)
- [GitHub Discussions](https://github.com/payloadcms/payload/discussions)
- [Official Documentation](https://payloadcms.com/docs)
