# PROJECT CONTEXT

> **INSTRUCTION**: This is a living document. Update it whenever the project structure, tech stack, or rules change.

## 1. TECH STACK

### Core
- **Language**: TypeScript
- **Framework**:
  - Next.js 15 (Unified App)
  - Payload CMS 3.x (Built-in)
- **Build Tool**: Next.js built-in (Turbopack)

### Database & Backend
- **Database**: PostgreSQL (via Supabase)
- **ORM/Query**: Drizzle ORM (via Payload)
- **Storage**: Supabase S3-compatible storage
- **API**: Local API (Server Components) + REST API (Client Components)

### Styling & UI
- **CSS**: Tailwind CSS 3.x
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Rich Text**: Lexical Editor (Payload), TipTap (Custom Admin UI)

### Forms & Validation
- **Form Management**: React Hook Form
- **Validation**: Zod

### State & Data Fetching
- **Tables**: TanStack Table (React Table v8)
- **Data Fetching**: Payload Local API (Server) / Axios (Client)
- **State**: React useState/useEffect

---

## 2. PROJECT STRUCTURE MAP

```
./
├── payload-v3/               # Unified Next.js App (Port 3000)
│   ├── app/                  # Next.js App Router
│   │   ├── (payload)/        # Payload Admin UI (built-in at /admin)
│   │   └── dashboard/        # Custom Admin UI (merged at /dashboard)
│   ├── collections/          # Payload Collections (7 migrated collections)
│   ├── components/           # Custom UI components (shadcn/ui, etc.)
│   ├── lib/                  # Utilities & Payload Client
│   ├── payload.config.ts     # Payload v3 Configuration
│   └── package.json
│
├── backup-v2/                # Archived v2 code (payload-cms, custom-admin-ui)
│
├── storefront/               # Next.js Storefront (TODO - Phase 5)
│   └── (empty/boilerplate)
│
├── docs/
│   ├── handover_summary.md   # Latest work summary
│   ├── task.md               # Project roadmap & checklist
│   └── implementation_plan.md
│
└── ClaudeKitMini/            # Claude Code configuration toolkit
```

---

## 3. DEVELOPMENT RULES

### General Principles
- **YAGNI**: Don't overengineer. Implement only what's needed now.
- **KISS**: Keep It Simple. Avoid premature abstraction.
- **DRY**: Don't Repeat Yourself. Extract reusable logic to `/lib` or `/components`.

### Code Style
- **TypeScript**: Strict mode. Always define types explicitly.
- **Naming**:
  - Components: PascalCase (e.g., `ProductForm`)
  - Functions: camelCase (e.g., `fetchProducts`)
  - Files: kebab-case for components (e.g., `product-form.tsx`)
- **Imports**: Use `@/` alias for absolute imports.
- **Comments**: Explain "Why", not "What". Use Vietnamese for complex business logic if needed.

### Component Structure
- **File Organization**: Feature-based folders (e.g., `app/dashboard/products/`).
- **Client Components**: Use `"use client"` directive when using hooks.
- **Server Components**: Default in Next.js 15 App Router. Use for static rendering.
- **Forms**: Always use `react-hook-form` + `zod` validation.

### API Client Rules (`payload-client.ts`)
- **Centralized**: All API calls go through `lib/payload-client.ts`.
- **Consistent Response**: All API functions return `{ docs: T[], totalDocs: number }` or `{ doc: T }`.
- **Error Handling**: Catch errors in API functions, log to console, and rethrow.

### Data Tables
- **Library**: Use `@tanstack/react-table`.
- **Features Required**:
  - Search & Filter (via `DataTableToolbar`)
  - Pagination (via `DataTablePagination`)
  - Column Visibility (via `DataTableViewOptions`)
  - Bulk Actions (via `onDelete` callback)
  - Individual Actions (Edit, Delete via dropdown menu)

### Product Management Specific Rules
- **Tabs**: Product Form must have 6 tabs: General, Inventory, Attributes, Variations, Gallery, SEO.
- **Variations**: Only visible when `type === "variable"`.
- **Attributes**: Support both "Product-specific" and "Global Attributes".
- **Gallery**: Multi-image upload with drag-to-reorder (future).
- **SEO**: Always include `metaTitle`, `metaDescription`, `ogImage`.

### Git Workflow
- **Branch**: Work on feature branches (e.g., `feature/product-variations`).
- **Commits**: Use Conventional Commits format: `type(scope): description`.
  - Examples: `feat(products): add variations tab`, `fix(columns): delete button not refreshing`
- **No Direct Push**: Never push directly to `main` (unless solo project).

---

## 4. ENVIRONMENT & DEPLOYMENT

### Environment Variables
- **Payload CMS** (`.env` in `payload-cms/`):
  ```
  DATABASE_URI=postgresql://...
  PAYLOAD_SECRET=...
  S3_ENDPOINT=...
  S3_ACCESS_KEY_ID=...
  S3_SECRET_ACCESS_KEY=...
  S3_BUCKET=...
  ```
- **Custom Admin UI** (`.env.local` in `custom-admin-ui/`):
  ```
  NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3000
  ```
- **NEVER** commit `.env` files.

### Development
- **Payload CMS**: `cd payload-cms && npm run dev` (Port 3000)
- **Custom Admin UI**: `cd custom-admin-ui && npm run dev` (Port 3001)

### Deployment (TODO - Phase 7)
- **Platform**: Vercel (Admin UI & Storefront), VPS (Payload CMS)
- **Build Commands**:
  - Payload: `npm run build && npm run serve`
  - Admin UI: `npm run build`

---

## 5. CURRENT PHASE & PRIORITIES

### ✅ Completed (Phase 3)
- Advanced Product Management (Variations, Attributes, Gallery, SEO)
- Global Attributes & Terms Management
- Enhanced Categories (Hierarchy, Image)
- Posts with SEO
- UX Polish (Search, Filter, Pagination, Bulk Delete)
- Bug fixes (Next.js 15 compatibility, Delete refresh)

### 🔄 In Progress
- Product List: Delete button auto-refresh (FIXED TODAY)
- Product Form: Tabs layout optimization (FIXED TODAY)
- Variations Tab: ID substring error (FIXED TODAY)

### ⏳ Next Steps (Phase 4 & 5)
1. **WordPress Data Migration**: Export & import data
2. **Storefront Development**: Homepage, Blog, Product pages
3. **SEO Optimization**: Sitemap, structured data

---

## 6. KNOWN ISSUES & WORKAROUNDS

### Next.js 15 Specific
- **Dynamic Routes**: Must use `useParams()` hook, not `params` prop in Client Components.
- **Fast Refresh**: Sometimes requires full page reload after major component changes.

### Payload CMS Quirks
- **Relationship Fields**: Must populate via `?depth=1` query param.
- **Media**: Returns object with `{ url, filename, mimeType }` structure.

---

## 7. CONTACT & HANDOVER

- **Current Developer**: Claude (AI Assistant)
- **Last Updated**: 2025-12-01
- **Session Summary**: See `handover_summary.md`
- **Full Roadmap**: See `task.md`
