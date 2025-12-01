import { woocommerce, payload, ensurePayloadAuth } from './api-clients'

/**
 * Build category mapping from WooCommerce ID to Payload ID
 * This is needed because we migrated categories first
 */
async function buildCategoryMap(): Promise<Map<number, string>> {
    console.log('🔄 Building category mapping...\\n')

    await ensurePayloadAuth()

    const categoryMap = new Map<number, string>()

    try {
        // Fetch all WooCommerce product categories
        const { data: wcCategories } = await woocommerce.get('products/categories', {
            per_page: 100,
        })

        // Fetch all Payload categories
        const { data: payloadResponse } = await payload.get('/categories', {
            params: {
                limit: 1000,
                where: {
                    type: { equals: 'product' },
                },
            },
        })

        // Map by slug (since we preserve slugs)
        const payloadBySlug = new Map<string, string>()
        payloadResponse.docs.forEach((cat: any) => {
            payloadBySlug.set(cat.slug, cat.id)
        })

        //console.log(JSON.stringify(payloadResponse.docs, null, 2));
        // Build WC ID → Payload ID map
        wcCategories.forEach((wcCat: any) => {
            const payloadId = payloadBySlug.get(wcCat.slug)
            if (payloadId) {
                categoryMap.set(wcCat.id, payloadId)
            }
        })

        console.log(`✅ Mapped ${categoryMap.size} categories\\n`)

        return categoryMap

    } catch (error: any) {
        console.error('❌ Failed to build category map:', error.response?.data || error.message)
        return new Map()
    }
}

buildCategoryMap().then((map) => {
    console.log('\\n📋 Category Map Sample:')
    let count = 0
    map.forEach((payloadId, wcId) => {
        if (count < 5) {
            console.log(`WC ID ${wcId} → Payload ID ${payloadId}`)
            count++
        }
    })
    process.exit(0)
})
