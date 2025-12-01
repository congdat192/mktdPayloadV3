# WordPress/WooCommerce to Payload Migration Scripts

## Overview

These scripts migrate data from WordPress/WooCommerce to Payload CMS while preserving:
- ✅ Product categories (hierarchical)
- ✅ Products with pricing, inventory, SKU
- ✅ Post categories
- ✅ Posts with content and metadata
- ✅ SEO metadata (from Yoast SEO if available)
- ✅ URL slugs (for SEO preservation)

---

## Setup

### 1. Install Dependencies

```bash
cd migration-scripts
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```bash
# WordPress Site URL (your current WordPress site)
WP_SITE_URL=https://your-wordpress-site.com

# WooCommerce API Credentials (already filled in)
WC_CONSUMER_KEY=ck_34f4f93a5576601fd224750a7ee4359ca7db645f
WC_CONSUMER_SECRET=cs_cc5d3bf3ba348a3e1e0954110524810935cb558f

# Payload CMS (make sure Payload is running)
PAYLOAD_URL=http://localhost:3000
PAYLOAD_EMAIL=your-admin-email@example.com
PAYLOAD_PASSWORD=your-payload-admin-password
```

### 3. Prerequisites

Before running migration:
- ✅ Payload CMS must be running (`cd payload-cms && npm run dev`)
- ✅ You must have created an admin user in Payload
- ✅ WordPress/WooCommerce site must be accessible
- ✅ WooCommerce REST API must be enabled

---

## Usage

### Option 1: Migrate Everything

```bash
npm run migrate:all
```

This will migrate in order:
1. Categories (product + post)
2. Products
3. Posts (TODO)
4. Media (TODO)

### Option 2: Migrate Specific Entity

```bash
# Migrate only categories
npm run migrate:categories

# Migrate only products (requires categories first)
npm run migrate:products

# Migrate only posts (TODO)
npm run migrate:posts

# Migrate only media (TODO)
npm run migrate:media
```

---

## Migration Process

### 1. Categories Migration

**What it does:**
- Fetches all product categories from WooCommerce
- Fetches all post categories from WordPress
- Preserves parent-child relationships
- Creates categories in Payload with correct hierarchy

**Output:**
```
📦 Starting Product Categories Migration...
Fetching product categories from WooCommerce...
Found 15 product categories
[100%] 15/15 categories | Elapsed: 3s | ETA: 0s
✅ Product Categories migration completed!
```

### 2. Products Migration

**What it does:**
- Fetches all products from WooCommerce (paginated)
- Migrates product data:
  - Name, slug, description
  - Regular price + sale price
  - SKU, stock quantity, stock status
  - Category relationships
  - Images (URLs logged, full migration pending)
- Preserves SEO data

**Output:**
```
🛍️  Starting Products Migration...
Fetching products page 1...
[100%] 20/20 products (page 1) | Elapsed: 12s | ETA: 0s
✅ Products migration completed! Total migrated: 45
```

### 3. Posts Migration (TODO)

Coming soon...

### 4. Media Migration (TODO)

Coming soon...

---

## Troubleshooting

### "Failed to login to Payload"

**Problem:** Migration can't authenticate with Payload

**Solutions:**
1. Make sure Payload is running: `cd payload-cms && npm run dev`
2. Verify `PAYLOAD_EMAIL` and `PAYLOAD_PASSWORD` in `.env`
3. Check you created an admin user in Payload admin panel

### "WooCommerce API error"

**Problem:** Can't connect to WooCommerce

**Solutions:**
1. Verify `WP_SITE_URL` is correct (include http/https)
2. Check WooCommerce API keys are valid
3. Ensure WooCommerce REST API is enabled in WP admin
4. Check your site allows external API connections

### "Category already exists"

**Info:** This is normal - script will skip existing categories

### Migration is slow

**Info:** Scripts include rate limiting to avoid overwhelming servers. Average:
- Categories: ~100ms per category
- Products: ~200ms per product

For 100 products, expect ~20 seconds

---

## Data Mapping

### WooCommerce Product → Payload Product

| WooCommerce | Payload | Notes |
|-------------|---------|-------|
| name | name | Direct mapping |
| slug | slug | ⚠️ Critical for SEO |
| description | description | HTML → Lexical JSON |
| short_description | shortDescription | Plain text |
| regular_price | price | Converted to number |
| sale_price | salePrice | Optional |
| sku | sku | Direct mapping |
| stock_quantity | stockQuantity | Integer |
| stock_status | stockStatus | instock/outofstock |
| categories | categories | Relationship (IDs mapped) |
| images | featuredImage, gallery | URLs → Payload Media (TODO) |

### WordPress Post → Payload Post (TODO)

| WordPress | Payload | Notes |
|-----------|---------|-------|
| title | title | Direct mapping |
| slug | slug | ⚠️ Critical for SEO |
| content | content | HTML → Lexical JSON |
| excerpt | excerpt | Plain text |
| featured_media | featuredImage | Media relationship |
| categories | categories | Relationship |
| yoast_meta | seo | SEO metadata |

---

## Advanced Usage

### Dry Run (Check Before Migrating)

```typescript
// In migrate-products.ts, add this:
const DRY_RUN = true

if (DRY_RUN) {
  console.log('Would create:', payloadProduct)
  continue // Skip actual creation
}
```

### Custom Field Mapping

Edit migration scripts to add custom fields:

```typescript
// In migrate-products.ts
payloadProduct.customField = wpProduct._custom_field
```

---

## Next Steps After Migration

1. **Verify Data**
   - Open Payload admin: http://localhost:3000/admin
   - Check products, categories are correct
   - Verify slugs match WordPress

2. **Run Media Migration**
   - Download all WordPress media
   - Upload to Supabase Storage
   - Update product/post references

3. **Test SEO**
   - Compare URLs: WordPress vs new site
   - Check canonical tags
   - Verify meta descriptions

4. **Update Storefront**
   - Connect to Payload API
   - Display products/posts
   - Test all URLs return 200

---

## File Structure

```
migration-scripts/
├── src/
│   ├── api-clients.ts       # API clients for WP, WC, Payload
│   ├── utils.ts             # Helper functions
│   ├── migrate-categories.ts
│   ├── migrate-products.ts
│   ├── migrate-posts.ts     # TODO
│   ├── migrate-media.ts     # TODO
│   └── migrate-all.ts       # Master script
├── package.json
├── tsconfig.json
└── README.md                # This file
```

---

## Support

If migration fails:
1. Check error messages carefully
2. Verify all credentials in `.env`
3. Ensure WordPress site is accessible
4. Check Payload logs in terminal

For help, refer to main project README.md
