import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { DB, Entry } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const REDIS_KEY = "barometer:db";

const DEFAULT_DB: DB = {
  entries: [],
  settings: {
    individualTarget: 20000,
    teamTarget: 100000,
    prizeLabel: "Summer Team Trip Away",
    deadline: "",
  },
};

function redisUrl(): string | undefined {
  return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
}

function redisToken(): string | undefined {
  return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
}

const useRedis = Boolean(redisUrl() && redisToken());

let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({ url: redisUrl()!, token: redisToken()! });
  }
  return _redis;
}

function normalize(parsed: Partial<DB> | null | undefined): DB {
  return {
    entries: parsed?.entries ?? [],
    settings: { ...DEFAULT_DB.settings, ...(parsed?.settings ?? {}) },
  };
}

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
  }
}

export async function readDB(): Promise<DB> {
  if (useRedis) {
    const data = await getRedis().get<DB>(REDIS_KEY);
    return normalize(data);
  }
  await ensureFile();
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return normalize(JSON.parse(raw) as Partial<DB>);
  } catch {
    return { ...DEFAULT_DB };
  }
}

export async function writeDB(db: DB): Promise<void> {
  if (useRedis) {
    await getRedis().set(REDIS_KEY, db);
    return;
  }
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
