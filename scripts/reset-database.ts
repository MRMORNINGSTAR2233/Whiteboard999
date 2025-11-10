/**
 * Database Reset Script
 * 
 * This script will:
 * 1. Drop all existing tables
 * 2. Run Prisma migrations to create fresh tables
 * 3. Optionally seed with sample data
 * 
 * WARNING: This will DELETE ALL DATA in your database!
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🚨 WARNING: This will delete ALL data in your database!')
  console.log('Starting database reset in 3 seconds...')
  
  await new Promise(resolve => setTimeout(resolve, 3000))

  try {
    console.log('\n📦 Dropping all tables...')
    
    // Drop tables in correct order (respecting foreign key constraints)
    const tables = [
      'CommentReply',
      'Comment',
      'WhiteboardShare',
      'Whiteboard',
      'Session',
      'Account',
      'VerificationToken',
      'User',
    ]

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE;`)
        console.log(`✅ Dropped table: ${table}`)
      } catch (error) {
        console.log(`⚠️  Table ${table} doesn't exist or already dropped`)
      }
    }

    console.log('\n✨ All tables dropped successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Run: npx prisma migrate dev --name init')
    console.log('2. Run: npx prisma generate')
    console.log('3. Optionally run: npx tsx scripts/seed-database.ts')
    
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
  .then(() => {
    console.log('\n✅ Database reset complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Database reset failed:', error)
    process.exit(1)
  })
