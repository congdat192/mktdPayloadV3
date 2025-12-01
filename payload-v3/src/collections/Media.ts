import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
    slug: 'media',
    upload: {
        staticURL: '/media',
        staticDir: 'media',
        mimeTypes: ['image/*', 'application/pdf'],
        imageSizes: [
            {
                name: 'thumbnail',
                width: 300,
                height: 300,
                position: 'centre',
            },
            {
                name: 'medium',
                width: 768,
                height: undefined,
                position: 'centre',
            },
            {
                name: 'large',
                width: 1200,
                height: undefined,
                position: 'centre',
            },
        ],
    },
    access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === 'admin',
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            required: true,
        },
        {
            name: 'caption',
            type: 'textarea',
        },
        {
            name: 'description',
            type: 'textarea',
        },
        {
            name: 'folder',
            type: 'relationship',
            relationTo: 'media-folders',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'usageCount',
            type: 'number',
            defaultValue: 0,
            admin: {
                readOnly: true,
                position: 'sidebar',
            },
        },
    ],
}
