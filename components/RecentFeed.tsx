"use client";

import { useState, useMemo } from "react";
import type { Entry, EntryType } from "@/lib/types";
import { TEAM, memberById } from "@/lib/team";
import { TeamAvatar } from "./TeamAvatar";
import { formatGBPFull } from "@/lib/calc";

const TYPE_LABEL: Record<Entry["type"], string> = {
  placement: "Placement",
  pipeline: "Pipeline / Interview",
  interview: "Hot Vacancy",
};

const TYPE_STYLE: Record<Entry["type"], string> = {
  placement: "bg-brand-500 text-ink",
  pipeline: "bg-brand-200/30 text-brand-100 border border-brand-200/40",
  interview: "bg-coral/80 text-ink",
};

const TYPE_FILTER_LABEL: Record<EntryType, string> = {
  placement: "Placements",
  pipeline: "Pipeline / Interviews",
  interview: "Hot Vacancies",
};

const TYPES: EntryType[] = ["placement", "pipeline", "interview"];

export function RecentFeed({ entries }: { entries: Entry[] }) {
  const [typeFilter, setTypeFilter] = useState<EntryType | "all">("all");
  const [memberFilter, setMemberFilter] = useState<string | "all">("all");

  function partnerOf(entry: Entry) {
    if (!entry.splitId) return null;
    const other = entries.find(
      (e) => e.splitId === entry.splitId && e.id !== entry.id
    );
    if (!other) return null;
    return memberById(other.memberId) ?? null;
  }

  // Dedupe split pairs and apply filters
  const visible = useMemo(() => {
    const sorted = [...entries].sort((a, b) =>
      (a.createdAt || "").localeCompare(b.createdAt || "")
    );
    const seen = new Set<string>();
    const kept: Entry[] = [];
    for (const e of sorted) {
      if (e.splitId) {
        if (seen.has(e.splitId)) continue;
        seen.add(e.splitId);
      }
      kept.push(e);
    }
    const ordered = kept.sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || "")
    );
    return ordered.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (memberFilter !== "all") {
        if (e.memberId === memberFilter) return true;
        if (e.splitId) {
          const partnerEntry = entries.find(
            (x) => x.splitId === e.splitId && x.id !== e.id
          );
          if (partnerEntry?.memberId === memberFilter) return true;
        }
        return false;
      }
      return true;
    });
  }, [entries, typeFilter, memberFilter]);

  const recent = visible.slice(0, 15);

  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl p-4 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-brand-200/70 mb-2">
            Filter by type
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
              All activity
            </FilterChip>
            {TYPES.map((t) => (
              <FilterChip
                key={t}
                active={typeFilter === t}
                onClick={() => setTypeFilter(t)}
                accent={t}
              >
                {TYPE_FILTER_LABEL[t]}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-brand-200/70 mb-2">
            Filter by consultant
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMemberFilter("all")}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition w-[60px] ${
                memberFilter === "all"
                  ? "bg-brand-500/20 ring-2 ring-brand-400"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-ink font-display font-extrabold text-[9px] tracking-wider">
                ALL
              </div>
              <span className="text-[10px] text-white">Everyone</span>
            </button>
            {TEAM.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMemberFilter(m.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition w-[60px] ${
                  memberFilter === m.id
                    ? "bg-brand-500/20 ring-2 ring-brand-400"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <TeamAvatar member={m} size={32} ring={false} />
                <span className="text-[10px] text-white">{m.firstName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-center text-brand-200/70">
          No activity matches your filters yet.
        </div>
      ) : (
        <div className="glass rounded-2xl p-2 divide-y divide-white/5">
          {recent.map((e) => {
            const member = memberById(e.memberId) ?? TEAM[0];
            const partner = partnerOf(e);
            const partnerEntry = e.splitId
              ? entries.find((x) => x.splitId === e.splitId && x.id !== e.id)
              : null;
            const total = partnerEntry ? e.value + partnerEntry.value : e.value;
            return (
              <div key={e.id} className="flex items-center gap-4 p-3">
                <TeamAvatar member={member} size={40} ring={false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{member.firstName}</span>
                    <span
                      className={`text-[10px] uppercase tracking-widest font-bold rounded-full px-2 py-0.5 ${TYPE_STYLE[e.type]}`}
                    >
                      {TYPE_LABEL[e.type]}
                    </span>
                    {partner && (
                      <span className="text-[10px] uppercase tracking-widest font-bold rounded-full px-2 py-0.5 bg-coral/20 text-coral border border-coral/40">
                        50/50 with {partner.firstName}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-brand-100/80 truncate">
                    {e.description || "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-white">
                    {formatGBPFull(total)}
                  </div>
                  <div className="text-[11px] text-brand-200/70">
                    {new Date(e.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  accent?: EntryType;
  children: React.ReactNode;
}) {
  const accentClass =
    accent === "placement"
      ? "bg-brand-500 text-ink"
      : accent === "pipeline"
      ? "bg-brand-200/30 text-brand-100 border border-brand-200/40"
      : accent === "interview"
      ? "bg-coral/80 text-ink"
      : "bg-brand-500 text-ink";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-bold transition ${
        active
          ? accentClass
          : "bg-white/5 text-brand-200/70 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
