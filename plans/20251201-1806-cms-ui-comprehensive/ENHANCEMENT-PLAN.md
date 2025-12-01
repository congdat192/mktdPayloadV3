# ENHANCEMENT PLAN - Nâng Cấp Features Hiện Có (Payload v3 Unified)

**Created**: 2025-12-01
**Updated**: 2025-12-01 (Adapted for Payload v3 Unified App)
**Goal**: Nâng cấp tất cả features hiện có lên mức WordPress + WooCommerce standard
**Priority**: HIGH - Làm TRƯỚC khi thêm features mới
**Architecture**: Next.js 15 App Router + Payload v3 Local API + Server Actions

---

## 📊 CURRENT STATE ANALYSIS

### ✅ Đã Hoàn Thành (Hiện Tại)
| Feature | Status | Completion Level |
|---------|--------|------------------|
| Products | ✅ Basic | 70% - Thiếu advanced features (Inventory alerts, SEO preview, Duplication) |
| Categories | ✅ Basic | 60% - Thiếu UX improvements (Drag & drop, Tree view) |
| Posts | ✅ Basic | 50% - Thiếu workflow & taxonomies (Tags, Status) |
| Media Library | ✅ Basic | 40% - Rất basic, thiếu Folders, Bulk actions, Editing |
| Dashboard | ✅ Basic | 30% - Chỉ có layout, thiếu Widgets & Stats |
| Authentication | ✅ Basic | 90% - Shared Auth (Admin + Dashboard) |
| Data Tables | ✅ Good | 80% - Khá tốt, cần polish (Bulk actions, Filters) |

---

## 🎯 ENHANCEMENT PRIORITIES

### 🔴 Priority 1: CRITICAL (Làm ngay)
1. **Media Library** (40% → 90%) - 2-3 ngày
2. **Dashboard Widgets** (30% → 80%) - 2 ngày
3. **Products Polish** (70% → 95%) - 2 ngày

### 🟠 Priority 2: HIGH (Tuần sau)
4. **Categories UX** (60% → 90%) - 1-2 ngày
5. **Posts Workflow** (50% → 85%) - 2 ngày

### 🟡 Priority 3: MEDIUM (Có thời gian)
6. **Data Tables Polish** (80% → 95%) - 1 ngày

**Total Estimate**: 10-12 ngày làm việc (2 tuần)

---

## 📋 DETAILED ENHANCEMENT PLAN

### 1. 🎨 MEDIA LIBRARY ENHANCEMENT (Priority 1)

**Current State**: Basic upload + selection modal
**Target State**: WordPress Media Library level (Folders, Bulk Upload, Editing)

#### 🔴 Backend (Payload v3)
**File**: `payload-v3/src/collections/Media.ts`

**Enhance existing Media collection:**
```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 150, height: 150, position: 'centre' },
      { name: 'medium', width: 768, height: 768, position: 'centre' },
      { name: 'large', width: 1920, height: 1920, position: 'centre' },
    ],
  },
  fields: [
    // NEW: Organization
    {
      name: 'folder',
      type: 'relationship',
      relationTo: 'mediaFolders',
      admin: { position: 'sidebar' },
    },
    // NEW: Enhanced metadata
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Alt text for accessibility (SEO important!)' },
    },
    { name: 'caption', type: 'textarea' },
    { name: 'description', type: 'textarea' },
    // NEW: Usage tracking
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],
}
```

**Create new MediaFolders collection:**
```typescript
export const MediaFolders: CollectionConfig = {
  slug: 'mediaFolders',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'mediaFolders',
      admin: { description: 'Parent folder (for nested folders)' },
    },
  ],
}
```

#### 🔵 Frontend (Unified App)

**Location**: `payload-v3/src/app/(app)/dashboard/media/`

**1. Full Media Library Page** (`page.tsx` - Server Component):
```tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { MediaGrid } from '@/components/media/media-grid'
import { MediaFolderTree } from '@/components/media/media-folder-tree'

export default async function MediaPage({ searchParams }) {
  const payload = await getPayload({ config })
  const folderId = searchParams?.folder

  // Fetch data directly using Local API
  const media = await payload.find({
    collection: 'media',
    where: folderId ? { folder: { equals: folderId } } : {},
    sort: '-createdAt',
  })

  const folders = await payload.find({
    collection: 'mediaFolders',
    limit: 100,
  })

  return (
    <div className="flex h-full">
      <div className="w-64 border-r">
        <MediaFolderTree folders={folders.docs} />
      </div>
      <div className="flex-1 p-6">
        <MediaGrid initialMedia={media.docs} folderId={folderId} />
      </div>
    </div>
  )
}
```

**2. Media Upload Zone** (`media-upload-zone.tsx` - Client Component):
```tsx
'use client'
import { useDropzone } from 'react-dropzone'
import { uploadMediaAction } from '@/actions/media-actions' // Server Action

export function MediaUploadZone({ folderId }) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (files) => {
      const formData = new FormData()
      files.forEach(file => formData.append('file', file))
      if (folderId) formData.append('folder', folderId)
      
      await uploadMediaAction(formData) // Call Server Action
    }
  })

  return (
    <div {...getRootProps()} className="border-dashed border-2 p-8 text-center">
      <input {...getInputProps()} />
      <p>Drag & drop files here</p>
    </div>
  )
}
```

---

### 2. 📊 DASHBOARD WIDGETS (Priority 1)

**Current State**: Empty dashboard
**Target State**: Informative dashboard with stats & widgets

#### 🔴 Backend (Payload v3)
**No separate API endpoint needed!** We use Local API in Server Components.

