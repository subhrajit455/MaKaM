import React from "react";
import { Globe, RefreshCw, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import AnimatedNumber from "../shared/AnimatedNumber";
import { clickSquash } from "../../animations/presets";

export default function VisaCountryGrid({
  isLoadingVisas = false,
  filteredVisas = [],
  visas = [],
  onFetchVisas,
  onResetFilters,
  onOpenApplication,
  navigate,
}) {
  return (
    <main className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 pb-16 font-poppins">
      {isLoadingVisas ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <div
              key={n}
              className="w-full h-[250px] xs:h-[270px] sm:h-[350px] lg:h-[400px] rounded-2xl sm:rounded-3xl bg-slate-200/80 animate-pulse flex flex-col justify-between p-4 border border-slate-200"
            >
              <div className="flex justify-between items-center">
                <div className="w-8 h-8 rounded-full bg-slate-300" />
                <div className="w-16 h-5 rounded-full bg-slate-300" />
              </div>
              <div className="space-y-2 mt-auto">
                <div className="w-3/4 h-5 rounded-lg bg-slate-300 mx-auto" />
                <div className="w-1/2 h-3.5 rounded-lg bg-slate-300 mx-auto" />
                <div className="w-full h-9 rounded-xl bg-slate-300 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredVisas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
            <Globe size={32} />
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900">
            {visas.length === 0
              ? "No Visas Found in Database"
              : "No Matching Visas Found"}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {visas.length === 0
              ? "No active visa catalog records were returned from the API."
              : "Try adjusting your search query or reset filter selections."}
          </p>
          <button
            type="button"
            onClick={() => {
              if (visas.length === 0) {
                onFetchVisas?.();
              } else {
                onResetFilters?.();
              }
            }}
            className="mt-4 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5 mx-auto"
          >
            {visas.length === 0 ? (
              <>
                <RefreshCw size={13} />
                <span>Fetch Visas from Database</span>
              </>
            ) : (
              <span>Reset Filters</span>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-6">
          {filteredVisas.map((visa) => (
            <div key={visa.id} className="visa-grid-card w-full flex flex-col group">
              {/* Visual Card (Compact height on mobile) */}
              <div
                className="pro-card pro-card-interactive pro-card-press relative h-[250px] xs:h-[270px] sm:h-[350px] lg:h-[400px] w-full rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer"
                onClick={(e) => {
                  clickSquash(e.currentTarget);
                  navigate?.(
                    `/visa/${visa.country.toLowerCase().replace(/\s+/g, "-")}`,
                  );
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    navigate?.(
                      `/visa/${visa.country.toLowerCase().replace(/\s+/g, "-")}`,
                    );
                  }
                }}
              >
                {/* Background Image */}
                <img
                  src={visa.image}
                  alt={visa.country}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center pro-card-image"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15" />

                {/* Top Badge: Official Flag Image + Visa Type */}
                <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between gap-1.5 z-10">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-white/90 shadow-md bg-white flex items-center justify-center shrink-0">
                    <img
                      src={
                        visa.raw?.countryFlag &&
                        visa.raw.countryFlag.startsWith("http")
                          ? visa.raw.countryFlag
                          : `https://flagcdn.com/w80/${(visa.code || "sa").toLowerCase()}.png`
                      }
                      alt={`${visa.country} flag`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/50 sm:bg-white/20 backdrop-blur-md text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider border border-white/25 truncate max-w-[95px] sm:max-w-none shadow-xs">
                    {visa.type}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 lg:p-5 flex flex-col items-center">
                  {/* Country Name */}
                  <h2
                    title={visa.country}
                    className="text-white text-xs sm:text-base lg:text-xl font-black uppercase text-center tracking-wide drop-shadow-md w-full truncate mb-1.5 sm:mb-3"
                  >
                    {visa.country}
                  </h2>

                  {/* Stats Frosted Glass Bar */}
                  <div className="w-full bg-black/50 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 border border-white/15 grid grid-cols-3 text-center gap-0.5 sm:gap-1">
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider text-emerald-300 truncate">
                        TYPE
                      </p>
                      <p className="text-white font-bold text-[9px] sm:text-xs truncate mt-0.5">
                        {visa.type}
                      </p>
                    </div>

                    <div className="min-w-0 border-x border-white/15 px-0.5 sm:px-1">
                      <p className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider text-emerald-300 truncate">
                        VALID
                      </p>
                      <p className="text-white font-bold text-[9px] sm:text-xs truncate mt-0.5">
                        {visa.valid}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider text-emerald-300 truncate">
                        FEES
                      </p>
                      <p className="text-white font-extrabold text-[9px] sm:text-xs truncate mt-0.5">
                        {visa.priceNumber ? (
                          <AnimatedNumber value={visa.priceNumber} prefix="₹" />
                        ) : (
                          visa.fee
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Dual Action Buttons: Quick Apply & Explore */}
                  <div className="w-full grid grid-cols-2 gap-1.5 mt-2 sm:mt-3.5">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        clickSquash(event.currentTarget);
                        onOpenApplication?.(visa);
                      }}
                      className="rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 py-1.5 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white shadow-xs hover:shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Zap size={12} className="text-amber-300" />
                      <span>Quick Apply</span>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        clickSquash(event.currentTarget);
                        navigate?.(
                          `/visa/${visa.country.toLowerCase().replace(/\s+/g, "-")}`,
                        );
                      }}
                      className="rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-1.5 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span>Explore</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Subtext Bar */}
              <div className="mt-1.5 p-1.5 sm:p-2.5 bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between px-2 sm:px-3.5">
                <div className="text-left min-w-0 flex-1">
                  <p className="text-[8px] sm:text-[10px] text-gray-400 font-semibold uppercase tracking-wider truncate">
                    Guaranteed In
                  </p>
                  <p className="font-extrabold text-[10px] sm:text-sm text-gray-900 truncate">
                    {visa.visaDate}
                  </p>
                </div>
                <span className="hidden xs:inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 size={10} className="text-emerald-600" />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
