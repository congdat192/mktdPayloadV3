import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'
import axios from 'axios'
import dotenv from 'dotenv'

// Polyfill for Node 18 (File API not available)
if (typeof File === 'undefined') {
    (global as any).File = class File extends Blob {
        constructor(bits: any[], name: string, options?: any) {
            super(bits, options)
        }
    }
}

dotenv.config()

// WooCommerce API Client
export const woocommerce = new WooCommerceRestApi({
    url: process.env.WP_SITE_URL!,
    consumerKey: process.env.WC_CONSUMER_KEY!,
    consumerSecret: process.env.WC_CONSUMER_SECRET!,
    version: 'wc/v3',
})

// WordPress REST API Client
export const wordpress = axios.create({
    baseURL: `${process.env.WP_SITE_URL}/wp-json/wp/v2`,
})

// Payload API Client
export let payloadToken: string | null = null

export const payload = axios.create({
    baseURL: `${process.env.PAYLOAD_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Login to Payload and get token
export async function loginToPayload() {
    try {
        console.log('🔐 Logging in to Payload...')
        const { data } = await payload.post('/users/login', {
            email: process.env.PAYLOAD_EMAIL,
            password: process.env.PAYLOAD_PASSWORD,
        })

        payloadToken = data.token

        // Set token for all future requests
        payload.defaults.headers.common['Authorization'] = `Bearer ${payloadToken}`

        console.log('✅ Logged in to Payload successfully')
        return data
    } catch (error: any) {
        console.error('❌ Failed to login to Payload:', error.response?.data || error.message)
        throw error
    }
}

// Helper to ensure we're logged in
export async function ensurePayloadAuth() {
    if (!payloadToken) {
        await loginToPayload()
    }
}
