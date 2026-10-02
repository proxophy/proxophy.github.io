import Plotly from "plotly.js-dist-min";

type SplitTable = { columns: string[]; index: string[]; data: number[][] };

async function main(): Promise<void> {
  const el = document.getElementById("ayto-plot")!;
  const t: SplitTable = await (await fetch(el.dataset.src!)).json();

  Plotly.newPlot(
    el,
    [{
      type: "heatmap",
      x: t.columns,
      y: t.index,
      z: t.data,
      zmin: 0,
      zmax: 100,
      colorscale: "Viridis",
      texttemplate: "%{z:.1f}",
      hovertemplate: "%{y} + %{x}: %{z:.1f}%<extra></extra>",
      colorbar: { title: { text: "Probability (%)" } },
    }],
    {
      height: 520,
      margin: { t: 20 },
      xaxis: { side: "top" },
      yaxis: { autorange: "reversed" },
    },
    { responsive: true },
  );
}

main();