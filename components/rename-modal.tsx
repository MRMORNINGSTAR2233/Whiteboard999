"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  onRename: (name: string, icon: string) => void
  currentName: string
  currentIcon: string
}

const iconCategories = [
  {
    name: "Work & Business",
    icons: [
      "💼",
      "📊",
      "📈",
      "📉",
      "💰",
      "🏢",
      "📋",
      "📝",
      "📄",
      "📑",
      "🗂️",
      "📁",
      "📂",
      "🗃️",
      "📇",
      "📌",
      "📍",
      "🔍",
      "🔎",
      "💡",
      "🎯",
      "⚡",
      "🔥",
      "⭐",
      "🏆",
      "🎖️",
      "🥇",
      "🎪",
      "🎨",
      "🖼️",
      "🎭",
    ],
  },
  {
    name: "Technology",
    icons: [
      "💻",
      "🖥️",
      "⌨️",
      "🖱️",
      "🖨️",
      "📱",
      "☎️",
      "📞",
      "📟",
      "📠",
      "📡",
      "🔋",
      "🔌",
      "💾",
      "💿",
      "📀",
      "🧮",
      "📷",
      "📸",
      "📹",
      "📼",
      "🔍",
      "🔎",
      "🔬",
      "🔭",
      "📺",
      "📻",
      "🎙️",
      "🎚️",
      "🎛️",
      "⏱️",
      "⏰",
      "⏲️",
      "⏳",
      "⌛",
      "📡",
      "🛰️",
      "🚀",
      "🛸",
      "🌐",
      "💫",
    ],
  },
  {
    name: "Creative & Design",
    icons: [
      "🎨",
      "🖌️",
      "🖍️",
      "✏️",
      "✒️",
      "🖊️",
      "🖋️",
      "✂️",
      "📐",
      "📏",
      "📌",
      "📍",
      "🎭",
      "🎪",
      "🎨",
      "🖼️",
      "🎬",
      "🎞️",
      "📽️",
      "🎥",
      "📷",
      "📸",
      "🎵",
      "🎶",
      "🎼",
      "🎹",
      "🥁",
      "🎸",
      "🎺",
      "🎷",
      "🎻",
      "🎤",
      "🎧",
      "📻",
      "🎙️",
      "🌈",
      "⭐",
      "✨",
      "💫",
      "🔮",
    ],
  },
  {
    name: "Planning & Organization",
    icons: [
      "📅",
      "📆",
      "🗓️",
      "📋",
      "📝",
      "📄",
      "📃",
      "📑",
      "📊",
      "📈",
      "📉",
      "🗂️",
      "📁",
      "📂",
      "🗃️",
      "📇",
      "🏷️",
      "📌",
      "📍",
      "🎯",
      "🗺️",
      "🧭",
      "📍",
      "📌",
      "⏰",
      "⏱️",
      "⏲️",
      "⏳",
      "⌛",
      "🔔",
      "🔕",
      "📢",
      "📣",
      "📯",
      "🎺",
      "📻",
      "📡",
      "🛰️",
      "🌐",
      "💫",
    ],
  },
  {
    name: "Communication",
    icons: [
      "💬",
      "💭",
      "🗨️",
      "🗯️",
      "💡",
      "📢",
      "📣",
      "📯",
      "🔔",
      "🔕",
      "📞",
      "☎️",
      "📱",
      "📧",
      "📨",
      "📩",
      "📤",
      "📥",
      "📮",
      "📪",
      "📫",
      "📬",
      "📭",
      "✉️",
      "💌",
      "📝",
      "✍️",
      "🖊️",
      "🖋️",
      "✒️",
      "🖌️",
      "🖍️",
      "📄",
      "📃",
      "📑",
      "📊",
      "📈",
      "📉",
      "🗂️",
      "📁",
      "📂",
    ],
  },
  {
    name: "Education & Learning",
    icons: [
      "📚",
      "📖",
      "📗",
      "📘",
      "📙",
      "📕",
      "📓",
      "📔",
      "📒",
      "📝",
      "📄",
      "📃",
      "📑",
      "📊",
      "📈",
      "📉",
      "🎓",
      "🏫",
      "🏛️",
      "🔬",
      "🔭",
      "🧪",
      "⚗️",
      "🧬",
      "💊",
      "🩺",
      "🌡️",
      "💉",
      "🩹",
      "🧲",
      "🔍",
      "🔎",
      "💡",
      "🧠",
      "🎯",
      "📐",
      "📏",
      "✏️",
      "✒️",
      "🖊️",
    ],
  },
  {
    name: "Travel & Places",
    icons: [
      "🌍",
      "🌎",
      "🌏",
      "🌐",
      "🗺️",
      "🧭",
      "🏔️",
      "⛰️",
      "🌋",
      "🗻",
      "🏕️",
      "🏖️",
      "🏜️",
      "🏝️",
      "🏞️",
      "🏟️",
      "🏛️",
      "🏗️",
      "🏘️",
      "🏚️",
      "🏠",
      "🏡",
      "🏢",
      "🏣",
      "🏤",
      "🏥",
      "🏦",
      "🏨",
      "🏩",
      "🏪",
      "🏫",
      "🏬",
      "🏭",
      "🏯",
      "🏰",
      "🗼",
      "🗽",
      "⛪",
      "🕌",
      "🛕",
      "🕍",
    ],
  },
  {
    name: "Objects & Tools",
    icons: [
      "🔧",
      "🔨",
      "⚒️",
      "🛠️",
      "⛏️",
      "🔩",
      "⚙️",
      "🧰",
      "🧲",
      "🔫",
      "💣",
      "🧨",
      "🔪",
      "🗡️",
      "⚔️",
      "🛡️",
      "🚬",
      "⚰️",
      "⚱️",
      "🏺",
      "🔮",
      "📿",
      "💈",
      "⚗️",
      "🔭",
      "🔬",
      "🕳️",
      "💊",
      "💉",
      "🩺",
      "🩹",
      "🩼",
      "🧬",
      "🦠",
      "🧫",
      "🧪",
      "🌡️",
      "🧹",
      "🧺",
      "🧻",
    ],
  },
]

