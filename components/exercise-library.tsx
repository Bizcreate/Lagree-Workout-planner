"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Exercise, Equipment } from "@/lib/types";
import { lagreeExercises } from "@/lib/data";
import { useWorkoutStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [series, setSeries] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [addBothSides, setAddBothSides] = useState(true); // why: speeds unilateral programming
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExercise, setNewExercise] = useState<Exercise>({
    id: "",
    name: "",
    description: "",
    muscleGroups: ["core"],
    series: "Custom",
    unilateral: false,
    defaultMetric: "time",
    defaultTimeSec: 45,
    equipment: ["Megaformer"],
    level: "beginner",
    aliases: [],
    tags: [],
  });

  const { addExerciseToWorkout } = useWorkoutStore();

  const muscleGroups = ["all", "core", "arms", "legs", "back", "glutes", "obliques", "full"] as const;

  const uniqueSeries = useMemo(
    () => Array.from(new Set(lagreeExercises.map((e) => e.series).filter(Boolean))).sort() as string[],
    []
  );
  const uniqueEquipment = useMemo(
    () => Array.from(new Set(lagreeExercises.flatMap((e) => e.equipment ?? []))) as Equipment[],
    []
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return lagreeExercises.filter((e) => {
      const matchesQ =
        !q ||
        e.name.toLowerCase().includes(q) ||
        (e.aliases ?? []).some((a) => a.toLowerCase().includes(q)) ||
        (e.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        e.description.toLowerCase().includes(q);
      const matchesTab = activeTab === "all" || e.muscleGroups.includes(activeTab as any);
      const matchesSeries = series === "all" || e.series === series;
      const matchesEquip = equipment === "all" || (e.equipment ?? []).includes(equipment as Equipment);
      return matchesQ && matchesTab && matchesSeries && matchesEquip;
    });
  }, [searchTerm, activeTab, series, equipment]);

  const onAdd = (e: Exercise) => addExerciseToWorkout(e, { bothSides: addBothSides });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Exercise Library</CardTitle>
        <CardDescription>Browse and add Lagree exercises</CardDescription>

        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, alias, tag, description…"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-3">
          <TabsList className="grid grid-cols-4 md:grid-cols-8">
            {muscleGroups.map((group) => (
              <TabsTrigger key={group} value={group} className="capitalize">
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-12 gap-2 mt-3">
          <Select value={series} onValueChange={setSeries}>
            <SelectTrigger className="col-span-7">
              <SelectValue placeholder="Series" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All series</SelectItem>
              {uniqueSeries.map((s) => (
                <SelectItem key={s} value={s!}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={equipment} onValueChange={setEquipment}>
            <SelectTrigger className="col-span-5">
              <SelectValue placeholder="Equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All equipment</SelectItem>
              {uniqueEquipment.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={addBothSides}
              onCheckedChange={(v) => setAddBothSides(Boolean(v))}
              id="both-sides"
            />
            Add both sides for unilateral
          </label>

          <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Custom Exercise
          </Button>
        </div>
      </CardHeader>

      <CardContent className="h-[calc(100vh-350px)] overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          {filtered.length > 0 ? (
            filtered.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} onAdd={() => onAdd(exercise)} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No exercises found.</p>
          )}
        </div>
      </CardContent>

      {/* Custom Exercise Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Custom Exercise</DialogTitle>
            <DialogDescription>Define a move and defaults. You can edit details in the planner later.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label>Name</Label>
              <Input
                value={newExercise.name}
                onChange={(e) => setNewExercise((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={newExercise.description}
                onChange={(e) => setNewExercise((s) => ({ ...s, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Series</Label>
                <Input
                  value={newExercise.series}
                  onChange={(e) => setNewExercise((s) => ({ ...s, series: e.target.value }))}
                />
              </div>
              <div>
                <Label>Muscle Group</Label>
                <Select
                  value={newExercise.muscleGroups[0]}
                  onValueChange={(v) => setNewExercise((s) => ({ ...s, muscleGroups: [v as any] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["core","legs","glutes","arms","back","obliques","full"].map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={!!newExercise.unilateral}
                  onCheckedChange={(v) => setNewExercise((s) => ({ ...s, unilateral: Boolean(v) }))}
                  id="unilateral"
                />
                <Label htmlFor="unilateral">Unilateral</Label>
              </div>

              <div className="flex items-center gap-2">
                <Label>Metric</Label>
                <Select
                  value={newExercise.defaultMetric ?? "time"}
                  onValueChange={(v) => setNewExercise((s) => ({ ...s, defaultMetric: v as any }))}
                >
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">time</SelectItem>
                    <SelectItem value="reps">reps</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newExercise.defaultMetric !== "reps" ? (
                <div className="flex items-center gap-2">
                  <Label>Secs</Label>
                  <Input
                    type="number"
                    className="w-24"
                    value={newExercise.defaultTimeSec ?? 45}
                    onChange={(e) => setNewExercise((s) => ({ ...s, defaultTimeSec: Number(e.target.value) }))}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    className="w-24"
                    value={newExercise.defaultReps ?? 12}
                    onChange={(e) => setNewExercise((s) => ({ ...s, defaultReps: Number(e.target.value) }))}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const ex: Exercise = {
                  ...newExercise,
                  id: `custom_${Date.now()}`,
                  equipment: newExercise.equipment?.length ? newExercise.equipment : ["Megaformer"],
                };
                // Opportunistically add to workout; keeps UX fast
                useWorkoutStore.getState().addExerciseToWorkout(ex, { bothSides: !!ex.unilateral });
                setIsAddOpen(false);
                setNewExercise({
                  id: "",
                  name: "",
                  description: "",
                  muscleGroups: ["core"],
                  series: "Custom",
                  unilateral: false,
                  defaultMetric: "time",
                  defaultTimeSec: 45,
                  equipment: ["Megaformer"],
                  level: "beginner",
                  aliases: [],
                  tags: [],
                });
              }}
            >
              Add & Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ExerciseCard({ exercise, onAdd }: { exercise: Exercise; onAdd: () => void }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{exercise.name}</CardTitle>
        <div className="flex flex-wrap gap-1 mt-1">
          {exercise.muscleGroups.map((group) => (
            <Badge key={group} variant="secondary" className="capitalize">
              {group}
            </Badge>
          ))}
          {exercise.series && <Badge variant="outline">{exercise.series}</Badge>}
          {exercise.unilateral && <Badge variant="outline">Unilateral</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{exercise.description}</p>
      </CardContent>
      <div className="p-3">
        <Button onClick={onAdd} size="sm" className="w-full">
          Add to Workout
        </Button>
      </div>
    </Card>
  );
}
