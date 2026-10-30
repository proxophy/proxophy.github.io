import { loadCsv, createTable } from "./table";

type Pair = { left: string; right: string };

const pairKey = (left: string, right: string) => `${left.trim()}|${right.trim()}`;

/** Confirmed pairs from solution.csv. A missing file just means no highlights. */
async function loadPairs(url: string | undefined): Promise<Set<string>> {
  if (!url) return new Set();
  const rows = await loadCsv<Pair>(url, true).catch(() => [] as Pair[]);
  return new Set(rows.map((p) => pairKey(p.left, p.right)));
}

export async function renderNights(el: HTMLElement): Promise<void> {
  const [[header, ...rows], pairs] = await Promise.all([
    loadCsv(el.dataset.src!),
    loadPairs(el.dataset.pairs),
  ]);

  // CSV columns: one per man, last one = number of lights
  const { table, tbody } = createTable(["Nacht", ...header.slice(0, -1), "Lichter"]);

  rows.forEach((row, i) => {
    const night = i + 1;
    const tr = tbody.insertRow();
    tr.dataset.week = String(night);
    tr.insertCell().textContent = String(night);

    row.forEach((value, j) => {
      const td = tr.insertCell();
      td.textContent = value;
      const isLights = j === row.length - 1;
      if (!isLights && pairs.has(pairKey(header[j], value))) td.classList.add("pair");
    });
  });

  el.replaceChildren(table);
}
