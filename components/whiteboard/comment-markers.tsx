"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Clock, Check, X } from "lucide-react"

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
  replies?: Comment[]
}

interface CommentMarkersProps {
  comments: Comment[]
  onCommentClick: (comment: Comment) => void
  onResolveComment: (commentId: string) => void
}

export function CommentMarkers({ comments, onCommentClick, onResolveComment }: CommentMarkersProps) {
  const [activeComment, setActiveComment] = useState<string | null>(null)

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <>
      {comments
        .filter((c) => !c.resolved)
        .map((comment) => (
          <div key={comment.id}>
            {/* Comment Marker */}
            <div
              className="absolute z-40 cursor-pointer"
              style={{
                left: comment.x,
                top: comment.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all ${
                  activeComment === comment.id ? "bg-accent scale-110" : "bg-black hover:scale-105"
                }`}
                onClick={() => {
                  setActiveComment(activeComment === comment.id ? null : comment.id)
                  onCommentClick(comment)
                }}
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </div>

              {/* Comment Count Badge */}
              {comment.replies && comment.replies.length > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-accent text-accent-foreground"
                >
                  {comment.replies.length + 1}
                </Badge>
              )}
            </div>

            {/* Comment Popup */}
            {activeComment === comment.id && (
              <Card
                className="absolute z-50 w-80 shadow-xl"
                style={{
                  left: comment.x + 20,
                  top: comment.y - 10,
                  transform: "translateY(-50%)",
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.userAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {comment.userName
                          ? comment.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="w-6 h-6 p-0" onClick={() => setActiveComment(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-2 mb-3 pl-4 border-l-2 border-muted">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={reply.userAvatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {reply.userName
                                ? reply.userName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs">{reply.userName}</span>
                              <span className="text-xs text-muted-foreground">{formatTimeAgo(reply.timestamp)}</span>
                            </div>
                            <p className="text-xs text-foreground">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                      Reply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs bg-transparent"
                      onClick={() => onResolveComment(comment.id)}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
    </>
  )
}
