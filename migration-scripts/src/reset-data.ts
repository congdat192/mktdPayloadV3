import { payload, ensurePayloadAuth } from './api-clients'
import { ProgressLogger } from './utils'

/**
 * Delete ALL Products, Variations, and Media
 * Keeps Categories and Attributes
 */
async function resetData() {
    console.log('\n🗑️  RESETTING DATA (Products, Variations, Media)...\n')

    await ensurePayloadAuth()

    try {
        // 1. Delete Variations
        console.log('Fetching variations...')
        const { data: variations } = await payload.get('/product-variations', {
            params: { limit: 1000 },
        })
        console.log(`Found ${variations.totalDocs} variations to delete`)

        if (variations.totalDocs > 0) {
            const vProgress = new ProgressLogger(variations.totalDocs, 'variations')
            for (const v of variations.docs) {
                await payload.delete(`/product-variations/${v.id}`)
                vProgress.increment()
            }
            vProgress.complete()
        }

        // 2. Delete Products
        console.log('\nFetching products...')
        const { data: products } = await payload.get('/products', {
            params: { limit: 1000 },
        })
        console.log(`Found ${products.totalDocs} products to delete`)

        if (products.totalDocs > 0) {
            const pProgress = new ProgressLogger(products.totalDocs, 'products')
            for (const p of products.docs) {
                await payload.delete(`/products/${p.id}`)
                pProgress.increment()
            }
            pProgress.complete()
        }

        // 3. Delete Media
        console.log('\nFetching media...')
        const { data: media } = await payload.get('/media', {
            params: { limit: 1000 },
        })
        console.log(`Found ${media.totalDocs} media files to delete`)

        if (media.totalDocs > 0) {
            const mProgress = new ProgressLogger(media.totalDocs, 'media')
            for (const m of media.docs) {
                try {
                    await payload.delete(`/media/${m.id}`)
                    mProgress.increment()
                } catch (e) {
                    console.error(`Failed to delete media ${m.id}`)
                }
            }
            mProgress.complete()
        }

        console.log(`\n✅ Successfully reset all product data!`)

    } catch (error: any) {
        console.error('❌ Failed to reset data:', error.message)
    }
}

if (require.main === module) {
    resetData().then(() => process.exit(0))
}
