import Plotly from "plotly.js-dist-min";
import { renderNights, NightsTable } from "./nights";
import { colorscales, isDark } from "./colors";
import { renderMatchBoxes } from "./matchboxes";

type SplitTable = { columns: string[]; index: string[]; data: number[][] };
type Episode = {
  num_sols: number;
  probs: SplitTable;
};

type Season = { episodes: Record<string, Episode> };


function probsPlot_Data(t: SplitTable): Plotly.Data {
  const eps = 0.0001;
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
function layout(t: SplitTable, container: HTMLElement): Partial<Plotly.Layout> {
  const rows = t.index.length;
  const cols = t.columns.length;
  const labelW = 90; // space for the row names
  const labelH = 40; // space for the column names
  const cell = Math.min(52, (container.clientWidth - labelW) / cols);

  return {
    width: Math.round(cell * cols + labelW + 20),
    height: Math.round(cell * rows + labelH + 20),
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
    font: {
      family: getComputedStyle(document.body).fontFamily,
      color: getComputedStyle(document.body).color,
      size: 13,
    },
  };
}

async function main(): Promise<void> {
  const probsPlot = document.getElementById("probs-plot")!;
  const slider = document.getElementById("week-slider") as HTMLInputElement;
  const sliderValue = document.getElementById("slider-value") as HTMLSpanElement;
  const numSols = document.getElementById("num-sols") as HTMLSpanElement;

  const nightsEl = document.getElementById("nights-table");
  const nights: NightsTable | null = nightsEl ? await renderNights(nightsEl) : null;

  const matchboxEl = document.getElementById("matchbox-table");
  const matchboxes = matchboxEl ? await renderMatchBoxes(matchboxEl) : null;

  const season: Season = await (await fetch(probsPlot.dataset.src!)).json();

  const episodes = Object.keys(season.episodes).sort((a, b) => Number(a) - Number(b));
  const episode_numbers = episodes.map(Number);

  // set slider
  slider.min = Math.min(...episode_numbers).toString();
  slider.max = Math.max(...episode_numbers).toString();
  slider.step = "1";
  slider.value = Math.max(...episode_numbers).toString();

  sliderValue.textContent = slider.value;
  numSols.textContent = season.episodes[slider.value].num_sols.toLocaleString("de-DE");

  // draw plot table
  const draw = () => {
    sliderValue.textContent = slider.value;
    Plotly.react(probsPlot,
      [probsPlot_Data(season.episodes[slider.value].probs)],
      layout(season.episodes[slider.value].probs, probsPlot),
      { responsive: true, displayModeBar: false });
    numSols.textContent = season.episodes[slider.value].num_sols.toLocaleString("de-DE");
    nights?.update(Number(slider.value));
    matchboxes?.update(Number(slider.value));
  };

  // eventlistener for episode selection
  slider.addEventListener("input", draw);
  window.addEventListener("resize", draw);

  // redraw on theme change
  new MutationObserver(draw).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  draw();
}

main();