# WORDPRESS → PAYLOAD CMS MIGRATION PLAN

**Created**: 2025-12-01
**Type**: Data Migration & SEO Preservation
**Complexity**: ⚠️ VERY HIGH - Critical project requiring careful execution
**Timeline**: 2-3 weeks (testing included)

---

## 📋 EXECUTIVE SUMMARY

### Migration Scope

**FROM**: WordPress + WooCommerce
- Products (WooCommerce)
- Posts (WordPress Blog)
- Pages (WordPress)
- Categories & Tags
- Media (Images, PDFs, etc.)
- Users
- Custom Fields (ACF, meta data)
- SEO data (Yoast/RankMath)

**TO**: Payload CMS + Custom Admin UI
- Products Collection (Payload)
- Posts Collection (Payload)
- Pages Collection (Payload)
- Categories Collection (Payload)
- Media Collection (Payload)
- Users Collection (Payload)

**CRITICAL REQUIREMENT**: **ZERO SEO IMPACT**
- Preserve all URLs (or implement 301 redirects)
- Preserve all meta titles, descriptions
- Preserve image alt texts
- Preserve structured data
- Maintain sitemap

---

## 🎯 SUCCESS CRITERIA

### Must Have (CRITICAL)
- ✅ 100% data migrated (no data loss)
- ✅ All URLs preserved OR 301 redirects in place
- ✅ SEO metadata intact (meta title, description, OG tags)
- ✅ Image alt texts preserved
- ✅ Google Search Console shows no errors
- ✅ Page speed same or better
- ✅ All WooCommerce products with correct pricing

### Should Have (HIGH)
- ✅ Comments migrated (if applicable)
- ✅ User roles preserved
- ✅ Custom fields migrated
- ✅ Revisions history (nice to have)

### Nice to Have (LOW)
- ✅ WordPress themes/plugins (not needed - using Custom Admin UI)
- ✅ WordPress settings (reconfigure in Payload)

---

## 🏗️ WORDPRESS DATA STRUCTURE ANALYSIS

### WordPress Database Tables (Relevant)

```sql
-- Core Tables
wp_posts              -- Posts, Pages, Products (post_type: post, page, product)
wp_postmeta           -- Custom fields, product meta, ACF data
wp_terms              -- Categories, Tags, Product Categories
wp_term_relationships -- Post-to-term relationships
wp_term_taxonomy      -- Taxonomy definitions
wp_users              -- Users
wp_usermeta           -- User metadata
wp_comments           -- Comments (if migrating)

-- WooCommerce Specific
wp_woocommerce_order_items
wp_woocommerce_order_itemmeta
-- (Note: Orders migration is Phase 2 if needed)
```

### Key WordPress Concepts to Map

| WordPress | Payload CMS | Notes |
|-----------|-------------|-------|
| `post_type: product` | `products` Collection | WooCommerce products |
| `post_type: post` | `posts` Collection | Blog posts |
| `post_type: page` | `pages` Collection | Static pages |
| `taxonomy: category` | `categories` Collection | Hierarchical |
| `taxonomy: product_cat` | `categories` Collection | Same as above |
| `taxonomy: post_tag` | `tags` Collection | Flat taxonomy |
| `wp_posts.guid` | Media `url` | Media file URLs |
| `_yoast_wpseo_title` | `seo.metaTitle` | SEO metadata |
| `_thumbnail_id` | `featuredImage` relationship | Featured images |

---

## 📊 MIGRATION STRATEGY

### Approach: 3-PHASE MIGRATION

```
Phase 1: PREPARATION (3-4 days)
├─ Export WordPress data
├─ Analyze data structure
├─ Create Payload Collections
└─ Build migration scripts

Phase 2: DATA MIGRATION (4-5 days)
├─ Migrate Media (images, files)
├─ Migrate Categories & Tags
├─ Migrate Products
├─ Migrate Posts
├─ Migrate Pages
└─ Migrate Users

Phase 3: VALIDATION & SEO (3-4 days)
├─ URL mapping & redirects
├─ SEO validation
├─ Performance testing
├─ Staging deployment
└─ Final checks
```

**Total**: 10-13 days + buffer (2-3 weeks safe)

---

## 🔧 TOOLS & TECHNOLOGIES

