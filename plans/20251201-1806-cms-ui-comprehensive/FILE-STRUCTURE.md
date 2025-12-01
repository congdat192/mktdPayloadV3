# Cấu trúc File & Folders Đề xuất

## 📂 Custom Admin UI - Final Structure

```
custom-admin-ui/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx                  ✅ Existing
│   │   ├── page.tsx                    ✅ Existing (enhance with widgets)
│   │   │
│   │   ├── products/                   ✅ Existing
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── columns.tsx
│   │   │   └── product-form.tsx
│   │   │
│   │   ├── categories/                 ✅ Existing
│   │   ├── posts/                      ✅ Existing
│   │   ├── attributes/                 ✅ Existing
│   │   │
│   │   ├── orders/                     🔴 Phase 3 - NEW
│   │   │   ├── page.tsx                # Orders list
│   │   │   ├── [id]/page.tsx           # Order detail
│   │   │   ├── columns.tsx
│   │   │   └── order-form.tsx
│   │   │
│   │   ├── customers/                  🔴 Phase 3 - NEW
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── customer-form.tsx
│   │   │
│   │   ├── coupons/                    🔴 Phase 3 - NEW
│   │   │   ├── page.tsx
│   │   │   └── coupon-form.tsx
│   │   │
│   │   ├── users/                      🔴 Phase 2 - NEW
│   │   │   ├── page.tsx                # Users list
│   │   │   ├── [id]/page.tsx           # User edit
│   │   │   └── roles/page.tsx          # Roles management
│   │   │
│   │   ├── menus/                      🔴 Phase 2 - NEW
│   │   │   └── page.tsx                # Menu builder
│   │   │
│   │   ├── comments/                   🔴 Phase 5 - NEW
│   │   │   └── page.tsx
│   │   │
│   │   ├── logs/                       🔴 Phase 2 - NEW
│   │   │   └── page.tsx                # Activity logs
│   │   │
│   │   ├── reports/                    🔴 Phase 4 - NEW
│   │   │   ├── page.tsx
│   │   │   ├── sales/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   └── customers/page.tsx
│   │   │
│   │   ├── settings/                   🔴 Phase 2 - NEW
│   │   │   ├── page.tsx                # Settings tabs container
│   │   │   ├── general/page.tsx
│   │   │   ├── reading/page.tsx
│   │   │   ├── permalinks/page.tsx
│   │   │   ├── shipping/page.tsx
│   │   │   └── tax/page.tsx
│   │   │
│   │   ├── media/                      🟡 Enhance in Phase 5
│   │   │   └── page.tsx                # Full media library page
│   │   │
│   │   └── tools/                      🔴 Phase 5 - NEW
│   │       ├── import/page.tsx
│   │       └── export/page.tsx
│   │
│   ├── login/                          ✅ Existing
│   ├── layout.tsx                      ✅ Existing
│   ├── providers.tsx                   🟡 Enhance (add React Query)
│   └── globals.css                     ✅ Existing
│
├── components/
│   ├── ui/                             ✅ Existing (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── data-table.tsx
│   │   ├── toast.tsx                   🔴 Phase 1 - ADD
│   │   ├── skeleton.tsx                🔴 Phase 1 - ADD
│   │   ├── breadcrumb.tsx              🔴 Phase 1 - ADD
│   │   ├── command.tsx                 🔴 Phase 1 - ADD
│   │   └── ... (other shadcn components)
│   │
│   ├── layout/                         ✅ Existing
│   │   ├── header.tsx                  🟡 Enhance (breadcrumbs, mobile menu)
│   │   ├── sidebar.tsx                 🟡 Enhance (collapsible)
│   │   └── breadcrumb-nav.tsx          🔴 Phase 1 - NEW
│   │
│   ├── shared/                         🔴 Phase 1 - NEW FOLDER
│   │   ├── command-palette.tsx         # Cmd+K global search
│   │   ├── loading-state.tsx
│   │   ├── error-state.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-boundary.tsx
│   │   ├── data-table/                 # Enhanced DataTable
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-toolbar.tsx
│   │   │   └── data-table-pagination.tsx
│   │   └── modals/
│   │       └── confirmation-dialog.tsx
│   │
│   ├── dashboard/                      🔴 Phase 4 - NEW FOLDER
│   │   ├── stats-card.tsx              # Dashboard widgets
│   │   ├── recent-orders.tsx
│   │   ├── sales-chart.tsx
│   │   └── low-stock-alert.tsx
│   │
│   ├── products/                       ✅ Existing
│   │   ├── product-form.tsx
│   │   ├── product-attributes.tsx
│   │   ├── product-variations.tsx
│   │   ├── product-gallery.tsx
│   │   └── product-seo.tsx
│   │
│   ├── orders/                         🔴 Phase 3 - NEW FOLDER
│   │   ├── order-form.tsx
│   │   ├── order-status-badge.tsx
│   │   ├── order-timeline.tsx
│   │   ├── order-items-table.tsx
│   │   └── order-actions.tsx
│   │
│   ├── customers/                      🔴 Phase 3 - NEW FOLDER
│   │   ├── customer-form.tsx
│   │   ├── customer-stats.tsx
│   │   └── customer-orders-history.tsx
│   │
│   ├── users/                          🔴 Phase 2 - NEW FOLDER
│   │   ├── user-form.tsx
│   │   ├── role-selector.tsx
│   │   └── permission-matrix.tsx
│   │
│   ├── menus/                          🔴 Phase 2 - NEW FOLDER
│   │   ├── menu-builder.tsx            # Drag & drop menu editor
│   │   ├── menu-item-form.tsx
│   │   └── menu-tree.tsx
│   │
│   ├── settings/                       🔴 Phase 2 - NEW FOLDER
│   │   ├── settings-form.tsx
│   │   └── settings-tabs.tsx
│   │
│   ├── reports/                        🔴 Phase 4 - NEW FOLDER
│   │   ├── date-range-picker.tsx
│   │   ├── sales-chart.tsx
│   │   └── export-button.tsx
│   │
│   ├── media/                          ✅ Existing
│   │   ├── media-library-modal.tsx     🟡 Enhance in Phase 5
│   │   ├── media-grid.tsx              🔴 Phase 5 - NEW
│   │   └── media-editor.tsx            🔴 Phase 5 - NEW
│   │
│   └── editor/                         ✅ Existing
│       └── rich-text-editor.tsx
│
├── lib/
│   ├── utils.ts                        ✅ Existing
│   ├── payload-client.ts               ✅ Existing
│   │
│   ├── design-tokens.ts                🔴 Phase 1 - NEW
│   ├── react-query.ts                  🔴 Phase 1 - NEW
│   ├── api-resource.ts                 🔴 Phase 1 - NEW (Generic CRUD)
│   │
│   ├── api/                            🔴 Phase 1+ - NEW FOLDER
│   │   ├── products.ts                 # Refactor existing
│   │   ├── categories.ts
│   │   ├── posts.ts
│   │   ├── orders.ts                   # Phase 3
│   │   ├── customers.ts                # Phase 3
│   │   ├── coupons.ts                  # Phase 3
│   │   ├── users.ts                    # Phase 2
│   │   └── media.ts
│   │
│   ├── stores/                         🔴 Phase 1 - NEW FOLDER (Zustand)
│   │   ├── ui-store.ts                 # Sidebar, theme, notifications
│   │   ├── auth-store.ts               # User session
│   │   └── settings-store.ts           # App settings
│   │
│   ├── hooks/                          🔴 Phase 1 - NEW FOLDER
│   │   ├── use-toast.ts
│   │   ├── use-data-table.ts           # DataTable abstraction
│   │   ├── use-command-palette.ts
│   │   ├── use-permissions.ts          # Phase 2 - RBAC
│   │   └── use-form-autosave.ts        # Phase 6
│   │
│   ├── validators/                     🔴 NEW FOLDER (Zod schemas)
│   │   ├── product-schema.ts
│   │   ├── order-schema.ts
│   │   ├── customer-schema.ts
│   │   └── user-schema.ts
│   │
│   └── utils/                          🔴 NEW FOLDER
│       ├── formatters.ts               # Currency, date formatting
│       ├── rbac.ts                     # Permission checks (Phase 2)
│       ├── order-calculations.ts       # Phase 3
│       └── menu-tree.ts                # Phase 2
│
├── types/                              🔴 NEW FOLDER
│   ├── product.ts
│   ├── order.ts
│   ├── customer.ts
│   ├── user.ts
│   └── common.ts
│
├── public/
│   └── ... (images, icons)
│
├── .env.local                          ✅ Existing
├── next.config.ts                      ✅ Existing
├── tailwind.config.ts                  ✅ Existing
├── tsconfig.json                       ✅ Existing
└── package.json                        🟡 Update with new dependencies
```

