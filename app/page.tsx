export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12">
      <h1 className="text-3xl font-extrabold bg-clip-text bg-linear-to-bl from-orange-500 to-orange-800 text-transparent text-center flex items-center justify-center space-x-4">
        <span>Indian Colleges List (Datasets)</span>
        <a
          href="https://github.com/anburocky3/indian-colleges-data/fork"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full  text-white hover:bg-orange-500"
          title="Fork this project"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
            />
          </svg>
        </a>
      </h1>

      <main className="mx-auto w-full max-w-4xl bg-white dark:bg-black px-8 py-10 rounded shadow-sm">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="mt-2 text-sm text-zinc-500">
            This api contains{" "}
            <span className="text-orange-600">39268 colleges data</span>, like
            names, states, district, address, etc., including private,
            government, autonomous, and affiliated institutions across India.
            The data is sourced from the All India Council for Technical
            Education (AICTE) website.
          </p>
        </header>

        {/* /api/institutions section */}
        <section className="mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold flex items-center">
              <span>GET /api/institutions </span>
              <span className="ml-3 text-orange-200 text-sm">(11.9MB)</span>
            </h2>
            <a
              href="/api/institutions"
              target="_blank"
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 cursor-pointer"
              title={"Open API in new tab"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="inline-flex mr-1"
              >
                <path
                  fill="currentColor"
                  d="M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h5.115q.213 0 .357.143t.143.357t-.143.357T10.73 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192h12.77q.23 0 .423-.192t.192-.423v-5.116q0-.213.143-.357t.357-.143t.357.143t.143.357v5.116q0 .69-.462 1.152T18.384 20zM19 5.708l-8.908 8.908q-.14.14-.344.15t-.363-.15t-.16-.354t.16-.354L18.292 5H14.5q-.213 0-.357-.143T14 4.5t.143-.357T14.5 4h4.692q.349 0 .578.23t.23.578V9.5q0 .214-.143.357T19.5 10t-.357-.143T19 9.5z"
                />
              </svg>
              View Endpoint
            </a>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            This is the main endpoint to access the Indian Colleges dataset. It
            is huge in size and may take some time to respond. If you want state
            wise data which is smaller, try the per-state endpoints described
            below.
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Examples</h2>
            <p className="text-sm text-zinc-700 mt-2">Browser (client-side):</p>
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">{`fetch("/api/institutions")
  .then((r) => r.json())
  .then((data) => console.log(data));`}</pre>

            <p className="text-sm text-zinc-700 mt-3">Curl (cmd.exe):</p>
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">
              curl https://indian-colleges-list.vercel.app/api/institutions
            </pre>
          </section>

          <p className="mt-3 text-sm text-green-600">
            <strong>Example: </strong>
            <a href="/api/institutions" target="_blank">
              <code>/api/institutions</code>
            </a>
          </p>

          <hr className="my-10 border border-gray-900" />

          {/* <h3 className="mt-4 font-medium">Parameters</h3>
          <p className="text-sm text-zinc-700 mt-2">
            The proxy accepts the following query parameters.
          </p> */}
          {/* 
          <ul className="list-disc pl-6 mt-2 text-sm text-zinc-300 space-y-1">
            <li>
              <code>year</code>{" "}
              <span className="text-zinc-600">
                - Academic year, e.g.{" "}
                <code className="text-orange-200">2024-2025</code>
              </span>
            </li>
            <li>
              <code>
                program <span className="text-zinc-600">- Program, e.g. </span>
                <code className="text-orange-200">
                  Engineering and Technology
                </code>
              </code>
              <div className="pl-4 text-zinc-500">
                <ul>
                  <li>Applied Arts and Crafts</li>
                  <li>Architecture and Town Planning</li>
                  <li>Architecture</li>
                  <li>Town Planning</li>
                  <li>Planning</li>
                  <li>Engineering and Technology</li>
                  <li>Hotel Management and Catering</li>
                  <li>Management</li>
                  <li>MCA</li>
                  <li>Computer Applications</li>
                  <li>Pharmacy</li>
                </ul>
              </div>
            </li>
            <li>
              <code>level</code>{" "}
              <span className="text-zinc-600">
                - Level of study, e.g.{" "}
                <code className="text-orange-200">UG</code>
              </span>
              <div className="pl-4 text-zinc-500">
                <ul>
                  <li>All - 1</li>
                  <li>Undergraduate - UG</li>
                  <li>Postgraduate - PG</li>
                  <li>Diploma - DIPLOMA</li>
                </ul>
              </div>
            </li>
            <li>
              <code>institutiontype</code> - Type of institution, e.g.{" "}
              <span className="text-zinc-600">
                - institution type , e.g.{" "}
                <code className="text-orange-200">1</code>
              </span>
              <div className="pl-4 text-zinc-500">
                <ul>
                  <li>1 - All</li>
                  <li>Central University</li>
                  <li>Deemed to be University(Govt)</li>
                  <li>Deemed to be University(Pvt)</li>
                  <li>Deemed University(Government)</li>
                  <li>Deemed University(Private)</li>
                  <li>Government</li>
                  <li>Govt aided</li>
                  <li>Private-Aided</li>
                  <li>Private-Self Financing</li>
                  <li>State Government University</li>
                  <li>State Private University</li>
                  <li>Unaided - Private</li>
                  <li>University Managed</li>
                  <li>University Managed-Govt</li>
                  <li>University Managed-Private</li>
                </ul>
              </div>
            </li>
            <li>
              <code>Women</code>{" "}
              <span className="text-zinc-600">
                - Women-only institutions, e.g.{" "}
              </span>
              <code className="text-orange-200">true</code>
            </li>
            <li>
              <code>Minority</code>{" "}
              <span className="text-zinc-600">
                - Minority institutions, e.g.{" "}
              </span>
              <code className="text-orange-200">true</code>
            </li>
            <li>
              <code>state</code>{" "}
              <span className="text-zinc-600"> - State, e.g. </span>
              <code className="text-orange-200">Tamil Nadu</code>
            </li>
            <li>
              <code>course</code>{" "}
              <span className="text-zinc-600"> - Course ID, e.g. </span>
              <code className="text-orange-200">101</code>
            </li>
          </ul> */}
        </section>

        <section className="mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold flex items-center">
              <span>GET /api/institutions/search </span>
            </h2>
            <a
              href="/api/institutions/search?state=Tamil Nadu&q=dmi"
              target="_blank"
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 cursor-pointer"
              title={"Open API in new tab"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="inline-flex mr-1"
              >
                <path
                  fill="currentColor"
                  d="M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h5.115q.213 0 .357.143t.143.357t-.143.357T10.73 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192h12.77q.23 0 .423-.192t.192-.423v-5.116q0-.213.143-.357t.357-.143t.357.143t.143.357v5.116q0 .69-.462 1.152T18.384 20zM19 5.708l-8.908 8.908q-.14.14-.344.15t-.363-.15t-.16-.354t.16-.354L18.292 5H14.5q-.213 0-.357-.143T14 4.5t.143-.357T14.5 4h4.692q.349 0 .578.23t.23.578V9.5q0 .214-.143.357T19.5 10t-.357-.143T19 9.5z"
                />
              </svg>
              View Endpoint
            </a>
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Search institutions. This route requires BOTH a <code>state</code>{" "}
            query parameter and a search string <code>q</code> of at least 3
            characters. Results are paginated.
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Examples</h2>
            <p className="text-sm text-zinc-700 mt-2">Browser (client-side):</p>
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">{`fetch("/api/institutions/search?state=Tamil Nadu&q=loyola&page=1&limit=20")
  .then((r) => r.json())
  .then((data) => console.log(data));`}</pre>

            <p className="text-sm text-zinc-700 mt-3">Curl (cmd.exe):</p>
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">
              curl
              https://indian-colleges-list.vercel.app/api/institutions/search?state=Tamil
              Nadu&q=loyola
            </pre>
          </section>

          <hr className="my-10 border border-gray-900" />
        </section>

        <section className="mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold flex items-center">
              <span>GET /api/institutions/states </span>
            </h2>
            <a
              href="/api/institutions/states"
              target="_blank"
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 cursor-pointer"
              title={"Open API in new tab"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="inline-flex mr-1"
              >
                <path
                  fill="currentColor"
                  d="M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h5.115q.213 0 .357.143t.143.357t-.143.357T10.73 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192h12.77q.23 0 .423-.192t.192-.423v-5.116q0-.213.143-.357t.357-.143t.357.143t.143.357v5.116q0 .69-.462 1.152T18.384 20zM19 5.708l-8.908 8.908q-.14.14-.344.15t-.363-.15t-.16-.354t.16-.354L18.292 5H14.5q-.213 0-.357-.143T14 4.5t.143-.357T14.5 4h4.692q.349 0 .578.23t.23.578V9.5q0 .214-.143.357T19.5 10t-.357-.143T19 9.5z"
                />
              </svg>
              View Endpoint
            </a>
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            returns a list of available states and their slugs. Example
            response: {`{ states: [{ name, slug }] }`}. The API provides
            state-level snapshots and metadata to make working with the dataset
            easier.
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Examples</h2>
            <p className="text-sm text-zinc-700 mt-2">Browser (client-side):</p>
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">{`fetch("/api/institutions/states")
  .then((r) => r.json())
  .then((data) => console.log(data));`}</pre>

            <p className="text-sm text-zinc-700 mt-3">Curl (cmd.exe):</p>
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">
              curl
              https://indian-colleges-list.vercel.app/api/institutions/states
            </pre>

            <p className="mt-3 text-sm text-green-600">
              <strong>Example: </strong>
              <a href="/api/institutions/states" target="_blank">
                <code>/api/institutions/states</code>
              </a>
            </p>
          </section>

          <hr className="my-10 border border-gray-900" />

          <section className="mt-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold flex items-center">
                <span>GET /api/institutions/states/{"{state}"}</span>
              </h2>
              <a
                href="/api/institutions/states/Tamil Nadu"
                target="_blank"
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 cursor-pointer"
                title={"Open API in new tab"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="inline-flex mr-1"
                >
                  <path
                    fill="currentColor"
                    d="M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h5.115q.213 0 .357.143t.143.357t-.143.357T10.73 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192h12.77q.23 0 .423-.192t.192-.423v-5.116q0-.213.143-.357t.357-.143t.357.143t.143.357v5.116q0 .69-.462 1.152T18.384 20zM19 5.708l-8.908 8.908q-.14.14-.344.15t-.363-.15t-.16-.354t.16-.354L18.292 5H14.5q-.213 0-.357-.143T14 4.5t.143-.357T14.5 4h4.692q.349 0 .578.23t.23.578V9.5q0 .214-.143.357T19.5 10t-.357-.143T19 9.5z"
                  />
                </svg>
                View Endpoint
              </a>
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              returns a list of available institutes inside that state. The API
              provides state-level snapshots and metadata to make working with
              the dataset easier.
            </p>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold">Examples</h2>
              <p className="text-sm text-zinc-700 mt-2">
                Browser (client-side):
              </p>
              <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">{`fetch("/api/institutions/states/{state}")
  .then((r) => r.json())
  .then((data) => console.log(data));`}</pre>

              <p className="text-sm text-zinc-700 mt-3">Curl (cmd.exe):</p>
              <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">
                curl
                https://indian-colleges-list.vercel.app/api/institutions/states/
                {"{state}"}
              </pre>

              <p className="mt-3 text-sm text-green-600">
                <strong>Example: </strong>
                <a href="/api/institutions/states/Tamil%20Nadu" target="_blank">
                  <code>/api/institutions/states/Tamil%20Nadu</code>
                </a>
              </p>
            </section>
          </section>

          <hr className="my-10 border border-gray-900" />
        </section>

        <section className="mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold flex items-center">
              <span>
                GET /api/institutions/states/{"{state}"}/{"{aicteid}"}
              </span>
            </h2>
            <a
              href="/api/institutions/states/Tamil Nadu/1-44641241273"
              target="_blank"
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 cursor-pointer"
              title={"Open API in new tab"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="inline-flex mr-1"
              >
                <path
                  fill="currentColor"
                  d="M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h5.115q.213 0 .357.143t.143.357t-.143.357T10.73 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192h12.77q.23 0 .423-.192t.192-.423v-5.116q0-.213.143-.357t.357-.143t.357.143t.143.357v5.116q0 .69-.462 1.152T18.384 20zM19 5.708l-8.908 8.908q-.14.14-.344.15t-.363-.15t-.16-.354t.16-.354L18.292 5H14.5q-.213 0-.357-.143T14 4.5t.143-.357T14.5 4h4.692q.349 0 .578.23t.23.578V9.5q0 .214-.143.357T19.5 10t-.357-.143T19 9.5z"
                />
              </svg>
              View Endpoint
            </a>
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            returns detailed information about a specific institute including
            programme details
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Examples</h2>
            <p className="text-sm text-zinc-700 mt-2">Browser (client-side):</p>
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">{`fetch("/api/institutions/states/{state}/{aicteid}")
  .then((r) => r.json())
  .then((data) => console.log(data));`}</pre>

            <p className="text-sm text-zinc-700 mt-3">Curl (cmd.exe):</p>
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded mt-2 text-sm overflow-auto">
              curl
              https://indian-colleges-list.vercel.app/api/institutions/states/
              {"{state}"}/{"{aicteid}"}
            </pre>

            <p className="mt-3 text-sm text-green-600">
              <strong>Example: </strong>
              <a
                href="/api/institutions/states/Tamil%20Nadu/1-44641241273"
                target="_blank"
              >
                <code>/api/institutions/states/Tamil%20Nadu/1-44641241273</code>
              </a>
            </p>
          </section>
        </section>

        <hr className="my-10 border border-gray-900" />

        <section className="mt-10">
          <h3 className="text-lg font-semibold">Postman collections</h3>
          <p className="text-sm text-zinc-700 mt-2">
            Import the Postman collection files from the <code>postman/</code>{" "}
            folder. Use the provided environment (base_url) and run the
            requests.
          </p>
          <ul className="mt-3 text-sm text-zinc-700 list-disc pl-6">
            <li>
              <a
                href="https://raw.githubusercontent.com/anburocky3/indian-colleges-data/refs/heads/main/postman/Institutions.postman_collection.json"
                download
              >
                Institutions.postman_collection.json
              </a>
            </li>
          </ul>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-4xl px-8 py-6 text-center text-sm text-zinc-500">
        <div className="mt-3 flex items-center justify-center space-x-2">
          <span>
            © {new Date().getFullYear()} Indian Colleges Data — Data from AICTE.{" "}
          </span>
          <a
            href="https://github.com/anburocky3/indian-colleges-data/fork"
            className="inline-flex items-center justify-center w-5 h-5 rounded-full  text-white hover:bg-orange-500 "
            title="Fork this project"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
              />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
