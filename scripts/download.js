import fs from "fs";
import path from "path";

async function main() {
  const args = process.argv.slice(2);
  const url =
    args[0] ||
    process.env.PREFETCH_URL ||
    "http://localhost:3000/api/institutions";
  const outPath =
    args[1] || path.join(process.cwd(), "data", "institutions.json");

  console.log("Fetching", url);

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.text();

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    // Write raw text so we preserve upstream raw when it's not JSON
    fs.writeFileSync(outPath, data, "utf8");
    console.log("Saved to", outPath);
  } catch (err) {
    console.error(
      "Failed to download:",
      err && err.message ? err.message : err
    );
    process.exitCode = 2;
  }
}

// Node 18+ has fetch globally; if not, inform the user
if (typeof fetch !== "function") {
  console.error(
    "Global fetch is not available in this Node version. Use Node 18+ or run with a fetch polyfill."
  );
  process.exit(1);
} else {
  main();
}
