"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Users, MessageCircle, Crown, Eye, Edit, Clock, Send, MoreHorizontal, UserPlus, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  avatar: string
  role: "owner" | "editor" | "viewer"
  status: "online" | "away" | "offline"
  cursor?: { x: number; y: number; color: string }
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: Date
  x: number
  y: number
  resolved: boolean
}

interface CollaborationPanelProps {
  onClose: () => void
  users?: Array<{ id: string; name: string; avatar?: string }>
  isConnected?: boolean
  connectionStatus?: string
}

export function CollaborationPanel({ onClose, users: connectedUsers, isConnected, connectionStatus }: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<"users" | "comments">("users")
  const [newComment, setNewComment] = useState("")
  
  // Use real users if provided, otherwise mock data for demo
  const [users] = useState<User[]>(
    connectedUsers?.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar || "",
      role: "editor" as const,
      status: "online" as const,
    })) || [
      {
        id: "1",
        name: "You",
        avatar: "",
        role: "owner",
        status: "online",
        cursor: { x: 100, y: 100, color: "#3b82f6" },
      },
    ]
  )
  const [comments, setComments] = useState<Comment[]>([])

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        userId: "current-user",
        userName: "You",
        userAvatar: "",
        content: newComment,
        timestamp: new Date(),
        x: 400,
        y: 200,
        resolved: false,
      }
      setComments([...comments, comment])
      setNewComment("")
    }
  }

  const handleInvite = () => {
    console.log("[v0] Opening invite dialog")
    // In a real app, this would open an invite modal or send invites
    alert("Invite functionality would open here. Enter email addresses to invite collaborators.")
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-3 h-3 text-yellow-500" />
      case "editor":
        return <Edit className="w-3 h-3 text-blue-500" />
      case "viewer":
        return <Eye className="w-3 h-3 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Collaboration</h2>
          <Badge variant="secondary">{users.filter((u) => u.status === "online").length} online</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex gap-1">
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("users")}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Users ({users.length})
          </Button>
          <Button
            variant={activeTab === "comments" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("comments")}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Comments ({comments.filter((c) => !c.resolved).length})
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "users" && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleInvite}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite People
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                        {user.cursor && (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              data-color={user.cursor.color}
                              style={{ backgroundColor: user.cursor.color } as React.CSSProperties}
                            />
                            <span className="text-xs text-muted-foreground">Active</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 p-4">
              {comments.filter((c) => !c.resolved).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs">Add a comment to start the discussion</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments
                    .filter((c) => !c.resolved)
                    .map((comment) => (
                      <div key={comment.id} className="p-3 rounded-lg border border-border bg-card">
                        <div className="flex items-start gap-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={comment.userAvatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {comment.userName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{comment.userName}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-2">{comment.content}</p>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-xs h-6">
                            Reply
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs h-6">
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleAddComment()
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()} className="self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Press Cmd+Enter to send</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
