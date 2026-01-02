"use client";
import { useMemo, useState } from "react";
import { Block, Move, Sequence } from "@/lib/types";
import { uid } from "@/lib/id";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_SEQUENCE: Sequence = {
  id: uid("seq"),
  title: "New Lagree Class",
  blocks: [
    { id: uid("blk"), name: "Warm-up Core", moves: [] },
    { id: uid("blk"), name: "Leg Series", moves: [] },
  ],
};

export function useSequence() {
  const [seq, setSeq] = useLocalStorage<Sequence>("lagree.sequence.v1", DEFAULT_SEQUENCE);
  const [activeBlockId, setActiveBlockId] = useState<string>(seq.blocks[0]?.id ?? "");

  const activeBlock = useMemo(
    () => seq.blocks.find(b => b.id === activeBlockId) ?? seq.blocks[0] ?? null,
    [seq.blocks, activeBlockId]
  );

  function totals() {
    const seconds = seq.blocks.reduce((acc, b) => {
      return acc + b.moves.reduce((s, m) => (m.metric === "time" ? s + m.value : s), 0);
    }, 0);
    return { seconds, minutes: Math.round(seconds / 60) };
  }

  function addBlock(name = "New Block") {
    const b: Block = { id: uid("blk"), name, moves: [] };
    setSeq({ ...seq, blocks: [...seq.blocks, b] });
    setActiveBlockId(b.id);
  }

  function renameBlock(id: string, name: string) {
    setSeq({ ...seq, blocks: seq.blocks.map(b => (b.id === id ? { ...b, name } : b)) });
  }

  function removeBlock(id: string) {
    const blocks = seq.blocks.filter(b => b.id !== id);
    setSeq({ ...seq, blocks });
    if (activeBlockId === id && blocks[0]) setActiveBlockId(blocks[0].id);
  }

  function addMove(blockId: string, base: Omit<Move, "id">) {
    const m: Move = { ...base, id: uid("mv") };
    setSeq({
      ...seq,
      blocks: seq.blocks.map(b => (b.id === blockId ? { ...b, moves: [...b.moves, m] } : b)),
    });
  }

  function addMoves(blockId: string, bases: Omit<Move, "id">[]) {
    setSeq({
      ...seq,
      blocks: seq.blocks.map(b =>
        b.id === blockId ? { ...b, moves: [...b.moves, ...bases.map(bs => ({ ...bs, id: uid("mv") }))] } : b
      ),
    });
  }

  function updateMove(blockId: string, moveId: string, patch: Partial<Move>) {
    setSeq({
      ...seq,
      blocks: seq.blocks.map(b =>
        b.id !== blockId
          ? b
          : { ...b, moves: b.moves.map(m => (m.id === moveId ? { ...m, ...patch } : m)) }
      ),
    });
  }

  function removeMove(blockId: string, moveId: string) {
    setSeq({
      ...seq,
      blocks: seq.blocks.map(b =>
        b.id !== blockId ? b : { ...b, moves: b.moves.filter(m => m.id !== moveId) }
      ),
    });
  }

  function reorderMove(blockId: string, moveId: string, dir: "up" | "down") {
    setSeq({
      ...seq,
      blocks: seq.blocks.map(b => {
        if (b.id !== blockId) return b;
        const idx = b.moves.findIndex(m => m.id === moveId);
        if (idx < 0) return b;
        const target = dir === "up" ? idx - 1 : idx + 1;
        if (target < 0 || target >= b.moves.length) return b;
        const copy = b.moves.slice();
        const [mv] = copy.splice(idx, 1);
        copy.splice(target, 0, mv);
        return { ...b, moves: copy };
      }),
    });
  }

  function reset() {
    setSeq(DEFAULT_SEQUENCE);
    setActiveBlockId(DEFAULT_SEQUENCE.blocks[0].id);
  }

  return {
    seq,
    setSeq,
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
  };
}
