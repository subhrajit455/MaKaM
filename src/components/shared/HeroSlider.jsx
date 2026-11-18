import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, MapPin } from "lucide-react";
import { useHeroBanner } from "../../hooks/useHeroBanner";
import slide1 from "../../assets/hero-slider/slide1-makkah-kaaba-tawaf.jpg";
import slide2 from "../../assets/hero-slider/slide2-madinah-prophet-mosque.jpg";
import slide3 from "../../assets/hero-slider/slide3-madinah-green-dome.jpg";
import slide4 from "../../assets/hero-slider/slide4-haramain-highspeed-rail.jpg";
import slide5 from "../../assets/hero-slider/slide5-quba-mosque-madinah.jpg";

const DEFAULT_HERO_SLIDES = [
  {
    src: slide1,
    alt: "Holy Kaaba and Mataf Courtyard at Masjid al-Haram in Makkah",
    location: "Masjid al-Haram, Makkah",
    eyebrow: "Verified Pilgrimage & Halal Travel",
    title: "Sacred Journeys, Effortlessly Arranged",
    subtitle:
      "Book verified hotels steps from Haram, direct flights to Jeddah & Madinah, and guided Ziyarat packages with transparent pricing.",
  },
  {
    src: slide2,
    alt: "Al-Masjid an-Nabawi Courtyard with Shading Umbrellas in Madinah",
    location: "Al-Masjid an-Nabawi, Madinah",
    eyebrow: "Madinah Courtyard Stays",
    title: "Serenity Steps from the Prophet's Mosque",
    subtitle:
      "Compare central 4★ and 5★ properties overlooking the sacred Piazza with breakfast and private transfers included.",
  },
  {
    src: slide3,
    alt: "The Iconic Green Dome and Minarets of Al-Masjid an-Nabawi",
    location: "Green Dome, Madinah",
    eyebrow: "Scholar-Guided Umrah",
    title: "Guided Ziyarat with Licensed Scholars",
    subtitle:
      "Travel with multilingual spiritual guides covering Rawdah permits, historic landmarks, and calm family itineraries.",
  },
  {
    src: slide4,
    alt: "Haramain High-Speed Rail Pilgrimage Travel Between Makkah and Madinah",
    location: "Haramain High-Speed Rail",
    eyebrow: "Direct Flights & Transfers",
    title: "Seamless Connections Between Two Holy Cities",
    subtitle:
      "Combine Jeddah and Madinah flight allotments with private ground transfers and pre-scheduled Haramain rail seats.",
  },
  {
    src: slide5,
    alt: "Historic Quba Mosque in Madinah, First Mosque in Islam",
    location: "Masjid Quba, Madinah",
    eyebrow: "Heritage & Cultural Excursions",
    title: "Curated Islamic Heritage & Global Holidays",
    subtitle:
      "Tailored itineraries crafted for families, elders, and small groups with 24/7 on-ground coordinator support.",
  },
];