---

## 🎯 Priority Markers

- ✅ **Existing** - Already implemented
- 🟡 **Enhance** - Exists but needs improvement
- 🔴 **NEW** - Needs to be created

---

## 📊 File Count Estimate

| Category | Current | After Phase 1 | After All Phases |
|----------|---------|---------------|------------------|
| Pages | ~15 | ~20 | ~40 |
| Components | ~30 | ~50 | ~100 |
| Lib/Utils | ~5 | ~20 | ~40 |
| **Total** | **~50** | **~90** | **~180** |

---

## 🔑 Key Folders to Create First (Phase 1)

```bash
# Phase 1 - Critical Folders
mkdir -p components/shared/{data-table,modals}
mkdir -p lib/{stores,hooks,api,utils}
mkdir -p types

# Phase 2 - Core CMS
mkdir -p app/dashboard/{users,menus,logs,settings}
mkdir -p components/{users,menus,settings}

# Phase 3 - E-Commerce
mkdir -p app/dashboard/{orders,customers,coupons}
mkdir -p components/{orders,customers}

# Phase 4 - Analytics
mkdir -p app/dashboard/reports/{sales,products,customers}
mkdir -p components/{dashboard,reports}

# Phase 5 - Advanced
mkdir -p app/dashboard/{tools,comments}
```

