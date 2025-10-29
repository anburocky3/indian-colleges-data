# Indian Colleges List — (Data via API)

This api contains 1278 colleges data, like names, district, address, etc., including private, government, autonomous, and affiliated institutions across India. The data is sourced from the All India Council for Technical Education (AICTE)
website.

Browse it here:
Postman collections:

## Quick start

1. Install deps and run the dev server:

```bash
npm install
npm run dev
```

2. Open the app in your browser:

```
http://localhost:3000
```

3. API routes are under `/api` (app router):

- `GET /api/institutions` — returns offline `data/institutions.json` by default; `?online=1` fetches upstream
- `GET /api/institution/[id]` — proxy for per-institution course details (supports extra query params like `course` and `year`)

## API — Detailed documentation

All endpoints are implemented as Next.js app routes (server-side). They include CORS headers so they can be called from browsers.

Common CORS headers set on responses:

- Access-Control-Allow-Origin: \*
- Access-Control-Allow-Methods: GET,OPTIONS
- Access-Control-Allow-Headers: Content-Type,Authorization

OPTIONS preflight requests are handled and return 204 with the same CORS headers.

### GET /api/institutions

Purpose: list institutions. By default this endpoint serves an offline snapshot in `data/institutions.json`. Use `?online=1` to fetch live upstream data.

Supported query parameters (forwarded to upstream):

- method (default: fetchdata)
- year
- program
- level
- institutiontype
- Women
- Minority
- state
- course

Behavior and responses:

- Default (no `online` query param): reads `data/institutions.json` and returns:

```json
{ "source": "offline", "data": [ ... ] }
```

and sets header `X-Data-Source: offline`.

- With `?online=1` (or `?online=true`): fetches the upstream endpoint and returns:

```json
{ "source": "online", "data": [ ... ] }
```

and sets header `X-Data-Source: online`.

You can also pass `fields` to transform rows into objects, as shown above for `/api/prefetch`.

Example:

```
GET /api/institutions
GET /api/institutions?online=1
GET /api/institutions?fields=aicte_id,institute_name,address,district,institution_type,women,minority,other_id
```

### GET /api/institution/[id]

Purpose: fetch per-institution course/approval details.

Notes:

- Next.js route receives an `id` path segment. For upstream compatibility some query params are expected to be wrapped with slashes (for example upstream expects `&course=/1/`). The route will wrap common params for you when constructing the upstream URL.
- Supported query params that will be wrapped automatically: `course`, `year`, `program`, `level`, `institutiontype`, `Women`, `Minority`, `state`.

Example request that the route will convert into the required upstream format:

```
GET /api/institution/1-44641241273?course=1&year=2025-2026

# The handler will call the upstream with course=/1/&year=/2025-2026/
```

## Scripts

- `npm run download` — downloads the upstream `/api/institutions` and saves the JSON snapshot to `data/institutions.json`. This is implemented by `scripts/download.js`.

Notes on running the script:

```bash
# Runs with node; ensure Node version supports global fetch or run with experimental fetch enabled if needed.
npm run download:download
```

If you need to run the script with an older Node version, you can run it using `node --experimental-fetch scripts/download.js`.

## Postman collections

You can import the Postman collections stored in the `postman/` folder:

- `postman/Institutions.postman_collection.json` — requests for `/api/institutions` (offline/online/fields examples).

Import the collection and environment into Postman, set `base_url` to `http://localhost:3000`, and run the examples.

## Examples

JavaScript (browser):

```js
// Fetch offline institutions
fetch("/api/institutions")
  .then((r) => r.json())
  .then((res) => {
    console.log(res.source); // 'offline' or 'online'
    console.log(res.data);
  });

// Fetch prefetch with field mapping
fetch("/api/prefetch?year=2024-2025&fields=id,institute_name,district")
  .then((r) => r.json())
  .then(console.log);
```

Curl (Windows cmd.exe):

```cmd
curl "http://localhost:3000/api/institutions"
curl "http://localhost:3000/api/institutions?online=1"
curl "http://localhost:3000/api/prefetch?year=2024-2025"
```

## Response shape and headers (summary)

- Wrapper: `{ source: 'offline'|'online', data: <payload> }` for endpoints that return JSON.
- Header: `X-Data-Source: offline|online`
- CORS headers: `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET,OPTIONS`, `Access-Control-Allow-Headers: Content-Type,Authorization`.

## Troubleshooting

- If you see unexpected absolute-drive imports from your editor, configure your editor to prefer relative imports (VS Code setting: `typescript.preferences.importModuleSpecifier = "relative"`).
- If the API fails with 502, the upstream returned an error — check the upstream body included in the response for more details.
- For local dev, ensure the `data/institutions.json` file exists; if missing, you can fetch a snapshot using `npm run download:prefetch` (or create one manually).

## Security & production notes

- The proxy sets `Access-Control-Allow-Origin: *` for convenience in development. For production, restrict the allowed origin(s) and enable `Access-Control-Allow-Credentials` if you need to forward cookies.
- Consider caching strategies for `/api/prefetch` and `/api/institutions` (e.g., in-memory cache, Redis, or Next.js ISR) to reduce upstream load and improve performance.

## Author

- [Anbuselvan Annamalai](https://fb.me/anburocky3)

## Acknowledgement

- All datas are owned by aicte website. Refer it for more clarity!
