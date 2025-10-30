import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const STATES_DIR = path.join(DATA_DIR, "states");
const OUTPUT_FILE = path.join(DATA_DIR, "institutions-with-programmes.json");
const FAILURES_FILE = path.join(DATA_DIR, "_state_merge_failures.json");
const PROGRESS_FILE = path.join(DATA_DIR, "_state_merge_progress.json");

type Programme = Record<string, unknown>;

interface GetProgrammesResult {
  programmes: Programme[];
  meta: { state?: string; university?: string };
}

async function getProgrammesForInstitution(
  institutionId: string,
  courseId = "1",
  year = "2025-2026"
): Promise<GetProgrammesResult> {
  const url = `https://facilities.aicte-india.org/dashboard/pages/php/approvedcourse.php?method=fetchdata&aicteid=${encodeURIComponent(
    institutionId
  )}&course=/${courseId}/&year=/${year}/`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(
      `upstream failed for ${institutionId}: ${res.status} ${res.statusText}`
    );
    return { programmes: [], meta: {} };
  }
  let data: unknown = await res.json();

  // if rows are arrays, map to objects using defaults
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    Array.isArray((data as unknown[])[0])
  ) {
    const defaultFields = [
      "aicte_id",
      "institute_name",
      "state",
      "programme",
      "university",
      "level",
      "course",
      "course_type",
      "shift",
      "availability",
      "intake",
      "enrollment",
      "placement",
    ];
    const rows = data as unknown as Array<Array<unknown>>;
    data = rows.map((row) => {
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < row.length; i++) {
        const key = defaultFields[i] ?? `col_${i}`;
        obj[key] = row[i] === undefined ? null : row[i];
      }
      return obj;
    });
  }

  const programmesRaw =
    (data as unknown as Array<Record<string, unknown>>) || [];
  let metaState: string | undefined;
  let metaUniversity: string | undefined;
  const programmes: Programme[] = programmesRaw.map((p) => {
    const copy: Record<string, unknown> = { ...(p ?? {}) };
    if (!metaState && typeof copy.state === "string" && copy.state)
      metaState = String(copy.state);
    if (
      !metaUniversity &&
      typeof copy.university === "string" &&
      copy.university
    )
      metaUniversity = String(copy.university);
    delete copy.aicte_id;
    delete copy.institute_name;
    delete copy.state;
    delete copy.university;
    return copy;
  });

  return { programmes, meta: { state: metaState, university: metaUniversity } };
}

function getPrimaryId(inst: Record<string, unknown>) {
  if (inst.id) return String(inst.id);
  if (inst.aicte_id) return String(inst.aicte_id);
  if (inst.other_id) return String(inst.other_id);
  if (inst.other && typeof inst.other === "string") return inst.other as string;
  return undefined;
}

async function main() {
  const files = (await fs.readdir(STATES_DIR)).filter((f) =>
    f.endsWith(".json")
  );
  console.log(`Found ${files.length} state files`);

  const CONCURRENCY = Number(process.env.MERGE_CONCURRENCY) || 8;
  const RETRIES = Number(process.env.MERGE_RETRIES) || 2;
  const RETRY_BASE_MS = Number(process.env.RETRY_BASE_MS) || 300;

  const failedIds: string[] = [];
  const combined: Record<string, unknown>[] = [];

  // ensure enriched output directory exists (don't overwrite original state files)
  try {
    await fs.mkdir(STATES_DIR, { recursive: true });
  } catch {}

  for (const file of files) {
    const p = path.join(STATES_DIR, file);
    console.log(`Processing state file: ${file}`);
    let arr: Record<string, unknown>[] = [];
    try {
      const raw = await fs.readFile(p, "utf-8");
      const parsed = JSON.parse(raw);
      arr = Array.isArray(parsed) ? parsed : parsed?.data ?? [];
      if (!Array.isArray(arr)) arr = [];
    } catch (err) {
      console.warn(`Failed to read ${file}:`, err);
      continue;
    }

    // process in batches
    for (let i = 0; i < arr.length; i += CONCURRENCY) {
      const batch = arr.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async (inst) => {
          const id = getPrimaryId(inst);
          if (!id) return;
          let attempt = 0;
          let ok = false;
          while (attempt <= RETRIES && !ok) {
            try {
              attempt++;
              const res = await getProgrammesForInstitution(id);
              inst.programmes = res.programmes;
              if (res.meta?.state && !inst.state) inst.state = res.meta.state;
              if (res.meta?.university && !inst.university)
                inst.university = res.meta.university;
              ok = true;
            } catch {
              const wait = RETRY_BASE_MS * Math.pow(2, attempt - 1);
              console.warn(
                `Attempt ${attempt} failed for ${id}, retrying in ${wait}ms`
              );
              await new Promise((r) => setTimeout(r, wait));
            }
          }
          if (!ok) {
            failedIds.push(id);
          }
        })
      );
      // write progress checkpoint
      try {
        await fs.writeFile(
          PROGRESS_FILE,
          JSON.stringify(
            { file, processed: Math.min(i + CONCURRENCY, arr.length) },
            null,
            2
          ),
          "utf-8"
        );
      } catch {}
    }

    // after enriching, write the enriched state file to the new folder (keep originals)
    const enrichedPath = path.join(STATES_DIR, file);
    try {
      await fs.writeFile(enrichedPath, JSON.stringify(arr, null, 2), "utf-8");
      console.log(
        `Wrote enriched state file: ${enrichedPath} (${arr.length} institutes)`
      );
    } catch (e) {
      console.warn(`Failed to write enriched file ${enrichedPath}:`, e);
    }

    // append to combined
    combined.push(...arr);
  }

  // write combined merged output
  try {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(combined, null, 2), "utf-8");
    console.log(
      `Wrote combined merged output: ${OUTPUT_FILE} (${combined.length} records)`
    );
  } catch (e) {
    console.warn("Failed to write combined output:", e);
  }

  if (failedIds.length > 0) {
    try {
      await fs.writeFile(
        FAILURES_FILE,
        JSON.stringify(Array.from(new Set(failedIds)), null, 2),
        "utf-8"
      );
      console.log(
        `Completed with ${failedIds.length} failures. See ${FAILURES_FILE}`
      );
    } catch (e) {
      console.warn("Failed to write failures file:", e);
    }
  } else {
    try {
      await fs.rm(FAILURES_FILE);
    } catch {}
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
