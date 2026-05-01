import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addEntry, deleteEntry, readDB, updateEntry } from "@/lib/db";
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

  const splitId =
    typeof body.splitId === "string" && body.splitId.trim()
      ? body.splitId.trim()
      : undefined;

  const entry: Entry = {
    id: randomUUID(),
    memberId,
    type,
    value,
    description,
    date,
    createdAt: new Date().toISOString(),
    ...(splitId ? { splitId } : {}),
  };
  const db = await addEntry(entry);
  return NextResponse.json({ ok: true, entry, db });
}

export async function PATCH(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<Entry> & { id?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  const patch: Partial<Entry> = {};
  if (body.memberId !== undefined) {
    const m = String(body.memberId).trim();
    if (!memberById(m)) {
      return NextResponse.json({ ok: false, error: "Unknown team member" }, { status: 400 });
    }
    patch.memberId = m;
  }
  if (body.type !== undefined) {
    if (!VALID_TYPES.includes(body.type as EntryType)) {
      return NextResponse.json({ ok: false, error: "Invalid type" }, { status: 400 });
    }
    patch.type = body.type as EntryType;
  }
  if (body.value !== undefined) {
    const v = Number(body.value);
    if (!Number.isFinite(v) || v < 0) {
      return NextResponse.json({ ok: false, error: "Invalid value" }, { status: 400 });
    }
    patch.value = v;
  }
  if (body.description !== undefined) {
    patch.description = String(body.description);
  }
  if (body.date !== undefined) {
    patch.date = String(body.date);
  }

  const db = await updateEntry(id, patch);
  return NextResponse.json({ ok: true, db });
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
