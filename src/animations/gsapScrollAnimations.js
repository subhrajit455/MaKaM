import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin with GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Checks if the user has requested reduced motion in their system preferences.
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Checks if the current viewport is mobile-sized (< 768px).
 * @returns {boolean}
 */
export const isMobileViewport = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

/**
 * Default animation configuration
 */
export const DEFAULT_CONFIG = {
  start: "top 85%",
  duration: 0.75,
  ease: "power2.out",
  stagger: 0.1,
  once: true,
};

/**
 * Initializes GSAP ScrollTrigger animations across any container element.
 * Scans for elements marked with [data-animate] and binds professional ScrollTrigger timelines.
 *
 * @param {HTMLElement|string} container - The DOM element or selector scoping the animation search.
 * @param {Object} [overrides={}] - Optional configuration overrides.
 * @returns {Array<gsap.core.Tween|gsap.core.Timeline>} Created GSAP animation instances.
 */
export const initScrollAnimations = (container = document, overrides = {}) => {
  if (typeof window === "undefined" || !container) return [];

  const root = typeof container === "string" ? document.querySelector(container) : container;
  if (!root) return [];

  // In reduced-motion mode, immediately reveal all marked elements cleanly without transforms
  if (prefersReducedMotion()) {
    const animatedElements = root.querySelectorAll?.("[data-animate]") || [];
    animatedElements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.visibility = "visible";
    });
    return [];
  }

  const isMobile = isMobileViewport();
  const elements = root.querySelectorAll?.("[data-animate]") || [];
  const animations = [];

  elements.forEach((element) => {
    // Avoid double-binding if already initialized in this cycle
    if (element.dataset.gsapInitialized === "true") return;

    const animType = element.dataset.animate || "fade-up";
    const delay = parseFloat(element.dataset.delay) || 0;
    const customDuration = parseFloat(element.dataset.duration) || DEFAULT_CONFIG.duration;
    const startPos = element.dataset.triggerStart || DEFAULT_CONFIG.start;
    const isOnce = element.dataset.once !== "false";
    const scrub = element.dataset.scrub === "true" ? 1 : false;

    // Halve vertical/horizontal movement on mobile to prevent jerky scroll or layout shifts
    const yOffset = isMobile ? 18 : 36;
    const xOffset = isMobile ? 22 : 44;

    const scrollTriggerConfig = {
      trigger: element,
      start: startPos,
      once: isOnce && !scrub,
      scrub: scrub,
      toggleActions: isOnce ? "play none none none" : "play reverse play reverse",
      ...overrides.scrollTrigger,
    };

    // Stagger Container Animation
    if (animType === "stagger") {
      const targetSelector = element.dataset.staggerTarget || "> *";
      const staggerDelay = parseFloat(element.dataset.stagger) || DEFAULT_CONFIG.stagger;
      const targets = element.querySelectorAll(targetSelector);

      if (targets && targets.length > 0) {
        const tween = gsap.fromTo(
          targets,
          {
            opacity: 0,
            y: yOffset,
            scale: 0.98,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: customDuration,
            delay: delay,
            stagger: staggerDelay,
            ease: DEFAULT_CONFIG.ease,
            clearProps: "transform,opacity", // Critical: Allows CSS :hover micro-interactions to work cleanly!
            scrollTrigger: scrollTriggerConfig,
          }
        );
        animations.push(tween);
        element.dataset.gsapInitialized = "true";
      }
      return;
    }

    // Scroll-Linked Parallax Animation
    if (animType === "parallax") {
      const speed = parseFloat(element.dataset.speed) || 0.15;
      const movement = speed * 120;
      const tween = gsap.fromTo(
        element,
        { y: -movement / 2 },
        {
          y: movement / 2,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            ...overrides.scrollTrigger,
          },
        }
      );
      animations.push(tween);
      element.dataset.gsapInitialized = "true";
      return;
    }

    // Individual Element Animation Mapping
    let fromProps = { opacity: 0 };
    let toProps = {
      opacity: 1,
      duration: customDuration,
      delay: delay,
      ease: DEFAULT_CONFIG.ease,
      clearProps: "transform,opacity",
      scrollTrigger: scrollTriggerConfig,
    };

    switch (animType) {
      case "fade-down":
        fromProps = { opacity: 0, y: -yOffset };
        toProps.y = 0;
        break;

      case "slide-left":
        fromProps = { opacity: 0, x: -xOffset };
        toProps.x = 0;
        toProps.ease = "power3.out";
        break;

      case "slide-right":
        fromProps = { opacity: 0, x: xOffset };
        toProps.x = 0;
        toProps.ease = "power3.out";
        break;

      case "zoom-in":
        fromProps = { opacity: 0, scale: 0.93 };
        toProps.scale = 1;
        break;

      case "scale-up":
        fromProps = { opacity: 0, scale: 0.88 };
        toProps.scale = 1;
        break;

      case "blur-reveal":
        // Simplify filter on low-end mobile devices to maintain 60fps budget
        if (isMobile) {
          fromProps = { opacity: 0, y: yOffset };
          toProps.y = 0;
        } else {
          fromProps = { opacity: 0, y: 20, filter: "blur(10px)" };
          toProps.y = 0;
          toProps.filter = "blur(0px)";
          toProps.clearProps = "transform,opacity,filter";
        }
        break;

      case "clip-reveal":
        // Smooth clipping mask expansion from bottom
        if (isMobile) {
          fromProps = { opacity: 0, y: yOffset };
          toProps.y = 0;
        } else {
          fromProps = { opacity: 0, clipPath: "inset(100% 0 0 0)" };
          toProps.clipPath = "inset(0% 0 0 0)";
          toProps.ease = "power3.out";
          toProps.clearProps = "clipPath,opacity";
        }
        break;

      case "rotate-reveal":
        fromProps = { opacity: 0, y: yOffset, rotation: 2 };
        toProps.y = 0;
        toProps.rotation = 0;
        break;

      case "3d-flip":
        if (isMobile) {
          fromProps = { opacity: 0, y: yOffset };
          toProps.y = 0;
        } else {
          fromProps = {
            opacity: 0,
            y: yOffset,
            rotationX: 12,
            transformPerspective: 800,
          };
          toProps.y = 0;
          toProps.rotationX = 0;
        }
        break;

      case "fade-up":
      default:
        fromProps = { opacity: 0, y: yOffset };
        toProps.y = 0;
        break;
    }

    const tween = gsap.fromTo(element, fromProps, toProps);
    animations.push(tween);
    element.dataset.gsapInitialized = "true";
  });

  return animations;
};

/**
 * Safely refreshes all registered ScrollTrigger positions after dynamic content or images load.
 */
export const refreshScrollTrigger = () => {
  if (typeof window !== "undefined" && ScrollTrigger) {
    ScrollTrigger.refresh();
  }
};

export { gsap, ScrollTrigger };
export default initScrollAnimations;