---

## 🚀 Migration Strategy

### Step 1: Create new structure WITHOUT breaking existing
```bash
# Create all new folders first
# Don't touch existing files yet
```

### Step 2: Gradually refactor existing files
```typescript
// Example: Refactor payload-client.ts to use APIResource

// OLD: lib/payload-client.ts
export const productsAPI = {
  getAll: async () => { ... },
  create: async () => { ... }
}

// NEW: lib/api/products.ts
export const productsAPI = new APIResource<Product>('/products')

// Then update imports in components one by one
```

### Step 3: Add new features in parallel
```
- Continue developing new features (Phase 2, 3, 4)
- While refactoring existing code
- No downtime, gradual improvement
```

---

## 📝 Naming Conventions

### Files
- **Components**: PascalCase (`OrderForm.tsx` → `order-form.tsx`)
- **Utilities**: kebab-case (`order-calculations.ts`)
- **Types**: kebab-case (`order.ts`)
- **Pages**: Next.js convention (`page.tsx`, `[id]/page.tsx`)

### Folders
- **Feature-based**: Group by domain (`orders/`, `customers/`)
- **Shared utilities**: Generic name (`shared/`, `utils/`)

### Exports
```typescript
// Named exports (preferred)
export function OrderForm() {}
export const ordersAPI = new APIResource<Order>('/orders')

// Default export only for Next.js pages
export default function OrdersPage() {}
```

---

## 🔍 Quick Navigation Guide

### "I want to add a new feature (e.g., Reviews)"

1. Create page: `app/dashboard/reviews/page.tsx`
2. Create API: `lib/api/reviews.ts`
3. Create components: `components/reviews/review-form.tsx`
4. Create types: `types/review.ts`
5. Add to sidebar: `components/layout/sidebar.tsx`

### "I want to add a reusable component"

- **UI primitive**: `components/ui/` (use shadcn/ui)
- **Complex shared component**: `components/shared/`
- **Feature-specific**: `components/[feature]/`

### "I want to add a utility function"

- **Generic**: `lib/utils/`
- **API-related**: `lib/api/`
- **State management**: `lib/stores/`
- **React hooks**: `lib/hooks/`

---

**Status**: ✅ Structure Defined
**Next**: Start implementing Phase 1