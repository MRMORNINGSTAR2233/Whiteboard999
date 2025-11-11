"use client"

import { create } from "zustand"
import type { TutorialId } from "@/types/tutorial"

interface TutorialState {
  activeTutorial: TutorialId | null
  isRunning: boolean
  stepIndex: number
  startTutorial: (id: TutorialId) => void
  stopTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  setStepIndex: (index: number) => void
}

export const useTutorial = create<TutorialState>((set) => ({
  activeTutorial: null,
  isRunning: false,
  stepIndex: 0,

  startTutorial: (id) =>
    set({
      activeTutorial: id,
      isRunning: true,
      stepIndex: 0,
    }),

  stopTutorial: () =>
    set({
      activeTutorial: null,
      isRunning: false,
      stepIndex: 0,
    }),

  nextStep: () =>
    set((state) => ({
      stepIndex: state.stepIndex + 1,
    })),

  prevStep: () =>
    set((state) => ({
      stepIndex: Math.max(0, state.stepIndex - 1),
    })),

  setStepIndex: (index) =>
    set({
      stepIndex: index,
    }),
}))
