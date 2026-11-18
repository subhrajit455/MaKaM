import React, { useState } from "react";
import { Filter, X, ChevronUp } from "lucide-react";

export default function FlightFiltersDrawer({
  isOpen = false,
  onClose,
  activeFiltersCount = 0,
  filteredFlightsCount = 0,
  onResetFilters,
  airlines = [],
  selectedAirlines = [],
  onToggleAirline,
  searchParams = {},
  arrival = 24,
  onChangeArrival,
  price = 50000,
  onChangePrice,
  minPrice = 0,
  maxPrice = 100000,
  stopOptions = [],
  selectedStops = [],
  onToggleStop,
}) {
  const [openAirline, setOpenAirline] = useState(true);
  const [openTimePrice, setOpenTimePrice] = useState(true);
  const [openStopage, setOpenStopage] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs lg:hidden">
      <div className="w-full max-w-xs sm:max-w-sm h-full bg-white p-4 overflow-y-auto flex flex-col justify-between shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[#00BBA7]" />
              <h2 className="text-lg font-bold text-gray-900">Filter Flights</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Airlines */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setOpenAirline(!openAirline)}
            >
              <h2 className="text-base font-bold text-gray-900">Airlines</h2>
              <ChevronUp
                className={`h-5 w-5 transition-transform ${
                  !openAirline ? "rotate-180" : ""
                }`}
              />
            </div>
            {openAirline && (
              <div className="mt-3 space-y-2">
                {airlines.map((item, idx) => (
                  <div
                    key={`${item.airlineCode}-${idx}`}
                    className="flex items-center justify-between py-1.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAirlines.includes(item.airlineCode)}
                        onChange={() => onToggleAirline?.(item.airlineCode)}
                        className="h-4 w-4 rounded border-gray-300 accent-teal-600"
                      />
                      <img
                        src={`https://images.kiwi.com/airlines/64/${item.airlineCode}.png`}
                        alt={item.airline}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          e.target.src =
                            "https://cdn-icons-png.flaticon.com/512/684/684908.png";
                        }}
                      />
                      <span className="text-xs sm:text-sm text-gray-700">
                        {item.airline}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-b w-full border-gray-200 my-4" />

          {/* Time & Price */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setOpenTimePrice(!openTimePrice)}
            >
              <h2 className="text-base font-bold text-gray-900">Time and Price</h2>
              <ChevronUp
                className={`h-5 w-5 transition-transform duration-300 ${
                  !openTimePrice ? "rotate-180" : ""
                }`}
              />
            </div>
            {openTimePrice && (
              <div className="space-y-5 mt-3">
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-gray-700">
                    Arrival at {searchParams.destination || "Destination"}
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={arrival}
                    onChange={(e) => onChangeArrival?.(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>24:00</span>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-semibold text-gray-700">
                    Flight Price
                  </h3>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={price}
                    onChange={(e) => onChangePrice?.(Number(e.target.value))}
                    className="w-full cursor-pointer accent-teal-600"
                  />
                  <div className="mt-1 flex justify-between text-xs font-semibold text-gray-700">
                    <span>₹ {minPrice.toLocaleString()}</span>
                    <span>₹ {maxPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-b w-full border-gray-200 my-4" />

          {/* Stops */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setOpenStopage(!openStopage)}
            >
              <h2 className="text-base font-bold text-gray-900">Stops</h2>
              <ChevronUp
                className={`h-5 w-5 transition-transform ${
                  !openStopage ? "rotate-180" : ""
                }`}
              />
            </div>
            {openStopage && (
              <div className="space-y-2.5 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  {stopOptions.map((item) => {
                    const isActive = selectedStops.includes(item.stop);
                    return (
                      <button
                        key={item.stop}
                        type="button"
                        onClick={() => onToggleStop?.(item.stop)}
                        className={`flex flex-col items-center justify-center py-2 px-1 text-xs rounded-xl font-bold border transition cursor-pointer ${
                          isActive
                            ? "bg-[#00BBA7] text-white border-[#00BBA7] shadow-xs"
                            : "border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span
                          className={`text-[10px] font-semibold mt-0.5 ${
                            isActive ? "text-white/80" : "text-gray-400"
                          }`}
                        >
                          ({item.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-gray-200 flex gap-3 mt-6">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex-1 py-2 px-3 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
          >
            Reset ({activeFiltersCount})
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#00BBA7] rounded-lg hover:bg-[#009b8a] transition cursor-pointer shadow-sm"
          >
            Apply Filters ({filteredFlightsCount})
          </button>
        </div>
      </div>
    </div>
  );
}
