# Supabase Database Setup

## Get Your Database Connection String

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ihxuuualanshcprgiwpy
2. Click on **Settings** (gear icon in sidebar)
3. Click on **Database**
4. Scroll down to **Connection String**
5. Select **URI** tab
6. Copy the connection string (it will look like):
   ```
   postgresql://postgres.ihxuuualanshcprgiwpy:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password

## Update .env.local

Replace these lines in `.env.local`:

```bash
DATABASE_URL="postgresql://postgres.ihxuuualanshcprgiwpy:YOUR_SUPABASE_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ihxuuualanshcprgiwpy:YOUR_SUPABASE_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

Replace `YOUR_SUPABASE_PASSWORD` with your actual password.

## Run Migrations

Once you've updated the DATABASE_URL, run:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will create all the necessary tables in your Supabase database.

## Verify Setup

You can verify the tables were created by:
1. Going to Supabase Dashboard
2. Click on **Table Editor**
3. You should see tables like: User, Whiteboard, WhiteboardShare, Comment, etc.
