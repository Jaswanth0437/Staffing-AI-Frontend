export type EmployeeAvailability = "available" | "on-bench" | "deployed";

export interface Employee {
  id: string;
  name: string;
  role_title: string;
  skills: string[];
  experience_years: number;
  availability: EmployeeAvailability;
  email?: string;
  summary?: string;
}

export interface EmployeeFormValues {
  name: string;
  role_title: string;
  skills: string;
  experience_years: string;
  availability: EmployeeAvailability;
  email: string;
  summary: string;
}
