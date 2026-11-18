import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { CountryFlagIcon } from "../../components/visacard/visaUtils";

export default function CountryVisaHero({
  country,
  infoRef,
  processRef,
  activeTab,
  scrollToSection,
  onOpenApplication,
}) {
  return (
    <>
      {/* Top Navigation Bar: Back to All Visas & Breadcrumb */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          to="/visa-card"
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 font-semibold text-xs transition border border-slate-200/90 shadow-2xs"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-1 text-slate-400 group-hover:text-emerald-600"
          />
          <span>Back to All Countries</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-slate-700 transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/visa-card" className="hover:text-slate-700 transition">
            Visas
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{country.country}</span>
        </nav>
      </div>

      {/* Cinematic Destination Hero */}
      <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all">
        <img
          src={country.heroImage}
          alt={`${country.country} scenery`}
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-100 hover:scale-102 transition-transform duration-1000"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/25" />

        {/* Top-Left Trust Badge */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 hero-trust-pill">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold tracking-wide shadow-lg transition-all">
            <CountryFlagIcon
              flag={country.flag}
              code={country.code}
              name={country.country}
              className="w-5 h-3.5 rounded-xs object-cover shadow-xs inline-block"
            />
            <span>Official {country.type} • Indian Citizens</span>
          </span>
        </div>

        {/* Bottom Content: Destination Title, Subtitle & Key Badges */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-10 z-10">
          <div className="max-w-2xl space-y-2">
            <h1 className="hero-title text-2xl sm:text-4xl md:text-[44px] font-black text-white tracking-tight drop-shadow-md leading-tight">
              {country.country} Visa for Indians
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-1 text-xs sm:text-sm text-slate-200 font-medium">
              <span className="hero-highlight-item flex items-center gap-1.5 text-emerald-300 font-semibold">
                <Clock size={15} />
                <span>{country.timeline} Turnaround</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="hero-highlight-item flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>99.8% Approval Rate</span>
              </span>
              <span className="text-white/30 hidden xs:inline">•</span>
              <span className="hero-highlight-item hidden xs:flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>No Embassy Visit</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Sub-Navigation Tabs */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 my-6 py-2 rounded-2xl shadow-xs px-2 sm:px-6">
        <nav className="flex items-center justify-center sm:justify-start gap-2 sm:gap-8 overflow-x-auto scrollbar-hide">
          {[
            { id: "info", label: "Visa Overview", ref: infoRef },
            { id: "process", label: "Application Process", ref: processRef },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id, tab.ref)}
              className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "text-emerald-700"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full animate-in fade-in duration-200" />
              )}
            </button>
          ))}

          {/* Quick CTA in Header on Mobile/Tablet */}
          <div className="ml-auto flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={onOpenApplication}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-xs cursor-pointer active:scale-95"
            >
              Apply Now
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
