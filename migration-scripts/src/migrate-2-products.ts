import { woocommerce, payload, ensurePayloadAuth, payloadToken } from './api-clients'
import { ProgressLogger, sleep } from './utils'
import { downloadAndUploadImage } from './image-utils'

// Build category mapping
async function buildCategoryMap(): Promise<Map<number, string>> {
    console.log('🔄 Building category mapping...\n')
    await ensurePayloadAuth()
    const categoryMap = new Map<number, string>()
    try {
        const { data: wcCategories } = await woocommerce.get('products/categories', { per_page: 100 })
        const { data: payloadResponse } = await payload.get('/categories', {
            params: { limit: 1000, where: { type: { equals: 'product' } } },
        })
        const payloadBySlug = new Map<string, string>()
        payloadResponse.docs.forEach((cat: any) => payloadBySlug.set(cat.slug, cat.id))
        wcCategories.forEach((wcCat: any) => {
            const payloadId = payloadBySlug.get(wcCat.slug)
            if (payloadId) categoryMap.set(wcCat.id, payloadId)
        })
        return categoryMap
    } catch (error) {
        return new Map()
    }
}

/**
 * MIGRATE 2 SPECIFIC PRODUCTS FOR TESTING
 */
export async function migrateTwoProducts(categoryMap: Map<number, string>) {
    console.log('\n🚀 MIGRATING 2 TEST PRODUCTS\n')
    await ensurePayloadAuth()

    try {
        // Fetch 2 products: 1 variable, 1 simple (if possible)
        // We'll fetch 5 and pick 2 distinct types if available
        const { data: products } = await woocommerce.get('products', {
            per_page: 5,
        })

        const selectedProducts: any[] = []
        const variableProduct = products.find((p: any) => p.type === 'variable')
        const simpleProduct = products.find((p: any) => p.type === 'simple')

        if (variableProduct) selectedProducts.push(variableProduct)
        if (simpleProduct) selectedProducts.push(simpleProduct)

        // If we don't have both types, just take the first 2
        if (selectedProducts.length < 2) {
            const remaining = products.filter((p: any) => !selectedProducts.includes(p))
            selectedProducts.push(...remaining.slice(0, 2 - selectedProducts.length))
        }

        console.log(`Selected ${selectedProducts.length} products for testing:`)
        selectedProducts.forEach(p => console.log(`- ${p.name} (${p.type})`))
        console.log('')

        for (const wpProduct of selectedProducts) {
            try {
                console.log(`\n📦 Processing: ${wpProduct.name || 'Untitled'} (ID: ${wpProduct.id})`)

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
                            if (index === 0) payloadProduct.featuredImage = imgId
                        }
                    }
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

                            if (variation.attributes) {
                                variation.attributes.forEach((attr: any) => {
                                    variationData.attributes[attr.name] = attr.option
                                })
                            }

                            if (variation.image && variation.image.src) {
                                const imgId = await downloadAndUploadImage(
                                    variation.image.src,
                                    payloadToken!,
                                    process.env.PAYLOAD_URL!
                                )
                                if (imgId) variationData.image = imgId
                            }

                            await payload.post('/product-variations', variationData)

                        } catch (err: any) {
                            console.error(`     ❌ Failed to create variation:`)
                            if (err.response?.data?.errors) {
                                err.response.data.errors.forEach((e: any) => console.error(`       - ${e.message}`))
                            } else {
                                console.error(`       ${err.message}`)
                            }
                        }
                    }
                    console.log(`   ✅ Variations processed`)
                }

            } catch (error: any) {
                console.error(`❌ Failed to migrate "${wpProduct.name}":`)
                if (error.response?.data?.errors) {
                    error.response.data.errors.forEach((e: any) => console.error(`   - ${e.message}`))
                } else {
                    console.error(`   ${error.message}`)
                }
            }
        }

        console.log(`\n✅ TEST COMPLETE`)

    } catch (error: any) {
        console.error('❌ Migration failed:', error.response?.data || error.message)
        throw error
    }
}

// Export token
export { payloadToken }

// Run
if (require.main === module) {
    (async () => {
        try {
            const categoryMap = await buildCategoryMap()
            await migrateTwoProducts(categoryMap)
            process.exit(0)
        } catch (error) {
            console.error('Migration failed:', error)
            process.exit(1)
        }
    })()
}
