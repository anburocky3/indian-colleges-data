#!/usr/bin/env node
/*
  download-all-states.js
  - Fetches institute lists from AICTE per state and writes one file per state under data/
  - Shows progress for each state (start/success/failure)
  - Retries with backoff on failure
  - After downloading all states, writes data/institutions.json by merging per-state files

  Usage:
    node --experimental-fetch scripts/download-all-states.js
    # optional env vars:
    #   DOWNLOAD_CONCURRENCY (default 2)
    #   DOWNLOAD_RETRIES (default 3)
    #   YEAR (default 2025-2026)
    #   COURSE (default 1)
*/

import fs from "fs/promises";
import path from "path";

export const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Orissa",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const DATA_DIR = path.join(process.cwd(), "data", "states");
const TARGET_BASE =
  "https://facilities.aicte-india.org/dashboard/pages/php/approvedinstituteserver.php";

const DEFAULT_CONCURRENCY = Number(process.env.DOWNLOAD_CONCURRENCY) || 2;
const DEFAULT_RETRIES = Number(process.env.DOWNLOAD_RETRIES) || 3;
const YEAR = process.env.YEAR || "2025-2026";
const COURSE = process.env.COURSE || "1";

function slug(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function fetchWithRetries(
  url: string,
  opts: RequestInit = {},
  retries = DEFAULT_RETRIES
): Promise<Response> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(t);
      return res as Response;
    } catch (e) {
      attempt++;
      if (attempt > retries) throw e;
      const backoff = 500 * Math.pow(2, attempt);
      console.warn(
        `fetch attempt ${attempt} failed for ${url}: ${String(
          e
        )}; retrying in ${backoff}ms`
      );
      await wait(backoff);
    }
  }
  throw new Error(`fetchWithRetries: exhausted retries for ${url}`);
}

type DownloadResult = {
  state: string;
  ok: boolean;
  reason?: string;
  count?: number;
  file?: string;
};

async function downloadState(state: string): Promise<DownloadResult> {
  const slugName = slug(state);
  const outFile = path.join(DATA_DIR, `${slugName}.json`);
  const params = new URLSearchParams({
    method: "fetchdata",
    year: YEAR,
    program: "1",
    level: "1",
    institutiontype: "1",
    Women: "1",
    Minority: "1",
    state,
    course: COURSE,
  });
  const url = `${TARGET_BASE}?${params.toString()}`;

  console.log(`[${state}] starting`);
  try {
    const res = await fetchWithRetries(url, {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "x-requested-with": "XMLHttpRequest",
      },
    });
    const text = await res.text();
    // Try parse JSON; if rows-of-arrays convert to objects using defaults
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // upstream returned HTML or blocked us
      await fs.writeFile(
        outFile,
        JSON.stringify({ error: "non-json", raw: text }, null, 2)
      );
      console.error(`[${state}] non-json response saved to ${outFile}`);
      return { state, ok: false, reason: "non-json" };
    }

    // transform rows if needed
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      Array.isArray(parsed[0])
    ) {
      const defaultFields = [
        "aicte_id",
        "institute_name",
        "address",
        "district",
        "institution_type",
        "women",
        "minority",
        "other_id",
      ];
      const rows = parsed;
      const transformed = rows.map((row) => {
        const obj: Record<string, unknown> = {};
        for (let i = 0; i < row.length; i++) {
          const key = (defaultFields[i] ?? `col_${i}`) as string;
          obj[key] = row[i] as unknown;
        }
        return obj;
      });
      await fs.writeFile(outFile, JSON.stringify(transformed, null, 2));
      console.log(
        `[${state}] saved ${transformed.length} records -> ${outFile}`
      );
      return { state, ok: true, count: transformed.length, file: outFile };
    }

    // array of objects or single object
    if (Array.isArray(parsed)) {
      await fs.writeFile(outFile, JSON.stringify(parsed, null, 2));
      console.log(`[${state}] saved ${parsed.length} records -> ${outFile}`);
      return { state, ok: true, count: parsed.length, file: outFile };
    }

    // single object
    await fs.writeFile(outFile, JSON.stringify(parsed, null, 2));
    console.log(`[${state}] saved 1 object -> ${outFile}`);
    return { state, ok: true, count: 1, file: outFile };
  } catch (e) {
    console.error(`[${state}] failed: ${String(e)}`);
    return { state, ok: false, reason: String(e) };
  }
}

async function mergeStateFiles() {
  const files = await fs.readdir(DATA_DIR);
  const stateFiles = files.filter((f) => f.endsWith(".json"));
  const combined: Array<Record<string, unknown>> = [];
  for (const f of stateFiles) {
    try {
      const text = await fs.readFile(path.join(DATA_DIR, f), "utf8");
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) combined.push(...parsed);
      else if (parsed && parsed.error) {
        // skip
      } else if (parsed && typeof parsed === "object") combined.push(parsed);
    } catch (e) {
      console.warn("Failed to read/parse", f, e);
    }
  }
  // Write merged output to the repository root `data` folder so it's the
  // canonical institutions.json used by the app. DATA_DIR is `data/states`.
  const OUT_ROOT = path.join(process.cwd(), 'data');
  const out = path.join(OUT_ROOT, 'institutions.json');
  await fs.writeFile(out, JSON.stringify(combined, null, 2));
  console.log(`Merged ${combined.length} records into ${out}`);
  try {
    const st = await fs.stat(out);
    const meta = {
      last_grabbed: st.mtime.toISOString(),
      records: combined.length,
    };
    await fs.writeFile(path.join(OUT_ROOT, 'institutions.meta.json'), JSON.stringify(meta, null, 2));
    console.log('Wrote meta file institutions.meta.json');
  } catch (e) {
    console.warn('Failed to write institutions.meta.json', e);
  }
}

async function main() {
  await ensureDataDir();
  const concurrency = DEFAULT_CONCURRENCY;
  const queue: string[] = [...STATES];
  const results: DownloadResult[] = [];

  const workers = Array.from({ length: concurrency }).map(async () => {
    while (queue.length) {
      const st = queue.shift();
      if (!st) break;
      const res = await downloadState(st);
      results.push(res);
      // small pause to be polite
      await wait(300);
    }
  });

  await Promise.all(workers);

  // write failures file only if there are failures
  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    await fs.writeFile(
      path.join(DATA_DIR, "_download_failures.json"),
      JSON.stringify(failures, null, 2)
    );
    console.log("Download complete. Failures:", failures.length);
  } else {
    console.log("Download complete. No failures.");
  }

  // merge
  await mergeStateFiles();
}

main().catch((e) => {
  console.error("download-all-states failed:", e);
  process.exit(1);
});
