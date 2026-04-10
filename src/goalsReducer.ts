import { Goal } from "./types";

export type GoalAction =
  | { type: "ADD_GOAL"; payload: Omit<Goal, "id"> }
  | { type: "EDIT_GOAL"; id: number; title: string; dueDate?: string; notes?: string }
  | { type: "DELETE_GOAL"; id: number };

export function nextGoalId(goals: Goal[]): number {
  return Math.max(0, ...goals.map((g) => g.id)) + 1;
}

export function goalsReducer(goals: Goal[], action: GoalAction): Goal[] {
  switch (action.type) {
    case "ADD_GOAL": {
      const id = nextGoalId(goals);
      return [...goals, { id, ...action.payload }];
    }
    case "EDIT_GOAL": {
      const { id, title, dueDate, notes } = action;
      const trimmed = title.trim();
      if (!trimmed) return goals;
      return goals.map((g) =>
        g.id === id ? { ...g, title: trimmed, dueDate, notes } : g
      );
    }
    case "DELETE_GOAL":
      return goals.filter((g) => g.id !== action.id);
    default:
      return goals;
  }
}
