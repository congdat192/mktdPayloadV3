import axios from 'axios'
import FormData from 'form-data'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import path from 'path'
import fs from 'fs'

/**
 * Download image from URL and upload to Payload Media
 * Preserves original filename/slug for SEO
 */
export async function downloadAndUploadImage(
    imageUrl: string,
    payloadToken: string,
    payloadUrl: string
): Promise<string | null> {
    try {
        const parsedUrl = new URL(imageUrl)
        const originalFilename = path.basename(parsedUrl.pathname)

        // 1. Check if image already exists in Payload
        try {
            const { data: existingMedia } = await axios.get(`${payloadUrl}/api/media`, {
                params: {
                    where: {
                        filename: { equals: originalFilename },
                    },
                },
                headers: {
                    Authorization: `Bearer ${payloadToken}`,
                },
            })

            if (existingMedia.docs.length > 0) {
                console.log(`  ♻️  Skipping upload, using existing: ${originalFilename}`)
                return existingMedia.docs[0].id
            }
        } catch (checkError) {
            // Ignore check error and proceed to upload
            // console.warn('Failed to check existing media, proceeding with upload...')
        }

        // Ensure tmp directory exists
        const tmpDir = path.join(process.cwd(), 'tmp')
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true })
        }

        const tempPath = path.join(tmpDir, originalFilename)

        console.log(`  📥 Downloading: ${originalFilename}`)

        // Download image
        const response = await axios.get(imageUrl, {
            responseType: 'stream',
            timeout: 30000,
        })

        const writer = createWriteStream(tempPath)
        await pipeline(response.data, writer)

        console.log(`  ⬆️  Uploading to Payload: ${originalFilename}`)

        // Upload to Payload
        const formData = new FormData()
        formData.append('file', fs.createReadStream(tempPath), {
            filename: originalFilename,
        })
        formData.append('alt', originalFilename.replace(/\.[^/.]+$/, '')) // Remove extension for alt

        const uploadResponse = await axios.post(
            `${payloadUrl}/api/media`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${payloadToken}`,
                },
                timeout: 60000,
            }
        )

        // Clean up temp file
        fs.unlinkSync(tempPath)

        console.log(`  ✅ Uploaded: ${uploadResponse.data.doc.id}`)
        return uploadResponse.data.doc.id

    } catch (error: any) {
        console.error(`  ❌ Failed to download/upload ${imageUrl}:`, error.message)
        return null
    }
}

/**
 * Sleep helper with countdown
 */
export function sleepWithCountdown(ms: number, message: string = ''): Promise<void> {
    return new Promise((resolve) => {
        const interval = 1000
        let remaining = ms

        const timer = setInterval(() => {
            remaining -= interval
            if (remaining <= 0) {
                clearInterval(timer)
                resolve()
            } else {
                process.stdout.write(`\r${message} ${Math.ceil(remaining / 1000)}s...`)
            }
        }, interval)
    })
}
