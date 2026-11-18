import { useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X, Check } from "lucide-react";
import { addCalendarDays, startOfLocalDay } from "../../utils/hotelDateUtils";

const HotelDatePicker = ({
  id,
  open,
  setOpen,
  selectedDate,
  setSelectedDate,
  type,
  minDate,
  checkInDate,
  align = "left",
  triggerRef,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      const clickedInsidePanel = containerRef.current?.contains(e.target);
      const clickedTrigger = triggerRef?.current?.contains(e.target);
      if (!clickedInsidePanel && !clickedTrigger) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef?.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  const isCheckOut = type === "checkOut";
  const isCheckIn = type === "checkIn";
  const isBookBy = !isCheckIn && !isCheckOut;

  const baseCheckIn = startOfLocalDay(checkInDate || new Date());
  const effectiveMinDate = minDate
    ? startOfLocalDay(minDate)
    : isCheckOut
      ? addCalendarDays(baseCheckIn, 1)
      : startOfLocalDay(new Date());

  const handleSelectDate = (targetDate) => {
    setSelectedDate(startOfLocalDay(targetDate));
    setOpen(false);
  };

  const getNextWeekendDate = () => {
    const today = startOfLocalDay(new Date());
    const offset = (5 + 7 - today.getDay()) % 7 || 7;
    return addCalendarDays(today, offset);
  };

  const quickPresets = isCheckOut
    ? [
        { label: "+1 Night", date: addCalendarDays(baseCheckIn, 1), primary: true },
        { label: "+2 Nights", date: addCalendarDays(baseCheckIn, 2) },
        { label: "+3 Nights", date: addCalendarDays(baseCheckIn, 3) },
        { label: "+1 Week", date: addCalendarDays(baseCheckIn, 7) },
      ]
    : [
        { label: "Today", date: startOfLocalDay(new Date()), primary: true },
        { label: "Tomorrow", date: addCalendarDays(new Date(), 1) },
        { label: "This Weekend", date: getNextWeekendDate() },
        { label: "+1 Week", date: addCalendarDays(new Date(), 7) },
      ];

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const titleText = isBookBy
    ? "Select Book By Date"
    : isCheckIn
      ? "Select Check-in Date"
      : "Select Check-out Date";

  const alignmentClasses =
    align === "right"
      ? "sm:right-0 sm:left-auto origin-top-right"
      : "sm:left-0 sm:right-auto origin-top-left";

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] z-[9998] sm:hidden"
        onClick={() => setOpen(false)}
      />

      <div
        id={id}
        ref={containerRef}
        role="dialog"
        aria-modal="false"
        aria-label={titleText}
        className={`
          fixed inset-x-3 top-1/2 -translate-y-1/2 sm:translate-y-0 z-[9999]
          sm:absolute sm:top-full sm:mt-2.5 sm:inset-x-auto ${alignmentClasses}
          w-auto sm:w-[340px] max-w-[calc(100vw-1.5rem)] mx-auto sm:mx-0
          bg-white dark:bg-slate-900
          border border-slate-200/90 dark:border-slate-700/90
          rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)]
          p-4 sm:p-5
          transition-all duration-150 ease-out
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#045C45] dark:text-emerald-400 shrink-0">
              <Calendar size={15} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {titleText}
              </h4>
              <p className="text-[11px] font-semibold text-[#045C45] dark:text-emerald-400 truncate">
                {formattedDate}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label={`Close ${titleText}`}
            onClick={() => {
              setOpen(false);
              triggerRef?.current?.focus();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#085c44] focus-visible:outline-offset-2"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {quickPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectDate(preset.date)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition whitespace-nowrap cursor-pointer shadow-2xs focus-visible:outline-2 focus-visible:outline-[#085c44] focus-visible:outline-offset-2 ${
                preset.primary
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
                  : "bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* DatePicker Calendar */}
        <div className="hotel-calendar-wrapper flex justify-center">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              if (date) {
                handleSelectDate(date);
              }
            }}
            inline
            minDate={effectiveMinDate}
            selectsStart={isCheckIn}
            selectsEnd={isCheckOut}
            startDate={isCheckOut ? baseCheckIn : startOfLocalDay(selectedDate)}
            endDate={isCheckOut ? startOfLocalDay(selectedDate) : undefined}
          />
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isBookBy
              ? "Choose your booking date"
              : isCheckIn
                ? "Pick your arrival date"
                : "Pick your departure date"}
          </span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              triggerRef?.current?.focus();
            }}
            className="px-4 py-1.5 text-xs font-bold bg-[#085c44] hover:bg-[#064e3b] active:scale-95 text-white rounded-full shadow-sm transition cursor-pointer flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#085c44] focus-visible:outline-offset-2"
          >
            <Check size={12} strokeWidth={3} aria-hidden="true" />
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default HotelDatePicker;
