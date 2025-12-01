import { migrateProductCategories, migratePostCategories } from './migrate-categories'
import { migrateProducts } from './migrate-products'

/**
 * Run all migrations in correct order
 */
async function runAllMigrations() {
    console.log(`
╔════════════════════════════════════════════╗
║   WordPress/WooCommerce → Payload CMS      ║
║            Migration Tool                  ║
╚════════════════════════════════════════════╝
  `)

    try {
        // Step 1: Migrate Categories (required first for relationships)
        console.log('\n📋 STEP 1: Migrating Categories...')
        const categoryMap = await migrateProductCategories()
        await migratePostCategories()

        // Step 2: Migrate Products
        console.log('\n📋 STEP 2: Migrating Products...')
        await migrateProducts(categoryMap)

        // Step 3: Migrate Posts (TODO)
        console.log('\n📋 STEP 3: Migrating Posts...')
        console.log('⏭️  Posts migration not yet implemented')

        // Step 4: Migrate Media (TODO)
        console.log('\n📋 STEP 4: Migrating Media...')
        console.log('⏭️  Media migration not yet implemented')

        console.log(`
╔════════════════════════════════════════════╗
║        ✅ Migration Completed!             ║
╚════════════════════════════════════════════╝

Next steps:
1. Review migrated data in Payload Admin
2. Run media migration for images
3. Test URLs and SEO metadata
4. Update any custom fields if needed
    `)

        process.exit(0)
    } catch (error) {
        console.error('\n❌ Migration failed:', error)
        process.exit(1)
    }
}

// Run
runAllMigrations()
