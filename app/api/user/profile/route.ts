import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth()
    
    // Fetch user data with statistics
    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        _count: {
          select: {
            whiteboards: true,
            shares: true,
            comments: true,
          },
        },
      },
    })
    
    // If user doesn't exist in database, create it from Clerk data
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.name,
          image: authUser.image,
        },
        include: {
          _count: {
            select: {
              whiteboards: true,
              shares: true,
              comments: true,
            },
          },
        },
      })
    }
    
    // Update lastLoginAt timestamp
    await prisma.user.update({
      where: { id: authUser.id },
      data: { lastLoginAt: new Date() },
    })
    
    // Return user profile
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      stats: {
        whiteboardCount: user._count.whiteboards,
        sharedWhiteboardCount: user._count.shares,
        commentCount: user._count.comments,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("Failed to fetch user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await requireAuth()
    const body = await request.json()
    
    // Validate inputs
    const { name, image } = body
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 1 || name.length > 100) {
        return NextResponse.json(
          { error: "Name must be between 1 and 100 characters" },
          { status: 400 }
        )
      }
    }
    
    if (image !== undefined) {
      if (typeof image !== 'string') {
        return NextResponse.json(
          { error: "Image must be a valid URL string" },
          { status: 400 }
        )
      }
      
      // Basic URL validation
      try {
        new URL(image)
      } catch {
        return NextResponse.json(
          { error: "Image must be a valid URL" },
          { status: 400 }
        )
      }
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
      },
      include: {
        _count: {
          select: {
            whiteboards: true,
            shares: true,
            comments: true,
          },
        },
      },
    })
    
    // Return updated profile
    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      image: updatedUser.image,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      createdAt: updatedUser.createdAt,
      lastLoginAt: updatedUser.lastLoginAt,
      stats: {
        whiteboardCount: updatedUser._count.whiteboards,
        sharedWhiteboardCount: updatedUser._count.shares,
        commentCount: updatedUser._count.comments,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("Failed to update user profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
