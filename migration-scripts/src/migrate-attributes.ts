import { woocommerce, payload, ensurePayloadAuth } from './api-clients'
import { ProgressLogger, sleep } from './utils'

interface WPAttribute {
    id: number
    name: string
    slug: string
    type: string
    order_by: string
    has_archives: boolean
}

interface WPAttributeTerm {
    id: number
    name: string
    slug: string
    description: string
    menu_order: number
    count: number
}

/**
 * Migrate Product Attributes and their Terms from WooCommerce
 * Run this BEFORE migrating products
 */
export async function migrateProductAttributes() {
    console.log('\n📊 Starting Product Attributes Migration...\n')

    await ensurePayloadAuth()

    try {
        // Step 1: Fetch all product attributes
        console.log('Fetching product attributes from WooCommerce...')
        const { data: attributes } = await woocommerce.get('products/attributes')

        console.log(`Found ${attributes.length} product attributes\n`)

        if (attributes.length === 0) {
            console.log('⚠️  No attributes found. Skipping...')
            return new Map<number, string>()
        }

        const attributeMap = new Map<number, string>() // WC ID -> Payload ID
        const progress = new ProgressLogger(attributes.length, 'attributes')

        // Step 2: Migrate each attribute
        for (const wpAttr of attributes) {
            try {
                console.log(`\n📊 Processing attribute: ${wpAttr.name}`)

                // Check if exists
                const { data: existing } = await payload.get('/product-attributes', {
                    params: {
                        where: {
                            slug: { equals: wpAttr.slug },
                        },
                    },
                })

                let payloadAttrId: string

                if (existing.docs.length > 0) {
                    console.log(`  ⏭️  Already exists`)
                    payloadAttrId = existing.docs[0].id
                    attributeMap.set(wpAttr.id, payloadAttrId)
                    progress.increment()
                    continue
                }

                // Fetch attribute terms (values)
                console.log(`  🔍 Fetching terms for "${wpAttr.name}"...`)
                const { data: terms } = await woocommerce.get(
                    `products/attributes/${wpAttr.id}/terms`,
                    { per_page: 100 }
                )

                console.log(`  📋 Found ${terms.length} terms`)

                // Transform to Payload format
                const payloadAttribute: any = {
                    name: wpAttr.name,
                    slug: wpAttr.slug,
                    type: 'select', // Default to select, can be color/button/image
                    options: terms.map((term: WPAttributeTerm) => ({
                        value: term.name,
                        label: term.name,
                    })),
                }

                // Create in Payload
                const { data: newAttr } = await payload.post('/product-attributes', payloadAttribute)
                payloadAttrId = newAttr.doc.id
                attributeMap.set(wpAttr.id, payloadAttrId)

                console.log(`  ✅ Created with ${terms.length} options`)

                progress.increment()
                await sleep(300) // Rate limiting

            } catch (error: any) {
                console.error(`❌ Failed to migrate attribute "${wpAttr.name}":`, error.response?.data || error.message)
            }
        }

        progress.complete()
        console.log(`\n✅ Product Attributes migration completed!`)
        console.log(`\n📋 Summary:`)
        console.log(`   Total attributes: ${attributes.length}`)
        console.log(`   Successfully migrated: ${attributeMap.size}`)

        return attributeMap

    } catch (error: any) {
        console.error('❌ Product attributes migration failed:', error.response?.data || error.message)
        throw error
    }
}

// Run if executed directly
if (require.main === module) {
    (async () => {
        try {
            await migrateProductAttributes()

            console.log('\n✅ DONE! Now you can run product migration.')
            console.log('Next command: npm run migrate:products:full')

            process.exit(0)
        } catch (error) {
            console.error('Migration failed:', error)
            process.exit(1)
        }
    })()
}
