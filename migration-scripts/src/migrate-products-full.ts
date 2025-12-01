import { woocommerce, payload, ensurePayloadAuth, payloadToken } from './api-clients'
import { ProgressLogger, sleep } from './utils'
import { downloadAndUploadImage } from './image-utils'

interface WPProduct {
    id: number
    name: string
    slug: string
    type: string
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
    tags: Array<{
        id: number
        name: string
        slug: string
    }>
    attributes: Array<{
        id: number
        name: string
        position: number
        visible: boolean
        variation: boolean
        options: string[]
    }>
    meta_data: Array<{
        id: number
        key: string
        value: any
    }>
}

interface WPVariation {
    id: number
    attributes: Array<{
        id: number
        name: string
        option: string
    }>
    price: string
    regular_price: string
    sale_price: string
    sku: string
    stock_quantity: number
    stock_status: string
    image: {
        id: number
        src: string
    }
}

/**
 * FULL MIGRATION: 5 products for testing
 * Includes: simple/variable products, attributes, variations, tags, meta data, images
 */
export async function migrateProductsFull(categoryMap: Map<number, string>) {
    console.log('\n🚀 FULL PRODUCT MIGRATION TEST (5 products)\n')
    console.log('Features:')
    console.log('  ✅ Simple & Variable products')
    console.log('  ✅ Product attributes')
    console.log('  ✅ Product variations (with pricing/stock)')
    console.log('  ✅ Tags')
    console.log('  ✅ Meta data (custom fields)')
    console.log('  ✅ Images (download + upload to Supabase)')
    console.log('')

    await ensurePayloadAuth()

    try {
        const TEST_LIMIT = 5

        console.log(`Fetching first ${TEST_LIMIT} products from WooCommerce...`)

        const { data: products } = await woocommerce.get('products', {
            per_page: TEST_LIMIT,
            page: 1,
        })

        console.log(`Found ${products.length} products\n`)

        const progress = new ProgressLogger(products.length, 'products')
        let totalVariations = 0

        for (const wpProduct of products) {
            try {
                console.log(`\n📦 Processing: ${wpProduct.name || 'Untitled'}`)
                console.log(`   Type: ${wpProduct.type}`)

                // Check if already exists
                const { data: existing } = await payload.get('/products', {
                    params: {
                        where: {
                            slug: { equals: wpProduct.slug },
                        },
                    },
                })

                if (existing.docs.length > 0) {
                    console.log(`⏭️  Already exists, skipping`)
                    progress.increment()
                    continue
                }

                // Transform to Payload format
                const payloadProduct: any = {
                    name: wpProduct.name || 'Untitled Product',
                    slug: wpProduct.slug || `product-${wpProduct.id}`,
                    type: wpProduct.type || 'simple',
                    description: wpProduct.description || '',
                    shortDescription: wpProduct.short_description || '',
                    price: parseFloat(wpProduct.regular_price) || 0,
                    salePrice: wpProduct.sale_price ? parseFloat(wpProduct.sale_price) : undefined,
                    sku: wpProduct.sku || null,
                    stockQuantity: wpProduct.stock_quantity || 0,
                    stockStatus: wpProduct.stock_status === 'instock' ? 'instock' : 'outofstock',
                }

                // Map categories
                if (wpProduct.categories && wpProduct.categories.length > 0) {
                    payloadProduct.categories = wpProduct.categories
                        .map((cat: any) => categoryMap.get(cat.id))
                        .filter(Boolean)
                }

                // Map attributes
                if (wpProduct.attributes && wpProduct.attributes.length > 0) {
                    console.log(`   📊 ${wpProduct.attributes.length} attributes`)
                    payloadProduct.attributes = wpProduct.attributes.map((attr: any) => ({
                        name: attr.name,
                        slug: attr.name.toLowerCase().replace(/\s+/g, '-'),
                        visible: attr.visible,
                        variation: attr.variation,
                        options: attr.options.map((opt: any) => ({ value: opt })),
                    }))
                }

                // Map tags
                if (wpProduct.tags && wpProduct.tags.length > 0) {
                    console.log(`   🏷️  ${wpProduct.tags.length} tags`)
                    payloadProduct.tags = wpProduct.tags.map((tag: any) => ({
                        name: tag.name,
                        slug: tag.slug,
                    }))
                }

                // Map meta data
                if (wpProduct.meta_data && wpProduct.meta_data.length > 0) {
                    console.log(`   📝 ${wpProduct.meta_data.length} meta data items`)
                    const metaObj: any = {}
                    wpProduct.meta_data.forEach((meta: any) => {
                        metaObj[meta.key] = meta.value
                    })
                    payloadProduct.metaData = metaObj
                }

                // Download and upload images
                if (wpProduct.images && wpProduct.images.length > 0) {
                    console.log(`   📸 ${wpProduct.images.length} images to migrate`)

                    const imageIds: string[] = []

                    for (const [index, img] of wpProduct.images.entries()) {
                        const imgId = await downloadAndUploadImage(
                            img.src,
                            payloadToken!,
                            process.env.PAYLOAD_URL!
                        )

                        if (imgId) {
                            imageIds.push(imgId)

                            // First image is featured
                            if (index === 0) {
                                payloadProduct.featuredImage = imgId
                            }
                        }
                    }

                    // Remaining images are gallery
                    if (imageIds.length > 1) {
                        payloadProduct.gallery = imageIds.slice(1).map((id) => ({ image: id }))
                    }
                }

                // SEO
                payloadProduct.seo = {
                    metaTitle: wpProduct.name,
                    metaDescription: wpProduct.short_description?.substring(0, 160),
                }

                // Create in Payload
                console.log(`   💾 Creating product in Payload...`)
                const { data: newProduct } = await payload.post('/products', payloadProduct)
                console.log(`   ✅ Created: ${newProduct.doc.id}`)

                // If variable product, migrate variations
                if (wpProduct.type === 'variable') {
                    console.log(`   🔄 Fetching variations...`)

                    const { data: variations } = await woocommerce.get(
                        `products/${wpProduct.id}/variations`,
                        { per_page: 100 }
                    )

                    console.log(`   📊 Found ${variations.length} variations`)

                    for (const variation of variations) {
                        try {
                            const variationData: any = {
                                product: newProduct.doc.id,
                                attributes: {},
                                price: parseFloat(variation.regular_price) || 0,
                                salePrice: variation.sale_price ? parseFloat(variation.sale_price) : undefined,
                                sku: variation.sku || null,
                                stockQuantity: variation.stock_quantity || 0,
                                stockStatus: variation.stock_status === 'instock' ? 'instock' : 'outofstock',
                            }

                            // Convert attributes array to object
                            if (variation.attributes) {
                                variation.attributes.forEach((attr: any) => {
                                    variationData.attributes[attr.name] = attr.option
                                })
                            }

                            // Variation image
                            if (variation.image && variation.image.src) {
                                const imgId = await downloadAndUploadImage(
                                    variation.image.src,
                                    payloadToken!,
                                    process.env.PAYLOAD_URL!
                                )
                                if (imgId) {
                                    variationData.image = imgId
                                }
                            }

                            await payload.post('/product-variations', variationData)
                            totalVariations++

                        } catch (err: any) {
                            console.error(`     ❌ Failed to create variation:`, err.response?.data || err.message)
                        }
                    }

                    console.log(`   ✅ Created ${variations.length} variations`)
                }

                progress.increment()
                await sleep(500) // Rate limiting

            } catch (error: any) {
                console.error(`❌ Failed to migrate "${wpProduct.name}":`)
                if (error.response?.data?.errors) {
                    error.response.data.errors.forEach((err: any) => {
                        console.error(`   - ${err.message}`)
                        if (err.data) console.error(`     Data:`, JSON.stringify(err.data))
                    })
                } else {
                    console.error(`   ${error.response?.data?.message || error.message}`)
                }
            }
        }

        progress.complete()

        console.log(`\n\n✅ MIGRATION TEST COMPLETED!`)
        console.log(`   Products migrated: ${products.length}`)
        console.log(`   Variations migrated: ${totalVariations}`)
        console.log(`\nNext: Review data in Payload Admin to verify!`)

    } catch (error: any) {
        console.error('❌ Full product migration failed:', error.response?.data || error.message)
        throw error
    }
}

