import { NextResponse } from "next/server";
import { corsHeaders } from "../../institutions/route";

const TARGET_BASE =
  "https://facilities.aicte-india.org/dashboard/pages/php/approvedcourse.php";

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

    const res = await fetch(targetUrl, {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "x-requested-with": "XMLHttpRequest",
      },
      cache: "force-cache",
    });
    const text = await res.text();
    let dataPayload: unknown;

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
            obj[key] = row[i];
          }
          return obj;
        });

        dataPayload = transformed;
      }

      return NextResponse.json(dataPayload, {
        headers: { "Access-Control-Allow-Origin": "*" },
        ...corsHeaders(),
      });
    } catch {
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

    return NextResponse.json(
      { error: (error as Error).message },
      {
        status: 500,
        headers,
      }
    );
  }
}
