import { loadCsv, createTable } from "./table";

type Pair = { left: string; right: string };

const pairKey = (left: string, right: string) => `${left.trim()}|${right.trim()}`;

/** Confirmed pairs from solution.csv. A missing file just means no highlights. */
async function loadPairs(url: string | undefined): Promise<Set<string>> {
  if (!url) return new Set();
  const rows = await loadCsv<Pair>(url, true).catch(() => [] as Pair[]);
  return new Set(rows.map((p) => pairKey(p.left, p.right)));
}

async function loadMatchBoxPairs(url: string | undefined): Promise<[Set<string>, Record<string, number>]> {
  if (!url) return [new Set(), {}];
  const [_, ...rows] = await loadCsv(url);
  const perfectMatches = rows.filter(p => p[3].toLowerCase() == "true")
  var episodes: Record<string, number> = {}
  for (const p of perfectMatches) {
    episodes[pairKey(p[1], p[2])] = Number(p[0])
  }
  return [new Set(perfectMatches.map((p) => pairKey(p[1], p[2]))), episodes]
}

export async function renderNights(el: HTMLElement): Promise<void> {
  const [[header, ...rows], pairs, [mppairs, mpnights]] = await Promise.all([
    loadCsv(el.dataset.src!),
    loadPairs(el.dataset.pairs),
    loadMatchBoxPairs(el.dataset.matchboxes)
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
      const key = pairKey(header[j], value)
      if (!isLights && mppairs.has(key) && i >= mpnights[key]) {
        td.classList.add("matchboxpair");
      }
      if (!isLights && pairs.has(key)) td.classList.add("pair");

    });
  });

  const caption = table.createCaption();
  caption.textContent = "Die blauen Zellen markieren die Perfect Matches. Die besonders hervorgehobenen Matches wurden durch eine Match Box aufgedeckt.";

  el.replaceChildren(table);
}