### Export Tools
1. **WP All Export** (WordPress plugin)
   - Export products to CSV/JSON
   - Export posts to CSV/JSON
   - Export pages to CSV/JSON

2. **WP-CLI** (Command line)
   ```bash
   wp post list --post_type=product --format=json > products.json
   wp post list --post_type=post --format=json > posts.json
   wp media export --porcelain > media.json
   ```

3. **Direct Database Export** (MySQL)
   ```bash
   mysqldump -u user -p wordpress_db > wordpress_dump.sql
   ```

### Migration Scripts
- **Node.js scripts** to parse WordPress exports
- **Payload API** to import data
- **Image downloader** to migrate media files

### SEO Tools
- **Screaming Frog** - Crawl old + new site
- **Google Search Console** - Monitor indexing
- **Redirect Manager** - 301 redirects if URLs change

---

## 📝 PHASE 1: PREPARATION

### 1.1 Export WordPress Data

**Using WP All Export Plugin:**

1. **Export Products**
   ```
   Plugin: WP All Export Pro
   Export: WooCommerce Products
   Format: JSON
   Include:
   - ID, Title, Slug, Description, Short Description
   - Price, Sale Price, SKU
   - Stock Status, Stock Quantity
   - Categories, Tags, Attributes
   - Featured Image, Gallery Images
   - Yoast SEO: Meta Title, Meta Description
   ```

2. **Export Posts**
   ```
   Export: Posts
   Include:
   - ID, Title, Slug, Content, Excerpt
   - Author, Published Date, Modified Date
   - Categories, Tags
   - Featured Image
   - Yoast SEO data
   ```

3. **Export Pages**
   ```
   Export: Pages
   Include:
   - ID, Title, Slug, Content
   - Parent Page (for hierarchy)
   - Featured Image
   - Yoast SEO data
   ```

4. **Export Media**
   ```
   Export: Media Library
   Include:
   - ID, Filename, URL
   - Alt Text, Caption, Description
   - Upload Date
   ```

5. **Export Categories/Tags**
   ```
   Export: Taxonomies
   Include:
   - Term ID, Name, Slug
   - Parent (for categories)
   - Description
   ```

**Output Files:**
```
exports/
├── products.json          # ~1000 products example
├── posts.json             # Blog posts
├── pages.json             # Static pages
├── media.json             # Media files metadata
├── categories.json        # Categories
├── tags.json              # Tags
└── users.json             # Users (optional)
```

### 1.2 Create Payload Collections

**Ensure these Payload Collections exist:**

```typescript
// payload-cms/src/collections/Products.ts (already exists)
// payload-cms/src/collections/Posts.ts (already exists)
// payload-cms/src/collections/Pages.ts (NEW - create this)
// payload-cms/src/collections/Categories.ts (already exists)
// payload-cms/src/collections/Tags.ts (NEW - create this)
// payload-cms/src/collections/Media.ts (already exists)
```

**NEW: Pages Collection**
```typescript
// payload-cms/src/collections/Pages.ts
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug (must match WordPress slug for SEO)',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        description: 'Parent page (for hierarchical pages)',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
    // Preserve WordPress ID for tracking
    {
      name: 'wordpressId',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Original WordPress post ID',
      },
    },
  ],
}
```

**NEW: Tags Collection**
```typescript
// payload-cms/src/collections/Tags.ts
export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'wordpressId',
      type: 'number',
      admin: { readOnly: true },
    },
  ],
}
```

**Add to payload.config.ts:**
```typescript
import { Pages } from './collections/Pages'
import { Tags } from './collections/Tags'

export default buildConfig({
  collections: [
    Products,
    Posts,
    Pages, // NEW
    Categories,
    Tags, // NEW
    Media,
    Users,
  ],
  // ...
})
```

### 1.3 Build Migration Scripts

**Create migration tool:**
```
migration-tool/
├── package.json
├── src/
│   ├── migrate.ts              # Main orchestrator
│   ├── parsers/
│   │   ├── wordpress-parser.ts # Parse WordPress JSON exports
│   │   └── html-to-lexical.ts  # Convert HTML to Lexical JSON
│   ├── importers/
│   │   ├── media-importer.ts   # Download & upload media
│   │   ├── category-importer.ts
│   │   ├── product-importer.ts
│   │   ├── post-importer.ts
│   │   └── page-importer.ts
│   └── utils/
│       ├── payload-api.ts      # Payload API client
│       └── url-mapper.ts       # URL mapping & redirects
└── exports/                    # WordPress export files
```