const HeroSlider = ({
  slides: initialSlides,
  heightClass = "min-h-[470px] h-[62svh] max-h-[640px] sm:min-h-[520px] lg:min-h-[570px]",
  curved = true,
  interval = 5000,
  offsetHeader = true,
  eyebrow,
  title,
  subtitle,
  align = "left",
  showEditorialOverlay = true,
  showControls = false,
  className = "",
  children,
}) => {
  const { heroBanner } = useHeroBanner();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
      : false
  );
  const [visitedSlides, setVisitedSlides] = useState(() => new Set([0]));

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Compute active slides list, prepending dynamic active hero banner if published
  const activeSlides = useMemo(() => {
    const base = initialSlides || DEFAULT_HERO_SLIDES;

    if (
      heroBanner &&
      heroBanner.isPublished !== false &&
      typeof heroBanner.imageUrl === "string" &&
      heroBanner.imageUrl.trim().length > 0
    ) {
      const bannerTitle = (heroBanner.title || "").trim().toUpperCase();
      const bannerSub = (heroBanner.subTitle || "").trim().toLowerCase();
      // Specifically filter out the "WELCOM TO MAQAM" / "Start your journey with us" slide as requested
      const isTargetRemovedBanner =
        bannerTitle.includes("WELCOM TO MAQAM") ||
        bannerTitle.includes("WELCOME TO MAQAM") ||
        bannerSub.includes("start your journey with us");

      if (isTargetRemovedBanner) {
        return base;
      }

      const dynamicSlide = {
        src: heroBanner.imageUrl.trim(),
        alt: heroBanner.title || "Maqam Travels Hero Banner",
        location: "Featured Pilgrimage Offer",
        eyebrow: eyebrow || "Verified Pilgrimage & Halal Travel",
        title: heroBanner.title?.trim() || title || base[0]?.title,
        subtitle: heroBanner.subTitle?.trim() || subtitle || base[0]?.subtitle,
        isDynamic: true,
        fallback: slide1,
      };

      // Put dynamic banner first, followed by default slides
      return [dynamicSlide, ...base];
    }

    return base;
  }, [initialSlides, heroBanner, eyebrow, title, subtitle]);

  const effectiveSlideIndex = currentSlide >= activeSlides.length ? 0 : currentSlide;
  const activeSlide = activeSlides[effectiveSlideIndex] || activeSlides[0];
  const isAutoPaused =
    isManuallyPaused || isHovered || isFocusedWithin || prefersReducedMotion;

  const selectSlide = useCallback(
    (nextIndex) => {
      if (activeSlides.length === 0) return;
      const normalized =
        ((nextIndex % activeSlides.length) + activeSlides.length) % activeSlides.length;
      setVisitedSlides((prev) => (prev.has(normalized) ? prev : new Set(prev).add(normalized)));
      setCurrentSlide(normalized);
    },
    [activeSlides.length]
  );

  useEffect(() => {
    if (activeSlides.length <= 1 || isAutoPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % activeSlides.length;
        setVisitedSlides((v) => (v.has(next) ? v : new Set(v).add(next)));
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeSlides.length, isAutoPaused, interval]);

  // Dynamic CMS slide 0 overrides prop fallbacks when admin sets custom title/subTitle
  const resolvedEyebrow =
    (activeSlide?.isDynamic ? activeSlide.eyebrow : eyebrow || activeSlide?.eyebrow) ||
    "Verified Pilgrimage & Halal Travel";
  const resolvedTitle =
    (activeSlide?.isDynamic ? heroBanner?.title?.trim() || title : title || activeSlide?.title) ||
    DEFAULT_HERO_SLIDES[0].title;
  const resolvedSubtitle =
    (activeSlide?.isDynamic
      ? heroBanner?.subTitle?.trim() || subtitle
      : subtitle || activeSlide?.subtitle) || DEFAULT_HERO_SLIDES[0].subtitle;

  const formattedIndex = String(effectiveSlideIndex + 1).padStart(2, "0");
  const formattedTotal = String(activeSlides.length).padStart(2, "0");

  return (
    <div
      className={`maqam-hero-parallax-wrap relative w-full overflow-hidden bg-[#045C45] ${
        offsetHeader ? "mt-16 sm:mt-18" : ""
      } ${heightClass} ${
        curved ? "rounded-b-[2rem] sm:rounded-b-[2.5rem] md:rounded-b-none" : ""
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusedWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocusedWithin(false);
        }
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Destinations & Pilgrimage Hero Showcase"
    >
      {/* Background Slides with Scroll Parallax Wrapper, Ken Burns & Crossfade */}
      <div className="maqam-hero-media absolute inset-0 pointer-events-none">
        {activeSlides.map((slide, index) => {
          // Render Slide 0 eagerly for instant LCP; only mount subsequent slides when active or visited
          if (!visitedSlides.has(index) && index !== currentSlide && index !== effectiveSlideIndex) return null;
          const isActive = index === effectiveSlideIndex;
          return (
            <div
              key={slide.src || index}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={slide.src}
                alt={slide.alt || `Slide ${index + 1}`}
                fetchPriority={index === 0 ? "high" : "low"}
                loading={index === 0 ? "eager" : "lazy"}
                decoding={index === 0 ? "sync" : "async"}
                className={`w-full h-full object-cover object-center ${
                  isActive ? "maqam-ken-burns" : ""
                } ${isActive && isManuallyPaused ? "maqam-ken-burns-paused" : ""}`}
                onError={(e) => {
                  if (slide.fallback && e.currentTarget.src !== slide.fallback) {
                    e.currentTarget.src = slide.fallback;
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Layered Atmospheric oklab Scrims for Cinema Contrast */}
      <div
        className="maqam-hero-scrim-top absolute inset-x-0 top-0 h-28 pointer-events-none z-15"
        aria-hidden="true"
      />
      <div
        className="maqam-hero-scrim-vignette absolute inset-0 pointer-events-none z-15"
        aria-hidden="true"
      />
      <div
        className="maqam-hero-scrim-bottom absolute inset-x-0 bottom-0 h-40 sm:h-48 pointer-events-none z-15"
        aria-hidden="true"
      />

      {/* Editorial Content Slot: Custom children (e.g. PackagePage) OR Structured Cinematic Hero */}
      {children ? (
        <div className="relative z-20 w-full h-full flex flex-col justify-center pb-20 sm:pb-28 pointer-events-none">
          {children}
        </div>
      ) : (
        showEditorialOverlay && (
          <div className="relative z-20 w-full h-full mx-auto max-w-[1760px] px-4 sm:px-6 lg:px-10 xl:px-12 flex flex-col justify-end pb-20 sm:pb-24 md:pb-28 lg:pb-32 pt-14 pointer-events-none">
            <div
              className={`max-w-3xl ${
                align === "center" ? "mx-auto text-center items-center flex flex-col" : "text-left"
              }`}
            >
              {/* Location & Trusted Service Eyebrow */}
              <div
                data-animate="fade-down"
                data-delay="0.1"
                className="mb-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-emerald-200 shadow-sm"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-300 shrink-0" aria-hidden="true" />
                <span>{activeSlide?.location || resolvedEyebrow}</span>
                <span className="text-white/35" aria-hidden="true">
                  •
                </span>
                <span className="font-mirza text-sm tracking-wide text-amber-200">
                  {resolvedEyebrow}
                </span>
              </div>

              <h1
                data-animate="fade-up"
                data-delay="0.2"
                className="maqam-hero-title font-poppins font-extrabold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]"
              >
                {resolvedTitle}
              </h1>

              <p
                data-animate="fade-up"
                data-delay="0.35"
                className="maqam-hero-subtitle mt-3 font-jakarta font-medium text-slate-100/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
              >
                {resolvedSubtitle}
              </p>
            </div>
          </div>
        )
      )}

      {/* Cinema Slide Controls & WCAG 2.2.2 Pause/Play Toggle */}
      {showControls && activeSlides.length > 1 && (
        <div
          className="absolute top-3.5 right-3.5 sm:top-auto sm:bottom-24 md:bottom-28 lg:bottom-32 sm:right-6 lg:right-10 xl:right-12 z-25 flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-black/35 backdrop-blur-md px-2 py-1 text-white shadow-lg"
          role="group"
          aria-label="Hero slideshow controls"
        >
          <button
            type="button"
            onClick={() => selectSlide(effectiveSlideIndex - 1)}
            aria-label="Previous hero slide"
            className="maqam-hero-control inline-flex min-h-[34px] min-w-[34px] [@media(pointer:coarse)]:min-h-[44px] [@media(pointer:coarse)]:min-w-[44px] items-center justify-center rounded-full text-white/85 hover:text-white hover:bg-white/15 transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Slide Dots */}
          <div className="hidden md:flex items-center gap-1.5 px-1">
            {activeSlides.map((slide, idx) => {
              const isCurrent = idx === effectiveSlideIndex;
              return (
                <button
                  key={slide.src || idx}
                  type="button"
                  onClick={() => selectSlide(idx)}
                  aria-label={`Show slide ${idx + 1}: ${slide.location || slide.alt}`}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`maqam-hero-control h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent ? "w-6 bg-amber-300" : "w-2 bg-white/45 hover:bg-white/75"
                  }`}
                />
              );
            })}
          </div>

          <span
            className="px-1.5 text-[11px] font-semibold font-inter tabular-nums text-white/90 select-none"
            aria-live="off"
          >
            {formattedIndex} / {formattedTotal}
          </span>

          <button
            type="button"
            onClick={() => selectSlide(effectiveSlideIndex + 1)}
            aria-label="Next hero slide"
            className="maqam-hero-control inline-flex min-h-[34px] min-w-[34px] [@media(pointer:coarse)]:min-h-[44px] [@media(pointer:coarse)]:min-w-[44px] items-center justify-center rounded-full text-white/85 hover:text-white hover:bg-white/15 transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <span className="h-4 w-px bg-white/20" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setIsManuallyPaused((p) => !p)}
            aria-label={isManuallyPaused ? "Play hero slideshow" : "Pause hero slideshow"}
            className="maqam-hero-control inline-flex min-h-[34px] min-w-[34px] [@media(pointer:coarse)]:min-h-[44px] [@media(pointer:coarse)]:min-w-[44px] items-center justify-center rounded-full text-amber-300 hover:bg-white/15 transition cursor-pointer"
          >
            {isManuallyPaused ? (
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Pause className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
