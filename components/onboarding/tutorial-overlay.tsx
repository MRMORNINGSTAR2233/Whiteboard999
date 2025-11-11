"use client"

import { useEffect, useState } from "react"
import Joyride, { CallBackProps, STATUS, EVENTS } from "react-joyride"
import { useTutorial } from "@/hooks/use-tutorial"
import { getTutorial } from "@/lib/tutorials/tutorial-steps"
import type { TutorialId } from "@/types/tutorial"

interface TutorialOverlayProps {
  onComplete?: (tutorialId: TutorialId) => void
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const { activeTutorial, isRunning, stepIndex, stopTutorial, setStepIndex } = useTutorial()
  const [tutorial, setTutorial] = useState(activeTutorial ? getTutorial(activeTutorial) : null)

  useEffect(() => {
    if (activeTutorial) {
      setTutorial(getTutorial(activeTutorial))
    } else {
      setTutorial(null)
    }
  }, [activeTutorial])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0))
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (activeTutorial && onComplete) {
        onComplete(activeTutorial)
      }
      stopTutorial()
    }
  }

  if (!tutorial || !isRunning) {
    return null
  }

  return (
    <Joyride
      steps={tutorial.steps}
      run={isRunning}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton={tutorial.skippable}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#3b82f6",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          borderRadius: 6,
          padding: "8px 16px",
        },
        buttonBack: {
          color: "#6b7280",
          marginRight: 8,
        },
        buttonSkip: {
          color: "#6b7280",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip",
      }}
    />
  )
}
