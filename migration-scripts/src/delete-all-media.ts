import { payload, ensurePayloadAuth } from './api-clients'
import { ProgressLogger } from './utils'

/**
 * Delete ALL media files from Payload
 */
async function deleteAllMedia() {
    console.log('\n🗑️  DELETING ALL MEDIA FILES...\n')

    await ensurePayloadAuth()

    try {
        // Fetch all media
        console.log('Fetching media list...')
        const { data: media } = await payload.get('/media', {
            params: { limit: 1000 },
        })

        console.log(`Found ${media.totalDocs} media files to delete\n`)

        if (media.totalDocs === 0) {
            console.log('✅ No media to delete.')
            return
        }

        const progress = new ProgressLogger(media.totalDocs, 'files')

        // Delete loop
        for (const file of media.docs) {
            try {
                await payload.delete(`/media/${file.id}`)
                progress.increment()
            } catch (error: any) {
                console.error(`❌ Failed to delete ${file.filename}:`, error.message)
            }
        }

        progress.complete()
        console.log(`\n✅ Successfully deleted all media files!`)

    } catch (error: any) {
        console.error('❌ Failed to delete media:', error.message)
    }
}

// Run if executed directly
if (require.main === module) {
    deleteAllMedia().then(() => process.exit(0))
}
