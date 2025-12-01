'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function createFolder(name: string, parentId?: string) {
    const payload = await getPayload({ config })
    try {
        await payload.create({
            collection: 'media-folders',
            data: {
                name,
                parent: parentId || undefined,
            },
        })
        revalidatePath('/dashboard/media')
        return { success: true }
    } catch (error) {
        console.error('Error creating folder:', error)
        return { success: false, error: 'Failed to create folder' }
    }
}

export async function deleteFolder(id: string) {
    const payload = await getPayload({ config })
    try {
        // Check if folder has children or media
        const children = await payload.find({
            collection: 'media-folders',
            where: { parent: { equals: id } },
        })
        const media = await payload.find({
            collection: 'media',
            where: { folder: { equals: id } },
        })

        if (children.totalDocs > 0 || media.totalDocs > 0) {
            return { success: false, error: 'Folder is not empty' }
        }

        await payload.delete({
            collection: 'media-folders',
            id,
        })
        revalidatePath('/dashboard/media')
        return { success: true }
    } catch (error) {
        console.error('Error deleting folder:', error)
        return { success: false, error: 'Failed to delete folder' }
    }
}

export async function moveMedia(mediaIds: string[], folderId: string | null) {
    const payload = await getPayload({ config })
    try {
        await Promise.all(
            mediaIds.map((id) =>
                payload.update({
                    collection: 'media',
                    id,
                    data: {
                        folder: folderId || null, // null means root
                    },
                })
            )
        )
        revalidatePath('/dashboard/media')
        return { success: true }
    } catch (error) {
        console.error('Error moving media:', error)
        return { success: false, error: 'Failed to move media' }
    }
}

export async function updateMediaMetadata(id: string, data: { alt?: string; caption?: string; description?: string }) {
    const payload = await getPayload({ config })
    try {
        await payload.update({
            collection: 'media',
            id,
            data,
        })
        revalidatePath('/dashboard/media')
        return { success: true }
    } catch (error) {
        console.error('Error updating media metadata:', error)
        return { success: false, error: 'Failed to update media metadata' }
    }
}
