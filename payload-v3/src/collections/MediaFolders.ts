import type { CollectionConfig } from 'payload'

export const MediaFolders: CollectionConfig = {
    slug: 'media-folders',
    admin: {
        useAsTitle: 'name',
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'parent',
            type: 'relationship',
            relationTo: 'media-folders',
            admin: {
                description: 'Parent folder (for nested folders)',
            },
        },
    ],
}
