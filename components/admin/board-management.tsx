"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Share2,
  Download,
  Users,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react"

interface Board {
  id: string
  title: string
  owner: string
  collaborators: number
  lastModified: Date
  status: "active" | "archived" | "shared"
  isAIGenerated: boolean
  views: number
  elements: number
}

const mockBoards: Board[] = [
  {
    id: "1",
    title: "Product Roadmap Q1 2024",
    owner: "John Doe",
    collaborators: 5,
    lastModified: new Date(Date.now() - 1000 * 60 * 30),
    status: "active",
    isAIGenerated: false,
    views: 127,
    elements: 23,
  },
  {
    id: "2",
    title: "AI-Generated User Journey",
    owner: "Sarah Miller",
    collaborators: 3,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "shared",
    isAIGenerated: true,
    views: 89,
    elements: 15,
  },
  {
    id: "3",
    title: "System Architecture Design",
    owner: "Mike Johnson",
    collaborators: 8,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "active",
    isAIGenerated: false,
    views: 234,
    elements: 45,
  },
  {
    id: "4",
    title: "Marketing Campaign Flow",
    owner: "Lisa Chen",
    collaborators: 2,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    status: "archived",
    isAIGenerated: true,
    views: 67,
    elements: 18,
  },
]

export function BoardManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [boards, setBoards] = useState(mockBoards)

  const filteredBoards = boards.filter((board) => {
    const matchesSearch =
      board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.owner.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "ai-generated") return matchesSearch && board.isAIGenerated
    if (activeTab === "active") return matchesSearch && board.status === "active"
    if (activeTab === "archived") return matchesSearch && board.status === "archived"

    return matchesSearch
  })

  const handleDeleteBoard = (boardId: string) => {
    setBoards((prev) => prev.filter((board) => board.id !== boardId))
  }

  const handleArchiveBoard = (boardId: string) => {
    setBoards((prev) => prev.map((board) => (board.id === boardId ? { ...board, status: "archived" as const } : board)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "shared":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Board Management</h1>
          <p className="text-muted-foreground">Manage and monitor all whiteboard activities</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Create Board
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search boards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Boards ({boards.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({boards.filter((b) => b.status === "active").length})</TabsTrigger>
          <TabsTrigger value="ai-generated">AI Generated ({boards.filter((b) => b.isAIGenerated).length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({boards.filter((b) => b.status === "archived").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4">
            {filteredBoards.map((board) => (
              <Card key={board.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{board.title}</h3>
                          {board.isAIGenerated && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getStatusColor(board.status)}`}>{board.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Owner: {board.owner}</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {board.collaborators} collaborators
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {board.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {board.elements} elements
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {board.lastModified.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Board
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Export Board
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveBoard(board.id)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteBoard(board.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBoards.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No boards found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first board to get started"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
