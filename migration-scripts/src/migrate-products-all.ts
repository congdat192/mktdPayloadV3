import { woocommerce, payload, ensurePayloadAuth, payloadToken } from './api-clients'
import { ProgressLogger, sleep } from './utils'
import { downloadAndUploadImage } from './image-utils'

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

/**
 * MIGRATE ALL PRODUCTS
 * Includes: simple/variable products, attributes, variations, tags, meta data, images
 */
export async function migrateAllProducts(categoryMap: Map<number, string>) {
    console.log('\n🚀 STARTING FULL MIGRATION OF ALL PRODUCTS\n')

    await ensurePayloadAuth()

    try {
        let page = 1
        let totalMigrated = 0
        let totalVariations = 0

        while (true) {
            console.log(`\n📄 Fetching page ${page}...`)

            const { data: products } = await woocommerce.get('products', {
                per_page: 20, // Process in batches of 20
                page: page,
            })

            if (products.length === 0) {
                console.log('✅ No more products found. Migration complete.')
                break
            }

            console.log(`Found ${products.length} products on page ${page}\n`)

            const progress = new ProgressLogger(products.length, `page ${page} products`)

            for (const wpProduct of products) {
                try {
                    console.log(`\n📦 Processing: ${wpProduct.name || 'Untitled'} (ID: ${wpProduct.id})`)

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
                        payloadProduct.tags = wpProduct.tags.map((tag: any) => ({
                            name: tag.name,
                            slug: tag.slug,
                        }))
                    }

                    // Map meta data
                    if (wpProduct.meta_data && wpProduct.meta_data.length > 0) {
                        const metaObj: any = {}
                        wpProduct.meta_data.forEach((meta: any) => {
                            metaObj[meta.key] = meta.value
                        })
                        payloadProduct.metaData = metaObj
                    }

                    // Download and upload images
                    if (wpProduct.images && wpProduct.images.length > 0) {
                        console.log(`   📸 Processing ${wpProduct.images.length} images...`)

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
                    console.log(`   💾 Creating product...`)
                    const { data: newProduct } = await payload.post('/products', payloadProduct)
                    console.log(`   ✅ Created: ${newProduct.doc.id}`)
                    totalMigrated++

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
                                console.error(`     ❌ Failed to create variation:`)
                                if (err.response?.data?.errors) {
                                    err.response.data.errors.forEach((e: any) => console.error(`       - ${e.message}`))
                                } else {
                                    console.error(`       ${err.message}`)
                                }
                            }
                        }
                    }

                    progress.increment()
                    await sleep(500) // Rate limiting

                } catch (error: any) {
                    console.error(`❌ Failed to migrate "${wpProduct.name}":`)
                    if (error.response?.data?.errors) {
                        error.response.data.errors.forEach((e: any) => console.error(`   - ${e.message}`))
                    } else {
                        console.error(`   ${error.message}`)
                    }
                }
            }

            progress.complete()
            page++
        }

        console.log(`\n\n✅ FULL MIGRATION COMPLETED!`)
        console.log(`   Total Products: ${totalMigrated}`)
        console.log(`   Total Variations: ${totalVariations}`)

    } catch (error: any) {
        console.error('❌ Migration failed:', error.response?.data || error.message)
        throw error
    }
}

// Export token for image utils
export { payloadToken }

// Run if executed directly
if (require.main === module) {
    (async () => {
        try {
            const categoryMap = await buildCategoryMap()
            await migrateAllProducts(categoryMap)
            process.exit(0)
        } catch (error) {
            console.error('Migration failed:', error)
            process.exit(1)
        }
    })()
}
