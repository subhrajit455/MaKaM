import React, { useId } from "react";
import { ArrowRight } from "lucide-react";
import LiquidFillText from "../ui/LiquidFillText";

export default function TripPlannerShowcase({ onLaunchPlanner }) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="bg-white dark:bg-[#0b1120] py-10 sm:py-14 px-4 sm:px-6 lg:px-10 xl:px-12 font-poppins transition-colors duration-300"
    >
      <div className="mx-auto max-w-[1760px]">
        <div data-animate="clip-reveal" className="maqam-planner-surface relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-16 text-center text-white shadow-xl">
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl"
            aria-hidden="true"
          />
          <div data-animate="fade-up" data-delay="0.2" className="relative z-10 mx-auto max-w-2xl">
            <h2
              id={headingId}
              className="maqam-section-title font-extrabold text-white tracking-tight"
            >
              Plan Your Pilgrimage &amp; Journey with our{" "}
              <LiquidFillText
                text="AI Travel Planner"
                baseClassName="text-white/25"
                gradientClassName="maqam-text-gradient-gold"
              />
            </h2>
            <p className="mx-auto mt-3.5 max-w-[48ch] text-sm sm:text-base font-jakarta text-slate-100/90 leading-relaxed text-pretty">
              Our AI builds your entire Umrah or travel itinerary effortlessly—simply share your dates, preferred city, or budget to plan your trip easily.
            </p>
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() => onLaunchPlanner?.("")}
                className="maqam-hero-control min-h-12 inline-flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-emerald-50 text-[#045C45] font-bold text-sm sm:text-base px-7 py-3 shadow-lg active:scale-[0.98] transition cursor-pointer"
              >
                <span>Plan Your Trip Easily</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