export function RenameModal({ isOpen, onClose, onRename, currentName, currentIcon }: RenameModalProps) {
  const [name, setName] = useState(currentName)
  const [selectedIcon, setSelectedIcon] = useState(currentIcon)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("Work & Business")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onRename(name.trim(), selectedIcon)
      onClose()
    }
  }

  const handleClose = () => {
    setName(currentName)
    setSelectedIcon(currentIcon)
    setSearchQuery("")
    setActiveCategory("Work & Business")
    onClose()
  }

  const filteredIcons = searchQuery
    ? iconCategories.flatMap((category) =>
        category.icons.filter(
          (icon) =>
            // Simple search - could be enhanced with icon names/descriptions
            icon.includes(searchQuery) || category.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    : iconCategories.find((cat) => cat.name === activeCategory)?.icons || []

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Rename Whiteboard</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Whiteboard Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter whiteboard name"
              className="w-full"
              autoFocus
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Choose Icon</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current:</span>
                <div className="text-2xl">{selectedIcon}</div>
              </div>
            </div>

            {/* Icon Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Tabs */}
            {!searchQuery && (
              <div className="flex flex-wrap gap-2">
                {iconCategories.map((category) => (
                  <Button
                    key={category.name}
                    type="button"
                    variant={activeCategory === category.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.name)}
                    className="text-xs"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}

            {/* Icon Grid */}
            <ScrollArea className="h-48 w-full border rounded-md p-4">
              <div className="grid grid-cols-8 gap-2">
                {filteredIcons.map((icon, index) => (
                  <button
                    key={`${icon}-${index}`}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2 rounded-md text-2xl hover:bg-muted transition-colors ${
                      selectedIcon === icon ? "bg-primary/10 ring-2 ring-primary" : ""
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              {filteredIcons.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>No icons found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Rename Whiteboard
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
