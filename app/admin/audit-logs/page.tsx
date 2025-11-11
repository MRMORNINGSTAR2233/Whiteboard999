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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { AuditLogEntry } from "@/types/audit-log"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionFilter, setActionFilter] = useState("")
  const [targetTypeFilter, setTargetTypeFilter] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [page, actionFilter, targetTypeFilter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(actionFilter && { action: actionFilter }),
        ...(targetTypeFilter && { targetType: targetTypeFilter }),
      })

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      const data = await response.json()

      setLogs(data.logs)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      suspend_user: "bg-orange-100 text-orange-800",
      activate_user: "bg-green-100 text-green-800",
      change_user_role: "bg-blue-100 text-blue-800",
      delete_user: "bg-red-100 text-red-800",
      delete_whiteboard: "bg-red-100 text-red-800",
      update_system_settings: "bg-purple-100 text-purple-800",
    }

    return (
      <Badge className={colors[action] || "bg-gray-100 text-gray-800"}>
        {action.replace(/_/g, " ")}
      </Badge>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Track all administrative actions</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Actions</SelectItem>
            <SelectItem value="suspend_user">Suspend User</SelectItem>
            <SelectItem value="activate_user">Activate User</SelectItem>
            <SelectItem value="change_user_role">Change Role</SelectItem>
            <SelectItem value="delete_user">Delete User</SelectItem>
            <SelectItem value="delete_whiteboard">Delete Whiteboard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="whiteboard">Whiteboard</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={fetchLogs}>
          <Filter className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Changes</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.actor.name || "Unknown"}</div>
                      <div className="text-sm text-gray-500">{log.actor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium capitalize">{log.targetType}</div>
                      {log.targetId && (
                        <div className="text-sm text-gray-500 font-mono">{log.targetId.slice(0, 8)}...</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <pre className="text-xs bg-gray-50 p-2 rounded max-w-xs overflow-auto">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {log.ipAddress || "N/A"}
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
    </div>
  )
}
