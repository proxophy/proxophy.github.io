type Stop = [number, string];

const eps = 0.0001;

export const colorscales: Record<"light" | "dark", Stop[]> = {
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
    [1, "#5c7cfa"],
  ],
};

export function isDark(): boolean {
  return document.documentElement.dataset.theme === "dark";
}

/** Color of a 100% cell in the current theme. */
export function topColor(): string {
  const scale = colorscales[isDark() ? "dark" : "light"];
  return scale[scale.length - 1][1];
}