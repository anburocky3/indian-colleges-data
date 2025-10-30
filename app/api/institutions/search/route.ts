import fs from "fs/promises";
import path from "path";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function pickId(inst: unknown) {
  const o = inst as Record<string, unknown>;
  return (
    (o.id as string | undefined) ??
    (o.aicte_id as string | undefined) ??
    (o.institute_id as string | undefined) ??
    (o.other_id as string | undefined) ??
    null
  );
}

function instituteName(inst: unknown) {
  const o = inst as Record<string, unknown>;
  return (
    (o.institute_name as string | undefined) ??
    (o.institute as string | undefined) ??
    (o.name as string | undefined) ??
    null
  );
}

async function readStateFile(stateParam: string) {
  if (!stateParam) return null;
  const candidates = [];
  candidates.push(
    path.join(process.cwd(), "data", "states_enriched", `${stateParam}.json`)
  );
  candidates.push(
    path.join(process.cwd(), "data", "states", `${stateParam}.json`)
  );
  const slug = slugify(stateParam);
  candidates.push(
    path.join(process.cwd(), "data", "states_enriched", `${slug}.json`)
  );
  candidates.push(path.join(process.cwd(), "data", "states", `${slug}.json`));

  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw || "[]");
    } catch {
      // try next
    }
  }
  return null;
}

async function readAllInstitutions() {
  const p = path.join(process.cwd(), "data", "institutions.json");
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const state = url.searchParams.get("state") || "";
  const page = Math.max(
    1,
    parseInt(url.searchParams.get("page") || "1", 10) || 1
  );
  const limitRaw = parseInt(url.searchParams.get("limit") || "25", 10) || 25;
  const limit = Math.min(200, Math.max(1, limitRaw));

  // load data: prefer state file when state provided
  let data: unknown[] = [];
  if (state) {
    const arr = await readStateFile(state);
    if (arr) data = arr;
  }
  if (!data || data.length === 0) {
    data = await readAllInstitutions();
  }

  // stricter validation: require BOTH state and a query `q` with >= 3 characters
  if (!state) {
    return new Response(
      JSON.stringify({ error: "please provide the 'state' query parameter" }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }
  if (!q || q.length < 3) {
    return new Response(
      JSON.stringify({
        error: "search query 'q' must be provided and be at least 3 characters",
      }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  const ql = q.toLowerCase();

  const filtered = data.filter((inst: unknown) => {
    if (state) {
      const o = inst as Record<string, unknown>;
      const s = ((o.state ?? o.region ?? "") as string)
        .toString()
        .toLowerCase();
      if (!s.includes(state.toLowerCase()) && !s.includes(slugify(state))) {
        return false;
      }
    }
    if (!ql) return true;
    const name = ((instituteName(inst) ?? "") as string)
      .toString()
      .toLowerCase();
    const o = inst as Record<string, unknown>;
    const uni = ((o.university ?? o.affiliated_university ?? "") as string)
      .toString()
      .toLowerCase();
    const district = ((o.district ?? o.city ?? o.taluk ?? "") as string)
      .toString()
      .toLowerCase();
    const address = ((o.address ?? "") as string).toString().toLowerCase();
    if (
      name.includes(ql) ||
      uni.includes(ql) ||
      district.includes(ql) ||
      address.includes(ql)
    )
      return true;
    // search programmes names if present
    if (Array.isArray(o.programmes)) {
      for (const p of o.programmes as unknown[]) {
        const pp = p as Record<string, unknown>;
        const pn = ((pp.programme_name ?? pp.name ?? "") as string)
          .toString()
          .toLowerCase();
        if (pn.includes(ql)) return true;
      }
    }
    return false;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const pageItems = filtered.slice(start, end).map((inst: unknown) => {
    const o = inst as Record<string, unknown>;
    return {
      id: pickId(inst),
      name: instituteName(inst),
      university:
        (o.university as string | undefined) ??
        (o.affiliated_university as string | undefined) ??
        null,
      state: (o.state as string | undefined) ?? null,
      district:
        (o.district as string | undefined) ??
        (o.city as string | undefined) ??
        null,
      programmes_count: Array.isArray(o.programmes)
        ? (o.programmes as unknown[]).length
        : 0,
    };
  });

  const body = { total, page, limit, results: pageItems };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", "X-Data-Source": "local" },
  });
}
