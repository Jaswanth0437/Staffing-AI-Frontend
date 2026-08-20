import type { Employee } from "./employee";

export interface MatchResult {
  id: string;
  lead_id: string;
  employee: Employee;
  match_score: number;
  reasoning: string;
}
