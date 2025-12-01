import { CollectionConfig } from 'payload/types'

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
            admin: {
                description: 'Alt text for accessibility and SEO',
            },
        },
        {
            name: 'caption',
            type: 'textarea',
        },
    ],
}
