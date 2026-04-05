export type Filter = "all" | "active" | "done";
export type Priority = "high" | "medium" | "low";
export type Recurrence = "daily" | "weekly";

export interface Subtask {
  id: number;
  text: string;
  done: boolean;
}

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  duration?: number;
  priority?: Priority;
  dueDate?: string;
  recurrence?: Recurrence;
  note?: string;
  subtasks?: Subtask[];
}
