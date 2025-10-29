import { NextResponse } from "next/server";
import { corsHeaders } from "../../institutions/route";

const TARGET_BASE =
  "https://facilities.aicte-india.org/dashboard/pages/php/approvedcourse.php";

export async function OPTIONS() {
  // Reply to preflight with CORS headers
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ aicteid: string }> }
) {
  const { aicteid } = await params;

  try {
    const url = new URL(req.url);
    const incoming = Object.fromEntries(url.searchParams.entries()) as Record<
      string,
      string
    >;

    // Some upstream parameters must be wrapped with leading/trailing slashes,
    // e.g. course=/1/ and year=/2025-2026/. We transform a small allowlist here.
    const wrapParams = ["course", "year"];
    for (const k of wrapParams) {
      const v = incoming[k];
      if (v && typeof v === "string") {
        // preserve if already wrapped
        if (!(v.startsWith("/") && v.endsWith("/"))) {
          incoming[k] = `/${v}/`;
        }
      }
    }

    const merged = {
      method: "fetchdata",
      aicteid: `/${aicteid}/`,
      ...incoming,
    };

    const queryParams = new URLSearchParams(merged as Record<string, string>);
    const targetUrl = `${TARGET_BASE}?${queryParams.toString()}`;

    // --- Robust fetch with timeout and better error reporting ---
    const controller = new AbortController();
    const timeoutMs = 15000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(targetUrl, {
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
          // upstream sometimes expects a referer/origin — include if needed
          referer:
            "https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        // use no-store to always fetch fresh and avoid runtime cache quirks
        cache: "no-store",
        method: "GET",
        signal: controller.signal,
      });
    } catch (fetchErr) {
      console.error("Upstream fetch failed:", fetchErr, { targetUrl });
      clearTimeout(timeout);
      return NextResponse.json(
        { error: "Upstream fetch failed", detail: String(fetchErr) },
        { status: 502, headers: corsHeaders() }
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = await res.text();
    let dataPayload: unknown;

    if (!res.ok) {
      console.error("Upstream returned non-OK:", res.status, text, {
        targetUrl,
      });
      // return upstream status and body for easier debugging on Vercel
      return NextResponse.json(
        { error: "Upstream returned error", status: res.status, body: text },
        { status: 502, headers: corsHeaders() }
      );
    }

    try {
      dataPayload = JSON.parse(text);

      if (
        Array.isArray(dataPayload) &&
        dataPayload.length > 0 &&
        Array.isArray((dataPayload as unknown as Array<unknown>)[0])
      ) {
        // read fields from query (client can pass `fields` or `keys`)
        const url = new URL(req.url);
        const incoming = Object.fromEntries(
          url.searchParams.entries()
        ) as Record<string, string>;
        const fieldsParam =
          incoming.fields ?? incoming.keys ?? incoming.columns;

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

        const fields = fieldsParam
          ? String(fieldsParam)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : defaultFields;

        const rows = dataPayload as Array<Array<unknown>>;
        const transformed = rows.map((row) => {
          const obj: Record<string, unknown> = {};
          for (let i = 0; i < row.length; i++) {
            const key = fields[i] ?? `col_${i}`;
            obj[key] = row[i] === undefined ? null : row[i];
          }
          return obj;
        });

        dataPayload = transformed;
      }

      return NextResponse.json(dataPayload, {
        headers: { "Access-Control-Allow-Origin": "*" },
        ...corsHeaders(),
      });
    } catch (parseErr) {
      console.error("Failed to parse upstream response as JSON:", parseErr, {
        text,
      });
      return NextResponse.json(
        { raw: text },
        {
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }
  } catch (error) {
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    } as Record<string, string>;

    console.error("Handler error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      {
        status: 500,
        headers,
      }
    );
  }
}
// ...existing code...
