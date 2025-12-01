import { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
    slug: 'posts',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
    },
    access: {
        read: ({ req: { user } }) => {
            // Public can read published posts
            if (!user) return { status: { equals: 'published' } }
            return true
        },
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === 'admin',
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: {
                description: 'URL-friendly version of title. Must match WordPress slug for SEO.',
            },
        },
        {
            name: 'content',
            type: 'richText',
            required: true,
        },
        {
            name: 'excerpt',
            type: 'textarea',
            admin: {
                description: 'Short summary of the post',
            },
        },
        {
            name: 'featuredImage',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'categories',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: true,
            filterOptions: {
                type: { equals: 'post' },
            },
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            defaultValue: ({ user }: any) => user?.id,
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'draft',
            options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
            ],
        },
        {
            name: 'publishedAt',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        // SEO fields
        {
            name: 'seo',
            type: 'group',
            fields: [
                {
                    name: 'metaTitle',
                    type: 'text',
                    admin: {
                        description: 'Override default title for SEO',
                    },
                },
                {
                    name: 'metaDescription',
                    type: 'textarea',
                    maxLength: 160,
                    admin: {
                        description: 'Recommended: 150-160 characters',
                    },
                },
                {
                    name: 'ogImage',
                    type: 'upload',
                    relationTo: 'media',
                    admin: {
                        description: 'Image for social media sharing',
                    },
                },
                {
                    name: 'canonicalUrl',
                    type: 'text',
                    admin: {
                        description: 'Leave empty to use default URL',
                    },
                },
            ],
        },
    ],
    timestamps: true,
}
