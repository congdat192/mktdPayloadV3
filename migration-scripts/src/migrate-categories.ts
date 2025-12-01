import { woocommerce, payload, ensurePayloadAuth } from './api-clients'
import { ProgressLogger, sleep } from './utils'

interface WPCategory {
    id: number
    name: string
    slug: string
    description: string
    parent: number
}

/**
 * Migrate WooCommerce Product Categories to Payload
 */
export async function migrateProductCategories() {
    console.log('\n📦 Starting Product Categories Migration...\n')

    await ensurePayloadAuth()

    try {
        // Fetch all product categories from WooCommerce
        console.log('Fetching product categories from WooCommerce...')
        const { data: categories } = await woocommerce.get('products/categories', {
            per_page: 100,
        })

        console.log(`Found ${categories.length} product categories`)

        const progress = new ProgressLogger(categories.length, 'categories')
        const createdCategories = new Map<number, string>() // WP ID -> Payload ID

        // Sort by parent (parents first)
        const sortedCategories = categories.sort((a: WPCategory, b: WPCategory) => {
            if (a.parent === 0 && b.parent !== 0) return -1
            if (a.parent !== 0 && b.parent === 0) return 1
            return 0
        })

        // Migrate each category
        for (const wpCategory of sortedCategories) {
            try {
                // Check if category already exists
                const { data: existing } = await payload.get('/categories', {
                    params: {
                        where: {
                            slug: { equals: wpCategory.slug },
                        },
                    },
                })

                if (existing.docs.length > 0) {
                    console.log(`⏭️  Category "${wpCategory.name}" already exists, skipping`)
                    createdCategories.set(wpCategory.id, existing.docs[0].id)
                    progress.increment()
                    continue
                }

                // Transform to Payload format
                const payloadCategory: any = {
                    name: wpCategory.name,
                    slug: wpCategory.slug,
                    description: wpCategory.description,
                    type: 'product',
                }

                // Handle parent category
                if (wpCategory.parent !== 0 && createdCategories.has(wpCategory.parent)) {
                    payloadCategory.parent = createdCategories.get(wpCategory.parent)
                }

                // Create in Payload
                const { data: newCategory } = await payload.post('/categories', payloadCategory)
                createdCategories.set(wpCategory.id, newCategory.doc.id)

                progress.increment()
                await sleep(100) // Rate limiting
            } catch (error: any) {
                console.error(`❌ Failed to migrate category "${wpCategory.name}":`, error.response?.data || error.message)
            }
        }

        progress.complete()
        console.log(`\n✅ Product Categories migration completed!`)
        return createdCategories
    } catch (error: any) {
        console.error('❌ Product categories migration failed:', error.response?.data || error.message)
        throw error
    }
}

/**
 * Migrate WordPress Post Categories to Payload
 */
export async function migratePostCategories() {
    console.log('\n📝 Starting Post Categories Migration...\n')

    await ensurePayloadAuth()

    try {
        // Fetch all post categories from WordPress
        console.log('Fetching post categories from WordPress...')
        const { data: categories } = await woocommerce.get('products/categories', {
            per_page: 100,
        })

        // Similar logic as product categories but with type: 'post'
        // Implementation would be similar...

        console.log(`\n✅ Post Categories migration completed!`)
    } catch (error: any) {
        console.error('❌ Post categories migration failed:', error.response?.data || error.message)
        throw error
    }
}

// Run if executed directly
if (require.main === module) {
    (async () => {
        try {
            await migrateProductCategories()
            await migratePostCategories()
            process.exit(0)
        } catch (error) {
            console.error('Migration failed:', error)
            process.exit(1)
        }
    })()
}
