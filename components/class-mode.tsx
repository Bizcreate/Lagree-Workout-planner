"use client"

import { useState, useEffect, useCallback } from "react"
import { useWorkoutStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown,
  Timer,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipForward,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  X
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ClassMode() {
  const { workoutPlan } = useWorkoutStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showStopwatch, setShowStopwatch] = useState(false)
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [showTimer, setShowTimer] = useState(true)
  const [timerTime, setTimerTime] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [showExerciseList, setShowExerciseList] = useState(false)

  const currentExercise = workoutPlan[currentIndex]
  const nextExercise = workoutPlan[currentIndex + 1]
  const totalExercises = workoutPlan.length

  // Initialize timer when exercise changes
  useEffect(() => {
    if (currentExercise?.time_sec) {
      setTimerTime(currentExercise.time_sec)
      setTimerRunning(false)
    } else {
      setTimerTime(60) // Default to 60 seconds
    }
  }, [currentIndex, currentExercise?.time_sec])

  // Stopwatch logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [stopwatchRunning])

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime((prev) => {
          if (prev <= 1) {
            setTimerRunning(false)
            // Auto-advance to next exercise
            if (currentIndex < totalExercises - 1) {
              speak("Time! Next exercise.")
              setTimeout(() => goToNext(), 1500)
            }
            return 0
          }
          // Announce countdown
          if (prev === 11) speak("10 seconds")
          if (prev === 6) speak("5")
          if (prev === 4) speak("3")
          if (prev === 3) speak("2")
          if (prev === 2) speak("1")
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerTime, currentIndex, totalExercises])

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.volume = 1.0
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(v => v.lang.startsWith('en-'))
    if (englishVoice) utterance.voice = englishVoice
    window.speechSynthesis.speak(utterance)
  }, [voiceEnabled])

  const goToNext = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex(currentIndex + 1)
      setTimerRunning(false)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setTimerRunning(false)
    }
  }

  const resetStopwatch = () => {
    setStopwatchTime(0)
    setStopwatchRunning(false)
  }

  const resetTimer = () => {
    if (currentExercise?.time_sec) {
      setTimerTime(currentExercise.time_sec)
    } else {
      setTimerTime(60)
    }
    setTimerRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const startExercise = () => {
    setTimerRunning(true)
    if (voiceEnabled && currentExercise) {
      speak(`${currentExercise.name}. ${currentExercise.time ? `${currentExercise.time} seconds` : ''}`)
    }
  }

  if (!workoutPlan || workoutPlan.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workout plan active. Please create or select a workout in the Planner tab to use Class Mode.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div>
          <h1 className="font-semibold text-lg">Class Mode</h1>
          <p className="text-sm text-muted-foreground">
            Exercise {currentIndex + 1} of {totalExercises}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "Voice on" : "Voice off"}
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExerciseList(!showExerciseList)}
          >
            {showExerciseList ? "Hide List" : "Show List"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Exercise List Sidebar */}
        {showExerciseList && (
          <div className="w-72 border-r bg-card overflow-y-auto">
            <div className="p-3 border-b sticky top-0 bg-card">
              <h3 className="font-medium text-sm">Exercise List</h3>
            </div>
            <div className="p-2">
              {workoutPlan?.map((ex, idx) => (
                <button
                  key={ex.id || idx}
                  onClick={() => {
                    setCurrentIndex(idx)
                    setTimerRunning(false)
                  }}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    idx === currentIndex 
                      ? 'bg-primary text-primary-foreground' 
                      : idx < currentIndex 
                        ? 'bg-muted/50 text-muted-foreground'
                        : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono w-6">{idx + 1}.</span>
                    <span className={`text-sm ${ex.isSpecialInstruction ? 'italic' : 'font-medium'}`}>
                      {ex.name}
                    </span>
                  </div>
                  {ex?.time_sec && (
                    <span className="text-xs opacity-70 ml-8">{ex.time_sec}s</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Exercise Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          {currentExercise?.isSpecialInstruction ? (
            /* Special Instruction Display */
            <div className="text-center max-w-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-6">
                <RotateCcw className="h-10 w-10 text-amber-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-amber-500">
                {currentExercise.name}
              </h2>
              {currentExercise.notes && (
                <p className="text-xl text-muted-foreground">{currentExercise.notes}</p>
              )}
            </div>
          ) : (
            /* Regular Exercise Display */
            <div className="text-center max-w-3xl w-full">
              {/* Exercise Number */}
              <div className="inline-flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {currentIndex + 1} / {totalExercises}
                </Badge>
                {currentExercise?.side && (
                  <Badge className="text-lg px-4 py-1 bg-blue-500">
                    {currentExercise.side.toUpperCase()} SIDE
                  </Badge>
                )}
              </div>

              {/* Exercise Name */}
              <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {currentExercise?.name}
              </h2>

              {/* Description */}
              {currentExercise?.description && (
                <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {currentExercise.description}
                </p>
              )}

              {/* Muscle Groups */}
              {currentExercise?.muscleGroups && currentExercise.muscleGroups.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {currentExercise.muscleGroups.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-sm">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Timer Display */}
              {showTimer && currentExercise?.time_sec && (
                <Card className="inline-block p-8 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">
                      Exercise Timer
                    </p>
                    <div className={`text-7xl md:text-8xl font-mono font-bold ${
                      timerTime <= 10 && timerTime > 0 ? 'text-red-500' : ''
                    }`}>
                      {formatTime(timerTime)}
                    </div>
                    <div className="flex justify-center gap-3 mt-4">
                      <Button
                        size="lg"
                        onClick={() => timerRunning ? setTimerRunning(false) : startExercise()}
                        className="w-32"
                      >
                        {timerRunning ? (
                          <><Pause className="mr-2 h-5 w-5" /> Pause</>
                        ) : (
                          <><Play className="mr-2 h-5 w-5" /> Start</>
                        )}
                      </Button>
                      <Button size="lg" variant="outline" onClick={resetTimer}>
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Notes */}
              {currentExercise?.notes && (
                <p className="text-lg text-muted-foreground italic mb-6">
                  {currentExercise.notes}
                </p>
              )}
            </div>
          )}

          {/* Next Exercise Preview */}
          {nextExercise && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-1">UP NEXT</p>
              <p className="text-xl font-medium">
                {nextExercise.name}
                {nextExercise.side && ` (${nextExercise.side} side)`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t bg-card p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Stopwatch Toggle & Display */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="stopwatch"
                checked={showStopwatch}
                onCheckedChange={setShowStopwatch}
              />
              <Label htmlFor="stopwatch" className="text-sm">Stopwatch</Label>
            </div>
            {showStopwatch && (
              <Card className="flex items-center gap-3 px-4 py-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xl font-bold min-w-[80px]">
                  {formatTime(stopwatchTime)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStopwatchRunning(!stopwatchRunning)}
                >
                  {stopwatchRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetStopwatch}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </Card>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>
            <Button
              size="lg"
              onClick={goToNext}
              disabled={currentIndex === totalExercises - 1}
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Timer Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="timer"
              checked={showTimer}
              onCheckedChange={setShowTimer}
            />
            <Label htmlFor="timer" className="text-sm">Show Timer</Label>
          </div>
        </div>
      </div>
    </div>
  )
}
