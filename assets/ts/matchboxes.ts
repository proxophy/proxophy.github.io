import Papa from "papaparse";
import { topColor } from "./colors";

export interface MatchBoxTable {
    update(week: number): void;
}

export async function renderMatchBoxes(el: HTMLElement): Promise<MatchBoxTable | null> {
    const url = el.dataset.src!;
    const res = await fetch(url);
    if (!res.ok) {
        el.textContent = `Konnte ${url} nicht laden`;
        return null;
    }

    const { data } = Papa.parse<string[]>((await res.text()).trim(), { skipEmptyLines: true });
    const [header, ...body] = data;

    const table = document.createElement("table");
    table.className = "matchbox-table";

    const headRow = table.createTHead().insertRow();
    const header_arr = ["Woche", header[1], header[2], "Ergebnis"];
    header_arr.forEach((h, j) => {
        const th = document.createElement("th");
        th.textContent = h;
        if (j == 0) {
            th.classList.add("indices")
        }
        headRow.appendChild(th);
    });

    const tbody = table.createTBody();
    body.forEach((r, i) => {
        const tr = tbody.insertRow();
        r.forEach((v, j) => {
            const td = tr.insertCell();
            if (j == 0) {
                td.textContent = (parseInt(v) + 1).toString();
                td.classList.add("indices")
            } else if (j == 3) {
                const isMatch = v == 'True';
                td.className = `matchbox ${isMatch ? "perfect" : "none"}`;
                td.textContent = isMatch ? "♥" : "✕";
                td.title = isMatch ? "Perfect Match" : "No Match";
                td.setAttribute("aria-label", td.title);
                if (isMatch){
                    tr.style.backgroundColor = `color-mix(in srgb, ${topColor()} 30%, transparent)`;
                    tr.style.fontWeight = "600";
                }


            } else {
                td.textContent = v;
            }
        })
    });

    el.replaceChildren(table);

    return null
}