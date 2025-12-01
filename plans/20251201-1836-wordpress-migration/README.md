# WordPress → Payload CMS Migration

**Status**: Planning Complete ✅
**Timeline**: 2-3 weeks
**Risk Level**: HIGH (SEO critical)

---

## 📁 Plan Structure

```
plans/20251201-1836-wordpress-migration/
├── README.md                  # This file
├── MIGRATION-PLAN.md          # Full detailed plan (~1200 lines)
└── scripts/                   # Migration scripts (to be created)
    ├── 01-export-wordpress.sh
    ├── 02-migrate-media.ts
    ├── 03-migrate-categories.ts
    ├── 04-migrate-products.ts
    ├── 05-migrate-posts.ts
    └── 06-validate-seo.ts
```

---

## 🎯 Quick Overview

### What We're Migrating

| From (WordPress) | To (Payload CMS) | Count (Example) |
|------------------|------------------|-----------------|
| Products (WooCommerce) | Products Collection | ~1000 |
| Posts | Posts Collection | ~100 |
| Pages | Pages Collection | ~20 |
| Categories | Categories Collection | ~50 |
| Tags | Tags Collection | ~100 |
| Media | Media Collection | ~2000 images |

### Critical Requirements

1. ✅ **ZERO data loss**
2. ✅ **ZERO SEO impact**
3. ✅ **All URLs preserved** (or 301 redirects)
4. ✅ **All metadata intact** (meta titles, descriptions, alt texts)

---

## 🚀 3-Phase Approach

### Phase 1: PREPARATION (3-4 days)
1. Export WordPress data (WP All Export plugin)
2. Create missing Payload Collections (Pages, Tags)
3. Build migration scripts (Node.js)

### Phase 2: DATA MIGRATION (4-5 days)
1. Migrate Media (images first - foundation)
2. Migrate Categories & Tags
3. Migrate Products (with all metadata)
4. Migrate Posts
5. Migrate Pages

### Phase 3: VALIDATION & SEO (3-4 days)
1. URL mapping & 301 redirects (if needed)
2. SEO validation (Screaming Frog)
3. Sitemap generation
4. Structured data validation
5. Performance testing

**Total**: 10-13 days + buffer = **2-3 weeks**

---

## 📋 Prerequisites

### WordPress Side
- [ ] Install **WP All Export** plugin
- [ ] Database backup access (mysqldump)
- [ ] FTP/SFTP access to wp-content/uploads
- [ ] Yoast SEO or RankMath installed (for SEO data)

### Payload Side
- [ ] Payload CMS running (port 3000)
- [ ] Collections created: Products, Posts, Pages, Categories, Tags, Media
- [ ] API token generated (for migration scripts)
- [ ] Storage configured (S3 or local)

### Tools Needed
- Node.js v18+ (for migration scripts)
- Screaming Frog SEO Spider (for validation)
- Google Search Console access
- Postman/Insomnia (for API testing)

---

## ⚡ Quick Start

### Step 1: Export WordPress Data

**Option A: Using WP All Export Plugin** (Recommended)
```
1. Install: WP All Export Pro
2. Export Products → JSON → Save as exports/products.json
3. Export Posts → JSON → Save as exports/posts.json
4. Export Pages → JSON → Save as exports/pages.json
5. Export Media → JSON → Save as exports/media.json
```

**Option B: Using WP-CLI**
```bash
cd /path/to/wordpress
wp post list --post_type=product --format=json > products.json
wp post list --post_type=post --format=json > posts.json
wp media export --format=json > media.json
```

### Step 2: Setup Migration Tool

```bash
# Create migration tool
mkdir migration-tool
cd migration-tool
npm init -y

# Install dependencies
npm install axios form-data dotenv cheerio
npm install @types/node typescript ts-node -D

# Create .env file
echo "PAYLOAD_URL=http://localhost:3000" > .env
echo "PAYLOAD_TOKEN=your-api-token-here" >> .env
```

### Step 3: Run Migration Scripts

```bash
# Migrate in order (important!)
ts-node src/migrate-media.ts       # ~30-60 min for 2000 images
ts-node src/migrate-categories.ts  # ~5 min
ts-node src/migrate-tags.ts        # ~5 min
ts-node src/migrate-products.ts    # ~1-2 hours for 1000 products
ts-node src/migrate-posts.ts       # ~10-20 min for 100 posts
ts-node src/migrate-pages.ts       # ~5 min
```

