"use client";

import { useEffect, useState } from "react";
import type { TeamMember } from "@/lib/types";
import type { MemberStats } from "@/lib/calc";
import { formatGBPFull, formatGBP } from "@/lib/calc";
import { TeamAvatar } from "./TeamAvatar";

interface Props {
  member: TeamMember;
  stats: MemberStats;
  target: number;
  rank?: number;
}

export function MemberCard({ member, stats, target, rank }: Props) {
  const pct = Math.min(stats.pctConfirmed, 1);
  const projectedPct = target ? Math.min(stats.projected / target, 1) : 0;
  const hit = stats.confirmed >= target && target > 0;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`relative glass rounded-2xl p-5 overflow-hidden ${hit ? "ring-2 ring-coral" : ""}`}>
      {/* Brand dot pattern accent */}
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full dot-grid opacity-50 pointer-events-none" />

      {rank !== undefined && (
        <div className="absolute top-3 right-3 text-[10px] uppercase tracking-widest font-bold text-brand-200/80">
          #{rank}
        </div>
      )}

      <div className="flex items-center gap-3">
        <TeamAvatar member={member} size={64} />
        <div className="leading-tight">
          <div className="font-display text-lg font-bold text-white">{member.firstName}</div>
          <div className="text-xs text-brand-200/70">{member.name}</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-brand-200/70">
            Confirmed
          </span>
          <span className="font-display text-xl font-bold text-white">
            {formatGBPFull(stats.confirmed)}
          </span>
        </div>

        {/* Bar with stacked layers */}
        <div className="relative h-3 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden">
          {/* Projected (interview + pipeline + confirmed) */}
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: mounted ? `${projectedPct * 100}%` : "0%",
              background:
                "linear-gradient(90deg, rgba(255,200,87,0.4), rgba(125,214,216,0.5))",
            }}
          />
          {/* Confirmed */}
          <div
            className="absolute inset-y-0 left-0 mercury transition-[width] duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: mounted ? `${pct * 100}%` : "0%" }}
          />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer animate-shimmer opacity-20" />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-brand-200/70">
          <span>{Math.round(pct * 100)}% of {formatGBP(target)}</span>
          <span>
            Pipeline {formatGBP(stats.pipeline)} · {stats.interviews} int.
          </span>
        </div>
      </div>

      {hit && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-ink bg-coral rounded-full px-2.5 py-0.5">
          🎉 Target smashed
        </div>
      )}
    </div>
  );
}
