"use client";
import ExerciseLibrary from "./ExerciseLibrary";
import BlockEditor from "./BlockEditor";
import SequenceOutline from "./SequenceOutline";
import ExerciseEditor from "./ExerciseEditor";
import { Metric, Move, Side } from "@/lib/types";
import { useSequence } from "@/hooks/useSequence";
import { useExercises } from "@/hooks/useExercises";
import { buildExerciseIndex } from "@/lib/exercises";

export default function SequenceBuilder() {
  const { index, addCustom, loading } = useExercises();
  const {
    seq,
    activeBlockId,
    setActiveBlockId,
    activeBlock,
    totals,
    addBlock,
    renameBlock,
    removeBlock,
    addMove,
    addMoves,
    updateMove,
    removeMove,
    reorderMove,
    reset,
  } = useSequence();

  const exIndex = index ?? buildExerciseIndex(); // fallback quickly during first render
  const [showEditor, setShowEditor] = useState(false);

  function handleAddExercise(ex: (typeof exIndex)["all"][number], addBothSides: boolean) {
    if (!activeBlock) return;
    const metric: Metric = ex.defaultMetric;
    const value = ex.defaultValue;
    const unilateral = ex.unilateral;

    if (unilateral && addBothSides) {
      const bases: Omit<Move,"id">[] = [
        { exerciseId: ex.id, metric, value, side: "L", springs: "", tempo: "", notes: "" },
        { exerciseId: ex.id, metric, value, side: "R", springs: "", tempo: "", notes: "" },
      ];
      addMoves(activeBlock.id, bases);
    } else {
      const base: Omit<Move, "id"> = {
        exerciseId: ex.id,
        metric,
        value,
        side: unilateral ? "L" : "Both",
        springs: "",
        tempo: "",
        notes: "",
      };
      addMove(activeBlock.id, base);
    }
  }

  function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(seq, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `${seq.title || "lagree-sequence"}.json`;
    a.click();
  }

  function printPlan() {
    const rows = seq.blocks.map(b => `<h3>${escapeHtml(b.name)}</h3><table border="1" cellspacing="0" cellpadding="6">
      <tr><th>Move</th><th>Metric</th><th>Value</th><th>Side</th><th>Springs</th><th>Tempo</th><th>Notes</th></tr>
      ${b.moves.map(m => {
        const ex = exIndex.byId[m.exerciseId];
        return `<tr>
          <td>${escapeHtml(ex?.name || "Unknown")}</td>
          <td>${m.metric}</td><td>${m.value}</td><td>${m.side}</td>
          <td>${escapeHtml(m.springs || "")}</td><td>${escapeHtml(m.tempo || "")}</td><td>${escapeHtml(m.notes || "")}</td>
        </tr>`;
      }).join("")}
    </table>`).join("");

    const html = `<!doctype html><html><head><meta charset="utf-8">
      <title>${escapeHtml(seq.title)}</title>
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; }
        h1 { margin: 0 0 12px 0; } h3 { margin: 16px 0 8px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { font-size: 12px; }
      </style></head><body>
        <h1>${escapeHtml(seq.title)} — Plan</h1>
        <div>Blocks: ${seq.blocks.length} • Total ~ ${totals().minutes} min</div>
        ${rows}
      </body></html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    }
  }

  const t = totals();

  return (
    <div className="grid h-[calc(100vh-140px)] grid-cols-12 gap-4">
      <div className="col-span-3">
        <div className="mb-3 text-lg font-semibold">Exercise Library</div>
        {loading ? (
          <div className="rounded-xl border p-3 text-sm text-gray-500">Loading exercises…</div>
        ) : (
          <ExerciseLibrary
            exercises={exIndex.all}
            onAdd={handleAddExercise}
            onCreateExercise={() => setShowEditor(true)}
          />
        )}
      </div>

      <div className="col-span-6">
        <div className="mb-3 flex items-center justify-between">
          <input
            className="w-2/3 rounded-xl border p-2 text-xl font-semibold"
            value={seq.title}
            onChange={e => {
              const next = { ...seq, title: e.target.value };
              window.localStorage.setItem("lagree.sequence.v1", JSON.stringify(next));
            }}
            placeholder="Class title"
          />
          <div className="text-sm text-gray-600">~ {t.minutes} min total</div>
        </div>
        {activeBlock ? (
          <BlockEditor
            blockName={activeBlock.name}
            moves={activeBlock.moves}
            exIndex={exIndex}
            onRename={name => renameBlock(activeBlock.id, name)}
            onUpdateMove={(id, patch) => updateMove(activeBlock.id, id, patch)}
            onRemoveMove={id => removeMove(activeBlock.id, id)}
            onReorder={(id, dir) => reorderMove(activeBlock.id, id, dir)}
          />
        ) : (
          <div className="rounded-xl border p-4 text-sm text-gray-500">Select or add a block.</div>
        )}
      </div>

      <div className="col-span-3">
        <SequenceOutline
          blocks={seq.blocks}
          activeId={activeBlockId}
          setActive={setActiveBlockId}
          addBlock={() => addBlock("New Block")}
          rename={(id, name) => renameBlock(id, name)}
          remove={removeBlock}
          totalsLabel={`Blocks: ${seq.blocks.length} • ~ ${t.minutes} min`}
          onExport={exportJSON}
          onPrint={printPlan}
          onReset={reset}
        />
      </div>

      {showEditor && (
        <ExerciseEditor
          onCreate={(ex) => addCustom(ex)}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

import { useState } from "react";

function escapeHtml(s: string) {
  return (s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c] as string));
}
