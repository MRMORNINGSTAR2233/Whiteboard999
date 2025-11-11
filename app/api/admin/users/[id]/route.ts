import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit-log"

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const userId = params.id

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent self-modification of critical fields
    if (userId === session.user?.id) {
      if (body.role && body.role !== currentUser.role) {
        return NextResponse.json(
          { error: "Cannot change your own role" },
          { status: 403 }
        )
      }
      if (body.status && body.status !== currentUser.status) {
        return NextResponse.json(
          { error: "Cannot change your own status" },
          { status: 403 }
        )
      }
    }

    const updates: any = {}
    const changes: Record<string, any> = {}

    // Handle status change (suspend/activate)
    if (body.status && body.status !== currentUser.status) {
      updates.status = body.status
      changes.status = { from: currentUser.status, to: body.status }

      if (body.status === "SUSPENDED") {
        updates.suspendedAt = new Date()
        updates.suspendedBy = session.user?.id
        changes.suspendedAt = { from: null, to: new Date() }
      } else if (body.status === "ACTIVE") {
        updates.suspendedAt = null
        updates.suspendedBy = null
        changes.suspendedAt = { from: currentUser.suspendedAt, to: null }
      }
    }

    // Handle role change
    if (body.role && body.role !== currentUser.role) {
      updates.role = body.role
      changes.role = { from: currentUser.role, to: body.role }
    }

    // Handle other updates
    if (body.name !== undefined) {
      updates.name = body.name
      changes.name = { from: currentUser.name, to: body.name }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        status: true,
        suspendedAt: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })

    // Create audit log
    const action = body.status === "SUSPENDED" 
      ? "suspend_user" 
      : body.status === "ACTIVE" 
      ? "activate_user" 
      : body.role 
      ? "change_user_role" 
      : "update_user"

    await createAuditLog(
      session.user?.id || "",
      action as any,
      "user",
      userId,
      changes,
      request
    )

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message.startsWith("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    console.error("Failed to update user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const userId = params.id

    // Prevent self-deletion
    if (userId === session.user?.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 }
      )
    }

    // Get user data before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Soft delete by updating status
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "DELETED",
        email: `deleted_${userId}@deleted.com`, // Anonymize email
        name: "Deleted User",
        image: null,
      },
    })

    // Create audit log
    await createAuditLog(
      session.user?.id || "",
      "delete_user",
      "user",
      userId,
      {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      request
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message.startsWith("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    console.error("Failed to delete user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