### Step 4: Validate

```bash
# Check counts
curl http://localhost:3000/api/products | jq '.totalDocs'
curl http://localhost:3000/api/posts | jq '.totalDocs'

# Validate SEO
ts-node src/validate-seo.ts
```

---

## 🔍 SEO Preservation Strategy

### Option A: URLs Exactly the Same (BEST)

**WordPress:**
```
https://example.com/product/nike-shoes/
https://example.com/blog/how-to-run/
```

**Payload + Next.js Storefront:**
```
https://example.com/product/nike-shoes/   ← SAME URL!
https://example.com/blog/how-to-run/      ← SAME URL!
```

**Result**: No redirects needed ✅ SEO preserved 100%

---

### Option B: URLs Different (Need 301 Redirects)

**WordPress:**
```
https://example.com/shop/nike-shoes/
```

**Payload + Next.js:**
```
https://example.com/product/nike-shoes/
```

**Setup 301 Redirect:**
```typescript
// next.config.ts
export default {
  async redirects() {
    return [
      {
        source: '/shop/:slug*',
        destination: '/product/:slug*',
        permanent: true, // 301
      },
    ]
  },
}
```

**Result**: SEO preserved ~95% (Google understands 301s)

---

## 📊 Data Mapping

### WordPress → Payload Fields

| WordPress Field | Payload Field | Notes |
|----------------|---------------|-------|
| `post_title` | `name` or `title` | Product/Post title |
| `post_name` | `slug` | URL slug |
| `post_content` | `description` or `content` | HTML → Lexical JSON |
| `_regular_price` | `price` | Number |
| `_sale_price` | `salePrice` | Number |
| `_sku` | `sku` | String |
| `_stock_status` | `stockStatus` | Enum mapping |
| `_thumbnail_id` | `featuredImage` | Relationship to Media |
| `_yoast_wpseo_title` | `seo.metaTitle` | SEO metadata |
| `_yoast_wpseo_metadesc` | `seo.metaDescription` | SEO metadata |
| `product_cat` | `categories` | Relationship (many) |

---

## ⚠️ Common Issues & Solutions

### Issue 1: Media Upload Fails
**Symptom**: Images not uploading to Payload
**Solution**:
- Check storage configuration (S3 credentials)
- Increase Payload upload size limit
- Download images locally first, then upload

### Issue 2: HTML Content Broken
**Symptom**: Product descriptions look wrong
**Solution**:
- Improve HTML → Lexical converter
- Use TipTap's HTML import function
- Manual cleanup for critical pages

### Issue 3: URLs Don't Match
**Symptom**: 404 errors on old URLs
**Solution**:
- Generate 301 redirect rules
- Add to Next.js config
- Test with Screaming Frog

### Issue 4: Missing SEO Data
**Symptom**: Meta titles/descriptions empty
**Solution**:
- Check Yoast/RankMath export
- Map `_yoast_wpseo_*` meta fields
- Fallback to post_title/post_excerpt

---

## 🔄 Rollback Plan

**If migration fails:**

1. **Immediate**: Switch DNS back to WordPress (5 min)
2. **Investigate**: Check migration logs
3. **Fix**: Correct scripts
4. **Retry**: Re-run migration on staging

**WordPress Backup:**
- Keep WordPress running for 1 month
- Subdomain: `old-wp.example.com`
- Read-only mode (disable plugins)

---

## 📈 Success Metrics

### Week 1
- [ ] Google Search Console: 0 new errors
- [ ] Traffic: ± 5% variance
- [ ] 0 customer complaints

### Month 1
- [ ] Organic traffic: Maintained
- [ ] Rankings: Same or better
- [ ] 0 broken links

---

## 📞 Next Steps

1. **Review** [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) thoroughly
2. **Prepare** WordPress exports
3. **Create** Payload Collections (Pages, Tags)
4. **Build** migration scripts
5. **Test** on staging first!

---

**Status**: Ready to Start
**Estimated Effort**: 80-100 hours
**Team**: 1-2 developers
**Timeline**: 2-3 weeks

**Question?** Read the [full plan](./MIGRATION-PLAN.md)