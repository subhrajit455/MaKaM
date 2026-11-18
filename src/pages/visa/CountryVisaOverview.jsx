import React from "react";
import {
  CreditCard,
  Camera,
  Plane,
  Building,
  FileCheck2,
} from "lucide-react";

export default function CountryVisaOverview({
  country,
  allCountryVisas = [],
  onSelectVisa,
  onOpenApplication,
  infoRef,
  processRef,
}) {
  return (
    <div className="space-y-8">
      {/* SECTION 1: VISA INFO (Overview Cards & Required Documents) */}
      <section ref={infoRef} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {allCountryVisas.length > 1
                ? `All Visa Types Offered (${allCountryVisas.length})`
                : `${country.country} Visa Specifications`}
            </h2>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
              {country.type || "Tourist"} Visa
            </span>
          </div>

          <div className="space-y-3.5">
            {(allCountryVisas.length > 1 ? allCountryVisas : [country]).map((v, idx) => {
              const isSelected = (v._id || v.id) === (country._id || country.id);
              const vPrice =
                v.price ||
                (v.fees?.totalPrice
                  ? `₹${v.fees.totalPrice.toLocaleString()}`
                  : v.fees?.basePrice
                    ? `₹${v.fees.basePrice.toLocaleString()}`
                    : country.price);
              const vValidity = v.validity || country.validity;
              const vStay = v.stayDuration || country.stayDuration;
              const vEntry = v.entryType || country.entryType || "Single";
              const vTitle =
                v.title ||
                v.headline ||
                `${vStay || "30 Days"} · ${
                  vEntry.toLowerCase().includes("multi")
                    ? "Multi-entry"
                    : "Single-entry"
                }`;
              const vTimeline =
                v.processingTime ||
                v.timeline ||
                country.processingTime ||
                "3-5 Working Days";

              return (
                <div
                  key={v._id || v.id || idx}
                  onClick={() => allCountryVisas.length > 1 && onSelectVisa?.(v)}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all ${
                    allCountryVisas.length > 1 ? "cursor-pointer" : ""
                  } ${
                    allCountryVisas.length > 1 && isSelected
                      ? "border-emerald-600 ring-2 ring-emerald-600/15 shadow-sm"
                      : "border-slate-200/90 shadow-2xs hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                        {vTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                        <span>
                          Valid for{" "}
                          <strong className="font-bold text-slate-900">
                            {vValidity}
                          </strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>
                          Maximum stay of{" "}
                          <strong className="font-bold text-slate-900">
                            {vStay}
                          </strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>
                          Entry{" "}
                          <strong className="font-bold text-slate-900">
                            {vEntry}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {vPrice}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold">
                      <span className="text-slate-500">Visa in</span>
                      <span className="font-bold text-slate-950">{vTimeline}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Official Fee Breakdown Card */}
        {country.fees && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-600" />
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                  Transparent Official Fee Structure ({country.fees.currency || "INR"})
                </h4>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                100% Transparent Rates
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium text-[11px]">Base Visa Fee</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {country.baseFee || `₹${(country.fees.basePrice || 0).toLocaleString()}`}
                </p>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium text-[11px]">Embassy / Govt. Fee</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {country.govtFee || `₹${(country.fees.governmentFee || 0).toLocaleString()}`}
                </p>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium text-[11px]">Service & Processing</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {country.serviceFee || `₹${(country.fees.serviceFee || 0).toLocaleString()}`}
                </p>
              </div>
              <div className="bg-emerald-50/90 p-3 rounded-xl border border-emerald-200">
                <p className="text-emerald-800 font-semibold text-[11px]">Total Price</p>
                <p className="font-black text-emerald-950 text-sm mt-0.5">
                  {country.price}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Checklist for Indians */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Documents Required for Indian Passport Holders
            </h3>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
              {country.documents?.length || 0} Required Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {(country.documents || []).map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/20 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs">
                  {doc.icon === "photo" ? (
                    <Camera size={16} />
                  ) : doc.icon === "flight" ? (
                    <Plane size={16} />
                  ) : doc.icon === "hotel" ? (
                    <Building size={16} />
                  ) : doc.icon === "finance" ? (
                    <CreditCard size={16} />
                  ) : (
                    <FileCheck2 size={16} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-xs sm:text-sm text-slate-900">
                      {doc.title || doc.label}
                    </p>
                    {doc.required ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {doc.desc}
                  </p>
                  {(doc.formatsText || doc.maxSizeText) && (
                    <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-200/50 text-[10px] text-slate-400 font-medium">
                      {doc.formatsText && <span>Formats: {doc.formatsText}</span>}
                      {doc.formatsText && doc.maxSizeText && <span>•</span>}
                      {doc.maxSizeText && <span>Max: {doc.maxSizeText}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: VISA PROCESS (3 Easy Steps) */}
      <section ref={processRef} className="space-y-6 pt-2">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              How the {country.country} Visa Process Works
            </h3>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
              {country.steps?.length || 3} Simple Steps
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(country.steps || []).map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    0{s.step || idx + 1}
                  </div>
                  {s.time && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {s.time}
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-center md:text-left space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
              100% On-Time Delivery Guarantee
            </p>
            <h3 className="text-base sm:text-lg font-black">
              Ready to visit {country.country}?
            </h3>
            <p className="text-xs text-slate-300">
              Join over 25,000+ Indian travelers who applied with Maqam.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenApplication}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-extrabold px-6 py-3 rounded-full shadow-md transition transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
          >
            Start Application Now
          </button>
        </div>
      </section>
    </div>
  );
}
