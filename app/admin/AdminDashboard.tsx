"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DB, Entry, EntryType, TeamMember } from "@/lib/types";
import { TEAM, memberById } from "@/lib/team";
import { Logo } from "@/components/Logo";
import { TeamAvatar } from "@/components/TeamAvatar";
import { allMemberStats, formatGBPFull, teamStats } from "@/lib/calc";

const TYPE_META: Record<
  EntryType,
  { label: string; helper: string; chip: string }
> = {
  placement: {
    label: "Confirmed Placement",
    helper: "Counts toward target.",
    chip: "bg-brand-500 text-ink",
  },
  pipeline: {
    label: "Pipeline / Interviews",
    helper: "Pipeline deals and interviews in progress.",
    chip: "bg-brand-200/30 text-brand-100 border border-brand-200/40",
  },
  interview: {
    label: "Hot Vacancies",
    helper: "Live vacancies you're working — fee value optional.",
    chip: "bg-coral/80 text-ink",
  },
};

const STAGE_LABEL: Record<EntryType, string> = {
  interview: "Hot Vacancy",
  pipeline: "Interview",
  placement: "Placement",
};

export function AdminDashboard({ initialDb }: { initialDb: DB }) {
  const router = useRouter();
  const [db, setDb] = useState<DB>(initialDb);
  const [tab, setTab] = useState<EntryType>("placement");
  const [memberId, setMemberId] = useState<string>(TEAM[0].id);
  const [value, setValue] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [conversionTarget, setConversionTarget] = useState<EntryType | null>(null);
  const [split, setSplit] = useState(false);
  const [secondMemberId, setSecondMemberId] = useState<string>("");

  function resetForm() {
    setEditingId(null);
    setConversionTarget(null);
    setValue("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setMemberId(TEAM[0].id);
    setSplit(false);
    setSecondMemberId("");
    setError(null);
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setConversionTarget(null);
    setTab(entry.type);
    setMemberId(entry.memberId);
    setValue(String(entry.value ?? ""));
    setDescription(entry.description ?? "");
    setDate(entry.date ?? new Date().toISOString().slice(0, 10));
    setSplit(false);
    setSecondMemberId("");
    setError(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function convertTo(entry: Entry, target: EntryType) {
    setEditingId(entry.id);
    setConversionTarget(target);
    setTab(target);
    setMemberId(entry.memberId);
    setValue(entry.value ? String(entry.value) : "");
    setDescription(entry.description ?? "");
    setDate(new Date().toISOString().slice(0, 10));
    setSplit(false);
    setSecondMemberId("");
    setError(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function splitPartner(entry: Entry): TeamMember | null {
    if (!entry.splitId) return null;
    const other = db.entries.find(
      (e) => e.splitId === entry.splitId && e.id !== entry.id
    );
    if (!other) return null;
    return memberById(other.memberId) ?? null;
  }

  const team = useMemo(() => teamStats(db), [db]);
  const memberStats = useMemo(() => allMemberStats(db), [db]);
  const filtered = useMemo(
    () => db.entries.filter((e) => e.type === tab),
    [db.entries, tab]
  );

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  async function submitEntry(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (editingId) {
        const original = db.entries.find((x) => x.id === editingId);
        const partner =
          original?.splitId
            ? db.entries.find(
                (x) => x.splitId === original.splitId && x.id !== editingId
              )
            : null;

        const enteredTotal = Number(value || 0);
        const convertingToSplit = !partner && split && !!secondMemberId;

        if (convertingToSplit && secondMemberId === memberId) {
          throw new Error("Pick a different second consultant for the split");
        }

        const willBeSplit = !!partner || convertingToSplit;
        const half = willBeSplit
          ? Math.round((enteredTotal / 2) * 100) / 100
          : enteredTotal;
        const newSplitId = convertingToSplit ? crypto.randomUUID() : undefined;

        const meBody: Record<string, unknown> = {
          id: editingId,
          memberId,
          type: tab,
          value:
            (conversionTarget && partner) || convertingToSplit
              ? half
              : partner
              ? half
              : enteredTotal,
          description,
          date,
        };
        if (convertingToSplit) meBody.splitId = newSplitId;

        const meRes = await fetch("/api/entries", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(meBody),
        });
        const meJson = await meRes.json();
        if (!meRes.ok) throw new Error(meJson.error || "Failed");
        let latest: DB = meJson.db;

        if (conversionTarget && partner) {
          const partRes = await fetch("/api/entries", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              id: partner.id,
              type: conversionTarget,
              value: half,
              description,
              date,
            }),
          });
          const partJson = await partRes.json();
          if (!partRes.ok) throw new Error(partJson.error || "Partner update failed");
          latest = partJson.db;
        } else if (convertingToSplit) {
          const partRes = await fetch("/api/entries", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              memberId: secondMemberId,
              type: tab,
              value: half,
              description,
              date,
              splitId: newSplitId,
            }),
          });
          const partJson = await partRes.json();
          if (!partRes.ok) throw new Error(partJson.error || "Failed to add partner");
          latest = partJson.db;
        }

        setDb(latest);
        resetForm();
        return;
      }

      const total = Number(value || 0);
      if (split) {
        if (!secondMemberId || secondMemberId === memberId) {
          throw new Error("Pick a different second consultant for the split");
        }
        const half = Math.round((total / 2) * 100) / 100;
        const splitId = crypto.randomUUID();
        const base = { type: tab, description, date, splitId };
        let latest: DB | null = null;
        for (const m of [memberId, secondMemberId]) {
          const res = await fetch("/api/entries", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...base, memberId: m, value: half }),
          });
          const j = await res.json();
          if (!res.ok) throw new Error(j.error || "Failed");
          latest = j.db;
        }
        if (latest) setDb(latest);
        resetForm();
        return;
      }

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          memberId,
          type: tab,
          value: total,
          description,
          date,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setDb(j.db);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry(id: string) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/entries?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const j = await res.json();
    if (j.ok) setDb(j.db);
  }

  async function saveSettings(next: Partial<DB["settings"]>) {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    const j = await res.json();
    if (j.ok) setDb(j.db);
  }

  return (
    <main className="relative min-h-screen">
      <header className="max-w-7xl mx-auto w-full px-6 pt-8 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-brand-200/70 hover:text-white"
          >
            View barometer →
          </Link>
          <button
            onClick={logout}
            className="text-xs uppercase tracking-[0.2em] text-brand-200/70 hover:text-coral"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 mt-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
          Admin Dashboard
        </h1>
        <p className="text-brand-200/70 mt-1">
          Add deals, pipeline and interviews — the barometer updates instantly.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 mt-6 grid lg:grid-cols-4 gap-4">
        <Stat label="Confirmed" value={formatGBPFull(team.confirmed)} accent />
        <Stat label="Pipeline / Interviews" value={formatGBPFull(team.pipeline)} />
        <Stat label="Hot Vacancies value" value={formatGBPFull(team.interviewValue)} />
        <Stat
          label="Gap to team target"
          value={formatGBPFull(Math.max(db.settings.teamTarget - team.confirmed, 0))}
        />
      </section>

      <section className="max-w-7xl mx-auto px-6 mt-8 grid lg:grid-cols-3 gap-6">
        {/* Add entry form */}
        <div className="lg:col-span-2 glass-strong rounded-2xl p-6">
          <div className="flex flex-wrap gap-2 mb-5 items-center">
            {(Object.keys(TYPE_META) as EntryType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold transition ${
                  tab === t
                    ? TYPE_META[t].chip
                    : "bg-white/5 text-brand-200/70 hover:bg-white/10"
                }`}
              >
                {TYPE_META[t].label}
              </button>
            ))}
            {editingId && !conversionTarget && (
              <span className="ml-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral/20 border border-coral/40 text-coral text-[11px] uppercase tracking-widest font-bold">
                Editing entry
              </span>
            )}
            {conversionTarget && (() => {
              const orig = db.entries.find((x) => x.id === editingId);
              const partner =
                orig?.splitId
                  ? db.entries.find(
                      (x) => x.splitId === orig.splitId && x.id !== editingId
                    )
                  : null;
              const partnerMember = partner
                ? memberById(partner.memberId)
                : null;
              const sourceLabel = orig ? STAGE_LABEL[orig.type] : "";
              const targetLabel = STAGE_LABEL[conversionTarget];
              const emoji = conversionTarget === "placement" ? "🎉 " : "➜ ";
              return (
                <span className="ml-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500 text-ink text-[11px] uppercase tracking-widest font-bold">
                  {emoji}Converting {sourceLabel} → {targetLabel}
                  {partnerMember && ` (split with ${partnerMember.firstName})`}
                </span>
              );
            })()}
          </div>
          <p className="text-sm text-brand-200/70 mb-4">{TYPE_META[tab].helper}</p>

          <form onSubmit={submitEntry} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
                Team member
              </label>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {TEAM.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMemberId(m.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
                      memberId === m.id
                        ? "bg-brand-500/20 ring-2 ring-brand-400"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <TeamAvatar member={m} size={42} ring={false} />
                    <span className="text-[10px] text-white">{m.firstName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-1 space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
                  {conversionTarget && (() => {
                    const orig = db.entries.find((x) => x.id === editingId);
                    return orig?.splitId ? "Total fee (£)" : "Value (£)";
                  })()}
                  {!conversionTarget && "Value (£)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required={tab !== "interview"}
                  placeholder={tab === "interview" ? "Optional" : "e.g. 9214.53"}
                  className="mt-1 w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-brand-400 outline-none text-white"
                />
                {conversionTarget && Number(value) > 0 && (() => {
                  const orig = db.entries.find((x) => x.id === editingId);
                  if (!orig?.splitId) return null;
                  return (
                    <div className="mt-1 text-[11px] text-brand-200">
                      Each consultant gets {formatGBPFull(Number(value) / 2)}
                    </div>
                  );
                })()}
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-brand-400 outline-none text-white"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  tab === "placement"
                    ? "Senior Dev — AcmeCo"
                    : tab === "pipeline"
                    ? "Final stage / interview — BetaCorp"
                    : "Live vacancy — Senior Engineer, GammaCo"
                }
                className="mt-1 w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-brand-400 outline-none text-white"
              />
            </div>

            {(() => {
              const orig = editingId
                ? db.entries.find((x) => x.id === editingId)
                : null;
              const existingPartner = orig?.splitId
                ? memberById(
                    db.entries.find(
                      (x) => x.splitId === orig.splitId && x.id !== editingId
                    )?.memberId ?? ""
                  )
                : null;

              if (existingPartner) {
                return (
                  <div className="md:col-span-2 rounded-xl border border-coral/30 bg-coral/10 p-4 text-sm text-coral">
                    Already split 50/50 with <strong>{existingPartner.firstName}</strong>.
                    Editing here only changes this side — edit {existingPartner.firstName}&apos;s entry separately if needed.
                  </div>
                );
              }

              return (
                <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={split}
                      onChange={(e) => {
                        setSplit(e.target.checked);
                        if (!e.target.checked) setSecondMemberId("");
                      }}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <span className="text-sm font-semibold text-white">
                      Split this 50/50 with another consultant
                    </span>
                    {split && (
                      <span className="ml-auto text-[11px] uppercase tracking-widest text-brand-200">
                        {Number(value) > 0
                          ? `Each gets ${formatGBPFull(Number(value) / 2)}`
                          : "Both consultants credited"}
                      </span>
                    )}
                  </label>

                  {split && (
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70 mb-2">
                        Second consultant
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {TEAM.filter((m) => m.id !== memberId).map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSecondMemberId(m.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
                              secondMemberId === m.id
                                ? "bg-coral/20 ring-2 ring-coral"
                                : "bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <TeamAvatar member={m} size={36} ring={false} />
                            <span className="text-[10px] text-white">{m.firstName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {error && (
              <div className="md:col-span-2 text-sm text-coral bg-coral/10 border border-coral/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition text-white font-bold uppercase tracking-widest text-sm"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={busy}
                className="px-6 py-3 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 transition text-ink font-bold uppercase tracking-widest text-sm"
              >
                {busy
                  ? editingId ? "Saving…" : "Adding…"
                  : conversionTarget
                  ? `Move to ${STAGE_LABEL[conversionTarget]}`
                  : editingId ? "Save changes" : `Add ${TYPE_META[tab].label}`}
              </button>
            </div>
          </form>

          <hr className="border-white/10 my-6" />

          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70 mb-2">
              {TYPE_META[tab].label}s · {filtered.length}
            </div>
            {filtered.length === 0 && (
              <div className="text-sm text-brand-200/60 py-6 text-center">
                Nothing logged yet.
              </div>
            )}
            {filtered.map((e) => {
              const m = memberById(e.memberId);
              const isEditing = editingId === e.id;
              const partner = splitPartner(e);
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition ${
                    isEditing ? "bg-coral/15 ring-1 ring-coral/40" : "bg-white/5"
                  }`}
                >
                  {m && <TeamAvatar member={m} size={36} ring={false} />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate flex items-center gap-2 flex-wrap">
                      <span>{m?.firstName ?? "—"}</span>
                      {partner && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold rounded-full px-2 py-0.5 bg-coral/20 text-coral border border-coral/40">
                          50/50 with {partner.firstName}
                        </span>
                      )}
                      <span className="text-brand-200/70 font-normal truncate">
                        {e.description || "—"}
                      </span>
                    </div>
                    <div className="text-[11px] text-brand-200/60">
                      {new Date(e.date).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <div className="font-display font-bold text-white">
                    {formatGBPFull(e.value)}
                  </div>
                  {e.type === "interview" && (
                    <button
                      onClick={() => convertTo(e, "pipeline")}
                      className="text-[11px] uppercase tracking-widest font-bold text-brand-100 bg-brand-500/20 hover:bg-brand-500/30 border border-brand-400/40 rounded-lg px-3 py-1.5"
                      title="Interview booked — move to Pipeline / Interviews"
                    >
                      → Interview
                    </button>
                  )}
                  {(e.type === "interview" || e.type === "pipeline") && (
                    <button
                      onClick={() => convertTo(e, "placement")}
                      className="text-[11px] uppercase tracking-widest font-bold text-ink bg-brand-500 hover:bg-brand-400 rounded-lg px-3 py-1.5"
                      title="Candidate placed — convert to placement"
                    >
                      ✓ Placed
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(e)}
                    className="text-[11px] uppercase tracking-widest font-bold text-brand-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeEntry(e.id)}
                    className="text-xs text-brand-200/60 hover:text-coral px-2"
                    aria-label="Delete"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: per-member + settings */}
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-6">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70 mb-3">
              Per-member confirmed
            </div>
            <div className="space-y-3">
              {TEAM.map((m, i) => {
                const s = memberStats[i];
                const pct = Math.min(s.pctConfirmed, 1);
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <TeamAvatar member={m} size={36} ring={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="text-white truncate">{m.firstName}</span>
                        <span className="text-brand-100">
                          {formatGBPFull(s.confirmed)}
                        </span>
                      </div>
                      <div className="h-1.5 mt-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full mercury"
                          style={{ width: `${pct * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <SettingsPanel db={db} onSave={saveSettings} />
        </div>
      </section>

      <div className="h-16" />
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`glass rounded-2xl p-5 ${accent ? "ring-1 ring-brand-400/40" : ""}`}>
      <div className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
        {label}
      </div>
      <div className="font-display text-2xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}

function SettingsPanel({
  db,
  onSave,
}: {
  db: DB;
  onSave: (next: Partial<DB["settings"]>) => Promise<void>;
}) {
  const [individual, setIndividual] = useState(String(db.settings.individualTarget));
  const [team, setTeam] = useState(String(db.settings.teamTarget));
  const [prize, setPrize] = useState(db.settings.prizeLabel);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave({
      individualTarget: Number(individual) || 0,
      teamTarget: Number(team) || 0,
      prizeLabel: prize,
    });
    setSaving(false);
  }

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70 mb-3">
        Targets & prize
      </div>
      <div className="space-y-3">
        <Field label="Individual target (£)">
          <input
            type="number"
            value={individual}
            onChange={(e) => setIndividual(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
          />
        </Field>
        <Field label="Team target (£)">
          <input
            type="number"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
          />
        </Field>
        <Field label="Prize">
          <input
            type="text"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
          />
        </Field>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition text-white font-bold uppercase tracking-widest text-xs"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-brand-200/70">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
