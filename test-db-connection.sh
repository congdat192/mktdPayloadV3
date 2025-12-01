# Test Supabase Connection Script
# Run this to verify your database credentials work

DATABASE_URL=postgres://postgres.sbpeuqsizcnkqrrgypvw:DYJZNYLHVMmFTsAY@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '$DATABASE_URL'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connection successful!');
  console.log('📅 Server time:', res.rows[0].now);
  pool.end();
  process.exit(0);
});
"
