import type { Tutorial } from "@/types/tutorial"

export const tutorials: Record<string, Tutorial> = {
  welcome: {
    id: "welcome",
    name: "Welcome to AI Whiteboard",
    skippable: true,
    autoStart: true,
    steps: [
      {
        id: "welcome-1",
        target: "body",
        content: "Welcome to AI Whiteboard! Let's take a quick tour to help you get started.",
        placement: "center",
        disableBeacon: true,
      },
      {
        id: "welcome-2",
        target: "[data-tour='create-whiteboard']",
        content: "Click here to create your first whiteboard. You can organize your ideas, diagrams, and collaborate with others.",
        placement: "bottom",
      },
      {
        id: "welcome-3",
        target: "[data-tour='ai-features']",
        content: "Use AI-powered features to generate diagrams, get content suggestions, and enhance your whiteboards.",
        placement: "bottom",
      },
      {
        id: "welcome-4",
        target: "[data-tour='profile']",
        content: "Access your profile, settings, and manage your account from here.",
        placement: "bottom",
      },
    ],
  },

  createWhiteboard: {
    id: "create-whiteboard",
    name: "Creating Your First Whiteboard",
    skippable: true,
    autoStart: false,
    steps: [
      {
        id: "create-1",
        target: "[data-tour='whiteboard-canvas']",
        content: "This is your canvas! Draw, add shapes, text, and more.",
        placement: "center",
      },
      {
        id: "create-2",
        target: "[data-tour='toolbar']",
        content: "Use these tools to draw, add shapes, text, and other elements.",
        placement: "right",
      },
      {
        id: "create-3",
        target: "[data-tour='save-button']",
        content: "Your work is auto-saved, but you can manually save anytime.",
        placement: "bottom",
      },
      {
        id: "create-4",
        target: "[data-tour='export-button']",
        content: "Export your whiteboard in multiple formats: PNG, PDF, Markdown, HTML, and more!",
        placement: "bottom",
      },
    ],
  },

  aiFeatures: {
    id: "ai-features",
    name: "AI-Powered Features",
    skippable: true,
    autoStart: false,
    steps: [
      {
        id: "ai-1",
        target: "[data-tour='ai-panel']",
        content: "Access AI features from this panel to enhance your whiteboard.",
        placement: "left",
      },
      {
        id: "ai-2",
        target: "[data-tour='generate-diagram']",
        content: "Generate diagrams from text descriptions using AI.",
        placement: "left",
      },
      {
        id: "ai-3",
        target: "[data-tour='ai-suggestions']",
        content: "Get smart suggestions to improve your whiteboard layout and content.",
        placement: "left",
      },
    ],
  },

  collaboration: {
    id: "collaboration",
    name: "Real-time Collaboration",
    skippable: true,
    autoStart: false,
    steps: [
      {
        id: "collab-1",
        target: "[data-tour='presence-indicator']",
        content: "See who's currently viewing or editing the whiteboard in real-time.",
        placement: "bottom",
      },
      {
        id: "collab-2",
        target: "[data-tour='comments']",
        content: "Add comments to specific areas of the whiteboard to provide feedback.",
        placement: "left",
      },
      {
        id: "collab-3",
        target: "[data-tour='connection-status']",
        content: "Monitor your connection status for real-time collaboration.",
        placement: "bottom",
      },
    ],
  },

  sharing: {
    id: "sharing",
    name: "Sharing & Permissions",
    skippable: true,
    autoStart: false,
    steps: [
      {
        id: "share-1",
        target: "[data-tour='share-button']",
        content: "Click here to share your whiteboard with others.",
        placement: "bottom",
      },
      {
        id: "share-2",
        target: "[data-tour='permission-levels']",
        content: "Set permission levels: View Only, Can Comment, or Can Edit.",
        placement: "left",
      },
      {
        id: "share-3",
        target: "[data-tour='share-link']",
        content: "Generate a shareable link or invite people by email.",
        placement: "left",
      },
    ],
  },
}

export function getTutorial(id: string): Tutorial | undefined {
  return tutorials[id]
}

export function getAllTutorials(): Tutorial[] {
  return Object.values(tutorials)
}
