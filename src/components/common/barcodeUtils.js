/**
 * Standard Code 39 Barcode Pattern Table
 * 'b' = narrow bar (1x)
 * 'B' = wide bar (2.5x)
 * 'w' = narrow space (1x)
 * 'W' = wide space (2.5x)
 */
export const CODE39_PATTERNS = {
  "0": "bwbwbWBwb",
  "1": "BwbwbWbwb",
  "2": "bwBwbWbwb",
  "3": "BwBwbwbwb",
  "4": "bwbwBWbwb",
  "5": "BwbwBwbwb",
  "6": "bwBwBwbwb",
  "7": "bwbwbwBWB",
  "8": "BwbwbwBWB",
  "9": "bwBwbwBWB",
  A: "BwbwbwbWB",
  B: "bwBwbwbWB",
  C: "BwBwbwbwB",
  D: "bwbwBwbWB",
  E: "BwbwBwbwB",
  F: "bwBwBwbwB",
  G: "bwbwbwBWB",
  H: "BwbwbwBWb",
  I: "bwBwbwBWb",
  J: "bwbwBwBWb",
  K: "BwbwbwbwB",
  L: "bwBwbwbwB",
  M: "BwBwbwbwB",
  N: "bwbwBwbwB",
  O: "BwbwBwbwB",
  P: "bwBwBwbwB",
  Q: "bwbwbwBwB",
  R: "BwbwbwBwB",
  S: "bwBwbwBwB",
  T: "bwbwBwBwB",
  U: "BWbwbwbwb",
  V: "bWBwbwbwb",
  W: "BWBwbwbwb",
  X: "bWbwBwbwb",
  Y: "BWbwBwbwb",
  Z: "bWBwBwbwb",
  "-": "bWbwbwBwb",
  ".": "BWbwbwBwb",
  " ": "bWBwbwBwb",
  $: "bWbWbWbwb",
  "/": "bWbWbwbWb",
  "+": "bWbwbWbWb",
  "%": "bwbWbWbWb",
  "*": "bWbwBwBwb",
};

/**
 * Encodes text into a series of bar widths and space widths.
 */
export function encodeCode39(text = "") {
  const clean = String(text || "TICKET")
    .toUpperCase()
    .replace(/[^0-9A-Z\-. $/+%]/g, "-");
  const fullText = `*${clean}*`;

  const elements = [];
  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS["-"];
    for (let p = 0; p < pattern.length; p++) {
      const type = pattern[p];
      const isBar = type === "b" || type === "B";
      const isWide = type === "B" || type === "W";
      elements.push({ isBar, width: isWide ? 2.5 : 1 });
    }
    // Inter-character narrow space
    if (i < fullText.length - 1) {
      elements.push({ isBar: false, width: 1 });
    }
  }
  return { clean, elements };
}

/**
 * Generates an SVG string representation of the barcode (useful for HTML templates and printing).
 */
export function generateBarcodeSvgString(text, { height = 36, unitWidth = 1.3, color = "#0f172a" } = {}) {
  const { elements } = encodeCode39(text);
  let totalWidth = 0;
  elements.forEach((el) => {
    totalWidth += el.width * unitWidth;
  });

  const quietZone = 8;
  const viewBoxWidth = totalWidth + quietZone * 2;

  let x = quietZone;
  let rects = "";

  elements.forEach((el) => {
    const w = el.width * unitWidth;
    if (el.isBar) {
      rects += `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${height}" fill="${color}" />`;
    }
    x += w;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth.toFixed(2)} ${height}" width="${viewBoxWidth.toFixed(2)}" height="${height}" style="display:block;margin:0 auto;max-width:100%;">${rects}</svg>`;
}
