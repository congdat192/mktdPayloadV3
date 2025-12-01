import express from 'express'
import payload from 'payload'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

// Initialize Payload
const start = async () => {
    await payload.init({
        secret: process.env.PAYLOAD_SECRET!,
        express: app,
    })

    app.listen(3000, () => {
        console.log(`
🚀 Payload CMS Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}
🔧 Admin: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin
📡 API: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `)
    })
}

start()
