"use client";
import { useState } from "react";
import { Exercise, Equipment, Metric } from "@/lib/types";
import { uid } from "@/lib/id";

interface Props {
  onCreate: (exercise: Exercise) => void;
  onClose: () => void;
}

export default function ExerciseEditor({ onCreate, onClose }: Props) {
  const [name, setName] = useState("");
  const [series, setSeries] = useState("Custom");
  const [category, setCategory] = useState("Core");
  const [focus, setFocus] = useState("core");
  const [unilateral, setUnilateral] = useState(false);
  const [defaultMetric, setDefaultMetric] = useState<Metric>("time");
  const [defaultValue, setDefaultValue] = useState(45);
  const [equipment, setEquipment] = useState<Equipment[]>(["Megaformer"]);
  const [level, setLevel] = useState("beginner");
  const [aliases, setAliases] = useState("");
  const [tags, setTags] = useState("");

  function toggleEquip(eq: Equipment) {
    setEquipment(prev => (prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]));
  }

  function submit() {
    if (!name.trim()) return;
    const ex: Exercise = {
      id: `ex_${uid("custom")}`,
      name: name.trim(),
      series: series.trim() || "Custom",
      category,
      focus: focus as any,
      unilateral,
      defaultMetric,
      defaultValue: Number(defaultValue) || 45,
      equipment,
      level: level as any,
      aliases: aliases
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
      tags: tags
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
    };
    onCreate(ex);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">Add Custom Exercise</div>
          <button className="rounded-xl border px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <input className="col-span-6 rounded-xl border p-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="col-span-6 rounded-xl border p-2" placeholder="Series (e.g., Lunge Series)" value={series} onChange={e => setSeries(e.target.value)} />

          <select className="col-span-4 rounded-xl border p-2" value={category} onChange={e => setCategory(e.target.value)}>
            <option>Core</option><option>Legs</option><option>Glutes</option><option>Obliques</option><option>Arms</option><option>Full</option>
          </select>
          <select className="col-span-4 rounded-xl border p-2" value={focus} onChange={e => setFocus(e.target.value)}>
            <option value="core">core</option><option value="legs">legs</option><option value="glutes">glutes</option><option value="obliques">obliques</option><option value="arms">arms</option><option value="full">full</option>
          </select>
          <select className="col-span-4 rounded-xl border p-2" value={level} onChange={e => setLevel(e.target.value)}>
            <option>beginner</option><option>intermediate</option><option>advanced</option>
          </select>

          <label className="col-span-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={unilateral} onChange={e => setUnilateral(e.target.checked)} /> Unilateral
          </label>
          <div className="col-span-3 flex items-center gap-2 text-sm">
            <label>Metric</label>
            <select className="rounded-xl border p-2" value={defaultMetric} onChange={e => setDefaultMetric(e.target.value as Metric)}>
              <option value="time">time</option><option value="reps">reps</option>
            </select>
          </div>
          <input type="number" className="col-span-3 rounded-xl border p-2" value={defaultValue} onChange={e => setDefaultValue(Number(e.target.value))} />
          <div className="col-span-3 text-sm">
            <div className="mb-1 font-medium">Equipment</div>
            {(["Megaformer","Micro","Mini","Mat","Other"] as Equipment[]).map(eq => (
              <label key={eq} className="mr-3 inline-flex items-center gap-1">
                <input type="checkbox" checked={equipment.includes(eq)} onChange={() => toggleEquip(eq)} /> {eq}
              </label>
            ))}
          </div>

          <input className="col-span-6 rounded-xl border p-2" placeholder="Aliases (comma separated)" value={aliases} onChange={e => setAliases(e.target.value)} />
          <input className="col-span-6 rounded-xl border p-2" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
        </div>

        <div className="mt-4 flex justify-end">
          <button className="rounded-xl border px-4 py-2 text-sm" onClick={submit}>Add Exercise</button>
        </div>
      </div>
    </div>
  );
}
