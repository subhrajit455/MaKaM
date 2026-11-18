import React, { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered liquid wave fill over brand color gradient headings.
 * Exposes full readable text via .visually-hidden and decouples the wave mask
 * from background-clip: text for cross-browser rendering stability.
 */
export default function LiquidFillText({
  text = "",
  className = "",
  baseClassName = "text-[#045C45]/20 dark:text-emerald-400/25",
  gradientClassName = "maqam-text-gradient",
}) {
  const containerRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
      : false
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isVisible) return undefined;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion, isVisible]);

  const active = prefersReducedMotion || isVisible;

  return (
    <span
      ref={containerRef}
      className={`relative inline-block max-w-full align-baseline ${className}`}
    >
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true" className={`select-none ${baseClassName}`}>
        {text}
      </span>
      <span
        aria-hidden="true"
        className={`maqam-liquid-mask absolute inset-0 select-none pointer-events-none ${
          active ? "is-active" : ""
        } ${prefersReducedMotion ? "is-reduced" : ""}`}
      >
        <span className={gradientClassName}>{text}</span>
      </span>
    </span>
  );
}
