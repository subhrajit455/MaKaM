import { useId } from "react";
import { Minus, Plus, PawPrint } from "lucide-react";

export default function RoomGuestSelector({
  setOpenroomguestselector,
  roomCount,
  setRoomCount,
  adultCount,
  setAdultCount,
  childrenCount,
  setChildrenCount,
  childAges,
  setChildAges,
  triggerRef,
}) {
  const petsCheckboxId = useId();

  const handleIncreaseRoomCount = () => {
    setRoomCount((prev) => (prev < 20 ? prev + 1 : prev));
  };

  const handleDecreaseRoomCount = () => {
    setRoomCount((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncreaseAdultCount = () => {
    setAdultCount((prev) => (prev < 40 ? prev + 1 : prev));
  };

  const handleDecreaseAdultCount = () => {
    setAdultCount((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncreaseChildCount = () => {
    setChildrenCount((prev) => (prev < 40 ? prev + 1 : prev));
    setChildAges((prev) => [...prev, 5]); // Default age = 5
  };

  const handleDecreaseChildCount = () => {
    setChildrenCount((prev) => (prev > 0 ? prev - 1 : prev));
    setChildAges((prev) => prev.slice(0, -1));
  };

  const handleAgeChange = (index, age) => {
    const updated = [...childAges];
    updated[index] = Number(age);
    setChildAges(updated);
  };

  const closeSelector = () => {
    setOpenroomguestselector(false);
    triggerRef?.current?.focus();
  };

  return (
    <div className="w-[min(92vw,320px)] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
      {/* Content */}
      <div className="p-4 space-y-3.5">
        {/* Room */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Rooms</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Max 20 rooms</p>
          </div>

          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/70 dark:bg-slate-800/70">
            <button
              type="button"
              aria-label="Decrease rooms"
              onClick={handleDecreaseRoomCount}
              disabled={roomCount <= 1}
              className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#085c44]"
            >
              <Minus size={15} aria-hidden="true" />
            </button>

            <span className="w-9 text-center font-bold text-sm text-slate-900 dark:text-white tabular-nums">
              {roomCount}
            </span>

            <button
              type="button"
              aria-label="Increase rooms"
              onClick={handleIncreaseRoomCount}
              disabled={roomCount >= 20}
              className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#085c44]"
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Adults */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Adults</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">18+ Years</p>
          </div>

          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/70 dark:bg-slate-800/70">
            <button
              type="button"
              aria-label="Decrease adults"
              onClick={handleDecreaseAdultCount}
              disabled={adultCount <= 1}
              className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#085c44]"
            >
              <Minus size={15} aria-hidden="true" />
            </button>

            <span className="w-9 text-center font-bold text-sm text-slate-900 dark:text-white tabular-nums">
              {adultCount}
            </span>

            <button
              type="button"
              aria-label="Increase adults"
              onClick={handleIncreaseAdultCount}
              disabled={adultCount >= 40}
              className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#085c44]"
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Children</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">0 - 17 Years Old</p>
          </div>

          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/70 dark:bg-slate-800/70">
            <button
              type="button"
              aria-label="Decrease children"
              onClick={handleDecreaseChildCount}
              disabled={childrenCount <= 0}
              className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#085c44]"
            >
              <Minus size={15} aria-hidden="true" />
            </button>

            <span className="w-9 text-center font-bold text-sm text-slate-900 dark:text-white tabular-nums">
              {childrenCount}
            </span>

            <button
              type="button"
              aria-label="Increase children"
              onClick={handleIncreaseChildCount}
              disabled={childrenCount >= 40}
              className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#085c44]"
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Provide the exact number of children and ages for accurate room options and rates.
        </p>

        {childrenCount > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5">
              Age of Children
            </h3>

            <div className="space-y-2.5 max-h-[120px] overflow-y-auto overscroll-contain pr-1">
              {childAges.map((age, index) => (
                <div key={index} className="flex justify-between items-center gap-2">
                  <label
                    htmlFor={`${petsCheckboxId}-child-${index}`}
                    className="text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Child {index + 1}
                  </label>

                  <select
                    id={`${petsCheckboxId}-child-${index}`}
                    value={age}
                    onChange={(e) => handleAgeChange(index, e.target.value)}
                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 w-24 focus-visible:outline-2 focus-visible:outline-[#085c44]"
                  >
                    {Array.from({ length: 18 }, (_, i) => (
                      <option key={i} value={i}>
                        {i} yrs
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pets */}
        <label
          htmlFor={petsCheckboxId}
          className="border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex justify-between items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70 transition"
        >
          <div className="flex items-center gap-2.5">
            <input
              id={petsCheckboxId}
              type="checkbox"
              className="w-4 h-4 rounded accent-[#085c44] cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Travelling with pets?
            </span>
          </div>

          <PawPrint size={20} className="text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
        </label>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 px-4 py-2.5 flex justify-end">
        <button
          type="button"
          onClick={closeSelector}
          className="cursor-pointer bg-[#085c44] hover:bg-[#064e3b] active:scale-[0.98] text-white text-xs font-bold px-5 py-2 rounded-full shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-[#085c44] focus-visible:outline-offset-2"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
