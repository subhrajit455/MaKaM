import React from "react";
import * as Icons from "lucide-react";

const ACCENTS = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  emerald: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  violet: "bg-violet-50 text-violet-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-red-50 text-red-500",
  amber: "bg-amber-50 text-amber-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function StatCard({
  title,
  label,
  value,
  change,
  note,
  icon,
  color = "blue",
  className = "",
}) {
  const displayTitle = title || label || "";
  const accent = ACCENTS[color] || ACCENTS.blue;

  let IconComponent = null;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
    IconComponent = icon;
  } else if (typeof icon === "string" && Icons[icon]) {
    IconComponent = Icons[icon];
  } else if (icon) {
    IconComponent = Icons.BarChart3;
  }

  const down = change && String(change).startsWith("-");

  // Dashboard layout with KPI change note
  if (change !== undefined || note !== undefined) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{displayTitle}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
          </div>
          {IconComponent ? (
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${accent}`}>
              <IconComponent size={19} />
            </div>
          ) : null}
        </div>
        {(change || note) ? (
          <p className="mt-3 text-xs">
            {change ? (
              <span className={`font-bold ${down ? "text-red-600" : "text-emerald-700"}`}>{change}</span>
            ) : null}
            {note ? <span className="ml-1 text-slate-400">{note}</span> : null}
          </p>
        ) : null}
      </div>
    );
  }

  // Horizontal metric card (hotelier / flight style)
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {IconComponent ? (
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${accent}`}>
          <IconComponent size={20} />
        </div>
      ) : null}

      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-slate-500">{displayTitle}</p>
        <p className="mt-0.5 text-[22px] font-bold leading-tight text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
