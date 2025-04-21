"use client"

import { useState } from "react"
import { format, addMonths, subMonths, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWorkoutStore } from "@/lib/store"

// Sample workout data - in a real app, this would come from a database
const sampleScheduledWorkouts = [
  {
    id: "1",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    workoutName: "Full Body Lagree",
    notes: "Focus on slow movements and proper form",
    duration: 45,
  },
  {
    id: "2",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 18),
    workoutName: "Core Intensive",
    notes: "Increase time under tension for all core exercises",
    duration: 30,
  },
  {
    id: "3",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 22),
    workoutName: "Lower Body Focus",
    notes: "Add extra resistance for lunges",
    duration: 40,
  },
]

export function WorkoutCalendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [scheduledWorkouts, setScheduledWorkouts] = useState(sampleScheduledWorkouts)
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false)
  const [newWorkout, setNewWorkout] = useState({
    workoutName: "",
    duration: "45",
    notes: "",
  })
  const [selectedWorkout, setSelectedWorkout] = useState<(typeof sampleScheduledWorkouts)[0] | null>(null)
  const [isViewWorkoutOpen, setIsViewWorkoutOpen] = useState(false)

  const { workoutPlan } = useWorkoutStore()

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)

      // Check if there's a workout scheduled for this date
      const workout = scheduledWorkouts.find((w) => isSameDay(w.date, date))
      if (workout) {
        setSelectedWorkout(workout)
        setIsViewWorkoutOpen(true)
      }
    }
  }

  const handleAddWorkout = () => {
    if (selectedDate && newWorkout.workoutName) {
      const workout = {
        id: Date.now().toString(),
        date: selectedDate,
        workoutName: newWorkout.workoutName,
        notes: newWorkout.notes,
        duration: Number.parseInt(newWorkout.duration),
      }

      setScheduledWorkouts([...scheduledWorkouts, workout])
      setIsAddWorkoutOpen(false)
      setNewWorkout({
        workoutName: "",
        duration: "45",
        notes: "",
      })
    }
  }

  // Function to highlight dates with scheduled workouts
  const isDayWithWorkout = (day: Date) => {
    return scheduledWorkouts.some((workout) => isSameDay(workout.date, day))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workout Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Schedule and track your Lagree workouts</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            className="rounded-md border"
            modifiers={{
              workout: (date) => isDayWithWorkout(date),
            }}
            modifiersClassNames={{
              workout: "bg-primary/20 font-bold text-primary",
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">{scheduledWorkouts.length} workouts scheduled this month</p>
          <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  if (!selectedDate) setSelectedDate(new Date())
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Schedule Workout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a Workout</DialogTitle>
                <DialogDescription>
                  Add a workout to your calendar for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "today"}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="workout-name">Workout Name</Label>
                  <Input
                    id="workout-name"
                    value={newWorkout.workoutName}
                    onChange={(e) => setNewWorkout({ ...newWorkout, workoutName: e.target.value })}
                    placeholder="e.g., Full Body Lagree"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workout-duration">Duration (minutes)</Label>
                  <Select
                    value={newWorkout.duration}
                    onValueChange={(value) => setNewWorkout({ ...newWorkout, duration: value })}
                  >
                    <SelectTrigger id="workout-duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="75">75 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workout-notes">Notes</Label>
                  <Textarea
                    id="workout-notes"
                    value={newWorkout.notes}
                    onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                    placeholder="Add any notes about this workout..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddWorkoutOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWorkout}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Workouts</CardTitle>
          <CardDescription>Your scheduled sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledWorkouts
              .filter((workout) => workout.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map((workout) => (
                <div key={workout.id} className="border rounded-lg p-3 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{workout.workoutName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(workout.date, "EEEE, MMMM d")} • {workout.duration} min
                      </p>
                    </div>
                    <Badge variant="outline">{format(workout.date, "MMM d")}</Badge>
                  </div>
                  {workout.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{workout.notes}</p>}
                </div>
              ))}

            {scheduledWorkouts.filter((workout) => workout.date >= new Date()).length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming workouts</p>
                <p className="text-sm text-muted-foreground mt-1">Schedule your next session to see it here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Workout Dialog */}
      <Dialog open={isViewWorkoutOpen} onOpenChange={setIsViewWorkoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedWorkout?.workoutName}</DialogTitle>
            <DialogDescription>
              {selectedWorkout && format(selectedWorkout.date, "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">{selectedWorkout?.duration} minutes</Badge>
            </div>

            {selectedWorkout?.notes && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-1">Notes</h3>
                <p className="text-sm text-muted-foreground">{selectedWorkout.notes}</p>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Actions</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (selectedWorkout) {
                      setScheduledWorkouts(scheduledWorkouts.filter((w) => w.id !== selectedWorkout.id))
                      setIsViewWorkoutOpen(false)
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewWorkoutOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
