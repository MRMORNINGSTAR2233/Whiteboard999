/**
 * Database Seed Script
 * 
 * This script will populate your database with sample data for testing
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
    // Create sample users
    console.log('\n👤 Creating sample users...')
    
    const password = await bcrypt.hash('password123', 10)
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        emailVerified: new Date(),
        role: 'ADMIN',
      },
    })
    console.log(`✅ Created admin user: ${adminUser.email}`)
    
    const user1 = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User',
        emailVerified: new Date(),
        role: 'USER',
      },
    })
    console.log(`✅ Created user: ${user1.email}`)

    const user2 = await prisma.user.create({
      data: {
        email: 'john@example.com',
        name: 'John Doe',
        emailVerified: new Date(),
        role: 'USER',
      },
    })
    console.log(`✅ Created user: ${user2.email}`)

    const user3 = await prisma.user.create({
      data: {
        email: 'jane@example.com',
        name: 'Jane Smith',
        emailVerified: new Date(),
        role: 'USER',
      },
    })
    console.log(`✅ Created user: ${user3.email}`)

    // Create sample whiteboards
    console.log('\n📋 Creating sample whiteboards...')
    
    const whiteboard1 = await prisma.whiteboard.create({
      data: {
        name: 'Welcome to AI Whiteboard',
        icon: '👋',
        ownerId: user1.id,
        data: {},
        isStarred: true,
      },
    })
    console.log(`✅ Created whiteboard: ${whiteboard1.name}`)

    const whiteboard2 = await prisma.whiteboard.create({
      data: {
        name: 'Project Planning',
        icon: '📊',
        ownerId: user1.id,
        data: {},
      },
    })
    console.log(`✅ Created whiteboard: ${whiteboard2.name}`)

    const whiteboard3 = await prisma.whiteboard.create({
      data: {
        name: 'Team Brainstorming',
        icon: '💡',
        ownerId: user2.id,
        data: {},
      },
    })
    console.log(`✅ Created whiteboard: ${whiteboard3.name}`)

    // Share whiteboard
    console.log('\n🤝 Creating shares...')
    
    await prisma.whiteboardShare.create({
      data: {
        whiteboardId: whiteboard3.id,
        userId: user1.id,
        permission: 'EDIT',
      },
    })
    console.log(`✅ Shared "${whiteboard3.name}" with ${user1.email}`)

    // Create sample comments
    console.log('\n💬 Creating sample comments...')
    
    const comment1 = await prisma.comment.create({
      data: {
        whiteboardId: whiteboard1.id,
        authorId: user2.id,
        content: 'Great work on this whiteboard!',
        x: 100,
        y: 100,
      },
    })
    console.log(`✅ Created comment on "${whiteboard1.name}"`)

    await prisma.commentReply.create({
      data: {
        commentId: comment1.id,
        authorId: user1.id,
        content: 'Thanks! Glad you like it.',
      },
    })
    console.log(`✅ Created reply to comment`)

    console.log('\n✨ Database seeded successfully!')
    console.log('\n📝 Sample credentials:')
    console.log('Admin: admin@example.com (role: ADMIN)')
    console.log('Email: demo@example.com')
    console.log('Email: john@example.com')
    console.log('Email: jane@example.com')
    console.log('Password: password123 (for all users)')
    console.log('\n💡 To manually promote a user to admin, run:')
    console.log('npx prisma studio')
    console.log('Then edit the user record and change role to "ADMIN"')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()
  .then(() => {
    console.log('\n✅ Seeding complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  })