**Install dependencies:**
```bash
npm install axios form-data dotenv
npm install @payloadcms/richtext-lexical
npm install cheerio # For HTML parsing
```

---

## 📦 PHASE 2: DATA MIGRATION

### 2.1 Migrate Media FIRST (Foundation)

**Why first?** Products/Posts reference media, so media must exist first.

**Script: `src/importers/media-importer.ts`**

```typescript
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

interface WordPressMedia {
  ID: number
  guid: string // Original URL
  post_title: string
  post_excerpt: string // Caption
  post_content: string // Description
  _wp_attachment_image_alt: string // Alt text
}

export async function migrateMedia(mediaExport: WordPressMedia[]) {
  const urlMapping: Record<number, string> = {}

  for (const media of mediaExport) {
    console.log(`Migrating media: ${media.post_title}`)

    try {
      // 1. Download image from WordPress
      const imageUrl = media.guid
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      })
      const buffer = Buffer.from(response.data)

      // 2. Upload to Payload
      const formData = new FormData()
      formData.append('file', buffer, {
        filename: path.basename(imageUrl),
        contentType: response.headers['content-type']
      })
      formData.append('alt', media._wp_attachment_image_alt || '')
      formData.append('caption', media.post_excerpt || '')
      formData.append('description', media.post_content || '')
      formData.append('wordpressId', media.ID.toString())

      const uploadResponse = await axios.post(
        `${process.env.PAYLOAD_URL}/api/media`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.PAYLOAD_TOKEN}`
          }
        }
      )

      const newMedia = uploadResponse.data.doc

      // 3. Map WordPress ID → Payload ID
      urlMapping[media.ID] = newMedia.id

      console.log(`✅ Migrated: ${media.post_title} (WP: ${media.ID} → Payload: ${newMedia.id})`)
    } catch (error) {
      console.error(`❌ Failed to migrate media ${media.ID}:`, error.message)
      // Log to error file for manual review
      fs.appendFileSync('migration-errors.log', `Media ${media.ID}: ${error.message}\n`)
    }
  }

  // Save mapping for reference
  fs.writeFileSync('media-mapping.json', JSON.stringify(urlMapping, null, 2))

  return urlMapping
}
```

**Run:**
```bash
node src/importers/media-importer.ts
```

**Output:**
- All images uploaded to Payload Media collection
- `media-mapping.json` created (WP ID → Payload ID mapping)

---

### 2.2 Migrate Categories & Tags

**Script: `src/importers/category-importer.ts`**

```typescript
interface WordPressCategory {
  term_id: number
  name: string
  slug: string
  description: string
  parent: number // 0 = no parent
}

