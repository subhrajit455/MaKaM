import React, { useState } from "react";
import { Filter, ChevronUp } from "lucide-react";

export default function FlightFiltersSidebar({
  activeFiltersCount = 0,
  onResetFilters,
  airlines = [],
  selectedAirlines = [],
  onToggleAirline,
  searchParams = {},
  departure = 24,
  onChangeDeparture,
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

  const [showDepartureTimeTooltip, setShowDepartureTimeTooltip] = useState(false);
  const [showArrivalTimeTooltip, setShowArrivalTimeTooltip] = useState(false);
  const [showPriceTooltip, setShowPriceTooltip] = useState(false);

  const percentage = maxPrice > minPrice
    ? Math.min(100, Math.max(0, ((price - minPrice) / (maxPrice - minPrice)) * 100))
    : 100;

  return (
    <aside className="hidden lg:block w-80 sticky top-24 self-start z-20">
      <div className="w-full p-4 rounded-xl bg-white border border-gray-200 shadow-sm max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {/* Filter Master Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-teal-600" />
            <span className="font-bold text-gray-900 text-base">Filter Flights</span>
            {activeFiltersCount > 0 && (
              <span className="bg-teal-100 text-teal-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline cursor-pointer"
            >
              Reset all
            </button>
          )}
        </div>

        {/* Airlines Accordion */}
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
          <div className="mt-4 space-y-3">
            {airlines.map((item, idx) => (
              <div
                key={`${item.airlineCode}-${idx}`}
                className="flex items-center justify-between py-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedAirlines.includes(item.airlineCode)}
                    onChange={() => onToggleAirline?.(item.airlineCode)}
                    className="h-5 w-5 rounded border-gray-300 accent-green-600"
                  />
                  <img
                    src={`https://images.kiwi.com/airlines/64/${item.airlineCode}.png`}
                    alt={item.airline}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      e.target.src =
                        "https://cdn-icons-png.flaticon.com/512/684/684908.png";
                    }}
                  />
                  <span className="text-sm sm:text-base text-gray-700">
                    {item.airline}
                  </span>
                </div>

                <span className="text-sm font-semibold text-gray-700">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="border-b w-full border-gray-200 my-4" />

        {/* Time and Price Accordion */}
        <div>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setOpenTimePrice(!openTimePrice)}
          >
            <h2 className="text-lg font-bold text-gray-900">Time and Price</h2>
            <ChevronUp
              className={`h-5 w-5 transition-transform duration-300 ${
                !openTimePrice ? "rotate-180" : ""
              }`}
            />
          </div>

          {openTimePrice && (
            <div className="space-y-6 mt-4">
              {/* Departure Hour Slider */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Departure from {searchParams.origin || "Origin"}
                </h3>
                <div className="relative">
                  {showDepartureTimeTooltip && (
                    <div
                      className="absolute -top-7 -translate-x-1/2 rounded bg-white px-2 py-1 shadow border text-xs pointer-events-none z-10"
                      style={{ left: `${(departure / 24) * 100}%` }}
                    >
                      {departure < 10 ? `0${departure}` : departure}:00
                    </div>
                  )}

                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={departure}
                    onChange={(e) => onChangeDeparture?.(Number(e.target.value))}
                    onMouseEnter={() => setShowDepartureTimeTooltip(true)}
                    onMouseLeave={() => setShowDepartureTimeTooltip(false)}
                    onMouseDown={() => setShowDepartureTimeTooltip(true)}
                    onMouseUp={() => setShowDepartureTimeTooltip(false)}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-600">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </div>

              {/* Arrival Hour Slider */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Arrival at {searchParams.destination || "Destination"}
                </h3>
                <div className="relative">
                  {showArrivalTimeTooltip && (
                    <div
                      className="absolute -top-7 -translate-x-1/2 rounded bg-white px-2 py-1 shadow border text-xs pointer-events-none z-10"
                      style={{ left: `${(arrival / 24) * 100}%` }}
                    >
                      {arrival < 10 ? `0${arrival}` : arrival}:00
                    </div>
                  )}

                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={arrival}
                    onChange={(e) => onChangeArrival?.(Number(e.target.value))}
                    onMouseEnter={() => setShowArrivalTimeTooltip(true)}
                    onMouseLeave={() => setShowArrivalTimeTooltip(false)}
                    onMouseDown={() => setShowArrivalTimeTooltip(true)}
                    onMouseUp={() => setShowArrivalTimeTooltip(false)}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-600">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </div>

              {/* Price Slider */}
              <div className="w-full">
                <h3 className="mb-4 text-sm font-bold text-base">Flight Price</h3>
                <div className="relative">
                  {showPriceTooltip && (
                    <div
                      className="absolute -top-7 -translate-x-1/2 text-xs"
                      style={{ left: `calc(${percentage}% )` }}
                    >
                      <div className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium shadow">
                        ₹ {price.toLocaleString()}
                      </div>
                      <div className="mx-auto h-2 w-2 rotate-45 border-r border-b border-gray-300 bg-white -mt-1"></div>
                    </div>
                  )}
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={price}
                    onChange={(e) => onChangePrice?.(Number(e.target.value))}
                    onMouseEnter={() => setShowPriceTooltip(true)}
                    onMouseLeave={() => setShowPriceTooltip(false)}
                    onMouseDown={() => setShowPriceTooltip(true)}
                    onMouseUp={() => setShowPriceTooltip(false)}
                    className="w-full cursor-pointer accent-blue-500"
                  />

                  <div className="mt-2 flex justify-between text-xs font-semibold text-gray-700">
                    <span>₹ {minPrice.toLocaleString()}</span>
                    <span>₹ {maxPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="border-b w-full border-gray-200 my-4" />
        </div>

        {/* Stops Accordion */}
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
            <div className="space-y-3 mt-4">
              <div className="space-y-2.5">
                {stopOptions.map((item) => {
                  const isChecked = selectedStops.includes(item.stop);
                  return (
                    <label
                      key={item.stop}
                      className="flex items-center justify-between cursor-pointer py-1"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleStop?.(item.stop)}
                          className="h-4 w-4 rounded border-gray-300 accent-teal-600 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
