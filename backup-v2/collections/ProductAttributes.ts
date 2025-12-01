import { CollectionConfig } from 'payload/types'

/**
 * Product Attributes Collection
 * For variable products (màu sắc, kích thước, chất liệu...)
 */
export const ProductAttributes: CollectionConfig = {
    slug: 'product-attributes',
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
            admin: {
                description: 'Attribute name (e.g., "Màu sắc", "Kích thước")',
            },
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
            options: [
                { label: 'Select', value: 'select' },
                { label: 'Color', value: 'color' },
                { label: 'Button', value: 'button' },
                { label: 'Image', value: 'image' },
            ],
            defaultValue: 'select',
        },
        {
            name: 'options',
            type: 'array',
            required: true,
            fields: [
                {
                    name: 'value',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'label',
                    type: 'text',
                },
            ],
        },
    ],
    timestamps: true,
}
