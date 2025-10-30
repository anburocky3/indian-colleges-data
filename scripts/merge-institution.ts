import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const INPUT_FILE = path.join(DATA_DIR, "institutions.json");
const OUTPUT_FILE = path.join(DATA_DIR, "institutions-with-programmes.json");

async function getProgrammesForInstitution(
  institutionId: string,
  courseId = "1",
  year = "2025-2026"
): Promise<{
  programmes: InstitutionProgramme[];
  meta: { state?: string; university?: string };
}> {
  const url = `https://facilities.aicte-india.org/dashboard/pages/php/approvedcourse.php?method=fetchdata&aicteid=${encodeURIComponent(
    institutionId
  )}&course=/${courseId}/&year=/${year}/`;
  const res = await fetch(url);
  let dataPayload: unknown;

  if (!res.ok) {
    console.warn(
      `Failed to fetch programmes for institution ${institutionId}: ${res.status} ${res.statusText}`
    );
    return { programmes: [], meta: {} };
  }
  dataPayload = await res.json();

  if (
    Array.isArray(dataPayload) &&
    dataPayload.length > 0 &&
    Array.isArray((dataPayload as unknown as Array<unknown>)[0])
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

    const fields = defaultFields;

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

  // At this point dataPayload should be an array of objects (programmes)
  const programmesRaw =
    (dataPayload as unknown as Array<Record<string, unknown>>) || [];

  // extract common metadata (state, university) from programmes and remove redundant keys
  let metaState: string | undefined;
  let metaUniversity: string | undefined;

  const programmes = programmesRaw.map((p) => {
    const copy: Record<string, unknown> = { ...p };

    // capture state/university from first occurrence
    if (!metaState && typeof copy.state === "string" && copy.state)
      metaState = String(copy.state);
    if (
      !metaUniversity &&
      typeof copy.university === "string" &&
      copy.university
    )
      metaUniversity = String(copy.university);

    // remove fields that are redundant at programme level
    delete copy.aicte_id;
    delete copy.institute_name;
    delete copy.state;
    delete copy.university;

    return copy as InstitutionProgramme;
  });

  return { programmes, meta: { state: metaState, university: metaUniversity } };
}

async function main() {
  // read institutions files and loop through each institution to merge programmes
  const data = await fs.readFile(INPUT_FILE, "utf-8");
  const institutions = JSON.parse(data);
  for (const inst of institutions) {
    const result = await getProgrammesForInstitution(inst.id);
    const programmes = result.programmes;
    const meta = result.meta;

    inst.programmes = programmes;
    // lift state/university to parent institution if not already present
    if (meta?.state && !inst.state) inst.state = meta.state;
    if (meta?.university && !inst.university) inst.university = meta.university;
  }
  return await fs.writeFile(OUTPUT_FILE, JSON.stringify(institutions, null, 2));
}

// main().catch((e) => {
//   console.error("Script failed:", e);
//   process.exit(1);
// });

interface InstitutionProgramme {
  programme?: string;
  level?: string;
  course?: string;
  course_type?: string;
  shift?: string;
  availability?: string;
  intake?: string;
  enrollment?: string;
  placement?: string;
  [key: string]: unknown;
}

const institutionSample = {
  aicte_id: "1-44637260871",
  institute_name: "K RAMAKRISHNAN COLLEGE OF TECHNOLOGY",
  address: "KARIYAMANICKAM ROAD, MANNACHANALLUR TALUK",
  district: "TIRUCHIRAPPALLI",
  institution_type: "Private-Self Financing",
  women: "N",
  minority: "N",
  other_id: "1-44637260871",
  programmes: [] as InstitutionProgramme[],
  state: "",
  university: "",
};

getProgrammesForInstitution("1-44637260871").then((res) => {
  const programmes = res.programmes;

  const meta = res.meta;

  institutionSample.programmes.push(...programmes);

  if (meta?.state) institutionSample.state = meta.state as string;

  if (meta?.university)
    institutionSample.university = meta.university as string;

  console.log(institutionSample);
});
