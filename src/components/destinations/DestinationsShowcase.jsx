import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight, Plane } from "lucide-react";
import packageService from "../../services/packageService";
import LiquidFillText from "../ui/LiquidFillText";
import makkahLocal from "../../assets/hero-slider/slide1-makkah-kaaba-tawaf.jpg";
import madinahLocal from "../../assets/hero-slider/slide3-madinah-green-dome.jpg";

const DESTINATION_TABS = [
  { id: "all", label: "All Destinations" },
  { id: "pilgrimage", label: "Sacred Pilgrimage" },
  { id: "holidays", label: "Halal Escapes" },
  { id: "heritage", label: "Islamic Heritage" },
];

const BASE_DESTINATIONS = [
  {
    id: "makkah",
    name: "Makkah Al-Mukarramah",
    country: "Saudi Arabia",
    category: "pilgrimage",
    tagline: "Masjid al-Haram Courtyard Stays",
    distanceNote: "Steps from King Fahad & Ajyad Gates",
    defaultPrice: 45000,
    airport: "JED",
    image: makkahLocal,
    keywords: ["makkah", "mecca", "haram"],
  },
  {
    id: "madinah",
    name: "Madinah Al-Munawwarah",
    country: "Saudi Arabia",
    category: "pilgrimage",
    tagline: "City of the Prophet & Rawdah Access",
    distanceNote: "2 mins walk to Al-Masjid an-Nabawi",
    defaultPrice: 42000,
    airport: "MED",
    image: madinahLocal,
    keywords: ["madina", "madinah", "medina"],
  },
  {
    id: "istanbul",
    name: "Istanbul & Cappadocia",
    country: "Turkey",
    category: "heritage",
    tagline: "Blue Mosque, Bosphorus & Cave Stays",
    distanceNote: "Sultanahmet & Historic Peninsula",
    defaultPrice: 62000,
    airport: "IST",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
    keywords: ["turkey", "istanbul", "cappadocia"],
  },
  {
    id: "dubai",
    name: "Dubai & Abu Dhabi",
    country: "United Arab Emirates",
    category: "holidays",
    tagline: "Sheikh Zayed Mosque & Desert Safaris",
    distanceNote: "Marina Resorts & Family Attractions",
    defaultPrice: 55000,
    airport: "DXB",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    keywords: ["dubai", "abu dhabi", "uae"],
  },
  {
    id: "cairo",
    name: "Cairo & Giza",
    country: "Egypt",
    category: "heritage",
    tagline: "Al-Azhar, Citadel & Great Pyramids",
    distanceNote: "Islamic Cairo & Nile Cruises",
    defaultPrice: 49000,
    airport: "CAI",
    image:
      "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80",
    keywords: ["cairo", "egypt", "giza"],
  },
  {
    id: "samarkand",
    name: "Samarkand & Bukhara",
    country: "Uzbekistan",
    category: "heritage",
    tagline: "Registan Square & Imam Bukhari Shrine",
    distanceNote: "Silk Road Islamic Architecture",
    defaultPrice: 52000,
    airport: "TAS",
    image:
      "https://images.unsplash.com/photo-1584250904113-1f4f1d90ca26?auto=format&fit=crop&w=1200&q=80",
    keywords: ["samarkand", "bukhara", "uzbekistan", "tashkent"],
  },
];

