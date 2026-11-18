import React from "react";
import { ShieldCheck, Plane, Building2, LockKeyhole } from "lucide-react";
import LiquidFillText from "../ui/LiquidFillText";

const PILLARS = [
  {
    title: "Ministry & Nusuk Aligned",
    description:
      "Authorized visa coordination and structured support for Rawdah permits via the official Nusuk portal.",
    icon: ShieldCheck,
  },
  {
    title: "Direct Airline Allotments",
    description:
      "Confirmed PNRs with baggage allowances on Saudia, Emirates, Qatar Airways, Flynas, and IndiGo.",
    icon: Plane,
  },
  {
    title: "Verified Haram Proximity",
    description:
      "Pre-inspected courtyard properties with guaranteed room vouchers and zero last-minute hotel swaps.",
    icon: Building2,
  },
  {
    title: "Transparent Encrypted Checkout",
    description:
      "256-bit SSL secured payments with itemized taxes and fees upfront—no hidden arrival surcharges.",
    icon: LockKeyhole,
  },
];

export default function TrustAccreditationBar() {
  return (
    <section
      aria-labelledby="trust-bar-heading"
      className="maqam-section py-12 md:py-16 px-4 sm:px-6 lg:px-10 xl:px-12 bg-white dark:bg-[#0b1120] font-poppins transition-colors"
    >
      <div className="w-full max-w-[1760px] mx-auto">
        <div data-animate="fade-up" className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#00987A] dark:text-emerald-400 mb-2">
            Standards &amp; Guarantees
          </p>
          <h2
            id="trust-bar-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Booked with Confidence,{" "}
            <LiquidFillText text="Protected at Every Step" />
          </h2>
        </div>

        <div data-animate="stagger" data-stagger-target="> div" className="flex overflow-x-auto snap-x snap-proximity overscroll-x-contain scrollbar-hide [-webkit-overflow-scrolling:touch] gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex-none w-[78vw] max-w-[290px] snap-start sm:w-auto sm:max-w-none rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900 p-6 flex flex-col items-start shadow-xs"
              >
                <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/60 text-[#045C45] dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
