import React from "react";
import { encodeCode39, generateBarcodeSvgString } from "./barcodeUtils.js";

export { encodeCode39, generateBarcodeSvgString };

/**
 * React Component for rendering Code 39 Barcode SVG
 */
export default function BarcodeSvg({
  value = "TESTPNR",
  height = 36,
  unitWidth = 1.3,
  color = "#0f172a",
  className = "",
  showText = false,
}) {
  const { clean, elements } = encodeCode39(value);

  let totalWidth = 0;
  elements.forEach((el) => {
    totalWidth += el.width * unitWidth;
  });

  const quietZone = 8;
  const viewBoxWidth = totalWidth + quietZone * 2;

  let currentX = quietZone;
  const rects = [];

  elements.forEach((el, idx) => {
    const w = el.width * unitWidth;
    if (el.isBar) {
      rects.push(
        <rect
          key={idx}
          x={currentX}
          y={0}
          width={w}
          height={height}
          fill={color}
        />
      );
    }
    currentX += w;
  });

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
        height={height}
        className="w-full max-w-[200px] h-auto overflow-visible"
        aria-label={`Barcode for ${clean}`}
      >
        {rects}
      </svg>
      {showText && (
        <span className="font-mono text-[11px] font-black tracking-widest text-slate-800 mt-1 uppercase">
          {clean}
        </span>
      )}
    </div>
  );
}
