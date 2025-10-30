import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const STATES_DIR = path.join(DATA_DIR, "states");
const FALLBACK_STATES_DIR = path.join(DATA_DIR, "states");

function matchesId(inst: Record<string, unknown>, id: string) {
  const candidates = [inst.id, inst.aicte_id, inst.other_id, inst.other];
  for (const c of candidates) {
    if (!c) continue;
    if (String(c) === id) return true;
    if (String(c).toLowerCase() === id.toLowerCase()) return true;
  }
  return false;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ state: string; aicteid: string }> }
) {
  const { state, aicteid } = await params;
  const slug = encodeURIComponent(state.toLowerCase().replace(/\s+/g, "-"));

  console.log(
    `Fetching programmes for institute ID ${aicteid} in state ${state}`
  );

  const tryPaths = [
    path.join(STATES_DIR, `${slug}.json`),
    path.join(FALLBACK_STATES_DIR, `${slug}.json`),
  ];

  for (const p of tryPaths) {
    try {
      const raw = await fs.readFile(p, "utf-8");
      const parsed = JSON.parse(raw);
      const arr: Array<Record<string, unknown>> = Array.isArray(parsed)
        ? parsed
        : parsed?.data ?? [];

      for (const inst of arr) {
        if (matchesId(inst, aicteid)) {
          const programmes = (inst.programmes as unknown) ?? [];
          const name = (inst.institute_name ??
            inst.institute ??
            inst.institute_name) as string | undefined;
          const university = (inst.university ?? inst.affiliated_university) as
            | string
            | undefined;
          const district = inst.district as string | undefined;
          const stateVal = (inst.state ?? inst.region ?? state) as
            | string
            | undefined;
          const address = inst.address as Array<string> | undefined;

          return new Response(
            JSON.stringify({
              source: "local",
              id: aicteid,
              name: name ?? null,
              university: university ?? null,
              state: stateVal ?? null,
              district: district ?? null,
              address: address ?? null,
              programmes,
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
      }
    } catch {
      // try next path
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
}
