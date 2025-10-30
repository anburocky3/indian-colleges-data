import { NextResponse } from "next/server";
import { STATES, corsHeaders } from "../route";

function slug(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  // return list of available states and slugs
  const list = STATES.map((name) => ({ name, slug: slug(name) }));
  return NextResponse.json({ states: list }, { headers: corsHeaders() });
}
