import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { updateSettings } from "@/lib/db";

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const next: Record<string, unknown> = {};
  if (typeof body.individualTarget === "number" && body.individualTarget >= 0) {
    next.individualTarget = body.individualTarget;
  }
  if (typeof body.teamTarget === "number" && body.teamTarget >= 0) {
    next.teamTarget = body.teamTarget;
  }
  if (typeof body.prizeLabel === "string") {
    next.prizeLabel = body.prizeLabel.slice(0, 120);
  }
  if (typeof body.deadline === "string") {
    next.deadline = body.deadline.slice(0, 32);
  }
  const db = await updateSettings(next);
  return NextResponse.json({ ok: true, db });
}
