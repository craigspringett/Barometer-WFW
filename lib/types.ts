export type EntryType = "placement" | "pipeline" | "interview";

export interface Entry {
  id: string;
  memberId: string;
  type: EntryType;
  /** Pounds (£). For interviews this can be 0 — the count is what matters. */
  value: number;
  /** Free-text label, e.g. "Senior Dev — AcmeCo" */
  description: string;
  /** ISO date */
  date: string;
  /** ISO timestamp */
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  firstName: string;
  role?: string;
  /** Path under /public, e.g. /team/luke.png */
  photo: string;
  accent: string;
}

export interface DB {
  entries: Entry[];
  /** Settings the admin can tweak from the dashboard. */
  settings: {
    individualTarget: number;
    teamTarget: number;
    prizeLabel: string;
    deadline: string;
  };
}