export default function DestinationsShowcase() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    let active = true;
    packageService
      .getPackages({ limit: 24 })
      .then((res) => {
        if (!active) return;
        const list = res?.packages || res?.data || [];
        if (Array.isArray(list)) setPackages(list);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const enrichedDestinations = useMemo(() => {
    return BASE_DESTINATIONS.map((dest) => {
      const matching = packages.filter((p) => {
        const text = `${p.destination || ""} ${p.title || ""}`.toLowerCase();
        return dest.keywords.some((kw) => text.includes(kw));
      });
      const prices = matching
        .map((m) => Number(m.sellPrice || 0))
        .filter((n) => n > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : dest.defaultPrice;
      const firstImage = matching.find((m) => Array.isArray(m.images) && m.images[0])?.images?.[0];

      return {
        ...dest,
        startingPrice: minPrice,
        packageCount: matching.length,
        coverImage: firstImage || dest.image,
      };
    });
  }, [packages]);

  const visibleDestinations = useMemo(() => {
    if (activeTab === "all") return enrichedDestinations;
    return enrichedDestinations.filter((d) => d.category === activeTab);
  }, [activeTab, enrichedDestinations]);

  const handleTabKeyDown = (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const idx = DESTINATION_TABS.findIndex((t) => t.id === activeTab);
    let nextIdx = idx;
    if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = DESTINATION_TABS.length - 1;
    else if (e.key === "ArrowRight") nextIdx = (idx + 1) % DESTINATION_TABS.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + DESTINATION_TABS.length) % DESTINATION_TABS.length;
    const nextTab = DESTINATION_TABS[nextIdx];
    setActiveTab(nextTab.id);
    const btn = document.getElementById(`dest-tab-${nextTab.id}`);
    btn?.focus();
    btn?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  return (
    <section
      aria-labelledby="destinations-heading"
      className="maqam-section py-10 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-10 xl:px-12 bg-white dark:bg-[#0b1120] font-poppins transition-colors"
    >
      <div className="w-full max-w-[1760px] mx-auto">
        <div data-animate="fade-up" className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-[#00987A] dark:text-emerald-400 mb-2">
              Explore Gateways
            </p>
            <h2
              id="destinations-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              Trending Destinations &amp;{" "}
              <LiquidFillText text="Sacred Cities" />
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Curated pilgrimage sanctuaries, historic Islamic capitals, and family-friendly halal destinations ready to book.
            </p>
          </div>

          {/* Accessible Single-Row Scrollable Tabs */}
          <div
            className="maqam-tablist flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-slate-100/80 dark:bg-slate-900 p-1.5 scrollbar-hide max-w-full"
            role="tablist"
            aria-label="Destination categories"
            onKeyDown={handleTabKeyDown}
          >
            {DESTINATION_TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`dest-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-none px-3.5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selected
                      ? "text-[#045C45] dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div data-animate="stagger" data-stagger-target="article" className="flex overflow-x-auto snap-x snap-proximity overscroll-x-contain scrollbar-hide [-webkit-overflow-scrolling:touch] gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {visibleDestinations.map((dest) => (
            <article
              key={dest.id}
              onClick={() => navigate(`/package-page?destination=${encodeURIComponent(dest.name.split(" ")[0])}`)}
              className="group pro-card pro-card-interactive pro-card-press relative flex-none w-[82vw] max-w-[330px] snap-start sm:w-auto sm:max-w-none rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900 overflow-hidden cursor-pointer flex flex-col"
            >
              <div className="relative h-56 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={dest.coverImage}
                  alt={`${dest.name}, ${dest.country}`}
                  loading="lazy"
                  width="600"
                  height="360"
                  className="h-full w-full object-cover pro-card-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-black/55 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white">
                    <Plane size={11} />
                    <span>{dest.airport}</span>
                  </span>
                  {dest.packageCount > 0 && (
                    <span className="rounded-lg bg-[#045C45]/95 px-2.5 py-1 text-[11px] font-semibold text-white">
                      {dest.packageCount} Live {dest.packageCount === 1 ? "Package" : "Packages"}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-200">
                    {dest.country}
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold leading-snug">{dest.name}</h3>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {dest.tagline}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin size={13} className="text-[#00987A] shrink-0" />
                    <span>{dest.distanceNote}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Starting From
                    </span>
                    <span className="text-lg font-extrabold text-[#045C45] dark:text-emerald-400 font-inter tabular-nums">
                      ₹{dest.startingPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#045C45] dark:text-emerald-300 text-xs font-bold group-hover:bg-[#045C45] group-hover:text-white transition-colors">
                    <span>Explore</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
