"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Search, UserX, UserCheck, Shield, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface User {
  id: string
  email: string
  name: string | null
  role: "USER" | "ADMIN"
  status: "ACTIVE" | "SUSPENDED" | "DELETED"
  createdAt: string
  lastLoginAt: string | null
  whiteboardCount: number
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<"suspend" | "activate" | "delete" | "role" | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      setUsers(data.users)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (user: User, action: "suspend" | "activate" | "delete" | "role") => {
    setSelectedUser(user)
    setActionType(action)
  }

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return

    try {
      if (actionType === "delete") {
        await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: "DELETE",
        })
      } else {
        const updates: any = {}
        
        if (actionType === "suspend") {
          updates.status = "SUSPENDED"
        } else if (actionType === "activate") {
          updates.status = "ACTIVE"
        } else if (actionType === "role") {
          updates.role = selectedUser.role === "ADMIN" ? "USER" : "ADMIN"
        }

        await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
      }

      fetchUsers()
    } catch (error) {
      console.error("Failed to perform action:", error)
    } finally {
      setSelectedUser(null)
      setActionType(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      ACTIVE: { variant: "default", label: "Active" },
      SUSPENDED: { variant: "destructive", label: "Suspended" },
      DELETED: { variant: "secondary", label: "Deleted" },
    }
    const config = variants[status] || variants.ACTIVE
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getRoleBadge = (role: string) => {
    return role === "ADMIN" ? (
      <Badge variant="default" className="bg-purple-600">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">User</Badge>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Whiteboards</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name || "Anonymous"}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.whiteboardCount}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === "ACTIVE" ? (
                          <DropdownMenuItem onClick={() => handleAction(user, "suspend")}>
                            <UserX className="w-4 h-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction(user, "activate")}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleAction(user, "role")}>
                          <Shield className="w-4 h-4 mr-2" />
                          {user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction(user, "delete")}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!selectedUser && !!actionType}
        onClose={() => {
          setSelectedUser(null)
          setActionType(null)
        }}
        onConfirm={confirmAction}
        title={
          actionType === "delete"
            ? "Delete User"
            : actionType === "suspend"
            ? "Suspend User"
            : actionType === "activate"
            ? "Activate User"
            : "Change Role"
        }
        description={
          actionType === "delete"
            ? `Are you sure you want to delete ${selectedUser?.email}? This action cannot be undone.`
            : actionType === "suspend"
            ? `Are you sure you want to suspend ${selectedUser?.email}?`
            : actionType === "activate"
            ? `Are you sure you want to activate ${selectedUser?.email}?`
            : `Are you sure you want to change ${selectedUser?.email}'s role to ${
                selectedUser?.role === "ADMIN" ? "USER" : "ADMIN"
              }?`
        }
      />
    </div>
  )
}
