import Plotly from "plotly.js-dist-min";

type SplitTable = { columns: string[]; index: string[]; data: number[][] };
type Episode = {
  num_sols: number;
  probs: SplitTable;
};

type Season = { episodes: Record<string, Episode> };

function isDark(): boolean { return document.documentElement.dataset.theme === "dark"; }

function probsPlot_Data(t: SplitTable): Plotly.Data {
  const eps = 0.0001;
  const colorscales: Record<"light" | "dark", [number, string][]> = {
    light: [
      [0, "#f2f2f2"],
      [eps, "#ffcde2"],
      [0.25, "#f7a1c4"],
      [0.5, "#e8457f"],
      [1 - eps, "#c72861"],
      [1, "#1a237e"],
    ],
    dark: [
      [0, "#2c2c30"],
      [eps, "#6b2a45"],
      [0.25, "#a63a6c"],
      [0.5, "#e8457f"],
      [1 - eps, "#ff7eab"],
      [1, "#5c7cfa"]
    ],
  };

  return {
    type: "heatmap",
    x: t.columns,
    y: t.index,
    z: t.data,
    zmin: 0,
    zmax: 100,
    colorscale: colorscales[isDark() ? "dark" : "light"],
    texttemplate: "%{z:.1f}",
    hovertemplate: "%{y} + %{x}: %{z:.1f}%<extra></extra>",
    colorbar: { title: { text: "Wahrscheinlichkeit (%)" } },
  } as Plotly.Data;
}

function layout(): Partial<Plotly.Layout> {
  return {
    height: 600,
    width: 800,
    margin: { t: 20, l: 20, r: 20, b: 20 },
    xaxis: { side: "top", automargin: true },
    yaxis: { autorange: "reversed", automargin: true },
    paper_bgcolor: "rgba(0,0,0,0)",   // let the page background show through
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: getComputedStyle(document.body).color },
  };
}

async function main(): Promise<void> {
  const probsPlot = document.getElementById("probs-plot")!;
  const slider = document.getElementById("week-slider") as HTMLInputElement;
  const sliderValue = document.getElementById("slider-value") as HTMLSpanElement;
  const numSols = document.getElementById("num-sols") as HTMLSpanElement;
  const nightPlot = document.getElementById("night-plot") as HTMLDivElement;
  console.log(slider);


  const season: Season = await (await fetch(probsPlot.dataset.src!)).json();

  const episodes = Object.keys(season.episodes).sort((a, b) => Number(a) - Number(b));
  const episode_numbers = episodes.map(Number);

  const reader = new FileReader();

  // set slider
  slider.min = Math.min(...episode_numbers).toString();
  slider.max = Math.max(...episode_numbers).toString();
  slider.step = "1";
  slider.value = Math.max(...episode_numbers).toString();

  sliderValue.textContent = slider.value;
  numSols.textContent = season.episodes[slider.value].num_sols.toLocaleString("de-DE");


  const draw = () => {
    sliderValue.textContent = slider.value;
    Plotly.react(probsPlot, [probsPlot_Data(season.episodes[slider.value].probs)], layout(), { responsive: true, displayModeBar: false });
    numSols.textContent = season.episodes[slider.value].num_sols.toLocaleString("de-DE");
  };

  // eventlistener for episode selection
  slider.addEventListener("input", draw);

  // redraw on theme change
  new MutationObserver(draw).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  draw();
}

main();