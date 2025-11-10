"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { X, Share2, Mail, Trash2, Copy, Check } from "lucide-react"

interface ShareDialogProps {
  whiteboardId: string
  onClose: () => void
}

interface Share {
  id: string
  permission: "VIEW" | "EDIT" | "ADMIN"
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface Owner {
  id: string
  name: string | null
  email: string
  image: string | null
}

export function ShareDialog({ whiteboardId, onClose }: ShareDialogProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<"VIEW" | "EDIT">("VIEW")
  const [shares, setShares] = useState<Share[]>([])
  const [owner, setOwner] = useState<Owner | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    fetchShares()
  }, [whiteboardId])

  const fetchShares = async () => {
    try {
      const response = await fetch(`/api/whiteboards/${whiteboardId}/share`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch shares")
      }

      const data = await response.json()
      setShares(data.shares)
      setOwner(data.owner)
    } catch (error) {
      console.error("Error fetching shares:", error)
      toast({
        title: "Error",
        description: "Failed to load sharing information",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/whiteboards/${whiteboardId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, permission }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to share whiteboard")
      }

      toast({
        title: "Success",
        description: `Whiteboard shared with ${email}`,
      })

      setEmail("")
      setPermission("VIEW")
      await fetchShares()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to share whiteboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveShare = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/whiteboards/${whiteboardId}/share?userId=${userId}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        throw new Error("Failed to remove access")
      }

      toast({
        title: "Access removed",
      })

      await fetchShares()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove access",
        variant: "destructive",
      })
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    })

    setTimeout(() => setIsCopied(false), 2000)
  }

  const getUserInitials = (user: { name: string | null; email: string }) => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Share Whiteboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Share Link</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={window.location.href}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-shrink-0"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Anyone with this link and access can view this whiteboard
          </p>
        </div>

        {/* Add People */}
        <form onSubmit={handleShare} className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Add People</Label>
          <div className="flex gap-2 mb-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select
              value={permission}
              onValueChange={(value: "VIEW" | "EDIT") => setPermission(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEW">Can view</SelectItem>
                <SelectItem value="EDIT">Can edit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" disabled={isLoading} className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? "Sharing..." : "Share"}
          </Button>
        </form>

        {/* People with Access */}
        <div>
          <Label className="text-sm font-medium mb-3 block">People with Access</Label>
          <div className="space-y-2">
            {/* Owner */}
            {owner && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                    {getUserInitials(owner)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{owner.name || owner.email}</p>
                    <p className="text-xs text-gray-500">{owner.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">Owner</span>
              </div>
            )}

            {/* Shared Users */}
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center font-medium">
                    {getUserInitials(share.user)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {share.user.name || share.user.email}
                    </p>
                    <p className="text-xs text-gray-500">{share.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {share.permission === "VIEW" ? "Can view" : "Can edit"}
                  </span>
                  <button
                    onClick={() => handleRemoveShare(share.user.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove access"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {shares.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Not shared with anyone yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
