export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function advanceDueDate(dateStr: string, recurrence: "daily" | "weekly"): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + (recurrence === "weekly" ? 7 : 1));
  return d.toISOString().slice(0, 10);
}

export function formatDueDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
