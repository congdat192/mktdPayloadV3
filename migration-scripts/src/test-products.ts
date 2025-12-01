import { woocommerce, payload, ensurePayloadAuth } from './api-clients'
import { ProgressLogger, sleep } from './utils'

/**
 * TEST MIGRATION: Chỉ migrate 5 sản phẩm đầu tiên để test
 * Bao gồm FULL data: attributes, variations, tags, images
 */
export async function migrateProductsTest(categoryMap: Map<number, string>) {
    console.log('\n🧪 TEST: Migrating first 5 products with FULL data...\n')

    await ensurePayloadAuth()

    try {
        const TEST_LIMIT = 5

        console.log(`Fetching first ${TEST_LIMIT} products from WooCommerce...`)

        const { data: products } = await woocommerce.get('products', {
            per_page: TEST_LIMIT,
            page: 1,
        })

        console.log(`Found ${products.length} products to test migrate`)
        console.log('\n📊 Product Analysis:')

        // Analyze what data we have
        products.forEach((p: any, idx: number) => {
            console.log(`\n${idx + 1}. ${p.name}`)
            console.log(`   - SKU: ${p.sku || 'N/A'}`)
            console.log(`   - Type: ${p.type}`) // simple, variable, grouped, external
            console.log(`   - Categories: ${p.categories?.length || 0}`)
            console.log(`   - Tags: ${p.tags?.length || 0}`)
            console.log(`   - Images: ${p.images?.length || 0}`)
            console.log(`   - Attributes: ${p.attributes?.length || 0}`)
            if (p.type === 'variable') {
                console.log(`   - Variations: Need to fetch separately`)
            }
            console.log(`   - Meta Data: ${p.meta_data?.length || 0} items`)
        })

        console.log('\n\n❓ REVIEW NEEDED:')
        console.log('Bạn có muốn tiếp tục migrate 5 products này với FULL data không?')
        console.log('Script sẽ migrate:')
        console.log('  ✅ Basic info (name, slug, description)')
        console.log('  ✅ Pricing (price, sale price)')
        console.log('  ✅ Inventory (SKU, stock)')
        console.log('  ✅ Categories')
        console.log('  ✅ Tags')
        console.log('  ✅ Attributes')
        console.log('  ⚠️  Variations (nếu có)')
        console.log('  ⚠️  Images (URL only, chưa download)')
        console.log('')
        console.log('Để tiếp tục, chạy: npm run migrate:products')

    } catch (error: any) {
        console.error('❌ Test migration failed:', error.response?.data || error.message)
        throw error
    }
}

// Run if executed directly
if (require.main === module) {
    (async () => {
        try {
            // Need category map from previous migration
            const categoryMap = new Map<number, string>()
            await migrateProductsTest(categoryMap)
            process.exit(0)
        } catch (error) {
            console.error('Test failed:', error)
            process.exit(1)
        }
    })()
}
