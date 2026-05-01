"use client";

import type { Entry } from "@/lib/types";
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

export function RecentFeed({ entries }: { entries: Entry[] }) {
  const recent = entries.slice(0, 12);

  function partnerOf(entry: Entry) {
    if (!entry.splitId) return null;
    const other = entries.find(
      (e) => e.splitId === entry.splitId && e.id !== entry.id
    );
    if (!other) return null;
    return memberById(other.memberId) ?? null;
  }

  if (!recent.length) {
    return (
      <div className="glass rounded-2xl p-6 text-center text-brand-200/70">
        No activity yet — the admin can add the first deal from the dashboard.
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-2 divide-y divide-white/5">
      {recent.map((e) => {
        const member = memberById(e.memberId) ?? TEAM[0];
        const partner = partnerOf(e);
        return (
          <div key={e.id} className="flex items-center gap-4 p-3">
            <TeamAvatar member={member} size={40} ring={false} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">{member.firstName}</span>
                <span className={`text-[10px] uppercase tracking-widest font-bold rounded-full px-2 py-0.5 ${TYPE_STYLE[e.type]}`}>
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
                {formatGBPFull(e.value)}
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
  );
}
