import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { corsHeaders } from "../../route";

function slug(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ state: string }> }
) {
  const { state } = await params;
  const fileName = `${slug(state)}.json`;
  const filePath = path.join(process.cwd(), "data", "states", fileName);

  try {
    const text = await fs.readFile(filePath, "utf8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      // If the per-state file contains raw text or error, return it as-is
      return NextResponse.json(
        { error: "invalid-json", raw: text },
        { status: 502, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { source: "local", state, data: parsed },
      { headers: corsHeaders() }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "not_found", state, detail: String(e) },
      { status: 404, headers: corsHeaders() }
    );
  }
}
