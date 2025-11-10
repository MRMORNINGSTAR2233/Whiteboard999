"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TemplateLibrary } from "@/components/template-library"
import { RenameModal } from "@/components/rename-modal"
import { ImportModal } from "@/components/import-modal"
import { UserMenu } from "@/components/user-menu"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Star,
  MoreHorizontal,
  Link2,
  Edit3,
  Share2,
  Move,
  Copy,
  Archive,
  Users,
  Clock,
  Trash2,
  RotateCcw,
  Upload,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface Whiteboard {
  id: string
  name: string
  icon: string
  isStarred: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  shares: Array<{
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }>
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([])
  const [filteredWhiteboards, setFilteredWhiteboards] = useState<Whiteboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<"all" | "starred" | "archived">("all")
  const [showTemplates, setShowTemplates] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedWhiteboard, setSelectedWhiteboard] = useState<Whiteboard | null>(null)

  // Fetch whiteboards from API
  useEffect(() => {
    if (status === "authenticated") {
      fetchWhiteboards()
    } else if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const fetchWhiteboards = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (activeTab === "archived") {
        params.append("archived", "true")
      } else if (activeTab === "starred") {
        params.append("starred", "true")
      }
      
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/whiteboards?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch whiteboards")
      }

      const data = await response.json()
      setWhiteboards(data.whiteboards)
      setFilteredWhiteboards(data.whiteboards)
    } catch (error) {
      console.error("Error fetching whiteboards:", error)
      toast({
        title: "Error",
        description: "Failed to load whiteboards",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch when tab or search changes
  useEffect(() => {
    if (status === "authenticated") {
      fetchWhiteboards()
    }
  }, [activeTab, searchQuery])

  const handleCreateWhiteboard = async () => {
    try {
      const response = await fetch("/api/whiteboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Untitled",
          icon: "🔶",
          data: {},
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create whiteboard")
      }

      const { whiteboard } = await response.json()
      
      toast({
        title: "Success",
        description: "Whiteboard created successfully",
      })

      router.push(`/whiteboard/${whiteboard.id}`)
    } catch (error) {
      console.error("Error creating whiteboard:", error)
      toast({
        title: "Error",
        description: "Failed to create whiteboard",
        variant: "destructive",
      })
    }
  }

  const handleStarToggle = async (whiteboard: Whiteboard) => {
    try {
      const response = await fetch(`/api/whiteboards/${whiteboard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isStarred: !whiteboard.isStarred,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update whiteboard")
      }

      await fetchWhiteboards()
      
      toast({
        title: whiteboard.isStarred ? "Removed from starred" : "Added to starred",
      })
    } catch (error) {
      console.error("Error toggling star:", error)
      toast({
        title: "Error",
        description: "Failed to update whiteboard",
        variant: "destructive",
      })
    }
  }

  const handleArchive = async (whiteboard: Whiteboard) => {
    try {
      const response = await fetch(`/api/whiteboards/${whiteboard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isArchived: !whiteboard.isArchived,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to archive whiteboard")
      }

      await fetchWhiteboards()
      
      toast({
        title: whiteboard.isArchived ? "Restored from archive" : "Moved to archive",
      })
    } catch (error) {
      console.error("Error archiving:", error)
      toast({
        title: "Error",
        description: "Failed to archive whiteboard",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (whiteboard: Whiteboard) => {
    if (!confirm("Are you sure you want to delete this whiteboard? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/whiteboards/${whiteboard.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete whiteboard")
      }

      await fetchWhiteboards()
      
      toast({
        title: "Whiteboard deleted",
      })
    } catch (error) {
      console.error("Error deleting:", error)
      toast({
        title: "Error",
        description: "Failed to delete whiteboard",
        variant: "destructive",
      })
    }
  }

  const handleRename = async (newName: string) => {
    if (!selectedWhiteboard) return

    try {
      const response = await fetch(`/api/whiteboards/${selectedWhiteboard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to rename whiteboard")
      }

      await fetchWhiteboards()
      setShowRenameModal(false)
      setSelectedWhiteboard(null)
      
      toast({
        title: "Whiteboard renamed",
      })
    } catch (error) {
      console.error("Error renaming:", error)
      toast({
        title: "Error",
        description: "Failed to rename whiteboard",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "Yesterday"
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (status === "loading" || isLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-900">AI Whiteboard</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search whiteboards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button size="sm" onClick={handleCreateWhiteboard}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Whiteboard
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs and View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                All Whiteboards
              </button>
              <button
                onClick={() => setActiveTab("starred")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === "starred"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Star className="h-4 w-4" />
                Starred
              </button>
              <button
                onClick={() => setActiveTab("archived")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === "archived"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Archive className="h-4 w-4" />
                Archived
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Whiteboards Grid/List */}
          {filteredWhiteboards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No whiteboards found</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === "starred"
                  ? "You haven't starred any whiteboards yet"
                  : activeTab === "archived"
                    ? "No archived whiteboards"
                    : "Get started by creating your first whiteboard"}
              </p>
              {activeTab === "all" && (
                <Button onClick={handleCreateWhiteboard}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Whiteboard
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWhiteboards.map((whiteboard) => (
                <div
                  key={whiteboard.id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <Link href={`/whiteboard/${whiteboard.id}`}>
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-2xl">{whiteboard.icon}</span>
                          <h3 className="font-medium text-gray-900 truncate">{whiteboard.name}</h3>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleStarToggle(whiteboard)
                          }}
                          className="flex-shrink-0"
                          aria-label={whiteboard.isStarred ? "Remove from starred" : "Add to starred"}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              whiteboard.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(whiteboard.updatedAt)}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedWhiteboard(whiteboard)
                              setShowRenameModal(true)
                            }}
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchive(whiteboard)}>
                            {whiteboard.isArchived ? (
                              <>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restore
                              </>
                            ) : (
                              <>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(whiteboard)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-gray-400" />
                      <div className="flex -space-x-2">
                        {[whiteboard.owner, ...whiteboard.shares.map((s) => s.user)].slice(0, 3).map((user, idx) => (
                          <div
                            key={user.id}
                            className="h-6 w-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
                            title={user.name || user.email}
                          >
                            {user.name?.[0] || user.email[0]}
                          </div>
                        ))}
                        {whiteboard.shares.length > 2 && (
                          <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center border-2 border-white">
                            +{whiteboard.shares.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              {filteredWhiteboards.map((whiteboard, idx) => (
                <div
                  key={whiteboard.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 ${
                    idx !== filteredWhiteboards.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <Link href={`/whiteboard/${whiteboard.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-2xl">{whiteboard.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{whiteboard.name}</h3>
                      <p className="text-sm text-gray-500">
                        Modified {formatDate(whiteboard.updatedAt)} by {whiteboard.owner.name || whiteboard.owner.email}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[whiteboard.owner, ...whiteboard.shares.map((s) => s.user)].slice(0, 3).map((user) => (
                        <div
                          key={user.id}
                          className="h-8 w-8 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center border-2 border-white"
                          title={user.name || user.email}
                        >
                          {user.name?.[0] || user.email[0]}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => handleStarToggle(whiteboard)}
                      aria-label={whiteboard.isStarred ? "Remove from starred" : "Add to starred"}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          whiteboard.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                        }`}
                      />
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedWhiteboard(whiteboard)
                            setShowRenameModal(true)
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(whiteboard)}>
                          {whiteboard.isArchived ? (
                            <>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </>
                          ) : (
                            <>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(whiteboard)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Modals */}
        {showTemplates && <TemplateLibrary onClose={() => setShowTemplates(false)} />}
        {showRenameModal && selectedWhiteboard && (
          <RenameModal
            currentName={selectedWhiteboard.name}
            onRename={handleRename}
            onClose={() => {
              setShowRenameModal(false)
              setSelectedWhiteboard(null)
            }}
          />
        )}
        {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
