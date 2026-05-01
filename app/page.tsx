import Link from "next/link";
import { readDB } from "@/lib/db";
import { allMemberStats, formatGBPFull, teamStats } from "@/lib/calc";
import { TEAM } from "@/lib/team";
import { Logo } from "@/components/Logo";
import { Barometer } from "@/components/Barometer";
import { MemberCard } from "@/components/MemberCard";
import { RecentFeed } from "@/components/RecentFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const db = await readDB();
  const team = teamStats(db);
  const memberStats = allMemberStats(db);
  const ranked = TEAM.map((m, i) => ({
    member: m,
    stats: memberStats[i],
  })).sort((a, b) => b.stats.confirmed - a.stats.confirmed);

  return (
    <main className="relative min-h-screen">
      <BackgroundDots />

      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <Logo />
        <Link
          href="/admin"
          className="text-xs uppercase tracking-[0.2em] text-brand-200/70 hover:text-white transition"
        >
          Admin →
        </Link>
      </header>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] uppercase tracking-[0.25em] text-brand-200">
          <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
          Live · Team Target Tracker
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-extrabold mt-5 leading-[1.05] text-white">
          Hit <span className="text-brand-300">£100k</span>.
          <br />
          Pack the suncream.
        </h1>
        <p className="mt-4 text-brand-100/80 max-w-2xl mx-auto">
          Every placement nudges the dial. Every member needs{" "}
          <strong className="text-white">{formatGBPFull(db.settings.individualTarget)}</strong> ·
          the team needs{" "}
          <strong className="text-white">{formatGBPFull(db.settings.teamTarget)}</strong> to unlock
          the {db.settings.prizeLabel.toLowerCase()}.
        </p>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="glass-strong rounded-3xl p-8 md:p-12">
          <Barometer
            confirmed={team.confirmed}
            pipeline={team.pipeline}
            interviewValue={team.interviewValue}
            target={db.settings.teamTarget}
            prizeLabel={db.settings.prizeLabel}
          />
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">
              The team
            </div>
            <h2 className="font-display text-3xl font-bold text-white">
              Individual barometers
            </h2>
          </div>
          <div className="text-xs text-brand-200/70 hidden md:block">
            Ranked by confirmed billings · target {formatGBPFull(db.settings.individualTarget)}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranked.map((row, i) => (
            <MemberCard
              key={row.member.id}
              member={row.member}
              stats={row.stats}
              target={db.settings.individualTarget}
              rank={i + 1}
            />
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            Latest activity
          </h2>
          <RecentFeed entries={db.entries} />
        </div>
        <aside className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70 mb-2">
              Team rollup
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Confirmed" value={formatGBPFull(team.confirmed)} accent />
              <Row label="Pipeline / Interviews" value={formatGBPFull(team.pipeline)} />
              <Row label="Hot Vacancies value" value={formatGBPFull(team.interviewValue)} />
              <Row label="Hot vacancies open" value={`${team.interviews}`} />
              <hr className="border-white/10 my-2" />
              <Row
                label="Gap to target"
                value={formatGBPFull(Math.max(db.settings.teamTarget - team.confirmed, 0))}
                accent
              />
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-gradient-to-br from-coral to-sun text-ink">
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-2">
              The prize
            </div>
            <div className="font-display text-2xl font-extrabold leading-tight">
              {db.settings.prizeLabel}
            </div>
            <p className="mt-2 text-sm/relaxed text-ink/80">
              Hit £100k as a team and we&apos;re booking the trip. Every deal counts.
            </p>
          </div>
        </aside>
      </section>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 pb-10 text-xs text-brand-200/50 flex items-center justify-between">
        <span>© WhoFoundWho · Built for the squad</span>
        <Link href="/admin" className="hover:text-white">Admin</Link>
      </footer>
    </main>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-brand-200/70">{label}</span>
      <span className={`font-semibold ${accent ? "text-white" : "text-brand-100"}`}>
        {value}
      </span>
    </div>
  );
}

function BackgroundDots() {
  return (
    <>
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-coral/10 blur-3xl pointer-events-none" />
    </>
  );
}
