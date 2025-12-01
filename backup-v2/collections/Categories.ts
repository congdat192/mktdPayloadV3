import { CollectionConfig } from 'payload/types'

export const Categories: CollectionConfig = {
    slug: 'categories',
    admin: {
        useAsTitle: 'name',
    },
    access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === 'admin',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
        },
        {
            name: 'description',
            type: 'textarea',
        },
        {
            name: 'type',
            type: 'select',
            required: true,
            defaultValue: 'post',
            options: [
                { label: 'Post Category', value: 'post' },
                { label: 'Product Category', value: 'product' },
            ],
        },
        {
            name: 'parent',
            type: 'relationship',
            relationTo: 'categories',
            admin: {
                description: 'For hierarchical categories',
            },
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Category thumbnail',
            },
        },
    ],
    timestamps: true,
}
