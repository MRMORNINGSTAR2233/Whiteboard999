# Database Setup Guide

This guide will help you set up the PostgreSQL database for the AI Whiteboard application.

## Option 1: Local PostgreSQL with Docker (Recommended for Development)

### Prerequisites
- Docker installed on your machine

### Steps

1. **Start PostgreSQL with Docker:**
```bash
docker run --name whiteboard-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=whiteboard \
  -p 5432:5432 \
  -d postgres:16-alpine
```

2. **Verify the container is running:**
```bash
docker ps
```

3. **Update .env.local:**
The DATABASE_URL is already configured for local Docker:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whiteboard?schema=public"
```

4. **Generate Prisma Client:**
```bash
npx prisma generate
```

5. **Run migrations:**
```bash
npx prisma migrate dev --name init
```

6. **Open Prisma Studio (optional):**
```bash
npx prisma studio
```

### Stop/Start the Database

Stop:
```bash
docker stop whiteboard-postgres
```

Start:
```bash
docker start whiteboard-postgres
```

Remove (deletes all data):
```bash
docker rm -f whiteboard-postgres
```

## Option 2: Hosted PostgreSQL (Recommended for Production)

### Supabase (Free tier available)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings > Database
4. Update DATABASE_URL in .env.local:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Neon (Free tier available)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update DATABASE_URL in .env.local

### Railway (Free tier available)

1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Update DATABASE_URL in .env.local

## After Database Setup

1. **Generate Prisma Client:**
```bash
npx prisma generate
```

2. **Run migrations:**
```bash
npx prisma migrate dev --name init
```

3. **Seed the database (optional):**
```bash
npx prisma db seed
```

## Troubleshooting

### Connection refused
- Make sure PostgreSQL is running
- Check if port 5432 is available
- Verify DATABASE_URL is correct

### Migration errors
- Drop the database and recreate: `npx prisma migrate reset`
- Check Prisma schema for syntax errors

### Prisma Client not found
- Run `npx prisma generate` again
- Restart your development server

## Next Steps

After setting up the database:
1. Generate a NextAuth secret: `openssl rand -base64 32`
2. Update NEXTAUTH_SECRET in .env.local
3. Start the development server: `pnpm dev`
4. The application will now use the database for persistence
