# Migration Scripts Template

Quick reference for building migration scripts.

---

## Project Structure

```
migration-tool/
├── package.json
├── tsconfig.json
├── .env
├── src/
│   ├── config.ts                    # Configuration
│   ├── migrate.ts                   # Main orchestrator
│   │
│   ├── parsers/
│   │   ├── wordpress-parser.ts      # Parse WordPress JSON
│   │   └── html-to-lexical.ts       # Convert HTML → Lexical
│   │
│   ├── importers/
│   │   ├── media-importer.ts        # Migrate media files
│   │   ├── category-importer.ts     # Migrate categories
│   │   ├── tag-importer.ts          # Migrate tags
│   │   ├── product-importer.ts      # Migrate products
│   │   ├── post-importer.ts         # Migrate posts
│   │   └── page-importer.ts         # Migrate pages
│   │
│   └── utils/
│       ├── payload-api.ts           # Payload API client
│       ├── logger.ts                # Logging utility
│       └── validator.ts             # SEO validator
│
├── exports/                         # WordPress export files
│   ├── products.json
│   ├── posts.json
│   ├── pages.json
│   ├── media.json
│   ├── categories.json
│   └── tags.json
│
└── logs/                            # Migration logs
    ├── media-mapping.json
    ├── category-mapping.json
    ├── migration-errors.log
    └── seo-validation.log
```

---

## 1. Setup (`package.json`)

```json
{
  "name": "wordpress-payload-migration",
  "version": "1.0.0",
  "scripts": {
    "migrate:media": "ts-node src/importers/media-importer.ts",
    "migrate:categories": "ts-node src/importers/category-importer.ts",
    "migrate:tags": "ts-node src/importers/tag-importer.ts",
    "migrate:products": "ts-node src/importers/product-importer.ts",
    "migrate:posts": "ts-node src/importers/post-importer.ts",
    "migrate:pages": "ts-node src/importers/page-importer.ts",
    "migrate:all": "ts-node src/migrate.ts",
    "validate:seo": "ts-node src/utils/validator.ts"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "form-data": "^4.0.0",
    "dotenv": "^16.3.1",
    "cheerio": "^1.0.0-rc.12",
    "csv-parser": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0"
  }
}
```

---

## 2. Config (`.env`)

```env
# Payload CMS
PAYLOAD_URL=http://localhost:3000
PAYLOAD_TOKEN=your-api-token-here

# WordPress (for downloading images)
WORDPRESS_URL=https://old-site.com

# Options
DRY_RUN=false
BATCH_SIZE=10
TIMEOUT=30000
```

---

## 3. Payload API Client (`src/utils/payload-api.ts`)

```typescript
import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import dotenv from 'dotenv'

dotenv.config()

export class PayloadAPI {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.PAYLOAD_URL}/api`,
      headers: {
        'Authorization': `Bearer ${process.env.PAYLOAD_TOKEN}`,
      },
      timeout: parseInt(process.env.TIMEOUT || '30000'),
    })
  }

  // Generic CRUD
  async create(collection: string, data: any) {
    const response = await this.client.post(`/${collection}`, data)
    return response.data.doc
  }

  async getAll(collection: string, params?: any) {
    const response = await this.client.get(`/${collection}`, { params })
    return response.data
  }

  async getById(collection: string, id: string) {
    const response = await this.client.get(`/${collection}/${id}`)
    return response.data
  }

  // Media upload (special handling)
  async uploadMedia(
    fileBuffer: Buffer,
    filename: string,
    metadata: {
      alt?: string
      caption?: string
      description?: string
      wordpressId?: number
    }
  ) {
    const formData = new FormData()
    formData.append('file', fileBuffer, filename)

    if (metadata.alt) formData.append('alt', metadata.alt)
    if (metadata.caption) formData.append('caption', metadata.caption)
    if (metadata.description) formData.append('description', metadata.description)
    if (metadata.wordpressId) formData.append('wordpressId', metadata.wordpressId.toString())

    const response = await this.client.post('/media', formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })

    return response.data.doc
  }
}

export const payloadAPI = new PayloadAPI()
```

---

## 4. Media Importer (`src/importers/media-importer.ts`)

```typescript
import fs from 'fs'
import axios from 'axios'
import { payloadAPI } from '../utils/payload-api'
import { logger } from '../utils/logger'

