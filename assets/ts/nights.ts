import Papa from "papaparse";
import { topColor } from "./colors";

export interface NightsTable {
    update(week: number): void;
}

const pairKey = (left: string, right: string) => `${left.trim()}|${right.trim()}`;

async function loadPairs(url: string | undefined): Promise<Set<string>> {
    const pairs = new Set<string>();
    if (!url) return pairs;
    const res = await fetch(url);
    if (!res.ok) return pairs; // table still renders, just without highlights

    const { data } = Papa.parse<{ left: string; right: string }>(
        (await res.text()).trim(),
        { header: true, skipEmptyLines: true }
    );
    data.forEach((p) => pairs.add(pairKey(p.left, p.right)));
    return pairs;
}

function styleCell(td: HTMLTableCellElement, pair: boolean): void {
    if (pair) {
        td.style.backgroundColor = `color-mix(in srgb, ${topColor()} 30%, transparent)`;
        td.style.fontWeight = "600";
    } else {
        td.style.backgroundColor = "";
        td.style.color = "";
        td.style.fontWeight = "";
    }
}

export async function renderNights(el: HTMLElement): Promise<NightsTable | null> {
    const url = el.dataset.src!;
    const res = await fetch(url);
    if (!res.ok) {
        el.textContent = `Konnte ${url} nicht laden`;
        return null;
    }

    const { data } = Papa.parse<string[]>((await res.text()).trim(), { skipEmptyLines: true });
    const [header, ...body] = data;
    const pairs = await loadPairs(el.dataset.pairs);

    const table = document.createElement("table");
    table.className = "nights-table";

    const headRow = table.createTHead().insertRow();
    const index_th = document.createElement("th");
    index_th.textContent = "Night";
    index_th.classList.add("indices");
    headRow.appendChild(index_th);
    header.forEach((h, j) => {
        const th = document.createElement("th");
        th.textContent = h;
        if (j === header.length - 1) th.classList.add("lights");
        headRow.appendChild(th);
    });

    const cells: { td: HTMLTableCellElement;  pair: boolean }[] = [];
    const tbody = table.createTBody();
    body.forEach((r, i) => {
        const tr = tbody.insertRow();
        const index_td = tr.insertCell();
        index_td.textContent = (i + 1).toString();
        index_td.classList.add("indices");
        r.forEach((v, j) => {
            const td = tr.insertCell();
            td.textContent = v;
            if (j === r.length - 1) td.classList.add("lights");
            cells.push({ td, pair: pairs.has(pairKey(header[j], v)) });
        });
    });

    el.replaceChildren(table);

    const update = (_week: number) => cells.forEach((c) => styleCell(c.td, c.pair));
    update(0);
    return { update };
}