import React from "react";
import { ArrowRight } from "lucide-react";
import { CountryFlagIcon } from "../../components/visacard/visaUtils";
import { clickSquash } from "../../animations/presets";

export default function CountryVisaPricingCard({
  country,
  onOpenApplication,
}) {
  return (
    <>
      {/* Desktop Sticky Pricing Card */}
      <div className="lg:col-span-4 hidden lg:block sticky top-28 space-y-5">
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl space-y-6">
          {/* Destination Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <CountryFlagIcon
              flag={country.flag}
              code={country.code}
              name={country.country}
              className="w-8 h-5.5 rounded-xs object-cover shadow-2xs"
            />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                {country.country}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {country.type}
              </p>
            </div>
          </div>

          {/* Clean Price Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Payable
            </span>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {country.price}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                / traveller
              </div>
            </div>
          </div>

          {/* Key Specifications Breakdown */}
          <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Entry Type</span>
              <span className="font-bold text-slate-800">
                {country.entryType || "Single Entry"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Validity</span>
              <span className="font-bold text-slate-800">{country.validity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Stay Duration</span>
              <span className="font-bold text-slate-800">
                {country.stayDuration}
              </span>
            </div>
            {country.fees && (
              <div className="pt-2.5 mt-1 border-t border-slate-200/60 space-y-2 text-[11px]">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Base Visa Price</span>
                  <span className="font-semibold text-slate-700">
                    {country.baseFee ||
                      `₹${(country.fees.basePrice || 0).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Government / Embassy</span>
                  <span className="font-semibold text-slate-700">
                    {country.govtFee ||
                      `₹${(country.fees.governmentFee || 0).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Service & Verification</span>
                  <span className="font-semibold text-slate-700">
                    {country.serviceFee ||
                      `₹${(country.fees.serviceFee || 0).toLocaleString()}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={(e) => {
              clickSquash(e.currentTarget);
              onOpenApplication?.();
            }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Start Visa Application</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>

      {/* Mobile Sticky Floating Bar */}
      <aside
        aria-label="Quick application"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 sm:p-4"
      >
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden xs:flex items-center justify-center">
              <CountryFlagIcon
                flag={country.flag}
                code={country.code}
                name={country.country}
                className="w-8 h-5.5 rounded-xs object-cover shadow-xs"
              />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">
                {country.country} {country.type}
              </p>
              <p className="text-base sm:text-xl font-black text-slate-900">
                {country.price}{" "}
                <span className="text-[11px] text-slate-400 font-medium">
                  / traveller
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={(e) => {
                clickSquash(e.currentTarget);
                onOpenApplication?.();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-full shadow-md transition transform hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Apply Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
