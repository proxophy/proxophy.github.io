import { loadCsv, createTable } from "./table";

export async function renderMatchBoxes(el: HTMLElement): Promise<void> {
    const [header, ...rows] = await loadCsv(el.dataset.src!);
    const { table, tbody } = createTable(["Woche", header[1], header[2], "Ergebnis"]);
    // todo: add _before_night
    for (const [weekIndex, left, right, result, before_night] of rows) {
        const week = Number(weekIndex) + 1;
        const isMatch = result === "True";

        const tr = tbody.insertRow();
        tr.dataset.week = String(week);
        if (isMatch) tr.classList.add("pair");

        tr.insertCell().textContent = String(week);
        tr.insertCell().textContent = left;
        tr.insertCell().textContent = right;

        const td = tr.insertCell();
        td.className = `matchbox ${isMatch ? "perfect" : "none"}`;
        td.textContent = isMatch ? "♥" : "✕";
        td.title = isMatch ? "Perfect Match" : "No Match";
        td.setAttribute("aria-label", td.title);

        // const tdb = tr.insertCell();
        // tdb.textContent = before_night
    }

    el.replaceChildren(table);
}