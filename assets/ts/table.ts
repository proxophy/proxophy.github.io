import Papa from "papaparse";

/** Fetch a CSV file and parse it. Throws if the request fails. */
export async function loadCsv<T = string[]>(url: string, header = false): Promise<T[]> {
  const res = await fetch(url,  { cache: "no-cache" });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const { data } = Papa.parse<T>((await res.text()).trim(), { header, skipEmptyLines: true });
  return data;
}

/** Create an empty <table class="ayto-table"> that already has its header row. */
export function createTable(headers: string[]): {
  table: HTMLTableElement;
  tbody: HTMLTableSectionElement;
} {
  const table = document.createElement("table");
  table.className = "ayto-table";

  const headRow = table.createTHead().insertRow();
  for (const text of headers) {
    const th = document.createElement("th");
    th.textContent = text;
    headRow.appendChild(th);
  }
  return { table, tbody: table.createTBody() };
}
