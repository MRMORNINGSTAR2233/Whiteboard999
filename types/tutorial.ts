import { Step } from "react-joyride"

export interface TutorialStep extends Step {
  id: string
}

export interface Tutorial {
  id: string
  name: string
  steps: TutorialStep[]
  skippable: boolean
  autoStart: boolean
}

export type TutorialId =
  | "welcome"
  | "create-whiteboard"
  | "ai-features"
  | "collaboration"
  | "sharing"

export interface OnboardingStatus {
  welcomeCompleted: boolean
  createWhiteboardCompleted: boolean
  aiFeaturesCompleted: boolean
  collaborationCompleted: boolean
  sharingCompleted: boolean
  completedAt: Date | null
}
