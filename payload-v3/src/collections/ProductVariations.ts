import { CollectionConfig } from 'payload'

/**
 * Product Variations Collection
 * For variable products - each combination of attributes
 */
export const ProductVariations: CollectionConfig = {
    slug: 'product-variations',
    admin: {
        useAsTitle: 'sku',
        defaultColumns: ['product', 'attributes', 'price', 'stockQuantity'],
    },
    access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === 'admin',
    },
    fields: [
        {
            name: 'product',
            type: 'relationship',
            relationTo: 'products',
            required: true,
            admin: {
                description: 'Parent product',
            },
        },
        {
            name: 'attributes',
            type: 'json',
            required: true,
            admin: {
                description: 'Attribute values for this variation (e.g., {"color": "Đen", "size": "XL"})',
            },
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
        },
        // Inventory
        {
            name: 'sku',
            type: 'text',
            unique: true,
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
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Image for this specific variation',
            },
        },
    ],
    timestamps: true,
}
