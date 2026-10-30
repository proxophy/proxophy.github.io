import Plotly from "plotly.js-dist-min";
import { colorscales, isDark, syncThemeColors } from "./colors";
import { renderNights } from "./nights";
import { renderMatchBoxes } from "./matchboxes";

type SplitTable = { columns: string[]; index: string[]; data: number[][] };
type Episode = { num_sols: number; probs: SplitTable };
type Season = { episodes: Record<string, Episode> };

const MAX_CELL = 52;
const LABEL_W = 90; // space for the row names
const LABEL_H = 40; // space for the rotated column names

function probsTrace(t: SplitTable): Plotly.Data {
  // hide zeros, show 100 without decimals
  const text = t.data.map((row) =>
    row.map((v) => (v === 0 ? "" : v === 100 ? "100" : v.toFixed(1))),
  );

  return {
    type: "heatmap",
    x: t.columns,
    y: t.index,
    z: t.data,
    text,
    texttemplate: "%{text}",
    textfont: { size: 12 },
    xgap: 2,
    ygap: 2,
    showscale: false,
    zmin: 0,
    zmax: 100,
    colorscale: colorscales[isDark() ? "dark" : "light"],
    hovertemplate: "%{y} + %{x}: %{z:.1f}%<extra></extra>",
  } as Plotly.Data;
}

function probsLayout(t: SplitTable, container: HTMLElement): Partial<Plotly.Layout> {
  const rows = t.index.length;
  const cols = t.columns.length;
  const cell = Math.min(MAX_CELL, (container.clientWidth - LABEL_W) / cols);
  const body = getComputedStyle(document.body);

  return {
    width: Math.round(cell * cols + LABEL_W + 20),
    height: Math.round(cell * rows + LABEL_H + 20),
    margin: { t: 10, l: 10, r: 10, b: 10 },
    xaxis: { side: "top", automargin: true, ticks: "", constrain: "domain" },
    yaxis: {
      autorange: "reversed",
      automargin: true,
      ticks: "",
      scaleanchor: "x",
      scaleratio: 1,
      constrain: "domain",
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: body.fontFamily, color: body.color, size: 13 },
  };
}

/** One clickable tick per week under the slider. Returns the tick elements. */
function buildTicks(container: HTMLElement, slider: HTMLInputElement, every = 1): HTMLElement[] {
  const min = Number(slider.min);
  const max = Number(slider.max);
  container.replaceChildren();

  const ticks: HTMLElement[] = [];
  for (let week = min; week <= max; week++) {
    const tick = document.createElement("button");
    tick.type = "button";
    tick.className = "tick";
    tick.title = `Woche ${week}`;
    tick.style.setProperty("--f", String(max === min ? 0 : (week - min) / (max - min)));

    const mark = document.createElement("span");
    mark.className = "mark";
    tick.appendChild(mark);

    if ((week - min) % every === 0) {
      const label = document.createElement("span");
      label.textContent = String(week);
      tick.appendChild(label);
    }

    tick.addEventListener("click", () => {
      slider.value = String(week);
      slider.dispatchEvent(new Event("input"));
    });

    container.appendChild(tick);
    ticks.push(tick);
  }
  return ticks;
}

/** Render a table; if that fails, only this table shows a message and the page keeps working. */
async function safely(
  el: HTMLElement | null,
  render: (el: HTMLElement) => Promise<void>,
): Promise<void> {
  if (!el) return;
  try {
    await render(el);
  } catch (e) {
    console.error(e);
    el.textContent = "Daten konnten nicht geladen werden.";
  }
}

async function loadSeason(url: string): Promise<Season> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

async function main(): Promise<void> {
  const probsPlot = document.getElementById("probs-plot")!;
  const controls = document.querySelector<HTMLElement>(".ayto-controls")!;
  const slider = document.getElementById("week-slider") as HTMLInputElement;
  const sliderValue = document.getElementById("slider-value")!;
  const numSols = document.getElementById("num-sols")!;

  // load plot data and both tables in parallel
  const [season] = await Promise.all([
    loadSeason(probsPlot.dataset.src!),
    safely(document.getElementById("nights-table"), renderNights),
    safely(document.getElementById("matchbox-table"), renderMatchBoxes),
  ]);

  // slider: weeks are consecutive, so min/max are enough
  const weeks = Object.keys(season.episodes).map(Number).sort((a, b) => a - b);
  const first = weeks[0];
  const last = weeks[weeks.length - 1];
  slider.min = String(first);
  slider.max = String(last);
  slider.step = "1";
  slider.value = String(last);

  const ticks = buildTicks(document.getElementById("week-ticks")!, slider);
  const weekRows = Array.from(document.querySelectorAll<HTMLElement>("tr[data-week]"));

  const draw = () => {
    const week = Number(slider.value);
    const episode = season.episodes[week];
    const layout = probsLayout(episode.probs, probsPlot);

    syncThemeColors();
    Plotly.react(probsPlot, [probsTrace(episode.probs)], layout, {
      responsive: true,
      displayModeBar: false,
    });
    controls.style.maxWidth = `${layout.width}px`; // same width as the plot

    sliderValue.textContent = String(week);
    numSols.textContent = episode.num_sols.toLocaleString("de-DE");

    // filled part of the slider track + active tick
    const pct = last === first ? 100 : ((week - first) / (last - first)) * 100;
    slider.style.setProperty("--p", `${pct}%`);
    ticks.forEach((tick, i) => tick.classList.toggle("active", first + i === week));

    // dim table rows that belong to later weeks
    weekRows.forEach((tr) => tr.classList.toggle("future", Number(tr.dataset.week) > week));
  };

  // coalesce bursts of resize / theme events into one redraw per frame
  let frame = 0;
  const scheduleDraw = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  };

  slider.addEventListener("input", draw);
  window.addEventListener("resize", scheduleDraw);
  new MutationObserver(scheduleDraw).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  draw();
}

main().catch((e) => {
  console.error(e);
  document.getElementById("probs-plot")?.replaceChildren("Daten konnten nicht geladen werden.");
});
