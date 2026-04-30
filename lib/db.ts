import { promises as fs } from "fs";
import path from "path";
import type { DB, Entry } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const DEFAULT_DB: DB = {
  entries: [],
  settings: {
    individualTarget: 20000,
    teamTarget: 100000,
    prizeLabel: "Summer Team Trip Away",
    deadline: "",
  },
};

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
  }
}

export async function readDB(): Promise<DB> {
  await ensureFile();
  const raw = await fs.readFile(DB_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      entries: parsed.entries ?? [],
      settings: { ...DEFAULT_DB.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return { ...DEFAULT_DB };
  }
}

export async function writeDB(db: DB): Promise<void> {
  await ensureFile();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function addEntry(entry: Entry): Promise<DB> {
  const db = await readDB();
  db.entries.unshift(entry);
  await writeDB(db);
  return db;
}

export async function deleteEntry(id: string): Promise<DB> {
  const db = await readDB();
  db.entries = db.entries.filter((e) => e.id !== id);
  await writeDB(db);
  return db;
}

export async function updateSettings(settings: Partial<DB["settings"]>): Promise<DB> {
  const db = await readDB();
  db.settings = { ...db.settings, ...settings };
  await writeDB(db);
  return db;
}
