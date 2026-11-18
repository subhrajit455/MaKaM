import React from "react";
import { Link } from "react-router-dom";
import LiquidFillText from "../ui/LiquidFillText";
import { PlaneTakeoff, FileCheck2, CarFront, Compass, ArrowRight } from "lucide-react";
import step1Img from "../../assets/boarding-guide/step1-saudi-visa-passport.jpg";
import step2Img from "../../assets/boarding-guide/step2-jeddah-terminal-arrival.jpg";
import step3Img from "../../assets/boarding-guide/step3-saudi-immigration-check.jpg";
import step4Img from "../../assets/boarding-guide/step4-saudia-aircraft-boarding.jpg";

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Select Verified Flights & Hotels",
    description:
      "Compare direct flights to Jeddah or Madinah alongside 4-star and 5-star hotels with confirmed courtyard proximity.",
    image: step4Img,
    alt: "Travelers boarding Saudia aircraft for pilgrimage",
    ctaLabel: "Browse Packages",
    to: "/package-page",
    icon: PlaneTakeoff,
  },
  {
    step: "02",
    title: "Digital eVisa & Nusuk Permits",
    description:
      "Upload passport details securely. Our specialists handle Saudi Umrah/Tourist eVisa processing and Rawdah slot guidance.",
    image: step1Img,
    alt: "Passport and Saudi visa documentation preparation",
    ctaLabel: "Check Visa Services",
    to: "/visa-card",
    icon: FileCheck2,
  },
  {
    step: "03",
    title: "Airport Meet & Ground Transfers",
    description:
      "Our multilingual coordinator greets your family at the terminal with private transfers or Haramain high-speed rail tickets.",
    image: step2Img,
    alt: "Arrival welcome at King Abdulaziz International Airport Jeddah",
    ctaLabel: "Book Transfers",
    to: "/cab-bookng-form",
    icon: CarFront,
  },
  {
    step: "04",
    title: "Guided Ziyarat & 24/7 Support",
    description:
      "Visit historic Islamic landmarks with licensed scholars while our on-ground support desk stays reachable round the clock.",
    image: step3Img,
    alt: "Smooth immigration and escorted pilgrim support in Saudi Arabia",
    ctaLabel: "Meet Our Guides",
    to: "/guides",
    icon: Compass,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="maqam-section py-12 md:py-16 px-4 sm:px-6 lg:px-10 xl:px-12 bg-[#FAFAF8] dark:bg-[#070c18] font-poppins transition-colors"
    >
      <div className="w-full max-w-[1760px] mx-auto">
        <div data-animate="fade-up" className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-[#00987A] dark:text-emerald-400 mb-2">
              Step-by-Step Travel Flow
            </p>
            <h2
              id="how-it-works-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              From Booking to Haram —{" "}
              <LiquidFillText text="How Your Journey Works" />
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every milestone from visa paperwork to hotel check-in and Ziyarat transfers is coordinated transparently before you depart.
            </p>
          </div>
          <Link
            to="/package-page"
            className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span>Explore Ready Packages</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div data-animate="stagger" data-stagger-target="article" className="flex overflow-x-auto snap-x snap-proximity overscroll-x-contain scrollbar-hide [-webkit-overflow-scrolling:touch] gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {JOURNEY_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.step}
                className="group flex flex-none w-[80vw] max-w-[300px] snap-start sm:w-auto sm:max-w-none flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900 overflow-hidden shadow-xs hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    width="400"
                    height="240"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 text-xs font-extrabold text-[#045C45] dark:text-emerald-400 shadow-xs font-inter tabular-nums">
                    <span>Step {item.step}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 h-9 w-9 rounded-xl bg-[#045C45]/90 text-white flex items-center justify-center shadow-sm">
                    <Icon size={17} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                    {item.description}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                    <Link
                      to={item.to}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#045C45] dark:text-emerald-400 hover:text-[#00987A] transition-colors"
                    >
                      <span>{item.ctaLabel}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
