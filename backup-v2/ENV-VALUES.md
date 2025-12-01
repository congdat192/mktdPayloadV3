# Environment Variables Documentation

**Backed up**: 2025-12-01
**Source**: payload-cms/.env

---

## Database Configuration

```bash
DATABASE_URL=postgres://postgres.sbpeuqsizcnkqrrgypvw:DYJZNYLHVMmFTsAY@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**For Payload v3, use this key name:**
```bash
DATABASE_URI=postgres://postgres.sbpeuqsizcnkqrrgypvw:DYJZNYLHVMmFTsAY@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## Payload Configuration

```bash
PAYLOAD_SECRET=7f7633575d1027ee29256c78fb6d87f2db5c4e712d297751024659fe7477f02c
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

**For Payload v3:**
```bash
PAYLOAD_SECRET=7f7633575d1027ee29256c78fb6d87f2db5c4e712d297751024659fe7477f02c
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

---

## S3 Storage (Supabase)

```bash
S3_ENDPOINT=https://sbpeuqsizcnkqrrgypvw.storage.supabase.co/storage/v1/s3
S3_BUCKET=media
S3_REGION=ap-southeast-1
S3_ACCESS_KEY_ID=7f7633575d1027ee29256c78fb6d87f2
S3_SECRET_ACCESS_KEY=db5c4e712d297751024659fe7477f02c2669f33780e100def75bf733db50a2f9
```

---

## Supabase Direct Access

```bash
SUPABASE_URL=https://sbpeuqsizcnkqrrgypvw.supabase.co
```

---

## Complete .env.local Template for Payload v3

Copy this template to your new `payload-v3/.env.local` file:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URI=postgres://postgres.sbpeuqsizcnkqrrgypvw:DYJZNYLHVMmFTsAY@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Payload
PAYLOAD_SECRET=7f7633575d1027ee29256c78fb6d87f2db5c4e712d297751024659fe7477f02c
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# S3 Storage (Supabase)
S3_ENDPOINT=https://sbpeuqsizcnkqrrgypvw.storage.supabase.co/storage/v1/s3
S3_BUCKET=media
S3_REGION=ap-southeast-1
S3_ACCESS_KEY_ID=7f7633575d1027ee29256c78fb6d87f2
S3_SECRET_ACCESS_KEY=db5c4e712d297751024659fe7477f02c2669f33780e100def75bf733db50a2f9

# Node Environment
NODE_ENV=development
```

---

## Key Changes from v2 to v3

| v2 Variable | v3 Variable | Notes |
|-------------|-------------|-------|
| `DATABASE_URL` | `DATABASE_URI` | Just renamed |
| `PAYLOAD_PUBLIC_SERVER_URL` | `NEXT_PUBLIC_SERVER_URL` | Next.js convention |

---

**IMPORTANT**: Keep this file secure. Do not commit to git.
