"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TemplateLibrary } from "@/components/template-library"
import { RenameModal } from "@/components/rename-modal"
import { ImportModal } from "@/components/import-modal"
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
} from "lucide-react"
import Link from "next/link"

interface Whiteboard {
  id: string
  name: string
  owner: string
  lastOpened: string
  modifiedBy: string
  modifiedDate: string
  sharedWith: Array<{ id: string; name: string; avatar: string; isOwner?: boolean }>
  isStarred: boolean
  icon: string
  isArchived?: boolean
}

const mockWhiteboards: Whiteboard[] = [
  {
    id: "1",
    name: "Untitled",
    owner: "Shashank Singh",
    lastOpened: "Today",
    modifiedBy: "Shashank Singh",
    modifiedDate: "Today",
    sharedWith: [{ id: "owner", name: "Shashank Singh", avatar: "/placeholder.svg?height=32&width=32", isOwner: true }],
    isStarred: false,
    icon: "🔶",
    isArchived: false,
  },
  {
    id: "2",
    name: "My First Board",
    owner: "Shashank Singh",
    lastOpened: "Nov 21, 2022",
    modifiedBy: "Shashank Singh",
    modifiedDate: "Nov 21, 2022",
    sharedWith: [
      { id: "owner", name: "Shashank Singh", avatar: "/placeholder.svg?height=32&width=32", isOwner: true },
      { id: "1", name: "John Doe", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "2", name: "Jane Smith", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    isStarred: true,
    icon: "🌐",
    isArchived: false,
  },
  {
    id: "3",
    name: "Product Roadmap Q1 2024",
    owner: "Sarah Johnson",
    lastOpened: "2 hours ago",
    modifiedBy: "Sarah Johnson",
    modifiedDate: "2 hours ago",
    sharedWith: [
      { id: "3", name: "Sarah Johnson", avatar: "/placeholder.svg?height=32&width=32", isOwner: true },
      { id: "4", name: "Mike Chen", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "5", name: "Lisa Wang", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "current", name: "Shashank Singh", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    isStarred: false,
    icon: "🗺️",
    isArchived: false,
  },
  {
    id: "4",
    name: "Design System Workshop",
    owner: "Alex Rodriguez",
    lastOpened: "Yesterday",
    modifiedBy: "Alex Rodriguez",
    modifiedDate: "Yesterday",
    sharedWith: [
      { id: "6", name: "Alex Rodriguez", avatar: "/placeholder.svg?height=32&width=32", isOwner: true },
      { id: "current", name: "Shashank Singh", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    isStarred: true,
    icon: "🎨",
    isArchived: false,
  },
  {
    id: "5",
    name: "Team Brainstorming Session",
    owner: "Emma Thompson",
    lastOpened: "3 days ago",
    modifiedBy: "Emma Thompson",
    modifiedDate: "3 days ago",
    sharedWith: [
      { id: "7", name: "Emma Thompson", avatar: "/placeholder.svg?height=32&width=32", isOwner: true },
      { id: "current", name: "Shashank Singh", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    isStarred: false,
    icon: "💡",
    isArchived: false,
  },
  {
    id: "6",
    name: "Architecture Planning",
    owner: "David Kim",
    lastOpened: "1 week ago",
    modifiedBy: "David Kim",
    modifiedDate: "1 week ago",
    sharedWith: [
      { id: "8", name: "David Kim", avatar: "/placeholder.svg?height=32&width=32", isOwner: true },
      { id: "9", name: "Rachel Green", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "current", name: "Shashank Singh", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    isStarred: false,
    icon: "🏗️",
    isArchived: false,
  },
  {
    id: "7",
    name: "Old Project Ideas",
    owner: "Shashank Singh",
    lastOpened: "2 weeks ago",
    modifiedBy: "Shashank Singh",
    modifiedDate: "2 weeks ago",
    sharedWith: [{ id: "owner", name: "Shashank Singh", avatar: "/placeholder.svg?height=32&width=32", isOwner: true }],
    isStarred: false,
    icon: "💭",
    isArchived: true,
  },
  {
    id: "8",
    name: "Archived Wireframes",
    owner: "Shashank Singh",
    lastOpened: "1 month ago",
    modifiedBy: "Shashank Singh",
    modifiedDate: "1 month ago",
    sharedWith: [{ id: "owner", name: "Shashank Singh", avatar: "/placeholder.svg?height=32&width=32", isOwner: true }],
    isStarred: false,
    icon: "📐",
    isArchived: true,
  },
]

const getUserAvatarColor = (name: string) => {
  const colors = [
    "bg-green-500 text-white",
    "bg-pink-500 text-white",
    "bg-blue-500 text-white",
    "bg-purple-500 text-white",
    "bg-orange-500 text-white",
    "bg-teal-500 text-white",
    "bg-red-500 text-white",
    "bg-indigo-500 text-white",
  ]

  // Generate consistent color based on name
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export default function WhiteboardsHomePage() {
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [whiteboards, setWhiteboards] = useState(mockWhiteboards)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [renameModal, setRenameModal] = useState<{
    isOpen: boolean
    boardId: string
    currentName: string
    currentIcon: string
  }>({
    isOpen: false,
    boardId: "",
    currentName: "",
    currentIcon: "",
  })
  const { toast } = useToast()

  const filteredWhiteboards = whiteboards.filter((board) => {
    const matchesSearch = board.name.toLowerCase().includes(searchQuery.toLowerCase())

    switch (activeTab) {
      case "recents":
        return matchesSearch && board.lastOpened === "Today" && !board.isArchived
      case "created":
        return matchesSearch && board.owner === "Shashank Singh" && !board.isArchived
      case "shared":
        return matchesSearch && board.owner !== "Shashank Singh" && !board.isArchived
      case "archived":
        return matchesSearch && board.owner === "Shashank Singh" && board.isArchived
      default:
        return matchesSearch && !board.isArchived
    }
  })

  const handleStarToggle = (id: string) => {
    setWhiteboards((prev) => prev.map((board) => (board.id === id ? { ...board, isStarred: !board.isStarred } : board)))
    toast({
      title: "Whiteboard Updated",
      description: "Starred status changed",
    })
  }

  const handleCopyLink = (id: string, name: string) => {
    console.log("[v0] Testing Copy Link functionality for:", name)
    const link = `${window.location.origin}/whiteboard/${id}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied",
      description: `Link to "${name}" copied to clipboard`,
    })
  }

  const handleRename = (id: string) => {
    console.log("[v0] Opening rename modal for board ID:", id)
    const board = whiteboards.find((b) => b.id === id)
    if (board) {
      setRenameModal({
        isOpen: true,
        boardId: id,
        currentName: board.name,
        currentIcon: board.icon,
      })
    }
  }

  const handleDuplicate = (id: string, name: string) => {
    console.log("[v0] Testing Duplicate functionality for:", name)
    const originalBoard = whiteboards.find((b) => b.id === id)!
    const newBoard: Whiteboard = {
      ...originalBoard,
      id: Date.now().toString(),
      name: `${name} (Copy)`,
      lastOpened: "Today",
      modifiedDate: "Today",
      isArchived: false,
    }
    setWhiteboards((prev) => [newBoard, ...prev])
    toast({
      title: "Whiteboard Duplicated",
      description: `Created copy of "${name}"`,
    })
  }

  const handleArchive = (id: string, name: string) => {
    console.log("[v0] Testing Archive functionality for:", name)
    setWhiteboards((prev) => prev.map((board) => (board.id === id ? { ...board, isArchived: true } : board)))
    toast({
      title: "Whiteboard Archived",
      description: `"${name}" has been archived`,
    })
  }

  const handleDelete = (id: string, name: string) => {
    console.log("[v0] Testing Delete functionality for:", name)
    if (confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) {
      setWhiteboards((prev) => prev.filter((board) => board.id !== id))
      toast({
        title: "Whiteboard Deleted",
        description: `"${name}" has been permanently deleted`,
        variant: "destructive",
      })
    }
  }

  const handleRestore = (id: string, name: string) => {
    console.log("[v0] Testing Restore functionality for:", name)
    setWhiteboards((prev) => prev.map((board) => (board.id === id ? { ...board, isArchived: false } : board)))
    toast({
      title: "Whiteboard Restored",
      description: `"${name}" has been restored to Created by Me`,
    })
  }

  const handleShare = async (id: string, name: string) => {
    console.log("[v0] Testing Share functionality for:", name)
    const shareUrl = `${window.location.origin}/whiteboard/${id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Whiteboard: ${name}`,
          text: `Check out this whiteboard: ${name}`,
          url: shareUrl,
        })
        toast({
          title: "Shared Successfully",
          description: `\"${name}\" has been shared`,
        })
      } catch (error) {
        // Handle user cancellation or permission denied
        if (error instanceof Error && error.name === "AbortError") {
          // User cancelled the share - don't show error
          return
        }

        // Fallback to copying link if share fails
        console.log("[v0] Share failed, falling back to copy link:", error)
        try {
          await navigator.clipboard.writeText(shareUrl)
          toast({
            title: "Share Link Copied",
            description: `Share link for \"${name}\" copied to clipboard`,
          })
        } catch (clipboardError) {
          // Final fallback - show the URL in a prompt
          console.log("[v0] Clipboard also failed, showing prompt:", clipboardError)
          prompt("Copy this link to share:", shareUrl)
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Share Link Copied",
          description: `Share link for \"${name}\" copied to clipboard`,
        })
      } catch (clipboardError) {
        // Final fallback - show the URL in a prompt
        console.log("[v0] Clipboard not available, showing prompt:", clipboardError)
        prompt("Copy this link to share:", shareUrl)
      }
    }
  }

  const handleMove = (id: string, name: string) => {
    console.log("[v0] Testing Move functionality for:", name)
    // Simulate move functionality
    const folders = ["Personal", "Work", "Projects", "Archive"]
    const selectedFolder = folders[Math.floor(Math.random() * folders.length)]
    toast({
      title: "Whiteboard Moved",
      description: `"${name}" moved to ${selectedFolder} folder`,
    })
  }

  const handleSelectTemplate = (template: any) => {
    setShowTemplateLibrary(false)
    // Navigate to new whiteboard with template
    window.location.href = `/whiteboard/new?template=${template.id}`
  }

  const handleRenameSubmit = (name: string, icon: string) => {
    console.log("[v0] Renaming board to:", name, "with icon:", icon)
    setWhiteboards((prev) => prev.map((board) => (board.id === renameModal.boardId ? { ...board, name, icon } : board)))
    toast({
      title: "Whiteboard Renamed",
      description: `Renamed to "${name}"`,
    })
    setRenameModal({ isOpen: false, boardId: "", currentName: "", currentIcon: "" })
  }

  const handleRenameClose = () => {
    setRenameModal({ isOpen: false, boardId: "", currentName: "", currentIcon: "" })
  }

  const handleImportSuccess = (boardData: any) => {
    console.log("[v0] Import successful, adding board:", boardData)
    const newBoard: Whiteboard = {
      id: boardData.id,
      name: boardData.name,
      owner: "Shashank Singh",
      lastOpened: "Today",
      modifiedBy: "Shashank Singh",
      modifiedDate: "Today",
      sharedWith: [
        { id: "owner", name: "Shashank Singh", avatar: "/placeholder.svg?height=32&width=32", isOwner: true },
      ],
      isStarred: false,
      icon: "📥",
      isArchived: false,
    }

    setWhiteboards((prev) => [newBoard, ...prev])
    toast({
      title: "Import Successful",
      description: `"${boardData.name}" has been imported from ${boardData.platform}`,
    })
  }

  const getActionMenu = (board: Whiteboard) => {
    const isOwner = board.owner === "Shashank Singh"
    const isArchived = board.isArchived

    if (isArchived && isOwner) {
      // Archived boards owned by user - only show restore
      return (
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleRestore(board.id, board.name)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDelete(board.id, board.name)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      )
    }

    if (isOwner) {
      // Boards owned by user - show all actions including archive and delete
      return (
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleCopyLink(board.id, board.name)}>
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRename(board.id)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare(board.id, board.name)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleMove(board.id, board.name)}>
            <Move className="h-4 w-4 mr-2" />
            Move
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDuplicate(board.id, board.name)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleArchive(board.id, board.name)}>
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDelete(board.id, board.name)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      )
    } else {
      // Shared boards - no archive action, limited actions
      return (
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleCopyLink(board.id, board.name)}>
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare(board.id, board.name)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDuplicate(board.id, board.name)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuContent>
      )
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-foreground">Whiteboards</h1>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground"
                  onClick={() => setShowTemplateLibrary(true)}
                >
                  Explore templates
                </Button>
                <Button
                  variant="outline"
                  className="text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground"
                  onClick={() => setShowImportModal(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Link href="/whiteboard/new">
                  <Button className="bg-foreground hover:bg-foreground/90 text-background">
                    <Plus className="h-4 w-4 mr-2" />
                    Create new
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              {[
                { key: "all", label: "All" },
                { key: "recents", label: "Recents" },
                { key: "created", label: "Created by Me" },
                { key: "shared", label: "Shared with me" },
                { key: "archived", label: "Archived" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "text-foreground border-foreground"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search whiteboards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none hover:bg-muted hover:text-foreground"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none hover:bg-muted hover:text-foreground"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-2">Shared With</div>
                <div className="col-span-2">Created On</div>
                <div className="col-span-2">Last opened</div>
                <div className="col-span-1"></div>
              </div>

              {filteredWhiteboards.map((board) => (
                <div
                  key={board.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-b-0 bg-white transition-colors"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <span className="text-lg">{board.icon}</span>
                    <div>
                      <Link href={`/whiteboard/${board.id}`}>
                        <h3 className="font-medium text-foreground hover:text-muted-foreground cursor-pointer">
                          {board.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Modified by {board.modifiedBy}, {board.modifiedDate}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <div className="group relative">
                      <div
                        className={`h-6 w-6 rounded-full cursor-pointer flex items-center justify-center text-xs font-medium ${getUserAvatarColor(board.owner)}`}
                      >
                        {board.owner
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {board.owner} (Owner)
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    {board.sharedWith.length > 0 ? (
                      <div className="flex -space-x-2">
                        {board.sharedWith.slice(0, 5).map((member) => (
                          <div
                            key={member.id}
                            className="group relative"
                            onMouseEnter={() => console.log(`[v0] Hovering over ${member.name}`)}
                          >
                            <div
                              className={`h-7 w-7 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-xs font-medium ${getUserAvatarColor(member.name)}`}
                            >
                              {member.name
                                .split(" ")
                                .map((n) => n.charAt(0))
                                .join("")
                                .toUpperCase()}
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              {member.name}
                              {member.isOwner ? " (Owner)" : ""}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                            </div>
                          </div>
                        ))}
                        {board.sharedWith.length > 5 && (
                          <div className="group relative">
                            <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 cursor-pointer hover:bg-gray-300">
                              +{board.sharedWith.length - 5}
                            </div>
                            {/* Tooltip for overflow count */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              {board.sharedWith.length - 5} more members
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-muted-foreground">{board.modifiedDate}</span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-muted-foreground">{board.lastOpened}</span>
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStarToggle(board.id)}
                      className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
                    >
                      <Star
                        className={`h-4 w-4 ${board.isStarred ? "fill-foreground text-foreground" : "text-muted-foreground"}`}
                      />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      {getActionMenu(board)}
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWhiteboards.map((board) => (
                <div
                  key={board.id}
                  className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{board.icon}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStarToggle(board.id)}
                        className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
                      >
                        <Star
                          className={`h-4 w-4 ${board.isStarred ? "fill-foreground text-foreground" : "text-muted-foreground"}`}
                        />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        {getActionMenu(board)}
                      </DropdownMenu>
                    </div>
                  </div>

                  <Link href={`/whiteboard/${board.id}`}>
                    <h3 className="font-medium text-foreground hover:text-muted-foreground cursor-pointer mb-2">
                      {board.name}
                    </h3>
                  </Link>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{board.lastOpened}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>{board.owner}</span>
                    </div>
                    {board.sharedWith.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {board.sharedWith.slice(0, 4).map((member) => (
                            <div key={member.id} className="group relative">
                              <div
                                className={`h-5 w-5 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-xs font-medium ${getUserAvatarColor(member.name)}`}
                              >
                                {member.name
                                  .split(" ")
                                  .map((n) => n.charAt(0))
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {member.name}
                                {member.isOwner ? " (Owner)" : ""}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                              </div>
                            </div>
                          ))}
                          {board.sharedWith.length > 4 && (
                            <div className="group relative">
                              <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 cursor-pointer hover:bg-gray-300">
                                +{board.sharedWith.length - 4}
                              </div>
                              {/* Tooltip for overflow count */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {board.sharedWith.length - 4} more members
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredWhiteboards.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-foreground mb-2">No whiteboards found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Create your first whiteboard to get started"}
              </p>
              {!searchQuery && (
                <Link href="/whiteboard/new">
                  <Button className="bg-foreground hover:bg-foreground/90 text-background">
                    <Plus className="h-4 w-4 mr-2" />
                    Create new whiteboard
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <TemplateLibrary
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />

      <RenameModal
        isOpen={renameModal.isOpen}
        onClose={handleRenameClose}
        onRename={handleRenameSubmit}
        currentName={renameModal.currentName}
        currentIcon={renameModal.currentIcon}
      />

      <Toaster />
    </ThemeProvider>
  )
}
