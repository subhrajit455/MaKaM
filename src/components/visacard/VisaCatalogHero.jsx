import React from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { categoryTabs } from "./visaUtils";
import { clickSquash } from "../../animations/presets";
import visaHeroBg from "../../assets/visa_hero_bg.jpg";

export default function VisaCatalogHero({
  searchQuery = "",
  setSearchQuery,
  activeCategory = "All Visas",
  setActiveCategory,
}) {
  return (
    <>
      {/* HERO TOP SECTION (Full Screen Width 100vw, Centered Minimal Luxury) */}
      <section className="relative w-full overflow-hidden bg-slate-950 font-poppins pt-20 sm:pt-24 border-b border-slate-800 shadow-xl">
        {/* Background Image: Nighttime Paris Skyline (Preserved) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${visaHeroBg})`,
            backgroundPosition: "center 35%",
          }}
        />
        {/* Dark Gradient Overlay for optimal contrast while letting city lights show */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95" />

        {/* Inner Content Container Centered */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col items-center text-center">
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Visas Made Simple for Every Trip
          </h1>

          {/* Minimal Clean Subtitle */}
          <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-normal mt-2.5 max-w-md mx-auto">
            Seamless online approvals for worldwide destinations.
          </p>

          {/* Centered Premium Search Bar with Integrated Action Button */}
          <div className="w-full max-w-2xl mt-7 sm:mt-8">
            <div className="flex items-center bg-white rounded-xl sm:rounded-2xl shadow-2xl p-1.5 sm:p-2 border border-white/20 transition-all focus-within:ring-4 focus-within:ring-emerald-500/20">
              <div className="flex items-center flex-1 px-3 sm:px-4 py-1.5 sm:py-2">
                <Search size={19} className="text-slate-400 mr-2.5 sm:mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery?.(e.target.value)}
                  placeholder="Search destination country (e.g. Dubai, Singapore, UK)..."
                  className="w-full bg-transparent outline-none font-poppins text-xs sm:text-sm lg:text-base text-slate-900 font-medium placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery?.("")}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer transition shrink-0 ml-1.5"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {/* Search Button */}
              <button
                type="button"
                onClick={() => {
                  const catalogueEl = document.querySelector("main");
                  if (catalogueEl) {
                    catalogueEl.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
              >
                <span>Search</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 pt-8 font-poppins">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 mb-2">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={(e) => {
                clickSquash(e.currentTarget);
                setActiveCategory?.(cat);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
