import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addEntry, deleteEntry, readDB } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { memberById } from "@/lib/team";
import type { Entry, EntryType } from "@/lib/types";

const VALID_TYPES: EntryType[] = ["placement", "pipeline", "interview"];

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db);
}

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<Entry> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const memberId = String(body.memberId ?? "").trim();
  const type = body.type as EntryType;
  const value = Number(body.value ?? 0);
  const description = String(body.description ?? "").trim();
  const date = String(body.date ?? new Date().toISOString().slice(0, 10));

  if (!memberById(memberId)) {
    return NextResponse.json({ ok: false, error: "Unknown team member" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ ok: false, error: "Invalid type" }, { status: 400 });
  }
  if (!Number.isFinite(value) || value < 0) {
    return NextResponse.json({ ok: false, error: "Invalid value" }, { status: 400 });
  }

  const entry: Entry = {
    id: randomUUID(),
    memberId,
    type,
    value,
    description,
    date,
    createdAt: new Date().toISOString(),
  };
  const db = await addEntry(entry);
  return NextResponse.json({ ok: true, entry, db });
}

export async function DELETE(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  const db = await deleteEntry(id);
  return NextResponse.json({ ok: true, db });
}