interface WordPressMedia {
  ID: number
  guid: string // Image URL
  post_title: string
  post_excerpt: string // Caption
  post_content: string // Description
  _wp_attachment_image_alt: string
}

export async function migrateMedia() {
  logger.info('Starting media migration...')

  // Load WordPress export
  const mediaExport: WordPressMedia[] = JSON.parse(
    fs.readFileSync('exports/media.json', 'utf-8')
  )

  const mapping: Record<number, string> = {}
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < mediaExport.length; i++) {
    const media = mediaExport[i]
    logger.progress(`Migrating media ${i + 1}/${mediaExport.length}: ${media.post_title}`)

    try {
      // 1. Download image from WordPress
      const imageUrl = media.guid
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      })
      const buffer = Buffer.from(response.data)

      // 2. Upload to Payload
      const uploaded = await payloadAPI.uploadMedia(buffer, media.post_title, {
        alt: media._wp_attachment_image_alt || '',
        caption: media.post_excerpt || '',
        description: media.post_content || '',
        wordpressId: media.ID,
      })

      // 3. Save mapping
      mapping[media.ID] = uploaded.id
      successCount++

      logger.success(`✅ ${media.post_title} (WP: ${media.ID} → Payload: ${uploaded.id})`)
    } catch (error: any) {
      errorCount++
      logger.error(`❌ Failed: ${media.post_title}`, error.message)
      fs.appendFileSync('logs/migration-errors.log', `Media ${media.ID}: ${error.message}\n`)
    }

    // Rate limiting (avoid overwhelming server)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Save mapping
  fs.writeFileSync('logs/media-mapping.json', JSON.stringify(mapping, null, 2))

  logger.info(`Media migration complete: ${successCount} success, ${errorCount} errors`)
  return mapping
}

// Run if executed directly
if (require.main === module) {
  migrateMedia().catch(console.error)
}
```

---

## 5. Product Importer (`src/importers/product-importer.ts`)

```typescript
import fs from 'fs'
import { payloadAPI } from '../utils/payload-api'
import { logger } from '../utils/logger'
import { convertHTMLToLexical } from '../parsers/html-to-lexical'

interface WordPressProduct {
  ID: number
  post_title: string
  post_name: string
  post_content: string
  post_excerpt: string
  _regular_price: string
  _sale_price: string
  _sku: string
  _stock_status: 'instock' | 'outofstock' | 'onbackorder'
  _stock: string
  _thumbnail_id: string
  _product_image_gallery: string // "123,456,789"
  _yoast_wpseo_title: string
  _yoast_wpseo_metadesc: string
  product_cat: string[] // Category slugs
  product_tag: string[] // Tag slugs
}

