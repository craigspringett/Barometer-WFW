import type { DB, Entry } from "./types";
import { TEAM } from "./team";

export interface MemberStats {
  memberId: string;
  confirmed: number;
  pipeline: number;
  interviews: number;
  interviewValue: number;
  /** confirmed + pipeline + interview values */
  projected: number;
  /** 0 — 1+, capped where used */
  pctConfirmed: number;
}

export interface TeamStats {
  confirmed: number;
  pipeline: number;
  interviews: number;
  interviewValue: number;
  projected: number;
  pctConfirmed: number;
}

export function statsForMember(memberId: string, entries: Entry[], target: number): MemberStats {
  const mine = entries.filter((e) => e.memberId === memberId);
  const confirmed = sumByType(mine, "placement");
  const pipeline = sumByType(mine, "pipeline");
  const interviewValue = sumByType(mine, "interview");
  const interviews = mine.filter((e) => e.type === "interview").length;
  const projected = confirmed + pipeline + interviewValue;
  return {
    memberId,
    confirmed,
    pipeline,
    interviews,
    interviewValue,
    projected,
    pctConfirmed: target ? confirmed / target : 0,
  };
}

export function teamStats(db: DB): TeamStats {
  const target = db.settings.teamTarget || 0;
  const confirmed = sumByType(db.entries, "placement");
  const pipeline = sumByType(db.entries, "pipeline");
  const interviewValue = sumByType(db.entries, "interview");
  const interviews = db.entries.filter((e) => e.type === "interview").length;
  return {
    confirmed,
    pipeline,
    interviews,
    interviewValue,
    projected: confirmed + pipeline + interviewValue,
    pctConfirmed: target ? confirmed / target : 0,
  };
}

export function allMemberStats(db: DB): MemberStats[] {
  return TEAM.map((m) => statsForMember(m.id, db.entries, db.settings.individualTarget));
}

function sumByType(entries: Entry[], type: Entry["type"]): number {
  return entries
    .filter((e) => e.type === type)
    .reduce((sum, e) => sum + (Number.isFinite(e.value) ? e.value : 0), 0);
}

export function formatGBP(n: number): string {
  if (!Number.isFinite(n)) return "£0";
  if (Math.abs(n) >= 1000) {
    const k = n / 1000;
    const rounded = Math.round(k * 10) / 10;
    return `£${rounded}k`;
  }
  return `£${Math.round(n).toLocaleString("en-GB")}`;
}

export function formatGBPFull(n: number): string {
  if (!Number.isFinite(n)) return "£0";
  const hasPence = Math.round(n * 100) % 100 !== 0;
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: hasPence ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
