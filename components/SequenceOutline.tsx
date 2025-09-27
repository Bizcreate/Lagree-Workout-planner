"use client";
import { Block } from "@/lib/types";

interface Props {
  blocks: Block[];
  activeId: string | null;
  setActive: (id: string) => void;
  addBlock: () => void;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  totalsLabel: string;
  onExport: () => void;
  onPrint: () => void;
  onReset: () => void;
}

export default function SequenceOutline({
  blocks,
  activeId,
  setActive,
  addBlock,
  rename,
  remove,
  totalsLabel,
  onExport,
  onPrint,
  onReset,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Sequence</div>
        <div className="flex gap-2">
          <button className="rounded-xl border px-3 py-1 text-sm" onClick={addBlock}>+ Block</button>
          <button className="rounded-xl border px-3 py-1 text-sm" onClick={onExport}>Export</button>
          <button className="rounded-xl border px-3 py-1 text-sm" onClick={onPrint}>Print</button>
          <button className="rounded-xl border px-3 py-1 text-sm text-red-600" onClick={onReset}>Reset</button>
        </div>
      </div>
      <ul className="flex-1 overflow-auto rounded-xl border">
        {blocks.map(b => (
          <li
            key={b.id}
            className={`flex items-center justify-between border-b p-2 ${b.id === activeId ? "bg-gray-50" : ""}`}
          >
            <button className="min-w-0 flex-1 text-left" onClick={() => setActive(b.id)}>
              <div className="truncate font-medium">{b.name}</div>
              <div className="text-xs text-gray-500">{b.moves.length} moves</div>
            </button>
            <input
              className="mx-2 w-40 rounded-xl border p-1 text-xs"
              value={b.name}
              onChange={e => rename(b.id, e.target.value)}
            />
            <button className="rounded-xl border px-2 py-1 text-xs text-red-600" onClick={() => remove(b.id)}>
              Delete
            </button>
          </li>
        ))}
        {blocks.length === 0 && <li className="p-3 text-sm text-gray-500">No blocks.</li>}
      </ul>
      <div className="rounded-xl border p-2 text-sm text-gray-700">{totalsLabel}</div>
    </div>
  );
}
