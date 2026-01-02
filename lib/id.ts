export function uid(prefix = "id"): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return (crypto as any).randomUUID();
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
