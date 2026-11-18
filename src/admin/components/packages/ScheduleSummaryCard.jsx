import { Calendar, Clock, Sun, Users } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

export default function ScheduleSummaryCard({ schedule }) {
  if (!schedule) return null;

  const { from, to, durationDays, nights, bookingDeadline, availableSlots } = schedule;

  const dateText =
    from && to
      ? `${formatDate(from, { day: "numeric", month: "short", year: "numeric" })} – ${formatDate(to, { day: "numeric", month: "short", year: "numeric" })}`
      : "Derived from selected offers";

  const durationText =
    durationDays != null
      ? `${durationDays} Days / ${nights ?? 0} Nights`
      : "Pending offer selection";

  const deadlineText = bookingDeadline
    ? formatDate(bookingDeadline, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "No deadline restriction";

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100/70 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Trip Schedule & Availability</h3>
          <p className="text-xs text-slate-500">Auto-derived from bundled flight and hotel stocks.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
          Auto-Derived
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-100/60 bg-white p-3 shadow-xs">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Calendar size={13} className="text-emerald-600" /> Travel Dates
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800 truncate" title={dateText}>
            {dateText}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100/60 bg-white p-3 shadow-xs">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Sun size={13} className="text-amber-500" /> Duration
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {durationText}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100/60 bg-white p-3 shadow-xs">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Clock size={13} className="text-sky-600" /> Bookable Until
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800 truncate" title={deadlineText}>
            {deadlineText}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100/60 bg-white p-3 shadow-xs">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Users size={13} className="text-purple-600" /> Available Slots
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {availableSlots != null ? `${availableSlots} slots` : "Live stock calculation"}
          </p>
        </div>
      </div>
    </div>
  );
}