export async function migrateProducts() {
  logger.info('Starting product migration...')

  // Load mappings
  const mediaMapping: Record<number, string> = JSON.parse(
    fs.readFileSync('logs/media-mapping.json', 'utf-8')
  )
  const categoryMapping: Record<string, string> = JSON.parse(
    fs.readFileSync('logs/category-mapping.json', 'utf-8')
  )

  // Load products export
  const products: WordPressProduct[] = JSON.parse(
    fs.readFileSync('exports/products.json', 'utf-8')
  )

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    logger.progress(`Migrating product ${i + 1}/${products.length}: ${product.post_title}`)

    try {
      // Map data
      const payload = {
        name: product.post_title,
        slug: product.post_name,
        description: await convertHTMLToLexical(product.post_content),
        shortDescription: await convertHTMLToLexical(product.post_excerpt),
        price: parseFloat(product._regular_price) || 0,
        salePrice: product._sale_price ? parseFloat(product._sale_price) : null,
        sku: product._sku || '',
        stockStatus: mapStockStatus(product._stock_status),
        stockQuantity: parseInt(product._stock) || 0,

        // Media
        featuredImage: product._thumbnail_id
          ? mediaMapping[parseInt(product._thumbnail_id)]
          : null,
        gallery: product._product_image_gallery
          ? product._product_image_gallery
              .split(',')
              .map(id => mediaMapping[parseInt(id.trim())])
              .filter(Boolean)
          : [],

        // Taxonomies
        categories: product.product_cat
          ? product.product_cat.map(slug => categoryMapping[slug]).filter(Boolean)
          : [],

        // SEO
        seo: {
          metaTitle: product._yoast_wpseo_title || product.post_title,
          metaDescription: product._yoast_wpseo_metadesc || product.post_excerpt,
        },

        // Track WordPress ID
        wordpressId: product.ID,
      }

      // Create in Payload
      await payloadAPI.create('products', payload)
      successCount++
      logger.success(`✅ ${product.post_title}`)
    } catch (error: any) {
      errorCount++
      logger.error(`❌ Failed: ${product.post_title}`, error.message)
      fs.appendFileSync('logs/migration-errors.log', `Product ${product.ID}: ${error.message}\n`)
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  logger.info(`Product migration complete: ${successCount} success, ${errorCount} errors`)
}

function mapStockStatus(wpStatus: string): string {
  const mapping: Record<string, string> = {
    'instock': 'instock',
    'outofstock': 'outofstock',
    'onbackorder': 'onbackorder',
  }
  return mapping[wpStatus] || 'instock'
}

if (require.main === module) {
  migrateProducts().catch(console.error)
}
```

---

## 6. Logger Utility (`src/utils/logger.ts`)

```typescript
import chalk from 'chalk'

export const logger = {
  info: (message: string) => {
    console.log(chalk.blue(`ℹ ${message}`))
  },

  success: (message: string) => {
    console.log(chalk.green(message))
  },

  error: (message: string, detail?: string) => {
    console.log(chalk.red(`✗ ${message}`))
    if (detail) console.log(chalk.gray(`  ${detail}`))
  },

  progress: (message: string) => {
    process.stdout.write(`\r${chalk.yellow('⏳')} ${message}`)
  },

  warn: (message: string) => {
    console.log(chalk.yellow(`⚠ ${message}`))
  },
}
```

---

## 7. HTML to Lexical Converter (`src/parsers/html-to-lexical.ts`)

```typescript
import { JSDOM } from 'jsdom'

export async function convertHTMLToLexical(html: string): Promise<any> {
  if (!html || html.trim() === '') {
    return null
  }

  // Simple conversion (enhance for production)
  const dom = new JSDOM(html)
  const textContent = dom.window.document.body.textContent || ''

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
              text: textContent.trim(),
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }

  // For production: Use proper HTML → Lexical parser
  // Example: https://github.com/facebook/lexical/tree/main/packages/lexical-html
}
```

---

## 8. Main Orchestrator (`src/migrate.ts`)

```typescript
import { migrateMedia } from './importers/media-importer'
import { migrateCategories } from './importers/category-importer'
import { migrateTags } from './importers/tag-importer'
import { migrateProducts } from './importers/product-importer'
import { migratePosts } from './importers/post-importer'
import { migratePages } from './importers/page-importer'
import { logger } from './utils/logger'

async function main() {
  logger.info('🚀 Starting WordPress → Payload migration...')

  try {
    // IMPORTANT: Order matters!
    await migrateMedia()        // 1. Media first (foundation)
    await migrateCategories()   // 2. Categories
    await migrateTags()         // 3. Tags
    await migrateProducts()     // 4. Products (references media + categories)
    await migratePosts()        // 5. Posts
    await migratePages()        // 6. Pages

    logger.success('✅ Migration complete!')
  } catch (error) {
    logger.error('Migration failed:', error.message)
    process.exit(1)
  }
}

main()
```

---

## 🚀 Usage

```bash
# Install dependencies
npm install

# Run individual migrations
npm run migrate:media
npm run migrate:categories
npm run migrate:products

# Or run all at once
npm run migrate:all

# Validate SEO
npm run validate:seo
```

---

## 📊 Expected Output

```
ℹ Starting media migration...
⏳ Migrating media 1/2000: product-image-1.jpg
✅ product-image-1.jpg (WP: 123 → Payload: abc123)
⏳ Migrating media 2/2000: product-image-2.jpg
✅ product-image-2.jpg (WP: 124 → Payload: abc124)
...
ℹ Media migration complete: 1950 success, 50 errors

ℹ Starting product migration...
⏳ Migrating product 1/1000: Nike Running Shoes
✅ Nike Running Shoes
...
ℹ Product migration complete: 980 success, 20 errors
```

---

**Next**: Customize these templates for your specific WordPress export structure!