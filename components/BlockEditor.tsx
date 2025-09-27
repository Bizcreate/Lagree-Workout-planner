"use client";
import { ExerciseIndex, Move } from "@/lib/types";

interface Props {
  blockName: string;
  moves: Move[];
  exIndex: ExerciseIndex;
  onRename: (name: string) => void;
  onUpdateMove: (id: string, patch: Partial<Move>) => void;
  onRemoveMove: (id: string) => void;
  onReorder: (id: string, dir: "up" | "down") => void;
}

export default function BlockEditor({
  blockName,
  moves,
  exIndex,
  onRename,
  onUpdateMove,
  onRemoveMove,
  onReorder,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-3">
      <input
        className="rounded-xl border p-2 text-lg font-semibold"
        value={blockName}
        onChange={e => onRename(e.target.value)}
      />
      <div className="flex-1 overflow-auto rounded-xl border">
        {moves.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Add moves from the library.</div>
        ) : (
          <ul>
            {moves.map((m) => {
              const ex = exIndex.byId[m.exerciseId];
              return (
                <li key={m.id} className="grid grid-cols-12 items-center gap-2 border-b p-2">
                  <div className="col-span-4 min-w-0">
                    <div className="truncate font-medium">{ex?.name ?? "Unknown"}</div>
                    <div className="text-xs text-gray-500">{ex?.series} • {ex?.category}</div>
                  </div>
                  <div className="col-span-2">
                    <select
                      className="w-full rounded-xl border p-2"
                      value={m.metric}
                      onChange={e => onUpdateMove(m.id, { metric: e.target.value as any })}
                    >
                      <option value="time">Time (s)</option>
                      <option value="reps">Reps</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-xl border p-2"
                      value={m.value}
                      onChange={e => onUpdateMove(m.id, { value: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      className="w-full rounded-xl border p-2"
                      value={m.side}
                      onChange={e => onUpdateMove(m.id, { side: e.target.value as any })}
                    >
                      <option value="Both">Both</option>
                      <option value="L">Left</option>
                      <option value="R">Right</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <div className="flex gap-1">
                      <button
                        className="rounded-lg border px-2 py-1 text-xs"
                        onClick={() => onReorder(m.id, "up")}
                        aria-label="Move up"
                      >↑</button>
                      <button
                        className="rounded-lg border px-2 py-1 text-xs"
                        onClick={() => onReorder(m.id, "down")}
                        aria-label="Move down"
                      >↓</button>
                    </div>
                    <button
                      className="rounded-lg border px-2 py-1 text-xs text-red-600"
                      onClick={() => onRemoveMove(m.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="col-span-12 grid grid-cols-12 gap-2">
                    <input
                      className="col-span-4 rounded-xl border p-2 text-xs"
                      placeholder="Springs"
                      value={m.springs ?? ""}
                      onChange={e => onUpdateMove(m.id, { springs: e.target.value })}
                    />
                    <input
                      className="col-span-4 rounded-xl border p-2 text-xs"
                      placeholder="Tempo"
                      value={m.tempo ?? ""}
                      onChange={e => onUpdateMove(m.id, { tempo: e.target.value })}
                    />
                    <input
                      className="col-span-4 rounded-xl border p-2 text-xs"
                      placeholder="Notes"
                      value={m.notes ?? ""}
                      onChange={e => onUpdateMove(m.id, { notes: e.target.value })}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