export async function migrateCategories(categoriesExport: WordPressCategory[]) {
  const mapping: Record<number, string> = {}

  // Sort by parent (migrate parents first)
  const sorted = categoriesExport.sort((a, b) => {
    if (a.parent === 0 && b.parent !== 0) return -1
    if (a.parent !== 0 && b.parent === 0) return 1
    return 0
  })

  for (const category of sorted) {
    const payload = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      wordpressId: category.term_id,
      // Map parent if exists
      parent: category.parent !== 0 ? mapping[category.parent] : null
    }

    const response = await axios.post(
      `${process.env.PAYLOAD_URL}/api/categories`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYLOAD_TOKEN}`
        }
      }
    )

    mapping[category.term_id] = response.data.doc.id
    console.log(`✅ Migrated category: ${category.name}`)
  }

  fs.writeFileSync('category-mapping.json', JSON.stringify(mapping, null, 2))
  return mapping
}
```

**Same for Tags** (simpler - no hierarchy)

---

### 2.3 Migrate Products

**Script: `src/importers/product-importer.ts`**

```typescript
import { convertHTMLToLexical } from '../parsers/html-to-lexical'

interface WordPressProduct {
  ID: number
  post_title: string
  post_name: string // slug
  post_content: string // description (HTML)
  post_excerpt: string // short description
  _regular_price: string
  _sale_price: string
  _sku: string
  _stock_status: string
  _stock: number
  _thumbnail_id: number // Featured image WP ID
  _product_image_gallery: string // "123,456,789" (image IDs)
  _yoast_wpseo_title: string
  _yoast_wpseo_metadesc: string
  product_cat: string[] // Category slugs
  product_tag: string[] // Tag slugs
}

export async function migrateProducts(
  productsExport: WordPressProduct[],
  mediaMapping: Record<number, string>,
  categoryMapping: Record<number, string>
) {
  for (const product of productsExport) {
    console.log(`Migrating product: ${product.post_title}`)

    // Convert HTML description to Lexical JSON
    const description = await convertHTMLToLexical(product.post_content)
    const shortDescription = await convertHTMLToLexical(product.post_excerpt)

    // Map featured image
    const featuredImage = product._thumbnail_id
      ? mediaMapping[product._thumbnail_id]
      : null

    // Map gallery images
    const galleryIds = product._product_image_gallery
      ? product._product_image_gallery.split(',').map(id => mediaMapping[parseInt(id)])
      : []

    // Map categories
    const categories = await getCategoryIdsBySlug(product.product_cat, categoryMapping)

    const payload = {
      name: product.post_title,
      slug: product.post_name,
      description: description,
      shortDescription: shortDescription,
      price: parseFloat(product._regular_price),
      salePrice: product._sale_price ? parseFloat(product._sale_price) : null,
      sku: product._sku,
      stockStatus: mapStockStatus(product._stock_status),
      stockQuantity: product._stock || 0,
      featuredImage: featuredImage,
      gallery: galleryIds.filter(Boolean),
      categories: categories,
      seo: {
        metaTitle: product._yoast_wpseo_title || product.post_title,
        metaDescription: product._yoast_wpseo_metadesc || product.post_excerpt,
      },
      wordpressId: product.ID,
    }

    try {
      const response = await axios.post(
        `${process.env.PAYLOAD_URL}/api/products`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.PAYLOAD_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log(`✅ Migrated product: ${product.post_title} (${response.data.doc.id})`)
    } catch (error) {
      console.error(`❌ Failed: ${product.post_title}`, error.response?.data || error.message)
      fs.appendFileSync('migration-errors.log', `Product ${product.ID}: ${error.message}\n`)
    }
  }
}

function mapStockStatus(wpStatus: string): string {
  const mapping = {
    'instock': 'instock',
    'outofstock': 'outofstock',
    'onbackorder': 'onbackorder',
  }
  return mapping[wpStatus] || 'instock'
}
```

**HTML to Lexical Converter:**
```typescript
// src/parsers/html-to-lexical.ts
import { JSDOM } from 'jsdom'

export async function convertHTMLToLexical(html: string): Promise<any> {
  if (!html) return null

  // Simple conversion (can be enhanced)
  const dom = new JSDOM(html)
  const text = dom.window.document.body.textContent

  // Basic Lexical structure
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: text,
              type: 'text',
              version: 1
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1
        }
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1
    }
  }

  // For production: Use proper HTML → Lexical parser
  // Reference: https://lexical.dev/docs/concepts/serialization
}
```

---

### 2.4 Migrate Posts & Pages

**Similar to Products, but simpler (no variations, pricing, etc.)**

**Key differences:**
- Posts have Categories & Tags
- Pages have Parent (hierarchy)
- Both need Featured Image

**See example in script library**

---

## 🔍 PHASE 3: VALIDATION & SEO

### 3.1 URL Mapping & Redirects

**Critical for SEO!**

#### Option A: URLs EXACTLY THE SAME (Best for SEO)

**WordPress URLs:**
```
https://example.com/product/product-slug/
https://example.com/blog/post-slug/
https://example.com/about-us/
```

**Payload + Next.js URLs (Storefront):**
```
https://example.com/product/product-slug/  # SAME!
https://example.com/blog/post-slug/        # SAME!
https://example.com/about-us/              # SAME!
```

**Implementation:**
```typescript
// storefront/app/product/[slug]/page.tsx
export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug)
  // Render product
}
```

**Result:** No redirects needed, URLs preserved ✅

---

#### Option B: URLs DIFFERENT (Need 301 Redirects)

**If URLs change:**
```
OLD: https://example.com/shop/product-slug/
NEW: https://example.com/product/product-slug/
```

**Setup 301 Redirects in Next.js:**
```typescript
// storefront/next.config.ts
export default {
  async redirects() {
    return [
      {
        source: '/shop/:slug*',
        destination: '/product/:slug*',
        permanent: true, // 301 redirect
      },
      {
        source: '/category/:slug*',
        destination: '/categories/:slug*',
        permanent: true,
      },
    ]
  },
}
```

**Generate redirect rules from WordPress export:**
```typescript
// migration-tool/src/utils/generate-redirects.ts
export function generateRedirects(oldUrls: string[], newUrls: string[]) {
  const redirects = []

  for (let i = 0; i < oldUrls.length; i++) {
    const oldPath = new URL(oldUrls[i]).pathname
    const newPath = new URL(newUrls[i]).pathname

    if (oldPath !== newPath) {
      redirects.push({
        source: oldPath,
        destination: newPath,
        permanent: true,
      })
    }
  }

  fs.writeFileSync('redirects.json', JSON.stringify(redirects, null, 2))
  return redirects
}
```

---

### 3.2 SEO Validation Checklist

**Use Screaming Frog to crawl both sites:**

1. **Crawl WordPress site (before migration)**
   ```
   Export: All URLs + Meta Data
   Save as: wordpress-seo-audit.xlsx
   ```

2. **Crawl Payload/Next.js site (after migration)**
   ```
   Export: All URLs + Meta Data
   Save as: payload-seo-audit.xlsx
   ```

3. **Compare:**
   - URLs match? ✅
   - Meta titles match? ✅
   - Meta descriptions match? ✅
   - Image alt texts present? ✅
   - H1 tags match? ✅

**Automated comparison script:**
```typescript
// migration-tool/src/utils/seo-validator.ts
import csv from 'csv-parser'
import fs from 'fs'

export async function validateSEO(oldCrawl: string, newCrawl: string) {
  const oldUrls = await parseCrawl(oldCrawl)
  const newUrls = await parseCrawl(newCrawl)

  const issues = []

  for (const oldUrl of oldUrls) {
    const newUrl = newUrls.find(u => u.path === oldUrl.path)

    if (!newUrl) {
      issues.push(`Missing URL: ${oldUrl.path}`)
      continue
    }

    if (oldUrl.metaTitle !== newUrl.metaTitle) {
      issues.push(`Meta title mismatch: ${oldUrl.path}`)
    }

    if (oldUrl.metaDescription !== newUrl.metaDescription) {
      issues.push(`Meta description mismatch: ${oldUrl.path}`)
    }
  }

  fs.writeFileSync('seo-validation-issues.txt', issues.join('\n'))
  console.log(`SEO Validation: ${issues.length} issues found`)
  return issues
}
```

---

### 3.3 Sitemap Generation

**WordPress** has sitemap at `/sitemap.xml` (Yoast/RankMath)

**Payload + Next.js** needs sitemap generation:

```typescript
// storefront/app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://example.com'

  // Fetch all products
  const products = await fetch(`${process.env.PAYLOAD_URL}/api/products?limit=1000`)
    .then(r => r.json())

  // Fetch all posts
  const posts = await fetch(`${process.env.PAYLOAD_URL}/api/posts?limit=1000`)
    .then(r => r.json())

  // Fetch all pages
  const pages = await fetch(`${process.env.PAYLOAD_URL}/api/pages?limit=100`)
    .then(r => r.json())

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...products.docs.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...posts.docs.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    ...pages.docs.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
  ]
}
```

**Submit to Google:**
```
https://example.com/sitemap.xml
→ Google Search Console → Sitemaps → Submit
```

---

### 3.4 Structured Data (Schema.org)

**Ensure Product schema is present:**

```typescript
// storefront/app/product/[slug]/page.tsx
export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug)

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'image': product.featuredImage?.url,
    'description': product.shortDescription,
    'sku': product.sku,
    'offers': {
      '@type': 'Offer',
      'price': product.salePrice || product.price,
      'priceCurrency': 'USD',
      'availability': product.stockStatus === 'instock'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Product UI */}
    </>
  )
}
```

---

## 🚀 DEPLOYMENT STRATEGY

### Approach: BLUE-GREEN DEPLOYMENT

```
┌─────────────────────────────────────────────────────────────┐
│                  BLUE (Current - WordPress)                  │
│             https://example.com (LIVE)                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Migrate data
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              GREEN (New - Payload + Next.js)                 │
│             https://staging.example.com (TEST)               │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ After validation
                           ▼
                    SWITCH DNS
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              GREEN (New - Payload + Next.js)                 │
│             https://example.com (LIVE)                       │
└─────────────────────────────────────────────────────────────┘
```

### Steps:

1. **Setup Staging** (staging.example.com)
   - Deploy Payload CMS
   - Deploy Custom Admin UI
   - Deploy Storefront (Next.js)

2. **Migrate Data** to Staging
   - Run all migration scripts
   - Validate data

3. **Test Staging**
   - SEO validation (Screaming Frog)
   - Functional testing (orders, checkout)
   - Performance testing (Lighthouse)

4. **Switch DNS**
   - Point example.com → New servers
   - Keep WordPress as backup (old-wp.example.com)

5. **Monitor**
   - Google Search Console (watch for errors)
   - Google Analytics (traffic patterns)
   - Error logs

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Data Loss
**Impact**: CRITICAL
**Mitigation**:
- Multiple backups of WordPress database
- Test migration on staging first
- Validate data counts (products before vs after)

### Risk 2: SEO Drop
**Impact**: CRITICAL
**Mitigation**:
- Preserve all URLs
- 301 redirects for any URL changes
- Monitor Google Search Console daily

### Risk 3: Broken Images
**Impact**: HIGH
**Mitigation**:
- Download all images during migration
- Validate image URLs after migration
- Keep WordPress media as backup

### Risk 4: Custom Fields Lost
**Impact**: MEDIUM
**Mitigation**:
- Map all ACF/meta fields to Payload fields
- Export custom fields to JSON for reference
- Manual migration if needed

---

## 📋 MIGRATION CHECKLIST

### Pre-Migration
- [ ] Backup WordPress database (SQL dump)
- [ ] Backup WordPress files (wp-content/uploads)
- [ ] Export products (WP All Export)
- [ ] Export posts (WP All Export)
- [ ] Export pages (WP All Export)
- [ ] Export categories/tags
- [ ] Export media metadata
- [ ] Create Payload Collections (Pages, Tags)

### Migration
- [ ] Migrate Media (images first)
- [ ] Migrate Categories
- [ ] Migrate Tags
- [ ] Migrate Products
- [ ] Migrate Posts
- [ ] Migrate Pages
- [ ] Migrate Users (optional)

### Post-Migration Validation
- [ ] Data count matches (products: WP 1000 = Payload 1000)
- [ ] Random spot checks (10 products, 10 posts)
- [ ] All images load correctly
- [ ] Categories hierarchy correct
- [ ] SEO metadata present
- [ ] Sitemap generated
- [ ] Structured data present

### SEO Validation
- [ ] Crawl staging site (Screaming Frog)
- [ ] Compare meta titles/descriptions
- [ ] Validate image alt texts
- [ ] Check for broken links
- [ ] Test redirects (if URLs changed)
- [ ] Submit sitemap to Google

### Go-Live
- [ ] Deploy to production
- [ ] Switch DNS
- [ ] Monitor Google Search Console
- [ ] Monitor error logs
- [ ] Keep WordPress backup online for 1 month

---

## 📞 SUPPORT & ROLLBACK

### If Something Goes Wrong

**Rollback Plan:**
1. Switch DNS back to WordPress (5 minutes)
2. Keep new Payload/Next.js site as staging
3. Fix issues
4. Retry migration

**WordPress Backup Access:**
- Keep WordPress running on subdomain: `old-wp.example.com`
- Accessible for 1 month post-migration
- Read-only mode (disable writes)

---

## 📊 SUCCESS METRICS

### Week 1 Post-Migration
- [ ] Google Search Console: 0 new errors
- [ ] Google Analytics: Traffic ± 5% (expected variance)
- [ ] Page speed: Same or better
- [ ] 0 customer complaints about missing products

### Month 1 Post-Migration
- [ ] Organic traffic: ± 10% (within normal variance)
- [ ] Keyword rankings: Maintained or improved
- [ ] No 404 errors
- [ ] All features working

---

**END OF MIGRATION PLAN**

**Estimated Timeline**: 2-3 weeks
**Team Required**: 1 backend dev + 1 frontend dev + 1 QA
**Budget**: Medium (mostly time investment)
**Risk Level**: HIGH (but mitigated with careful planning)

**Next Step**: Review plan → Start Phase 1 (Preparation)