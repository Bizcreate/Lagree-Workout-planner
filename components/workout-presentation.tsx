"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  Maximize,
  Minimize,
  Settings,
  List,
  Mic,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useWorkoutStore } from "@/lib/store"
import type { WorkoutExercise } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WorkoutPresentationProps {
  onClose: () => void
}

// Tabata timer settings interface
interface TabataSettings {
  workSeconds: number
  restSeconds: number
  rounds: number
}

// Workout mode type
type WorkoutMode = "standard" | "guided" | "tabata"

export function WorkoutPresentation({ onClose }: WorkoutPresentationProps) {
  const { workoutPlan } = useWorkoutStore()
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isModeSelectionOpen, setIsModeSelectionOpen] = useState(true) // Start with mode selection open
  const [narrationStyle, setNarrationStyle] = useState<"basic" | "instructor">("instructor") // Default to instructor mode
  const [voiceVolume, setVoiceVolume] = useState(80)
  const [instructorStyle, setInstructorStyle] = useState("motivational")
  const presentationRef = useRef<HTMLDivElement>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const narrationQueueRef = useRef<string[]>([])
  const isSpeakingRef = useRef(false)
  const [showNarrationBadge, setShowNarrationBadge] = useState(false)
  const [currentNarration, setCurrentNarration] = useState("")
  const [displayedWorkoutPlan, setDisplayedWorkoutPlan] = useState<WorkoutExercise[]>([])
  const previousExerciseRef = useRef<WorkoutExercise | null>(null)
  const [lastChangeSidesIndex, setLastChangeSidesIndex] = useState(-1)
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [workoutMode, setWorkoutMode] = useState<WorkoutMode>("guided")

  // Tabata specific states
  const [tabataSettings, setTabataSettings] = useState<TabataSettings>({
    workSeconds: 20,
    restSeconds: 10,
    rounds: 8,
  })
  const [isTabataRest, setIsTabataRest] = useState(false)
  const [tabataRound, setTabataRound] = useState(1)
  const [tabataExerciseIndex, setTabataExerciseIndex] = useState(0)

  // Process the workout plan to handle "Change Sides" and "Repeat on Other Side"
  useEffect(() => {
    setDisplayedWorkoutPlan(workoutPlan)
  }, [workoutPlan])

  const currentExercise = displayedWorkoutPlan[currentExerciseIndex]
  const totalExercises = displayedWorkoutPlan.length
  const exerciseDuration = currentExercise?.timeInSeconds || 60

  // Initialize timer when exercise changes
  useEffect(() => {
    if (currentExercise) {
      // Store the previous exercise (if not a special instruction)
      if (currentExerciseIndex > 0 && !isSpecialInstruction(displayedWorkoutPlan[currentExerciseIndex - 1])) {
        previousExerciseRef.current = displayedWorkoutPlan[currentExerciseIndex - 1]
      }

      // Skip setting timer for special instructions
      if (isSpecialInstruction(currentExercise)) {
        setTimeRemaining(5) // Just 5 seconds for instructions

        // If this is a "Change Sides" instruction, set up auto-advance to repeat the previous exercise
        if (currentExercise.name === "Change Sides" && previousExerciseRef.current && isPlaying) {
          // Clear any existing auto-advance timer
          if (autoAdvanceTimer) {
            clearTimeout(autoAdvanceTimer)
          }

          // Set a timer to automatically advance to the next exercise after the instruction
          const timer = setTimeout(() => {
            if (currentExerciseIndex < totalExercises - 1) {
              setCurrentExerciseIndex((prev) => prev + 1)
            }
          }, 5000) // 5 seconds for the instruction

          setAutoAdvanceTimer(timer)
          setLastChangeSidesIndex(currentExerciseIndex)
        }
      } else {
        // For Tabata mode, use the work interval time
        if (workoutMode === "tabata") {
          setTimeRemaining(isTabataRest ? tabataSettings.restSeconds : tabataSettings.workSeconds)
        } else {
          setTimeRemaining(exerciseDuration)
        }
      }

      // Announce the exercise if voice is enabled and in guided mode
      if (voiceEnabled && (workoutMode === "guided" || (workoutMode === "tabata" && !isTabataRest))) {
        if (narrationStyle === "basic") {
          announceExercise(currentExercise)
        } else {
          instructorAnnounceExercise(currentExercise)
        }
      } else if (voiceEnabled && workoutMode === "tabata" && isTabataRest) {
        // Announce rest period in Tabata mode
        if (narrationStyle === "basic") {
          speak("Rest period")
        } else {
          addToNarrationQueue(
            `Rest period. Round ${tabataRound} of ${tabataSettings.rounds}. Get ready for the next exercise.`,
          )
        }
      }
    }

    return () => {
      // Clear auto-advance timer when exercise changes
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer)
        setAutoAdvanceTimer(null)
      }
    }
  }, [currentExerciseIndex, currentExercise, narrationStyle, isPlaying, workoutMode, isTabataRest, tabataRound])

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isPlaying && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          // For Tabata mode
          if (workoutMode === "tabata") {
            // Announce upcoming transition at 3 seconds
            if (prev === 3) {
              if (isTabataRest) {
                // Announce the next work interval
                if (voiceEnabled) {
                  const nextExercise = displayedWorkoutPlan[tabataExerciseIndex]
                  if (narrationStyle === "basic") {
                    speak(`Get ready for ${nextExercise.name}`)
                  } else {
                    addToNarrationQueue(`Get ready for ${nextExercise.name}. Work interval starting in 3 seconds.`)
                  }
                }
              } else {
                // Announce the upcoming rest
                if (voiceEnabled) {
                  if (narrationStyle === "basic") {
                    speak("Rest period coming up")
                  } else {
                    addToNarrationQueue("Rest period coming up in 3 seconds. Good work!")
                  }
                }
              }
            }
          }
          // For standard and guided modes
          else {
            // When timer reaches halfway point, give mid-exercise cue (only in guided mode)
            if (
              prev === Math.floor(exerciseDuration / 2) &&
              voiceEnabled &&
              narrationStyle === "instructor" &&
              !isSpecialInstruction(currentExercise) &&
              workoutMode === "guided"
            ) {
              addToNarrationQueue(getMotivationalCue())
            }

            // When timer reaches 10 seconds, give final push (only in guided mode)
            if (
              prev === 10 &&
              voiceEnabled &&
              narrationStyle === "instructor" &&
              !isSpecialInstruction(currentExercise) &&
              workoutMode === "guided"
            ) {
              addToNarrationQueue(getFinalPushCue())
            }

            // When timer reaches 10 seconds, announce the next exercise (increased from 3 to 10 seconds)
            if (prev === 10 && voiceEnabled && currentExerciseIndex < totalExercises - 1) {
              const nextExercise = displayedWorkoutPlan[currentExerciseIndex + 1]
              if (narrationStyle === "basic") {
                announceNextExercise(nextExercise)
              } else {
                instructorAnnounceNextExercise(nextExercise)
              }
            }
          }
          return prev - 1
        })
      }, 1000)
    } else if (timeRemaining === 0 && isPlaying) {
      // Handle timer completion based on workout mode
      if (workoutMode === "tabata") {
        handleTabataTimerEnd()
      } else {
        // Move to next exercise when timer ends for standard and guided modes
        if (currentExerciseIndex < totalExercises - 1) {
          // Immediate transition to next exercise
          setCurrentExerciseIndex((prev) => prev + 1)

          // If in guided mode, immediately announce the new exercise
          if (workoutMode === "guided" && voiceEnabled) {
            // Small timeout to ensure state updates first
            setTimeout(() => {
              const nextExercise = displayedWorkoutPlan[currentExerciseIndex + 1]
              if (nextExercise) {
                if (narrationStyle === "basic") {
                  announceExercise(nextExercise)
                } else {
                  instructorAnnounceExercise(nextExercise)
                }
              }
            }, 50)
          }
        } else {
          // End of workout
          setIsPlaying(false)
          if (voiceEnabled) {
            if (narrationStyle === "basic") {
              speak("Workout complete! Great job!")
            } else {
              addToNarrationQueue("Excellent work! You've completed your workout.")
              addToNarrationQueue("Take a moment to breathe and be proud of what you've accomplished today.")
              addToNarrationQueue("Remember to stretch and hydrate. You did amazing!")
            }
          }
        }
      }
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [
    isPlaying,
    timeRemaining,
    currentExerciseIndex,
    totalExercises,
    voiceEnabled,
    displayedWorkoutPlan,
    narrationStyle,
    exerciseDuration,
    workoutMode,
    isTabataRest,
    tabataRound,
    tabataExerciseIndex,
  ])

  // Handle Tabata timer end
  const handleTabataTimerEnd = () => {
    if (isTabataRest) {
      // End of rest period, start work period
      setIsTabataRest(false)
      setTimeRemaining(tabataSettings.workSeconds)

      // If we've completed all rounds, move to the next exercise
      if (tabataRound >= tabataSettings.rounds) {
        setTabataRound(1)
        if (tabataExerciseIndex < displayedWorkoutPlan.length - 1) {
          setTabataExerciseIndex((prev) => prev + 1)
        } else {
          // End of workout
          setIsPlaying(false)
          if (voiceEnabled) {
            if (narrationStyle === "basic") {
              speak("Workout complete! Great job!")
            } else {
              addToNarrationQueue("Excellent work! You've completed your Tabata workout.")
              addToNarrationQueue("Take a moment to breathe and be proud of what you've accomplished today.")
            }
          }
        }
      }
    } else {
      // End of work period, start rest period
      setIsTabataRest(true)
      setTimeRemaining(tabataSettings.restSeconds)
      setTabataRound((prev) => prev + 1)
    }
  }

  // Process narration queue with minimal delay
  useEffect(() => {
    const processQueue = () => {
      if (narrationQueueRef.current.length > 0 && !isSpeakingRef.current) {
        const text = narrationQueueRef.current.shift()
        if (text) {
          isSpeakingRef.current = true
          setShowNarrationBadge(true)
          setCurrentNarration(text)
          speakWithVolume(text, voiceVolume / 100)
        }
      }
    }

    // Process queue more frequently to reduce delays - check every 100ms instead of 200ms
    const interval = setInterval(processQueue, 100)
    return () => clearInterval(interval)
  }, [voiceVolume])

  // Handle speech synthesis events
  useEffect(() => {
    const handleSpeechEnd = () => {
      isSpeakingRef.current = false
      setShowNarrationBadge(false)
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("end", handleSpeechEnd)
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.removeEventListener("end", handleSpeechEnd)
      }
    }
  }, [])

  // Check if the current exercise is a special instruction
  const isSpecialInstruction = (exercise: WorkoutExercise) => {
    return exercise?.name === "Change Sides" || exercise?.name === "Repeat on Other Side"
  }

  // Add text to narration queue
  const addToNarrationQueue = (text: string) => {
    narrationQueueRef.current.push(text)
  }

  // Basic text-to-speech function
  const speak = (text: string) => {
    // Always show narration badge
    setShowNarrationBadge(true)
    setCurrentNarration(text)

    // Set a fallback timer to hide the badge if speech fails
    const fallbackTimer = setTimeout(() => {
      setShowNarrationBadge(false)
    }, text.length * 80)

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9 // Slightly slower rate for clarity
        utterance.pitch = 1

        // Add proper event handlers
        utterance.onend = () => {
          clearTimeout(fallbackTimer)
          setShowNarrationBadge(false)
        }

        utterance.onerror = (event) => {
          clearTimeout(fallbackTimer)
          console.log("Basic speech synthesis error:", event)
          // Keep the narration badge visible as a fallback
          setTimeout(() => {
            setShowNarrationBadge(false)
          }, 3000)
        }

        speechSynthesisRef.current = utterance
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        clearTimeout(fallbackTimer)
        console.error("Basic speech synthesis failed:", error)
        // Keep the narration badge visible as a fallback
        setTimeout(() => {
          setShowNarrationBadge(false)
        }, 3000)
      }
    } else {
      // Speech synthesis not supported - rely on visual narration only
      console.warn("Speech synthesis not supported in this browser")
      // Keep the narration badge visible longer since there's no audio
      setTimeout(() => {
        setShowNarrationBadge(false)
      }, text.length * 100) // Longer display time for reading
    }
  }

  // Text-to-speech with volume control and better error handling
  const speakWithVolume = (text: string, volume: number) => {
    // Always show the narration badge regardless of speech synthesis support
    setShowNarrationBadge(true)
    setCurrentNarration(text)

    // Set a timeout to hide the badge after a reasonable time if speech fails
    const fallbackTimer = setTimeout(() => {
      setShowNarrationBadge(false)
      isSpeakingRef.current = false
    }, text.length * 80) // Rough estimate based on text length

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        // Create a new utterance with error handling
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9 // Slightly slower rate for clarity
        utterance.pitch = 1
        utterance.volume = volume

        // Use the specifically selected voice if available
        if (selectedVoice) {
          const voices = window.speechSynthesis.getVoices()
          const voice = voices.find((v) => v.name === selectedVoice)
          if (voice) {
            utterance.voice = voice
          }
        } else {
          // Try to find appropriate voices if available
          const voices = window.speechSynthesis.getVoices()
          if (voices && voices.length > 0) {
            // Filter for English voices first
            const englishVoices = voices.filter(
              (voice) => voice.lang.includes("en-US") || voice.lang.includes("en-GB") || voice.lang.includes("en"),
            )

            // Use English voices if available, otherwise fall back to all voices
            const availableVoices = englishVoices.length > 0 ? englishVoices : voices

            // Try to find a suitable voice based on instructor style
            if (instructorStyle === "motivational") {
              // Look for female English voices
              const femaleVoice = availableVoices.find(
                (voice) =>
                  (voice.name.includes("Female") || voice.name.includes("female")) && !voice.name.includes("Google UK"),
              )
              if (femaleVoice) utterance.voice = femaleVoice
            } else if (instructorStyle === "intense") {
              // Look for male English voices
              const maleVoice = availableVoices.find(
                (voice) =>
                  (voice.name.includes("Male") || voice.name.includes("male")) && !voice.name.includes("Google UK"),
              )
              if (maleVoice) utterance.voice = maleVoice
            }

            // If no specific voice was found, use the first English voice
            if (!utterance.voice && availableVoices.length > 0) {
              utterance.voice = availableVoices[0]
            }
          }
        }

        // Set up proper event handlers
        utterance.onend = () => {
          clearTimeout(fallbackTimer)
          isSpeakingRef.current = false
          setShowNarrationBadge(false)
        }

        utterance.onerror = (event) => {
          clearTimeout(fallbackTimer)
          console.log("Speech synthesis error:", event)
          // Don't set isSpeakingRef to false immediately to prevent queue flooding
          setTimeout(() => {
            isSpeakingRef.current = false
          }, 500)
          // Keep the narration badge visible a bit longer as a fallback
          setTimeout(() => {
            setShowNarrationBadge(false)
          }, 3000)
        }

        // Attempt to speak
        speechSynthesisRef.current = utterance
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        clearTimeout(fallbackTimer)
        console.error("Speech synthesis failed:", error)
        // Keep the narration badge visible as a fallback
        setTimeout(() => {
          setShowNarrationBadge(false)
          isSpeakingRef.current = false
        }, 3000)
      }
    } else {
      // Speech synthesis not supported - rely on visual narration only
      console.warn("Speech synthesis not supported in this browser")
      // Keep the narration badge visible longer since there's no audio
      setTimeout(() => {
        setShowNarrationBadge(false)
        isSpeakingRef.current = false
      }, text.length * 100) // Longer display time for reading
    }
  }

  // Basic exercise announcement
  const announceExercise = (exercise: WorkoutExercise) => {
    if (exercise.name === "Change Sides") {
      speak("Change sides")
    } else if (exercise.name === "Repeat on Other Side") {
      speak("Repeat on other side")
    } else {
      const duration = Math.floor((exercise.timeInSeconds || 60) / 60)
      const reps = exercise.reps ? `${exercise.reps} reps` : ""
      const timeText = duration > 0 ? `${duration} minute${duration > 1 ? "s" : ""}` : ""

      let announcement = `${exercise.name}. `

      if (timeText && reps) {
        announcement += `${timeText} or ${reps}.`
      } else if (timeText) {
        announcement += `${timeText}.`
      } else if (reps) {
        announcement += `${reps}.`
      }

      if (exercise.notes) {
        announcement += ` ${exercise.notes}`
      }

      speak(announcement)
    }
  }

  // Basic next exercise announcement
  const announceNextExercise = (exercise: WorkoutExercise) => {
    if (exercise.name === "Change Sides") {
      speak("In 10 seconds: Change sides. Prepare to transition.")
    } else if (exercise.name === "Repeat on other Side") {
      speak("In 10 seconds: Repeat on other side. Get ready.")
    } else {
      speak(`In 10 seconds: ${exercise.name}. Prepare for transition.`)
    }
  }

  // Instructor-style exercise announcement
  const instructorAnnounceExercise = (exercise: WorkoutExercise) => {
    if (exercise.name === "Change Sides") {
      addToNarrationQueue("Let's change sides now. Maintain your form as you transition.")

      // If we have a previous exercise, mention it
      if (previousExerciseRef.current) {
        addToNarrationQueue(`We'll repeat ${previousExerciseRef.current.name} on the other side.`)
      }
    } else if (exercise.name === "Repeat on Other Side") {
      addToNarrationQueue("Now let's repeat that on the other side. Keep your core engaged throughout the movement.")

      // If we have a previous exercise, mention it
      if (previousExerciseRef.current) {
        addToNarrationQueue(`We'll do ${previousExerciseRef.current.name} again on the opposite side.`)
      }
    } else {
      // Clear the queue first
      narrationQueueRef.current = []

      // Introduction
      const introductions = [
        `Next up is ${exercise.name}.`,
        `Let's move into ${exercise.name}.`,
        `Now we're going to do ${exercise.name}.`,
        `It's time for ${exercise.name}.`,
      ]
      addToNarrationQueue(introductions[Math.floor(Math.random() * introductions.length)])

      // Form guidance based on muscle groups
      if (exercise.muscleGroups && exercise.muscleGroups.length > 0) {
        const formCues = getFormCues(exercise)
        addToNarrationQueue(formCues)
      }

      // Duration/reps announcement
      if (workoutMode === "tabata") {
        addToNarrationQueue(`We'll do this for ${tabataSettings.workSeconds} seconds. Ready, and begin!`)
      } else {
        const duration = Math.floor((exercise.timeInSeconds || 60) / 60)
        const seconds = (exercise.timeInSeconds || 60) % 60
        const timeText =
          duration > 0
            ? `${duration} minute${duration > 1 ? "s" : ""}${seconds > 0 ? ` and ${seconds} seconds` : ""}`
            : `${seconds} seconds`

        if (exercise.reps) {
          addToNarrationQueue(`We're aiming for ${exercise.reps} reps in ${timeText}. Let's begin!`)
        } else {
          addToNarrationQueue(`We'll do this for ${timeText}. Ready, and begin!`)
        }
      }

      // Add intensity-specific cue
      if (exercise.intensity) {
        setTimeout(() => {
          const intensityCues = {
            low: "Keep the movement controlled and focus on your form.",
            medium: "Maintain a steady pace and really feel the muscle engagement.",
            high: "Push yourself here! This is where transformation happens!",
          }
          addToNarrationQueue(intensityCues[exercise.intensity as keyof typeof intensityCues] || intensityCues.medium)
        }, 5000) // Add this cue after 5 seconds
      }

      // Add ongoing coaching cues throughout the exercise
      if (workoutMode === "guided") {
        scheduleOngoingCoaching(exercise)
      }
    }
  }

  // Schedule ongoing coaching cues throughout the exercise
  const scheduleOngoingCoaching = (exercise: WorkoutExercise) => {
    if (isSpecialInstruction(exercise)) return

    const duration = exercise.timeInSeconds || 60

    // Only add ongoing coaching for exercises longer than 20 seconds
    if (duration > 20) {
      // Schedule coaching cues at different points - reduced frequency
      const coachingPoints = [
        { time: Math.floor(duration * 0.25), type: "form" },
        { time: Math.floor(duration * 0.75), type: "technique" },
      ]

      coachingPoints.forEach((point) => {
        setTimeout(
          () => {
            if (isPlaying && voiceEnabled && narrationStyle === "instructor" && workoutMode === "guided") {
              let cue = ""

              switch (point.type) {
                case "form":
                  cue = getFormReminder(exercise)
                  break
                case "technique":
                  cue = getTechniqueCue(exercise)
                  break
              }

              addToNarrationQueue(cue)
            }
          },
          (duration - point.time) * 1000,
        )
      })
    }
  }

  // Get form reminder cues
  const getFormReminder = (exercise: WorkoutExercise): string => {
    const formReminders = [
      "Remember to keep your core engaged throughout this movement.",
      "Maintain proper alignment and focus on your breathing.",
      "Quality over quantity! Focus on perfect form with each rep.",
      "Keep your shoulders relaxed and away from your ears.",
      "Breathe deeply and control the movement in both directions.",
    ]

    // Exercise-specific reminders
    const specificReminders: Record<string, string[]> = {
      "Plank to Pike": [
        "Keep your arms straight and shoulders stacked over wrists.",
        "Engage your core as you pike up, pulling the carriage in with control.",
      ],
      "Reverse Lunge": [
        "Keep your front knee aligned with your ankle, not past your toes.",
        "Stay tall through your torso as you lunge back.",
      ],
      "French Twist": [
        "Keep your spine tall and rotate from your waist, not your shoulders.",
        "Engage your obliques with each twist.",
      ],
    }

    if (exercise.name in specificReminders) {
      const reminders = specificReminders[exercise.name]
      return reminders[Math.floor(Math.random() * reminders.length)]
    }

    return formReminders[Math.floor(Math.random() * formReminders.length)]
  }

  // Get encouragement cues - reduced and more focused
  const getEncouragementCue = (): string => {
    const encouragementCues = [
      "You're doing great! Keep up the good work!",
      "Stay with it! Focus on your form!",
      "You're stronger than you think! Keep pushing!",
      "Beautiful form! Keep that control!",
      "Stay focused! Every rep brings you closer to your goals!",
    ]

    return encouragementCues[Math.floor(Math.random() * encouragementCues.length)]
  }

  // Get technique cues based on exercise
  const getTechniqueCue = (exercise: WorkoutExercise): string => {
    // Generic technique cues by muscle group
    const techniqueCues: Record<string, string[]> = {
      core: [
        "Draw your navel to your spine and maintain that engagement.",
        "Think about connecting your ribs to your hips as you work.",
        "Imagine your core is a corset, tightening around your waist.",
      ],
      legs: [
        "Push through your heels to engage your hamstrings and glutes.",
        "Keep your knees tracking in line with your toes.",
        "Feel the burn in your quads and embrace it!",
      ],
      arms: [
        "Keep your elbows close to your body for more tricep engagement.",
        "Think about squeezing a pencil between your shoulder blades.",
        "Control the resistance in both directions.",
      ],
      back: [
        "Pull from your back, not your arms.",
        "Think about bringing your shoulder blades together.",
        "Maintain length in your spine as you work.",
      ],
      glutes: [
        "Squeeze your glutes at the top of the movement.",
        "Think about pushing the floor away through your heels.",
        "Imagine you're holding a penny between your glutes.",
      ],
    }

    // If we have muscle groups, use a relevant cue
    if (exercise.muscleGroups && exercise.muscleGroups.length > 0) {
      for (const group of exercise.muscleGroups) {
        if (group in techniqueCues) {
          const cues = techniqueCues[group]
          return cues[Math.floor(Math.random() * cues.length)]
        }
      }
    }

    // Default technique cues if no specific ones apply
    const defaultCues = [
      "Focus on the mind-muscle connection. Feel the working muscles.",
      "Control the movement in both directions for maximum benefit.",
      "Quality over quantity! Each rep should be your best effort.",
      "Stay present and focused on your form right now.",
    ]

    return defaultCues[Math.floor(Math.random() * defaultCues.length)]
  }

  // Instructor-style next exercise announcement with 10-second warning
  const instructorAnnounceNextExercise = (exercise: WorkoutExercise) => {
    if (exercise.name === "Change Sides") {
      addToNarrationQueue("In 10 seconds, we'll change sides. Prepare to transition.")

      // If we have a current exercise that's not a special instruction, mention it will be repeated
      if (currentExercise && !isSpecialInstruction(currentExercise)) {
        addToNarrationQueue(`Get ready to repeat ${currentExercise.name} on the other side.`)
      }
    } else if (exercise.name === "Repeat on Other Side") {
      addToNarrationQueue("In 10 seconds, we'll repeat the exercise on the other side. Prepare to switch.")
    } else {
      // More detailed transition announcement
      addToNarrationQueue(`In 10 seconds, we'll move to ${exercise.name}.`)

      // Add muscle group info if available
      if (exercise.muscleGroups && exercise.muscleGroups.length > 0) {
        addToNarrationQueue(`This will target your ${exercise.muscleGroups.join(" and ")}. Get ready to transition.`)
      } else {
        addToNarrationQueue("Prepare for the transition. Finish strong on this current exercise.")
      }
    }
  }

  // Get form cues based on exercise muscle groups
  const getFormCues = (exercise: WorkoutExercise): string => {
    const muscleGroups = exercise.muscleGroups || []

    // Exercise-specific form cues
    const exerciseCues: Record<string, string> = {
      "Plank to Pike":
        "Start in a plank position with your feet on the carriage. Keep your core engaged as you pike your hips up toward the ceiling, pulling the carriage in. Maintain straight arms and a strong back.",
      "Reverse Lunge":
        "Stand tall on the platform, place one foot on the carriage. Slide back into a lunge position, keeping your front knee aligned with your ankle. Engage your glutes as you return to standing.",
      "French Twist":
        "Sit tall on the carriage, hold the handles firmly. Rotate your torso from side to side while keeping your hips stable. Engage your obliques with each twist.",
      Mermaid:
        "Sit sideways on the carriage, extend one arm overhead and stretch to the side. Feel the lengthening through your entire side body. Breathe deeply into the stretch.",
      Bear: "Start on all fours with your knees on the carriage. Lift your knees slightly off and hold, keeping your back flat and core engaged. Think about pushing the floor away with your hands.",
      "Scrambled Eggs":
        "In plank position with hands on the platform and feet on the carriage, draw your knees toward your chest. Keep your shoulders stacked over your wrists and maintain a strong core.",
      Spoon:
        "Lie on your back on the carriage with legs extended. Curl up into a C-curve, engaging your deep abdominals. Keep your neck long and gaze toward your knees.",
      Wheelbarrow:
        "In plank position with hands on the platform and feet on the carriage, walk your hands out and in. Maintain a straight line from head to heels throughout the movement.",
      "Donkey Kicks":
        "On all fours with knees on the carriage, extend one leg back and up. Keep your hips square to the floor and focus on using your glute to lift the leg.",
      "Elevator Lunges":
        "In a lunge position with your back foot on the carriage, pulse up and down. Keep your weight in your front heel and maintain an upright torso.",
      "Spider Climbs":
        "In plank position with feet on the carriage, bring one knee toward the same-side elbow. Keep your hips low and core engaged throughout the movement.",
      Teaser:
        "Lie on your back on the carriage, then lift legs and upper body simultaneously into a V-shape. Reach your fingertips toward your toes and keep your core engaged.",
      "Kneeling Lat Pulls":
        "Kneel on the carriage, hold handles and pull down while maintaining an upright posture. Focus on squeezing your shoulder blades together as you pull.",
      "Curtsy Lunges":
        "Standing on the platform, place one foot on the carriage and slide into a curtsy lunge. Cross behind while keeping your hips facing forward.",
      "Mega Plank":
        "In a forearm plank position with feet on the carriage, hold and engage your core. Create a straight line from head to heels and breathe deeply.",
      Catfish:
        "Lie face down on the carriage with hands holding the front of the machine, then lift your chest up. Focus on using your back muscles, not your neck.",
      "Skater Lunges":
        "Standing sideways on the platform, place inside foot on the carriage and slide into a side lunge. Keep your weight in the heel of your standing leg.",
      "Chest Press":
        "Kneeling or lying on the carriage, push handles forward against resistance. Keep your shoulders down away from your ears and engage your chest.",
      "Butterfly Sit-ups":
        "Lie on your back on the carriage with soles of feet together, then perform a sit-up. Keep your knees wide and focus on using your abdominals.",
      "Rowing Series":
        "Seated on the carriage, hold handles and pull back while maintaining an upright posture. Pull your elbows back and squeeze your shoulder blades together.",
    }

    // If we have a specific cue for this exercise, use it
    if (exercise.name in exerciseCues) {
      return exerciseCues[exercise.name]
    }

    // Generic cues based on muscle groups
    if (muscleGroups.includes("core")) {
      return "Engage your core throughout this exercise. Draw your navel to your spine and maintain a neutral pelvis."
    } else if (muscleGroups.includes("legs") || muscleGroups.includes("glutes")) {
      return "Focus on your form. Keep your knees tracking over your toes and engage your glutes with each movement."
    } else if (muscleGroups.includes("arms") || muscleGroups.includes("back")) {
      return "Keep your shoulders down away from your ears. Engage your lats and maintain a strong posture."
    } else {
      return "Focus on your form and control the movement. Quality over quantity!"
    }
  }

  // Get motivational cues for mid-exercise
  const getMotivationalCue = (): string => {
    const motivationalCues = [
      "You're halfway there! Keep pushing!",
      "Looking strong! Maintain that form!",
      "Stay with it! Feel those muscles working!",
      "You've got this! Every rep counts!",
      "Breathe through the challenge! You're doing great!",
    ]

    // Adjust based on instructor style
    if (instructorStyle === "intense") {
      return motivationalCues[Math.floor(Math.random() * 3)] // First 3 are more intense
    } else {
      return motivationalCues[Math.floor(Math.random() * motivationalCues.length)]
    }
  }

  // Get final push cues for end of exercise
  const getFinalPushCue = (): string => {
    const finalPushCues = [
      "Final 10 seconds! Give it everything you've got!",
      "Finish strong! Don't give up now!",
      "Last few seconds! Make them count!",
      "Push through the finish line! Almost there!",
      "You're almost done! One final push!",
    ]

    // Adjust based on instructor style
    if (instructorStyle === "intense") {
      return finalPushCues[Math.floor(Math.random() * 3)] // First 3 are more intense
    } else {
      return finalPushCues[Math.floor(Math.random() * finalPushCues.length)]
    }
  }

  const togglePlayPause = () => {
    const wasPlaying = isPlaying
    setIsPlaying((prev) => !prev)

    // Immediately trigger narration when starting the workout
    if (!wasPlaying && voiceEnabled && workoutMode === "guided") {
      // Clear any existing speech
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      narrationQueueRef.current = []

      // Immediate announcement of current exercise
      if (narrationStyle === "basic") {
        announceExercise(currentExercise)
      } else {
        instructorAnnounceExercise(currentExercise)
      }
    }
  }

  const nextExercise = () => {
    if (workoutMode === "tabata") {
      // For Tabata, move to the next exercise
      if (tabataExerciseIndex < displayedWorkoutPlan.length - 1) {
        setTabataExerciseIndex((prev) => prev + 1)
        setTabataRound(1)
        setIsTabataRest(false)
        setTimeRemaining(tabataSettings.workSeconds)
      }
    } else {
      // For standard and guided modes
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex((prev) => prev + 1)
      }
    }
  }

  const previousExercise = () => {
    if (workoutMode === "tabata") {
      // For Tabata, move to the previous exercise
      if (tabataExerciseIndex > 0) {
        setTabataExerciseIndex((prev) => prev - 1)
        setTabataRound(1)
        setIsTabataRest(false)
        setTimeRemaining(tabataSettings.workSeconds)
      }
    } else {
      // For standard and guided modes
      if (currentExerciseIndex > 0) {
        setCurrentExerciseIndex((prev) => prev - 1)
      }
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled((prev) => !prev)
    if (!voiceEnabled && currentExercise) {
      // If enabling voice, announce current exercise
      if (narrationStyle === "basic") {
        announceExercise(currentExercise)
      } else {
        instructorAnnounceExercise(currentExercise)
      }
    } else if (voiceEnabled) {
      // If disabling voice, stop any ongoing speech
      window.speechSynthesis.cancel()
      narrationQueueRef.current = []
      setShowNarrationBadge(false)
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (presentationRef.current?.requestFullscreen) {
        presentationRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (workoutMode === "tabata") {
      if (isTabataRest) {
        return ((tabataSettings.restSeconds - timeRemaining) / tabataSettings.restSeconds) * 100
      } else {
        return ((tabataSettings.workSeconds - timeRemaining) / tabataSettings.workSeconds) * 100
      }
    } else {
      return currentExercise?.name === "Change Sides" || currentExercise?.name === "Repeat on Other Side"
        ? ((5 - timeRemaining) / 5) * 100
        : ((exerciseDuration - timeRemaining) / exerciseDuration) * 100
    }
  }

  // Calculate overall workout progress
  const getOverallProgress = () => {
    if (workoutMode === "tabata") {
      const totalRounds = tabataSettings.rounds * displayedWorkoutPlan.length
      const completedRounds = tabataExerciseIndex * tabataSettings.rounds + (tabataRound - 1)
      return (completedRounds / totalRounds) * 100
    } else {
      return ((currentExerciseIndex + 1) / totalExercises) * 100
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Force voice loading
      window.speechSynthesis.getVoices()

      // Some browsers need this event to load voices
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        console.log("Voices loaded:", window.speechSynthesis.getVoices().length)
      })
    }
  }, [])

  // Provide continuous coaching during exercises - reduced frequency
  useEffect(() => {
    if (
      isPlaying &&
      voiceEnabled &&
      narrationStyle === "instructor" &&
      !isSpecialInstruction(currentExercise) &&
      workoutMode === "guided"
    ) {
      // Add periodic coaching cues during longer exercises - reduced frequency
      const coachingInterval = setInterval(() => {
        if (!isSpeakingRef.current && Math.random() > 0.7) {
          // 30% chance to add a coaching cue (reduced from 50%)
          const coachingCues = [
            "Keep your form strong!",
            "Focus on the muscle working.",
            "Stay with it, you've got this!",
          ]
          addToNarrationQueue(coachingCues[Math.floor(Math.random() * coachingCues.length)])
        }
      }, 25000) // Every 25 seconds (increased from 15 seconds)

      return () => clearInterval(coachingInterval)
    }
  }, [isPlaying, voiceEnabled, narrationStyle, currentExercise, workoutMode])

  // Ensure voices are loaded before attempting to speak
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Some browsers need a small delay before voices are available
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length === 0) {
          // If no voices are available yet, try again after a delay
          setTimeout(loadVoices, 200)
        } else {
          console.log("Voices loaded successfully:", voices.length)
          // Set a default English voice if available
          const englishVoices = voices.filter(
            (voice) => voice.lang.includes("en-US") || voice.lang.includes("en-GB") || voice.lang.includes("en"),
          )
          if (englishVoices.length > 0) {
            setSelectedVoice(englishVoices[0].name)
          }
        }
      }

      // Try to load voices immediately
      loadVoices()

      // Also set up the voiceschanged event listener
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        const voices = window.speechSynthesis.getVoices()
        console.log("Voices changed event, voices available:", voices.length)
        loadVoices()
      })
    }
  }, [])

  // Helper function to get available voices
  const getAvailableVoices = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return []

    const voices = window.speechSynthesis.getVoices()
    // Filter for English voices
    return voices.filter(
      (voice) => voice.lang.includes("en-US") || voice.lang.includes("en-GB") || voice.lang.includes("en"),
    )
  }

  // Render the mode selection dialog
  const renderModeSelectionDialog = () => {
    return (
      <Dialog open={isModeSelectionOpen} onOpenChange={setIsModeSelectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Workout Mode</DialogTitle>
            <DialogDescription>Select how you want to experience your workout</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div
              className={`p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${workoutMode === "standard" ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setWorkoutMode("standard")}
            >
              <div className="flex items-center gap-2 mb-2">
                <List className="h-5 w-5" />
                <h3 className="font-medium">Standard Class View</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Simple exercise list with minimal narration. Perfect for self-guided workouts.
              </p>
            </div>

            <div
              className={`p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${workoutMode === "guided" ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setWorkoutMode("guided")}
            >
              <div className="flex items-center gap-2 mb-2">
                <Mic className="h-5 w-5" />
                <h3 className="font-medium">Guided Class Workout</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Full instructor narration with form cues, technique guidance, and motivation.
              </p>
            </div>

            <div
              className={`p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${workoutMode === "tabata" ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setWorkoutMode("tabata")}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5" />
                <h3 className="font-medium">Tabata Timer</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Interval-based training with work and rest periods. Great for high-intensity workouts.
              </p>
            </div>

            {workoutMode === "tabata" && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Tabata Settings</h3>
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="work-seconds">Work Period (seconds)</Label>
                    <Select
                      value={tabataSettings.workSeconds.toString()}
                      onValueChange={(value) =>
                        setTabataSettings({ ...tabataSettings, workSeconds: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger id="work-seconds">
                        <SelectValue placeholder="Work seconds" />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 15, 20, 30, 40, 45, 60].map((seconds) => (
                          <SelectItem key={seconds} value={seconds.toString()}>
                            {seconds} seconds
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rest-seconds">Rest Period (seconds)</Label>
                    <Select
                      value={tabataSettings.restSeconds.toString()}
                      onValueChange={(value) =>
                        setTabataSettings({ ...tabataSettings, restSeconds: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger id="rest-seconds">
                        <SelectValue placeholder="Rest seconds" />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 30].map((seconds) => (
                          <SelectItem key={seconds} value={seconds.toString()}>
                            {seconds} seconds
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rounds">Rounds per Exercise</Label>
                    <Select
                      value={tabataSettings.rounds.toString()}
                      onValueChange={(value) =>
                        setTabataSettings({ ...tabataSettings, rounds: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger id="rounds">
                        <SelectValue placeholder="Rounds" />
                      </SelectTrigger>
                      <SelectContent>
                        {[4, 6, 8, 10, 12].map((rounds) => (
                          <SelectItem key={rounds} value={rounds.toString()}>
                            {rounds} rounds
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModeSelectionOpen(false)}>Start Workout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Render the standard class view
  const renderStandardView = () => {
    return (
      <>
        {/* Progress indicator */}
        <div className="w-full mb-8 flex items-center justify-between">
          <span className="text-sm font-medium">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </span>
          <Progress value={getOverallProgress()} className="w-full mx-4 h-2" />
          <span className="text-sm font-medium">{Math.round(getOverallProgress())}%</span>
        </div>

        {/* Current exercise card */}
        <Card className="w-full mb-8">
          <CardContent className="p-8 flex flex-col items-center">
            {isSpecialInstruction(currentExercise) ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-lg">
                  {currentExercise.name}
                </Badge>
                <p className="text-xl text-center">{currentExercise.description}</p>

                {/* Show which exercise will be repeated */}
                {previousExerciseRef.current && (
                  <div className="mt-4 text-center">
                    <p className="text-muted-foreground">Repeating:</p>
                    <p className="font-medium">{previousExerciseRef.current.name}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4 text-center">{currentExercise?.name}</h2>

                {currentExercise?.muscleGroups && currentExercise.muscleGroups.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {currentExercise.muscleGroups.map((group) => (
                      <Badge key={group} variant="outline" className="capitalize">
                        {group}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add exercise description */}
                <p className="text-lg text-center mb-6">{currentExercise?.description}</p>

                <div className="text-6xl font-mono font-bold mb-8">{formatTime(timeRemaining)}</div>

                <Progress value={getProgressPercentage()} className="w-full h-3 mb-6" />

                {currentExercise?.notes && (
                  <p className="text-lg text-center text-muted-foreground mt-2">{currentExercise.notes}</p>
                )}

                <div className="flex gap-4 mt-4">
                  {currentExercise?.reps && (
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {currentExercise.reps} reps
                    </Badge>
                  )}
                  {currentExercise?.intensity && (
                    <Badge variant="outline" className="text-lg px-3 py-1 capitalize">
                      {currentExercise.intensity} intensity
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Exercise list */}
        <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle>Workout Plan</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[200px] overflow-y-auto">
            <div className="space-y-2">
              {displayedWorkoutPlan.map((exercise, index) => (
                <div
                  key={`${exercise.id}-${index}`}
                  className={`p-2 rounded-md flex justify-between items-center ${
                    index === currentExerciseIndex ? "bg-primary/10 border border-primary/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{index + 1}.</span>
                    <span className={index === currentExerciseIndex ? "font-medium" : ""}>{exercise.name}</span>
                  </div>
                  {exercise.timeInSeconds && !isSpecialInstruction(exercise) && (
                    <Badge variant="outline">{formatTime(exercise.timeInSeconds)}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={previousExercise} disabled={currentExerciseIndex === 0}>
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button size="lg" onClick={togglePlayPause} className="h-16 w-16 rounded-full">
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextExercise}
            disabled={currentExerciseIndex === totalExercises - 1}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
      </>
    )
  }

  // Render the guided class view
  const renderGuidedView = () => {
    return (
      <>
        {/* Narration badge - more prominent and always visible when needed */}
        {showNarrationBadge && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in max-w-md w-full">
            <Badge
              variant="secondary"
              className="px-4 py-3 text-sm bg-primary/20 border border-primary/30 w-full text-center shadow-md"
            >
              {currentNarration}
            </Badge>
          </div>
        )}

        {/* Speech unavailable indicator */}
        {voiceEnabled && !showNarrationBadge && (
          <div className="fixed top-4 left-4 z-50">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Volume2 className="h-3 w-3 mr-1" />
              Visual narration mode
            </Badge>
          </div>
        )}

        {/* Progress indicator */}
        <div className="w-full mb-8 flex items-center justify-between">
          <span className="text-sm font-medium">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </span>
          <Progress value={getOverallProgress()} className="w-full mx-4 h-2" />
          <span className="text-sm font-medium">{Math.round(getOverallProgress())}%</span>
        </div>

        {/* Current exercise card */}
        <Card className="w-full mb-8">
          <CardContent className="p-8 flex flex-col items-center">
            {isSpecialInstruction(currentExercise) ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-lg">
                  {currentExercise.name}
                </Badge>
                <p className="text-xl text-center">{currentExercise.description}</p>

                {/* Show which exercise will be repeated */}
                {previousExerciseRef.current && (
                  <div className="mt-4 text-center">
                    <p className="text-muted-foreground">Repeating:</p>
                    <p className="font-medium">{previousExerciseRef.current.name}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4 text-center">{currentExercise?.name}</h2>

                {currentExercise?.muscleGroups && currentExercise.muscleGroups.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {currentExercise.muscleGroups.map((group) => (
                      <Badge key={group} variant="outline" className="capitalize">
                        {group}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add exercise description */}
                <p className="text-lg text-center mb-6">{currentExercise?.description}</p>

                <div className="text-6xl font-mono font-bold mb-8">{formatTime(timeRemaining)}</div>

                <Progress value={getProgressPercentage()} className="w-full h-3 mb-6" />

                {currentExercise?.notes && (
                  <p className="text-lg text-center text-muted-foreground mt-2">{currentExercise.notes}</p>
                )}

                <div className="flex gap-4 mt-4">
                  {currentExercise?.reps && (
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {currentExercise.reps} reps
                    </Badge>
                  )}
                  {currentExercise?.intensity && (
                    <Badge variant="outline" className="text-lg px-3 py-1 capitalize">
                      {currentExercise.intensity} intensity
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={previousExercise} disabled={currentExerciseIndex === 0}>
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button size="lg" onClick={togglePlayPause} className="h-16 w-16 rounded-full">
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextExercise}
            disabled={currentExerciseIndex === totalExercises - 1}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        <Button
          variant={voiceEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleVoice}
          className="mt-6 flex items-center gap-2"
        >
          {voiceEnabled ? (
            <>
              <Volume2 className="h-4 w-4" />
              {narrationStyle === "instructor" ? (
                <span className="flex items-center">
                  Instructor Mode
                  <Badge variant="secondary" className="ml-2">
                    ON
                  </Badge>
                </span>
              ) : (
                <span className="flex items-center">
                  Voice Guidance
                  <Badge variant="secondary" className="ml-2">
                    ON
                  </Badge>
                </span>
              )}
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4" />
              Voice Guidance Off
            </>
          )}
        </Button>
      </>
    )
  }

  // Render the tabata view
  const renderTabataView = () => {
    const currentTabataExercise = displayedWorkoutPlan[tabataExerciseIndex]

    return (
      <>
        {/* Narration badge */}
        {showNarrationBadge && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in max-w-md w-full">
            <Badge
              variant="secondary"
              className="px-4 py-3 text-sm bg-primary/20 border border-primary/30 w-full text-center shadow-md"
            >
              {currentNarration}
            </Badge>
          </div>
        )}

        {/* Progress indicator */}
        <div className="w-full mb-4 flex items-center justify-between">
          <span className="text-sm font-medium">
            Exercise {tabataExerciseIndex + 1} of {displayedWorkoutPlan.length}
          </span>
          <Progress value={getOverallProgress()} className="w-full mx-4 h-2" />
          <span className="text-sm font-medium">{Math.round(getOverallProgress())}%</span>
        </div>

        {/* Tabata status */}
        <div className="w-full mb-4 flex justify-between items-center">
          <Badge variant="outline" className="px-3 py-1">
            Round {tabataRound} of {tabataSettings.rounds}
          </Badge>
          <Badge variant={isTabataRest ? "secondary" : "default"} className="px-3 py-1">
            {isTabataRest ? "REST" : "WORK"}
          </Badge>
        </div>

        {/* Current exercise card */}
        <Card className="w-full mb-8">
          <CardContent className="p-8 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4 text-center">{currentTabataExercise?.name}</h2>

            {currentTabataExercise?.muscleGroups && currentTabataExercise.muscleGroups.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {currentTabataExercise.muscleGroups.map((group) => (
                  <Badge key={group} variant="outline" className="capitalize">
                    {group}
                  </Badge>
                ))}
              </div>
            )}

            {/* Add exercise description */}
            <p className="text-lg text-center mb-6">{currentTabataExercise?.description}</p>

            <div className={`text-7xl font-mono font-bold mb-8 ${isTabataRest ? "text-muted-foreground" : ""}`}>
              {formatTime(timeRemaining)}
            </div>

            <Progress
              value={getProgressPercentage()}
              className={`w-full h-4 mb-6 ${isTabataRest ? "bg-secondary" : "bg-secondary"}`}
            />

            {currentTabataExercise?.notes && (
              <p className="text-lg text-center text-muted-foreground mt-2">{currentTabataExercise.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={previousExercise} disabled={tabataExerciseIndex === 0}>
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button size="lg" onClick={togglePlayPause} className="h-16 w-16 rounded-full">
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextExercise}
            disabled={tabataExerciseIndex === displayedWorkoutPlan.length - 1}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsModeSelectionOpen(true)} className="mt-6">
          Change Tabata Settings
        </Button>
      </>
    )
  }

  return (
    <div
      ref={presentationRef}
      className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-start p-4 overflow-y-auto"
    >
      <div className="w-full max-w-3xl flex flex-col items-center pb-20">
        {/* Top controls */}
        <div className="sticky top-4 right-4 w-full flex justify-end gap-2 mb-4 z-10">
          <Button variant="outline" size="icon" onClick={() => setIsModeSelectionOpen(true)}>
            {workoutMode === "standard" ? (
              <List className="h-4 w-4" />
            ) : workoutMode === "guided" ? (
              <Mic className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Render the appropriate view based on workout mode */}
        {workoutMode === "standard" && renderStandardView()}
        {workoutMode === "guided" && renderGuidedView()}
        {workoutMode === "tabata" && renderTabataView()}
      </div>

      {/* Mode Selection Dialog */}
      {renderModeSelectionDialog()}

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Workout Settings</DialogTitle>
            <DialogDescription>Customize your workout experience</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voice-toggle">Voice Guidance</Label>
                <p className="text-sm text-muted-foreground">Enable voice announcements during workout</p>
              </div>
              <Switch id="voice-toggle" checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            </div>

            <div className="space-y-3">
              <Label>Narration Style</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={narrationStyle === "basic" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setNarrationStyle("basic")}
                >
                  <div className="flex flex-col items-start">
                    <span>Basic</span>
                    <span className="text-xs text-muted-foreground">Simple exercise announcements</span>
                  </div>
                </Button>
                <Button
                  variant={narrationStyle === "instructor" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setNarrationStyle("instructor")}
                >
                  <div className="flex flex-col items-start">
                    <span>Instructor</span>
                    <span className="text-xs text-muted-foreground">Detailed guidance with motivation</span>
                  </div>
                </Button>
              </div>
            </div>

            {narrationStyle === "instructor" && (
              <div className="space-y-3">
                <Label>Instructor Style</Label>
                <Select value={instructorStyle} onValueChange={setInstructorStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="intense">Intense</SelectItem>
                    <SelectItem value="calm">Calm & Focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3">
              <Label>Voice Selection</Label>
              <Select
                value={selectedVoice}
                onValueChange={(value) => {
                  setSelectedVoice(value)
                  // Test the selected voice
                  if (value && typeof window !== "undefined" && "speechSynthesis" in window) {
                    const voices = window.speechSynthesis.getVoices()
                    const voice = voices.find((v) => v.name === value)
                    if (voice) {
                      const utterance = new SpeechSynthesisUtterance("Voice selected")
                      utterance.voice = voice
                      window.speechSynthesis.speak(utterance)
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableVoices().map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label htmlFor="volume-slider">Voice Volume: {voiceVolume}%</Label>
              </div>
              <Slider
                id="volume-slider"
                min={0}
                max={100}
                step={5}
                value={[voiceVolume]}
                onValueChange={(value) => setVoiceVolume(value[0])}
              />
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (narrationStyle === "basic") {
                    speak("Voice guidance is working correctly.")
                  } else {
                    addToNarrationQueue(
                      "Voice guidance is working correctly. You should hear this message if your device supports speech synthesis.",
                    )
                  }
                }}
                className="w-full"
              >
                Test Voice
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
