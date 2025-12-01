import { payload, ensurePayloadAuth } from './api-clients'

/**
 * TEST: Create 1 simple product to debug errors
 */
async function testCreateProduct() {
    console.log('🧪 Testing product creation with minimal data...\n')

    await ensurePayloadAuth()

    try {
        // Simplest possible product
        const minimalProduct = {
            name: 'Test Product',
            slug: 'test-product-' + Date.now(),
            type: 'simple',
            price: 100000,
            stockQuantity: 10,
            stockStatus: 'instock',
        }

        console.log('Attempting to create:', JSON.stringify(minimalProduct, null, 2))

        const response = await payload.post('/products', minimalProduct)

        console.log('\n✅ SUCCESS!')
        console.log('Created product:', response.data.doc)

    } catch (error: any) {
        console.error('\n❌ FAILED!')
        console.error('Status:', error.response?.status)
        console.error('Error data:', JSON.stringify(error.response?.data, null, 2))

        if (error.response?.data?.errors) {
            console.error('\nValidation errors:')
            error.response.data.errors.forEach((err: any) => {
                console.error('-', err.message)
                if (err.data) {
                    console.error('  Data:', JSON.stringify(err.data, null, 2))
                }
            })
        }
    }
}

testCreateProduct()
