import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, initScrollAnimations, refreshScrollTrigger } from "../animations/gsapScrollAnimations";

/**
 * Custom React hook to bind and manage GSAP ScrollTrigger animations across a component lifecycle.
 * Utilizes `gsap.context()` for scoped triggers and 100% clean teardown on unmount or route change.
 * Fully compatible with React 19 StrictMode double-mounting.
 *
 * @param {React.RefObject<HTMLElement>} containerRef - Ref pointing to the section/container root.
 * @param {Array<any>} [deps=[]] - Dependency array to re-initialize or refresh triggers when data loads.
 * @returns {{ refresh: () => void }} Controller object with manual refresh capability.
 */
export function useScrollAnimation(containerRef, deps = []) {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    const container = containerRef?.current;
    if (!container) return;

    // Small delay ensures child DOM elements, images and sub-components are fully committed
    const rafId = requestAnimationFrame(() => {
      if (!isMountedRef.current || !containerRef.current) return;

      const ctx = gsap.context(() => {
        initScrollAnimations(containerRef.current);
      }, containerRef);

      // Save context on container for cleanup
      container._gsapContext = ctx;
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (container?._gsapContext) {
        container._gsapContext.revert();
        delete container._gsapContext;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Extra refresh effect after DOM settle
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshScrollTrigger();
    }, 200);

    return () => clearTimeout(timer);
  }, deps);

  return { refresh: refreshScrollTrigger };
}

export default useScrollAnimation;
