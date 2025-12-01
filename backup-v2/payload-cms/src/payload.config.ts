import path from 'path'
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { webpackBundler } from '@payloadcms/bundler-webpack'

// Collections
import { Users } from './collections/Users'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { ProductAttributes } from './collections/ProductAttributes'
import { ProductVariations } from './collections/ProductVariations'

export default buildConfig({
    serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',

    admin: {
        user: Users.slug,
        bundler: webpackBundler(),
        // Minimal admin UI (we have custom UI)
        // But keep it as backup/fallback
    },

    collections: [
        Users,
        Posts,
        Products,
        Categories,
        Media,
        ProductAttributes,
        ProductVariations,
    ],

    editor: lexicalEditor({}),

    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL,
        },
    }),

    typescript: {
        outputFile: path.resolve(__dirname, '../payload-types.ts'),
    },

    // Enable GraphQL
    graphQL: {
        schemaOutputFile: path.resolve(__dirname, '../generated-schema.graphql'),
    },

    // CORS for custom admin UI
    cors: [
        'http://localhost:3001', // Custom Admin UI dev
        'http://localhost:3002', // Storefront dev
        process.env.ADMIN_UI_URL || '',
        process.env.STOREFRONT_URL || '',
    ].filter(Boolean),
})
