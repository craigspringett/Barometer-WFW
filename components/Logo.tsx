export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-[0_0_20px_rgba(79,195,197,0.5)]">
        <svg viewBox="0 0 32 32" className="h-6 w-6 text-ink" fill="currentColor">
          <circle cx="11" cy="13" r="5" />
          <circle cx="21" cy="13" r="5" />
          <path d="M3 27c1.5-4 5-6 8-6s6.5 2 8 6z" />
          <path d="M13 27c1.5-4 5-6 8-6s6.5 2 8 6z" opacity="0.7" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg font-bold tracking-tight">
          Who<span className="text-brand-300">Found</span>Who
        </div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
          Sales Barometer
        </div>
      </div>
    </div>
  );
}
