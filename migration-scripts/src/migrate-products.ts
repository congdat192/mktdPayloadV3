import { woocommerce, payload, ensurePayloadAuth } from './api-clients'
import { ProgressLogger, sleep, parseYoastSEO } from './utils'

interface WPProduct {
    id: number
    name: string
    slug: string
    description: string
    short_description: string
    price: string
    regular_price: string
    sale_price: string
    sku: string
    stock_quantity: number
    stock_status: string
    images: Array<{
        id: number
        src: string
        name: string
        alt: string
    }>
    categories: Array<{
        id: number
        name: string
        slug: string
    }>
}

/**
 * Migrate WooCommerce Products to Payload
 */
export async function migrateProducts(categoryMap: Map<number, string>) {
    console.log('\n🛍️  Starting Products Migration...\n')

    await ensurePayloadAuth()

    try {
        let page = 1
        let hasMore = true
        let totalMigrated = 0

        while (hasMore) {
            console.log(`\nFetching products page ${page}...`)

            const { data: products } = await woocommerce.get('products', {
                per_page: 20,
                page,
            })

            if (products.length === 0) {
                hasMore = false
                break
            }

            const progress = new ProgressLogger(products.length, `products (page ${page})`)

            for (const wpProduct of products) {
                try {
                    // Check if product already exists
                    const { data: existing } = await payload.get('/products', {
                        params: {
                            where: {
                                slug: { equals: wpProduct.slug },
                            },
                        },
                    })

                    if (existing.docs.length > 0) {
                        console.log(`⏭️  Product "${wpProduct.name}" already exists, skipping`)
                        progress.increment()
                        continue
                    }

                    // Transform to Payload format
                    const payloadProduct: any = {
                        name: wpProduct.name,
                        slug: wpProduct.slug,
                        description: wpProduct.description,
                        shortDescription: wpProduct.short_description,
                        price: parseFloat(wpProduct.regular_price) || 0,
                        salePrice: wpProduct.sale_price ? parseFloat(wpProduct.sale_price) : undefined,
                        sku: wpProduct.sku,
                        stockQuantity: wpProduct.stock_quantity || 0,
                        stockStatus: wpProduct.stock_status === 'instock' ? 'instock' : 'outofstock',
                    }

                    // Map categories
                    if (wpProduct.categories && wpProduct.categories.length > 0) {
                        payloadProduct.categories = wpProduct.categories
                            .map((cat) => categoryMap.get(cat.id))
                            .filter(Boolean)
                    }

                    // Handle images (simplified - would need media migration first)
                    if (wpProduct.images && wpProduct.images.length > 0) {
                        // TODO: Download images and upload to Payload Media
                        // For now, just store the URLs
                        console.log(`  📷 Product has ${wpProduct.images.length} images (migration pending)`)
                    }

                    // SEO (WooCommerce doesn't have built-in SEO, might use Yoast)
                    payloadProduct.seo = {
                        metaTitle: wpProduct.name,
                        metaDescription: wpProduct.short_description?.substring(0, 160),
                    }

                    // Create in Payload
                    await payload.post('/products', payloadProduct)

                    totalMigrated++
                    progress.increment()
                    await sleep(200) // Rate limiting
                } catch (error: any) {
                    console.error(`❌ Failed to migrate product "${wpProduct.name}":`, error.response?.data || error.message)
                }
            }

            progress.complete()
            page++
        }

        console.log(`\n✅ Products migration completed! Total migrated: ${totalMigrated}`)
    } catch (error: any) {
        console.error('❌ Products migration failed:', error.response?.data || error.message)
        throw error
    }
}

// Run if executed directly
if (require.main === module) {
    (async () => {
        try {
            // You'll need to run categories migration first to get the map
            console.log('⚠️  Make sure to run migrate:categories first!')
            console.log('This script requires category mapping.')
            process.exit(1)
        } catch (error) {
            console.error('Migration failed:', error)
            process.exit(1)
        }
    })()
}
