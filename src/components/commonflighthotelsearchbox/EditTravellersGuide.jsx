import React from "react";
import { Sparkles, Users, X } from "lucide-react";

const EditTravellersGuide = ({
  show,
  onQuickSet,
  onOpenClass,
  onDismiss,
}) => {
  if (!show) return null;

  return (
    <div className="mb-4 w-full rounded-2xl border border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-r from-emerald-50 via-teal-50/90 to-white dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 p-4 sm:p-4.5 shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#085c44] text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">
                Multiple Travellers Guidance
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                (Previously searched for 1 Person)
              </span>
            </div>
            <h4 className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Want to book for 2 or more travellers?
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              You previously searched for <strong>1 person</strong>. In flight bookings, airline fares and seat quotas are locked to the search. 
              Please edit the number of travellers in <strong className="text-[#085c44] dark:text-emerald-300 underline">TRAVELLERS &amp; CLASS</strong> below (e.g. 2 or 3) and search again to get verified fares and seats for all passengers.
            </p>

            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Quick Select &amp; Search:
              </span>
              <button
                type="button"
                onClick={() => onQuickSet(2)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#085c44] hover:bg-[#064e3b] text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Set 2 Travellers &amp; Search</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickSet(3)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Set 3 Travellers &amp; Search</span>
              </button>
              <button
                type="button"
                onClick={onOpenClass}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              >
                <span>Edit in TRAVELLERS &amp; CLASS</span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition"
          title="Dismiss suggestion"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EditTravellersGuide;
