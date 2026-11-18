import React from "react";

export default function SavedTravellersBar({
  savedTravellers = [],
  selectedTravellerIds = [],
  passengerSlots = [],
  onToggleSavedTraveller,
}) {
  if (!savedTravellers || savedTravellers.length === 0) return null;

  return (
    <div className="px-4 py-3 bg-teal-50/40 border-b border-gray-200">
      <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-2">
        Saved Travellers (Click to autofill)
      </p>
      <div className="flex flex-wrap gap-2">
        {savedTravellers.map((trav) => {
          const isSelected =
            selectedTravellerIds.includes(trav.id) ||
            passengerSlots.some((s) => s.savedTravellerId === trav.id);
          return (
            <button
              key={trav.id}
              type="button"
              onClick={() => onToggleSavedTraveller?.(trav)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                isSelected
                  ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                  : "bg-white text-gray-700 border-gray-300 hover:border-teal-400 hover:text-teal-700"
              }`}
            >
              <span>
                {trav.title} {trav.firstName} {trav.lastName}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? "bg-teal-700 text-teal-100"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {trav.travellerType}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
