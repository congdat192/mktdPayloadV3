# PAYLOAD V3 MIGRATION - QUICK START GUIDE

> **TL;DR**: Fresh install Payload v3, copy collections, merge custom UI. 3-4 hours total.

---

## 🚀 QUICK COMMANDS (Copy-Paste Ready)

### Step 1: Backup Current Work (5 mins)
```bash
cd "/Users/congdat/Desktop/Landingpage sinh nhật"
mkdir -p backup-v2/collections backup-v2/custom-ui

# Backup collections
cp -r payload-cms/src/collections/* backup-v2/collections/
cp payload-cms/src/payload.config.ts backup-v2/
cp payload-cms/.env backup-v2/.env.backup

# Backup custom UI
cp -r custom-admin-ui/components backup-v2/custom-ui/
cp -r custom-admin-ui/app/dashboard backup-v2/custom-ui/
cp -r custom-admin-ui/lib backup-v2/custom-ui/
cp custom-admin-ui/tailwind.config.ts backup-v2/custom-ui/
```

### Step 2: Create Payload v3 App (10 mins)
```bash
cd "/Users/congdat/Desktop/Landingpage sinh nhật"
npx create-payload-app@latest payload-v3

# Prompts:
# - Template: blank
# - Database: PostgreSQL
# - Cloud database: No
```

### Step 3: Install Dependencies (5 mins)
```bash
cd payload-v3

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
  zod \
  @payloadcms/storage-s3
```

### Step 4: Configure Environment (5 mins)
```bash
# Copy .env values from backup-v2/.env.backup
# Create .env.local with these keys:
cat > .env.local << 'EOF'
DATABASE_URI=your_postgres_url_here
PAYLOAD_SECRET=your_secret_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
S3_ENDPOINT=your_s3_endpoint
S3_ACCESS_KEY_ID=your_key
S3_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=your_bucket
S3_REGION=ap-southeast-1
NODE_ENV=development
EOF
```

### Step 5: Copy Collections (10 mins)
```bash
# Copy collection files
mkdir -p collections
cp ../backup-v2/collections/*.ts ./collections/

# Update imports in all collection files
# Change: import { CollectionConfig } from 'payload/types'
# To: import type { CollectionConfig } from 'payload'

# Use find-and-replace in your IDE
```

### Step 6: Update payload.config.ts (10 mins)
Replace entire file with config from `PAYLOAD-V3-MIGRATION-PLAN.md` (Section 3.2)

### Step 7: Merge Custom UI (30 mins)
```bash
# Copy UI files
cp -r ../backup-v2/custom-ui/components ./components
cp -r ../backup-v2/custom-ui/dashboard ./app/dashboard
cp -r ../backup-v2/custom-ui/lib ./lib

# Copy Tailwind config
cp ../backup-v2/custom-ui/tailwind.config.ts ./
```

### Step 8: Start & Test (10 mins)
```bash
npm run dev

# Open in browser:
# - Payload Admin: http://localhost:3000/admin
# - Custom Dashboard: http://localhost:3000/dashboard
```

---

## ✅ VERIFICATION CHECKLIST

Quick tests to verify everything works:

```bash
# 1. Server starts without errors
npm run dev

# 2. Can access Payload admin
curl http://localhost:3000/admin

# 3. Can access API
curl http://localhost:3000/api/products

# 4. Database connected
psql $DATABASE_URI -c "SELECT 1"
```

**In Browser:**
- [ ] `/admin` loads (Payload UI)
- [ ] Create test user
- [ ] `/dashboard` loads (Custom UI)
- [ ] Create test product
- [ ] Upload test image
- [ ] All Tailwind styles work

---

## 🔧 COMMON FIXES

### Fix 1: Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Fix 2: TypeScript Errors
```bash
npm run generate:types
```

### Fix 3: Database Connection
```bash
# Test connection
psql $DATABASE_URI -c "\dt"
```

### Fix 4: Tailwind Not Working
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 📁 NEW PROJECT STRUCTURE

```
payload-v3/
├── app/
│   ├── (payload)/          # Payload admin (auto-generated)
│   │   └── admin/          # /admin route
│   └── dashboard/          # Custom UI (your code)
│       ├── products/
│       ├── categories/
│       └── posts/
├── collections/            # 7 Collections
│   ├── Users.ts
│   ├── Products.ts
│   ├── Categories.ts
│   ├── Posts.ts
│   ├── Media.ts
│   ├── ProductAttributes.ts
│   └── ProductVariations.ts
├── components/             # Custom UI components
│   ├── ui/                # shadcn/ui
│   ├── products/
│   └── editor/
├── lib/
│   └── payload-client.ts  # API utilities
├── payload.config.ts       # Payload config
├── .env.local             # Environment vars
└── package.json
```

---

## 📊 MIGRATION PROGRESS TRACKER

**Current Status**: [ ] Not Started

- [ ] **Phase 1**: Backup (5 mins)
- [ ] **Phase 2**: Install v3 (10 mins)
- [ ] **Phase 3**: Configure (15 mins)
- [ ] **Phase 4**: Migrate Collections (10 mins)
- [ ] **Phase 5**: Merge Custom UI (30 mins)
- [ ] **Phase 6**: Authentication (15 mins)
- [ ] **Phase 7**: Testing (30 mins)
- [ ] **Phase 8**: Documentation (15 mins)

**Total Estimated Time**: 2.5 - 3 hours

---

## 🆘 NEED HELP?

1. **Read full guide**: `PAYLOAD-V3-MIGRATION-PLAN.md`
2. **Payload Docs**: https://payloadcms.com/docs
3. **Discord**: https://discord.gg/payload
4. **GitHub Issues**: https://github.com/payloadcms/payload/issues

---

**Good luck! 🎉**
