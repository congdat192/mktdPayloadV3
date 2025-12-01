import { CollectionConfig } from 'payload/types'

export const Products: CollectionConfig = {
    slug: 'products',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'price', 'stockStatus', 'updatedAt'],
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
            name: 'type',
            type: 'select',
            required: true,
            defaultValue: 'simple',
            options: [
                { label: 'Simple Product', value: 'simple' },
                { label: 'Variable Product', value: 'variable' },
                { label: 'Grouped Product', value: 'grouped' },
                { label: 'External Product', value: 'external' },
            ],
            admin: {
                description: 'Product type from WooCommerce',
            },
        },
        {
            name: 'description',
            type: 'textarea',
        },
        {
            name: 'shortDescription',
            type: 'textarea',
        },
        // Pricing
        {
            name: 'price',
            type: 'number',
            required: true,
            min: 0,
        },
        {
            name: 'salePrice',
            type: 'number',
            min: 0,
            admin: {
                description: 'Leave empty if no sale',
            },
        },
        // Inventory
        {
            name: 'sku',
            type: 'text',
            unique: true,
            admin: {
                description: 'Stock Keeping Unit',
            },
        },
        {
            name: 'stockQuantity',
            type: 'number',
            defaultValue: 0,
            min: 0,
        },
        {
            name: 'stockStatus',
            type: 'select',
            defaultValue: 'instock',
            options: [
                { label: 'In Stock', value: 'instock' },
                { label: 'Out of Stock', value: 'outofstock' },
                { label: 'On Backorder', value: 'onbackorder' },
            ],
        },
        // Images
        {
            name: 'featuredImage',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'gallery',
            type: 'array',
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                },
            ],
        },
        // Categories
        {
            name: 'categories',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: true,
            filterOptions: {
                type: { equals: 'product' },
            },
        },
        // Product Attributes (for variable products)
        {
            name: 'attributes',
            type: 'array',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'slug',
                    type: 'text',
                },
                {
                    name: 'visible',
                    type: 'checkbox',
                    defaultValue: true,
                },
                {
                    name: 'variation',
                    type: 'checkbox',
                    defaultValue: false,
                    admin: {
                        description: 'Used for variations?',
                    },
                },
                {
                    name: 'options',
                    type: 'array',
                    fields: [
                        {
                            name: 'value',
                            type: 'text',
                        },
                    ],
                },
            ],
        },
        // Tags
        {
            name: 'tags',
            type: 'array',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                },
                {
                    name: 'slug',
                    type: 'text',
                },
            ],
        },
        // Meta Data (custom fields from WooCommerce)
        {
            name: 'metaData',
            type: 'json',
            admin: {
                description: 'Custom fields from WooCommerce',
            },
        },
        // SEO
        {
            name: 'seo',
            type: 'group',
            fields: [
                {
                    name: 'metaTitle',
                    type: 'text',
                },
                {
                    name: 'metaDescription',
                    type: 'textarea',
                    maxLength: 160,
                },
                {
                    name: 'ogImage',
                    type: 'upload',
                    relationTo: 'media',
                },
            ],
        },
    ],
    timestamps: true,
}