#### 🔵 Frontend (Unified App)

**Enhance** `payload-v3/src/app/(app)/dashboard/page.tsx`:
```tsx
export default async function DashboardPage() {
  const payload = await getPayload({ config })

  // Parallel data fetching for performance
  const [products, posts, media, recentProducts] = await Promise.all([
    payload.count({ collection: 'products' }),
    payload.count({ collection: 'posts' }),
    payload.count({ collection: 'media' }),
    payload.find({ collection: 'products', limit: 5, sort: '-createdAt' }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Products" value={products.totalDocs} icon={ShoppingBag} />
        <StatsCard title="Total Posts" value={posts.totalDocs} icon={FileText} />
        <StatsCard title="Media Files" value={media.totalDocs} icon={Image} />
        <StatsCard title="Users" value={15} icon={Users} />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProductsWidget products={recentProducts.docs} />
        <QuickActionsWidget />
      </div>
    </div>
  )
}
```

**Widgets Components:**
- `StatsCard`: Simple UI component.
- `RecentProductsWidget`: Displays table of recent items with "Edit" links.
- `QuickActionsWidget`: Links to `/dashboard/products/new`, `/dashboard/posts/new`.

---

### 3. 🛍️ PRODUCTS POLISH (Priority 1)

**Current State**: 6 tabs, basic CRUD
**Target State**: WooCommerce-level product management

#### Enhancements Needed:

**1. Gallery Tab - Drag to Reorder:**
```tsx
// components/products/product-gallery.tsx
'use client'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'

export function ProductGallery({ value, onChange }) {
  // ... dnd-kit implementation ...
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = value.findIndex(img => img.id === active.id)
      const newIndex = value.findIndex(img => img.id === over.id)
      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }
  // ... render sortable images ...
}
```

**2. Inventory - Stock Alerts:**
- **Backend**: Add `stockQuantity` (number) and `lowStockThreshold` (number) to `Products` collection.
- **Frontend**: In `ProductForm`, add logic to show alert:
```tsx
{stockQuantity < lowStockThreshold && (
  <Alert variant="warning">
    <AlertTitle>Low Stock!</AlertTitle>
    <AlertDescription>Only {stockQuantity} items remaining.</AlertDescription>
  </Alert>
)}
```

**3. SEO - Structured Data Preview:**
```tsx
// components/products/product-seo.tsx
export function ProductSEO({ product }) {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.featuredImage?.url,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD"
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing fields */}
      <Card className="p-4 bg-muted">
        <h4 className="font-semibold mb-2">Google Preview</h4>
        <div className="text-blue-600 text-xl">{product.seo?.metaTitle || product.name}</div>
        <div className="text-green-700 text-sm">example.com/products/{product.slug}</div>
        <div className="text-gray-600">{product.seo?.metaDescription}</div>
      </Card>
    </div>
  )
}
```

**4. Product Duplication:**
- Add "Duplicate" button in Data Table Actions.
- **Server Action**:
```tsx
// actions/product-actions.ts
export async function duplicateProduct(id: string) {
  'use server'
  const payload = await getPayload({ config })
  const product = await payload.findByID({ collection: 'products', id })
  
  const { id: _, createdAt, updatedAt, ...data } = product
  
  const newProduct = await payload.create({
    collection: 'products',
    data: {
      ...data,
      name: `${data.name} (Copy)`,
      slug: `${data.slug}-copy-${Date.now()}`,
    }
  })
  
  redirect(`/dashboard/products/${newProduct.id}`)
}
```

---

### 4. 📁 CATEGORIES UX (Priority 2)

**Enhancements:**

**1. Drag & Drop Reordering:**
- Add `order` (number) field to `Categories` collection.
- Use `@dnd-kit` in Categories List.
- Server Action `reorderCategories(items)` to update multiple docs.

**2. Nested Category Tree View:**
```tsx
// components/categories/category-tree.tsx
export function CategoryTree({ categories, level = 0 }) {
  return (
    <div className="space-y-1">
      {categories.map(cat => (
        <div key={cat.id} style={{ paddingLeft: level * 20 }}>
          <div className="flex items-center gap-2 p-2 hover:bg-muted">
            <FolderIcon /> {cat.name}
          </div>
          {cat.children && <CategoryTree categories={cat.children} level={level + 1} />}
        </div>
      ))}
    </div>
  )
}
```

---

### 5. 📝 POSTS WORKFLOW (Priority 2)

**Enhancements:**

**1. Workflow Status:**
- Add `status` select field to `Posts`: `['draft', 'pending', 'published']`.
- Visual badge in Data Table (Gray for Draft, Yellow for Pending, Green for Published).

**2. Taxonomies (Tags):**
- Create `Tags` collection.
- In Post Form, use a `Combobox` or `MultiSelect` component that can create new tags on the fly (using Server Action `createTag`).

---

## 🏗️ TECHNICAL IMPLEMENTATION SUMMARY

### 1. Data Fetching Strategy
- **Server Components**: Primary method. Use `getPayload()` + Local API.
- **Client Components**: Only for interactivity. Pass data as props from Server Components.

### 2. Mutation Strategy (Server Actions)
- All Create/Update/Delete operations use **Next.js Server Actions**.
- Pattern:
  1. Define action in `src/actions/*.ts`.
  2. Call `getPayload()`.
  3. Perform operation.
  4. Call `revalidatePath()`.
  5. Return result/error.

### 3. UI Components
- Continue using **shadcn/ui** components.
- Use **Lucide React** for icons.
- Use **TanStack Table** for complex data grids.
- Use **@dnd-kit** for all drag-and-drop interactions.