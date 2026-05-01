"use client";

import { useEffect, useState } from "react";
import { formatGBP, formatGBPFull } from "@/lib/calc";

interface Props {
  confirmed: number;
  pipeline: number;
  interviewValue: number;
  target: number;
  prizeLabel: string;
}

export function Barometer({ confirmed, pipeline, interviewValue, target, prizeLabel }: Props) {
  const safeTarget = Math.max(target, 1);
  const pctConfirmed = Math.min(confirmed / safeTarget, 1);
  const pctPipeline = Math.min((confirmed + pipeline) / safeTarget, 1);
  const pctInterview = Math.min(
    (confirmed + pipeline + interviewValue) / safeTarget,
    1
  );
  const hit = confirmed >= target && target > 0;

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  // Animate fills in on mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {hit && <Confetti />}

      {/* Headline numbers */}
      <div className="mb-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-brand-200/80 mb-2">
          Team progress · prize
        </div>
        <div className="font-display text-2xl md:text-3xl font-bold text-white">
          {prizeLabel}
        </div>
      </div>

      <div className="flex items-end gap-8 md:gap-12">
        {/* Tick scale */}
        <div className="hidden md:flex flex-col-reverse h-[420px] py-2 text-xs text-brand-200/70 font-medium">
          {ticks.map((t) => (
            <div key={t} className="flex-1 flex items-end">
              <span>{formatGBP(safeTarget * t)}</span>
            </div>
          ))}
        </div>

        {/* Thermometer */}
        <div className="relative">
          <div className="relative w-28 md:w-32 h-[420px] rounded-full bg-white/5 border border-white/10 overflow-hidden">
            {/* Tick lines */}
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute left-0 right-0 border-t border-white/10"
                style={{ bottom: `${t * 100}%` }}
              />
            ))}

            {/* Hot Vacancies layer (highest, top of stack) */}
            <div
              className="absolute left-0 right-0 bottom-0 transition-[height] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                height: mounted ? `${pctInterview * 100}%` : "0%",
                background:
                  "linear-gradient(180deg, rgba(255,200,87,0.55), rgba(255,122,89,0.45))",
              }}
            />
            {/* Pipeline / Interviews */}
            <div
              className="absolute left-0 right-0 bottom-0 transition-[height] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                height: mounted ? `${pctPipeline * 100}%` : "0%",
                background:
                  "linear-gradient(180deg, rgba(125,214,216,0.65), rgba(35,137,139,0.65))",
              }}
            />
            {/* Confirmed mercury */}
            <div
              className="absolute left-0 right-0 bottom-0 mercury mercury-glow transition-[height] duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ height: mounted ? `${pctConfirmed * 100}%` : "0%" }}
            />

            {/* Bubbles inside mercury */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <span className="absolute left-4 bottom-2 w-2 h-2 rounded-full bg-white/50 animate-bubble" style={{ animationDelay: "0s" }} />
              <span className="absolute left-1/2 bottom-1 w-1.5 h-1.5 rounded-full bg-white/40 animate-bubble" style={{ animationDelay: "1s" }} />
              <span className="absolute right-4 bottom-3 w-2 h-2 rounded-full bg-white/50 animate-bubble" style={{ animationDelay: "2s" }} />
            </div>

            {/* Hot Vacancies marker line (top) */}
            {interviewValue > 0 && (
              <div
                className="absolute left-0 right-0 transition-[bottom] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                style={{ bottom: mounted ? `${pctInterview * 100}%` : "0%" }}
              >
                <div className="h-0.5 bg-coral shadow-[0_0_8px_rgba(255,122,89,0.9)]" />
              </div>
            )}

            {/* Pipeline marker line */}
            {pipeline > 0 && (
              <div
                className="absolute left-0 right-0 transition-[bottom] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                style={{ bottom: mounted ? `${pctPipeline * 100}%` : "0%" }}
              >
                <div className="h-0.5 bg-brand-200 shadow-[0_0_8px_rgba(168,228,229,0.8)]" />
              </div>
            )}

            {/* Confirmed marker line (top of mercury) */}
            {confirmed > 0 && (
              <div
                className="absolute left-0 right-0 transition-[bottom] duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                style={{ bottom: mounted ? `${pctConfirmed * 100}%` : "0%" }}
              >
                <div className="h-[3px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
              </div>
            )}

            {/* Target line */}
            <div className="absolute left-0 right-0 top-0 border-t-2 border-dashed border-white/40" />
            <div className="absolute -top-3 right-3 text-[10px] uppercase tracking-widest text-white/70 bg-black/30 rounded px-1.5 py-0.5">
              Target {formatGBP(target)}
            </div>
          </div>

          {/* Marker labels — pinned to right of thermometer at each layer */}
          <div className="absolute -right-2 top-0 bottom-0 hidden md:block pointer-events-none">
            {confirmed > 0 && (
              <MarkerLabel
                pct={pctConfirmed}
                color="bg-white text-ink"
                label={`Confirmed ${formatGBP(confirmed)}`}
                animate={mounted}
              />
            )}
            {pipeline > 0 && (
              <MarkerLabel
                pct={pctPipeline}
                color="bg-brand-200 text-ink"
                label={`+ Pipeline ${formatGBP(confirmed + pipeline)}`}
                animate={mounted}
              />
            )}
            {interviewValue > 0 && (
              <MarkerLabel
                pct={pctInterview}
                color="bg-coral text-ink"
                label={`+ Vacancies ${formatGBP(confirmed + pipeline + interviewValue)}`}
                animate={mounted}
              />
            )}
          </div>

          {/* Bulb */}
          <div className="thermo-bulb absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 md:w-36 md:h-36 rounded-full" />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 md:w-36 md:h-36 rounded-full pointer-events-none">
            <div className="absolute inset-0 rounded-full mix-blend-overlay bg-gradient-to-br from-white/30 to-transparent" />
          </div>
        </div>

        {/* Side stats */}
        <div className="flex flex-col gap-4 min-w-[180px]">
          <Stat label="Confirmed" value={formatGBPFull(confirmed)} swatch="bg-brand-400" big />
          <Stat label="Pipeline / Interviews" value={formatGBPFull(pipeline)} swatch="bg-brand-400/40" />
          <Stat label="Hot Vacancies" value={formatGBPFull(interviewValue)} swatch="bg-coral/60" />
          <Stat
            label="To target"
            value={formatGBPFull(Math.max(target - confirmed, 0))}
            swatch="bg-white/30"
          />
          <div className="mt-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70 mb-1">
              % of target
            </div>
            <div className="font-display text-3xl font-bold text-white">
              {Math.round(pctConfirmed * 100)}%
            </div>
          </div>
        </div>
      </div>

      {hit && (
        <div className="mt-12 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-coral text-ink font-bold uppercase tracking-widest text-xs animate-pop">
          🌴 Target Hit · Trip is on
        </div>
      )}
    </div>
  );
}

function MarkerLabel({
  pct,
  color,
  label,
  animate,
}: {
  pct: number;
  color: string;
  label: string;
  animate: boolean;
}) {
  return (
    <div
      className="absolute left-3 transition-[bottom] duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        bottom: animate
          ? `calc(${pct * 100}% - 10px)`
          : "0%",
      }}
    >
      <div
        className={`whitespace-nowrap font-display text-[11px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md shadow-md ${color}`}
      >
        {label}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  swatch,
  big,
}: {
  label: string;
  value: string;
  swatch: string;
  big?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`inline-block w-3 h-3 rounded-sm ${swatch}`} />
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-brand-200/70">
          {label}
        </div>
        <div className={`font-display font-bold text-white ${big ? "text-xl" : "text-base"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ["#4FC3C5", "#FF7A59", "#FFC857", "#7DD6D8", "#ffffff"];
  return (
    <div className="pointer-events-none absolute -top-10 inset-x-0 h-[110vh] overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const dur = 3 + Math.random() * 3;
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 8;
        return (
          <span
            key={i}
            className="absolute block animate-confetti"
            style={{
              left: `${left}%`,
              top: "-10vh",
              width: size,
              height: size * 0.4,
              background: color,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
}
