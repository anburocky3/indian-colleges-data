import { NextResponse } from "next/server";
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

const TARGET_BASE =
  "https://facilities.aicte-india.org/dashboard/pages/php/approvedinstituteserver.php";

const DEFAULT_PARAMS: Record<string, string> = {
  method: "fetchdata",
  year: "2025-2026",
  program: "1",
  level: "1",
  institutiontype: "1",
  Women: "1",
  Minority: "1",
  state: "Tamil Nadu",
  course: "1",
};

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    // If you need credentials, change the origin and set this true on both sides
    "Access-Control-Allow-Credentials": "false",
  } as Record<string, string>;
}

export async function OPTIONS() {
  // Reply to preflight with CORS headers
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const incoming = Object.fromEntries(url.searchParams.entries()) as Record<
      string,
      string
    >;

    const onlineFlag =
      incoming.online === "1" ||
      incoming.online === "true" ||
      incoming.online === "yes";

    let payload: unknown;
    let status = 200;

    if (!onlineFlag) {
      // Load offline JSON from data/institutions.json
      const filePath = path.join(process.cwd(), "data", "institutions.json");
      try {
        const text = await fs.readFile(filePath, "utf8");
        try {
          payload = JSON.parse(text);
        } catch {
          payload = { raw: text };
        }
        status = 200;
      } catch (e) {
        return new NextResponse(
          JSON.stringify({
            error: `Failed to read offline data: ${String(e)}`,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              ...corsHeaders(),
            },
          }
        );
      }
    } else {
      // Online: fetch from upstream using merged params
      const merged = { ...DEFAULT_PARAMS, ...incoming };

      const allStatesFlag =
        incoming.allStates === "1" ||
        incoming.allStates === "true" ||
        incoming.allStates === "yes" ||
        String(incoming.states || "").toLowerCase() === "all";

      // If the client requested all states, iterate the `states` list and
      // accumulate results. This keeps the rest of the route simple by
      // returning an array of objects (not rows) so downstream callers get
      // a single merged dataset.
      if (allStatesFlag) {
        const combined: Array<Record<string, unknown>> = [];
        const failures: Array<{ state: string; error: string }> = [];

        // Use a simple sequential fetch to avoid hammering upstream. We could
        // add concurrency later if required.
        for (const st of STATES) {
          const perParams = { ...merged, state: st } as Record<string, string>;
          // remove the allStates flag from params when making upstream calls
          delete perParams.allStates;
          perParams.state = st;

          const params = new URLSearchParams(
            perParams as Record<string, string>
          );
          const targetUrl = `${TARGET_BASE}?${params.toString()}`;

          try {
            const res = await fetch(targetUrl, {
              headers: {
                accept: "application/json, text/javascript, */*; q=0.01",
                "x-requested-with": "XMLHttpRequest",
              },
              cache: "no-store",
            });

            const text = await res.text();

            // Try parse JSON; if it's rows (array-of-arrays) map to objects
            let parsed: unknown;
            try {
              parsed = JSON.parse(text);
            } catch {
              // upstream returned HTML or non-JSON — record and skip
              failures.push({
                state: st,
                error: `non-json response (${text.slice(0, 200)})`,
              });
              continue;
            }

            if (
              Array.isArray(parsed) &&
              parsed.length > 0 &&
              Array.isArray((parsed as Array<unknown>)[0])
            ) {
              // transform rows -> objects using same default as below
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
              const rows = parsed as Array<Array<unknown>>;
              const transformed = rows.map((row) => {
                const obj: Record<string, unknown> = {};
                for (let i = 0; i < row.length; i++) {
                  const key = defaultFields[i] ?? `col_${i}`;
                  obj[key] = row[i];
                }
                return obj;
              });
              combined.push(...transformed);
            } else if (Array.isArray(parsed)) {
              // already array of objects
              combined.push(...(parsed as Array<Record<string, unknown>>));
            } else if (parsed && typeof parsed === "object") {
              // single object -> push
              combined.push(parsed as Record<string, unknown>);
            }
          } catch (e) {
            failures.push({ state: st, error: String(e) });
          }
        }

        payload = { combined, failures };
        status = 200;
      } else {
        const params = new URLSearchParams(merged as Record<string, string>);
        const targetUrl = `${TARGET_BASE}?${params.toString()}`;

        // Server-side fetch - avoids CORS restrictions from the remote site
        const res = await fetch(targetUrl, {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "x-requested-with": "XMLHttpRequest",
          },
          cache: "force-cache",
        });

        const text = await res.text();

        try {
          payload = JSON.parse(text);
        } catch {
          payload = { raw: text };
        }

        status = res.ok ? 200 : 502;
      }
    }

    // If the upstream returned an array of arrays (rows), convert each sub-array
    // into an object. The client can specify a comma-separated `fields` query
    // parameter (e.g. `fields=id,institute,col,district,...`) to control keys.
    // If not provided, a sensible default key list is used.
    // Transform if payload is array of arrays
    if (
      Array.isArray(payload) &&
      payload.length > 0 &&
      Array.isArray((payload as unknown as Array<unknown>)[0])
    ) {
      // read fields from query (client can pass `fields` or `keys`)
      const url = new URL(req.url);
      const incoming = Object.fromEntries(url.searchParams.entries()) as Record<
        string,
        string
      >;
      const fieldsParam = incoming.fields ?? incoming.keys ?? incoming.columns;

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

      const fields = fieldsParam
        ? String(fieldsParam)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : defaultFields;

      const rows = payload as Array<Array<unknown>>;
      const transformed = rows.map((row) => {
        const obj: Record<string, unknown> = {};
        for (let i = 0; i < row.length; i++) {
          const key = fields[i] ?? `col_${i}`;
          obj[key] = row[i];
        }
        return obj;
      });

      payload = transformed;
    }

    const source = onlineFlag ? "online" : "offline";

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      "X-Data-Source": source,
    } as Record<string, string>;

    // Include a small `source` field in the response body alongside data so
    // clients can know where the data came from. Also include last_grabbed
    // metadata when we have a local institutions.json snapshot.
    let meta: Record<string, unknown> | undefined = undefined;
    try {
      const metaPath = path.join(
        process.cwd(),
        "data",
        "institutions.meta.json"
      );
      const instPath = path.join(process.cwd(), "data", "institutions.json");
      if (
        await fs
          .stat(metaPath)
          .then(() => true)
          .catch(() => false)
      ) {
        const metaText = await fs.readFile(metaPath, "utf8");
        meta = JSON.parse(metaText);
      } else if (
        await fs
          .stat(instPath)
          .then(() => true)
          .catch(() => false)
      ) {
        const st = await fs.stat(instPath);
        meta = { last_grabbed: st.mtime.toISOString() };
        // if payload is the offline array, include record count
        if (!onlineFlag && Array.isArray(payload))
          meta.records = (payload as Array<unknown>).length;
      }
    } catch {
      // ignore meta errors
    }

    const responseBody = meta
      ? { source, meta, data: payload }
      : { source, data: payload };

    return new NextResponse(JSON.stringify(responseBody), {
      status,
      headers,
    });
  } catch (err) {
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    } as Record<string, string>;

    return new NextResponse(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers,
    });
  }
}
