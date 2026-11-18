import React from "react";
import { PlaneTakeoff, Luggage, CheckCircle } from "lucide-react";
import AnimatedNumber from "../shared/AnimatedNumber";
import AnimatedFlightRoute from "./AnimatedFlightRoute";
import { clickSquash } from "../../animations/presets";
import { getFlightNetFare, getFlightUnitFare } from "./flightUtils";

export default function FlightSearchResultCard({
  flight,
  index,
  paxMultiplier = 1,
  totalPassengerCount = 1,
  isRoundTrip = false,
  activeLeg = "outbound",
  isSelected = false,
  onViewPrices,
  onOpenDetails,
}) {
  const firstSegment = flight?.segments?.[0];
  const lastSegment = flight?.segments?.[flight?.segments?.length - 1];

  if (!firstSegment || !lastSegment) return null;

  // Calculate duration
  const depDate = new Date(firstSegment.departure);
  const arrDate = new Date(lastSegment.arrival);
  let durationStr = "03h 05m";
  if (!isNaN(depDate) && !isNaN(arrDate)) {
    const diffMs = arrDate - depDate;
    if (diffMs > 0) {
      const hrs = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      durationStr = `${hrs}h ${mins}m`;
    }
  }

  const unitAdultFare = Number(
    flight?.fares?.[0]?.totalAmount ?? flight?.totalAmount ?? 0,
  );
  const totalCardFare = Math.round(unitAdultFare * (paxMultiplier || 1));

  return (
    <div key={index} className="w-full">
      <div className="flight-card-container group pro-card pro-card-interactive relative rounded-2xl border border-slate-200/90 bg-white w-full overflow-hidden">
        {/* Top Badge Strip */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-1 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              100% on time
            </span>
            {flight?.fares?.[0]?.isRefundable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-teal-50 text-teal-700 border border-teal-200/50">
                Refundable
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {firstSegment.cabinClass || "Economy"}
          </span>
        </div>

        {/* Main Section */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between px-4 sm:px-6 py-4 gap-4 sm:gap-6">
          {/* Airline Info */}
          <div className="flex items-center gap-3.5 shrink-0 min-w-0 sm:w-48 lg:w-52">
            <div className="flight-airline-logo h-12 w-12 shrink-0 rounded-2xl bg-white p-2 shadow-xs border border-slate-100 flex items-center justify-center">
              <img
                src={`https://images.kiwi.com/airlines/64/${firstSegment.airlineCode}.png`}
                alt={firstSegment.airline}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.src =
                    "https://cdn-icons-png.flaticon.com/512/684/684908.png";
                }}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-[15px] sm:text-base font-extrabold text-slate-900 truncate leading-snug tracking-tight">
                {firstSegment.airline}
              </h3>

              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                <span className="font-mono font-semibold tracking-wide text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                  {firstSegment.flightNumber || "QP-1526"}
                </span>
              </p>
            </div>
          </div>

          {/* Departure, Duration & Arrival */}
          <div className="flex items-center justify-between sm:justify-center gap-3 sm:gap-8 flex-1 min-w-0 py-2 sm:py-0 border-y lg:border-y-0 border-slate-100">
            {/* Departure */}
            <div className="text-left sm:text-right shrink-0 min-w-[75px] sm:min-w-[95px]">
              <h2 className="text-2xl sm:text-[26px] font-black leading-none text-slate-900 tracking-tight">
                {firstSegment.departure?.split("T")?.[1]?.slice(0, 5) || "00:00"}
              </h2>

              <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[100px] sm:max-w-none">
                {firstSegment.originCity || firstSegment.origin}
              </p>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                {firstSegment.originCode || firstSegment.origin}
              </span>
            </div>

            {/* Duration & Animated Route Visualizer */}
            <AnimatedFlightRoute
              durationStr={durationStr}
              stopsContent={(() => {
                const stopsCount = flight?.segments?.length - 1;
                if (stopsCount === 0) {
                  return (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Non Stop
                    </span>
                  );
                }
                const layovers = flight?.segments
                  ?.slice(0, -1)
                  ?.map((seg) => seg.destination)
                  ?.filter(Boolean)
                  ?.join(", ");
                return (
                  <span
                    className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md truncate max-w-full inline-block"
                    title={`${stopsCount} stop via ${layovers}`}
                  >
                    {stopsCount} {stopsCount === 1 ? "Stop" : "Stops"} via {layovers}
                  </span>
                );
              })()}
            />

            {/* Arrival */}
            <div className="text-right sm:text-left shrink-0 min-w-[75px] sm:min-w-[95px]">
              <h2 className="text-2xl sm:text-[26px] font-black leading-none text-slate-900 tracking-tight">
                {lastSegment.arrival?.split("T")?.[1]?.slice(0, 5) || "00:00"}
              </h2>

              <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[100px] sm:max-w-none">
                {lastSegment.destinationCity || lastSegment.destination}
              </p>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                {lastSegment.destinationCode || lastSegment.destination}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-14 w-px bg-slate-200/80 shrink-0"></div>

          {/* Price & Action */}
          <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-3 shrink-0 pt-2 lg:pt-0">
            <div className="text-left lg:text-right">
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider block">
                {totalPassengerCount > 1
                  ? `Total for ${totalPassengerCount} travellers`
                  : "Total Fare"}
              </span>
              <div className="flex items-baseline justify-start lg:justify-end gap-1 mt-0.5">
                <span className="text-sm font-extrabold text-slate-700">₹</span>
                <AnimatedNumber
                  value={totalCardFare}
                  className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none font-mono"
                />
              </div>
              {totalPassengerCount > 1 && (
                <span className="inline-block mt-1 text-[10px] sm:text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                  <AnimatedNumber
                    value={unitAdultFare}
                    prefix="₹"
                    suffix=" / adult"
                  />
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  clickSquash(e.currentTarget);
                  onViewPrices?.(flight);
                }}
                className="h-10 px-4 rounded-xl border border-teal-600/90 bg-teal-50/50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 whitespace-nowrap"
              >
                VIEW PRICES
              </button>

              {isRoundTrip ? (
                <button
                  type="button"
                  onClick={(e) => {
                    clickSquash(e.currentTarget);
                    onViewPrices?.(flight);
                  }}
                  className={`h-10 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                      : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xs hover:shadow-md"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>SELECTED</span>
                    </>
                  ) : (
                    <span>
                      SELECT {activeLeg === "outbound" ? "DEPARTURE" : "RETURN"}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    clickSquash(e.currentTarget);
                    onViewPrices?.(flight);
                  }}
                  className="h-10 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-md shadow-teal-700/20 hover:shadow-lg hover:shadow-teal-700/30 active:scale-95 whitespace-nowrap flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                >
                  <span>BOOK NOW</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex h-11 items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                onOpenDetails?.({
                  ...flight,
                  netFare: getFlightNetFare(flight),
                  retailFare: getFlightUnitFare(flight),
                });
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition cursor-pointer"
            >
              <PlaneTakeoff className="h-3.5 w-3.5 text-teal-600" />
              <span>Flight details</span>
            </button>

            {flight?.fares?.[0]?.baggage && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Luggage className="w-3.5 h-3.5 text-slate-400" />
                {flight.fares[0].baggage}
              </span>
            )}
          </div>

          <span className="text-[11px] font-semibold text-emerald-700 hidden sm:flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            100% Verified Fare
          </span>
        </div>
      </div>
    </div>
  );
}
