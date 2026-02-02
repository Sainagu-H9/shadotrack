
export enum TaskType {
  BINARY = 'binary',
  QUANTITATIVE = 'quantitative'
}

export interface Task {
  id: string;
  label: string;
  description?: string;
  type: TaskType;
  unit?: string;
}

export interface Goal {
  id: string;
  title: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  tasks: Task[];
}

export interface BinaryResult {
  success: boolean;
  reason?: string;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  results: Record<string, BinaryResult | number>;
}

export interface AppState {
  currentGoal: Goal | null;
  history: DailyEntry[];
}