// Export token for image utils
export { payloadToken }

// Build category mapping from WooCommerce ID to Payload ID
async function buildCategoryMap(): Promise<Map<number, string>> {
    console.log('🔄 Building category mapping...\n')

    await ensurePayloadAuth()

    const categoryMap = new Map<number, string>()

    try {
        const { data: wcCategories } = await woocommerce.get('products/categories', {
            per_page: 100,
        })

        const { data: payloadResponse } = await payload.get('/categories', {
            params: {
                limit: 1000,
                where: {
                    type: { equals: 'product' },
                },
            },
        })

        const payloadBySlug = new Map<string, string>()
        payloadResponse.docs.forEach((cat: any) => {
            payloadBySlug.set(cat.slug, cat.id)
        })

        wcCategories.forEach((wcCat: any) => {
            const payloadId = payloadBySlug.get(wcCat.slug)
            if (payloadId) {
                categoryMap.set(wcCat.id, payloadId)
            }
        })

        console.log(`✅ Mapped ${categoryMap.size} categories\n`)
        return categoryMap

    } catch (error: any) {
        console.error('❌ Failed to build category map:', error.response?.data || error.message)
        return new Map()
    }
}

// Run if executed directly
if (require.main === module) {
    (async () => {
        try {
            const categoryMap = await buildCategoryMap()
            await migrateProductsFull(categoryMap)
            process.exit(0)
        } catch (error) {
            console.error('Migration failed:', error)
            process.exit(1)
        }
    })()
}
