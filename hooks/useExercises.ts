"use client";
import { useEffect, useMemo, useState } from "react";
import { Exercise, ExerciseIndex } from "@/lib/types";
import { buildExerciseIndex } from "@/lib/exercises";
import { useLocalStorage } from "./useLocalStorage";

export function useExercises() {
  const [server, setServer] = useState<Exercise[] | null>(null);
  const [custom, setCustom] = useLocalStorage<Exercise[]>("lagree.exercises.custom.v1", []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/exercises")
      .then(r => r.json())
      .then((data: Exercise[]) => {
        if (mounted) setServer(data);
      })
      .catch(() => setServer([]));
    return () => {
      mounted = false;
    };
  }, []);

  const index: ExerciseIndex | null = useMemo(() => {
    if (!server) return null;
    return buildExerciseIndex(custom);
  }, [server, custom]);

  function addCustom(ex: Exercise) {
    setCustom([...custom, ex]);
  }

  function removeCustom(id: string) {
    setCustom(custom.filter(e => e.id !== id));
  }

  return { index, addCustom, removeCustom, loading: !server };
}
