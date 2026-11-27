import { loadCsv, createTable } from "./table";

export async function renderMatchBoxes(el: HTMLElement): Promise<void> {
    const [header, ...rows] = await loadCsv(el.dataset.src!);
    const { table, tbody } = createTable(["Woche", header[1], header[2], "Ergebnis",]);

    for (const [weekIndex, left, right, result, before_night] of rows) {
        const week = Number(weekIndex) + 1;
        const isMatch = result.toLowerCase() === "true";
        const timing = before_night.toLowerCase() === "true"

        const tr = tbody.insertRow();
        tr.dataset.week = String(week);
        if (isMatch) tr.classList.add("matchboxpair");

        tr.insertCell().innerHTML = String(week) + (!timing ? "<sup>⁎</sup>" : "");
        // const tdb = tr.insertCell();
        // tdb.textContent = timing
        tr.insertCell().textContent = left;
        tr.insertCell().textContent = right;

        const td = tr.insertCell();
        td.className = `matchbox ${isMatch ? "perfect" : "none"}`;
        td.textContent = isMatch ? "♥" : (result.toLowerCase() === "sold"?"€" :"✕");
        td.title =isMatch ? "Perfect match" : (result.toLowerCase() === "sold"?"Verkauft" :"No Match");
        td.setAttribute("aria-label", td.title);

    }
    const caption = table.createCaption();
    caption.innerHTML = "Ein <sup>⁎</sup> bedeutet, dass die Match Box schon am Ende der Folge  aufgelöst wurde ";

    el.replaceChildren(table);
}