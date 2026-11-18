import React, { useEffect, useState } from "react";
import offerService from "../../services/offerService";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plane } from "lucide-react";
import HorizontalCarousel from "../shared/HorizontalCarousel";
import { FlightCard } from "../ui/FlightCard1";
import LiquidFillText from "../ui/LiquidFillText";

// Lookup table mapping IATA codes & city names to { code, city }
const LOCATION_DIRECTORY = {
  DEL: { code: "DEL", city: "New Delhi" },
  "NEW DELHI": { code: "DEL", city: "New Delhi" },
  DELHI: { code: "DEL", city: "New Delhi" },
  IST: { code: "IST", city: "Istanbul" },
  ISTANBUL: { code: "IST", city: "Istanbul" },
  DXB: { code: "DXB", city: "Dubai" },
  DUBAI: { code: "DXB", city: "Dubai" },
  JED: { code: "JED", city: "Jeddah" },
  JEDDAH: { code: "JED", city: "Jeddah" },
  MED: { code: "MED", city: "Medina" },
  MADINAH: { code: "MED", city: "Medina" },
  RUH: { code: "RUH", city: "Riyadh" },
  RIYADH: { code: "RUH", city: "Riyadh" },
  GOI: { code: "GOI", city: "Goa" },
  GOA: { code: "GOI", city: "Goa" },
  BOM: { code: "BOM", city: "Mumbai" },
  MUMBAI: { code: "BOM", city: "Mumbai" },
  CCU: { code: "CCU", city: "Kolkata" },
  KOLKATA: { code: "CCU", city: "Kolkata" },
  BLR: { code: "BLR", city: "Bengaluru" },
  BENGALURU: { code: "BLR", city: "Bengaluru" },
  HYD: { code: "HYD", city: "Hyderabad" },
  HYDERABAD: { code: "HYD", city: "Hyderabad" },
  MAA: { code: "MAA", city: "Chennai" },
  CHENNAI: { code: "MAA", city: "Chennai" },
  JFK: { code: "JFK", city: "New York" },
  "NEW YORK": { code: "JFK", city: "New York" },
  LHR: { code: "LHR", city: "London" },
  LONDON: { code: "LHR", city: "London" },
  DOH: { code: "DOH", city: "Doha" },
  DOHA: { code: "DOH", city: "Doha" },
  AUH: { code: "AUH", city: "Abu Dhabi" },
  "ABU DHABI": { code: "AUH", city: "Abu Dhabi" },
  SIN: { code: "SIN", city: "Singapore" },
  SINGAPORE: { code: "SIN", city: "Singapore" },
  SFO: { code: "SFO", city: "San Francisco" },
  LAX: { code: "LAX", city: "Los Angeles" },
};

const resolveAirportInfo = (rawLocation) => {
  if (!rawLocation) {
    return { code: "---", city: "Unknown" };
  }
  const normalized = String(rawLocation).trim().toUpperCase();
  if (LOCATION_DIRECTORY[normalized]) {
    return LOCATION_DIRECTORY[normalized];
  }
  if (normalized.length === 3) {
    return { code: normalized, city: normalized };
  }
  const toTitleCase = String(rawLocation)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return {
    code: normalized.slice(0, 3),
    city: toTitleCase,
  };
};

const formatFlightTime = (isoDate) => {
  if (!isoDate) return "--:--";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatFlightDuration = (departureIso, arrivalIso) => {
  if (!departureIso || !arrivalIso) return "--";
  const start = new Date(departureIso).getTime();
  const end = new Date(arrivalIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return "--";
  }
  const totalMinutes = Math.round((end - start) / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
};

const formatShortDuration = (departureIso, arrivalIso) => {
  if (!departureIso || !arrivalIso) return "--";
  const start = new Date(departureIso).getTime();
  const end = new Date(arrivalIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return "--";
  }
  const totalMinutes = Math.round((end - start) / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const FlightOffersSection = () => {
  const [flightOffers, setFlightOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchFlightOffers = async () => {
      try {
        setLoading(true);
        const rawList = await offerService.getOffers({ itemType: "flight" });
        const list = Array.isArray(rawList)
          ? rawList.filter(
              (item) =>
                (!item.itemType ||
                  String(item.itemType).toLowerCase() === "flight") &&
                item.isActive !== false
            )
          : [];

        if (isMounted) {
          setFlightOffers(list);
        }
      } catch (err) {
        console.error("Failed to fetch flight offers:", err);
        if (isMounted) {
          setFlightOffers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFlightOffers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (offer) => {
    const stock = offer?.flightRef?.stock || {};
    const depInfo = resolveAirportInfo(stock.origin);
    const arrInfo = resolveAirportInfo(stock.destination || offer?.destination);
    const departureDate = stock.departureDate || offer?.startDate;
    const arrivalDate = stock.arrivalDate || offer?.endDate;
    const flightNumber = stock.flightNumber || "FL-100";
    const airlineCode = flightNumber.includes("-")
      ? flightNumber.split("-")[0]
      : flightNumber.slice(0, 2);
    const flightId = offer?._id || stock?._id || offer?.id;
    const cardId = offer?._id || offer?.id;
    const resultIndex = null;
    const traceId = null;
    const fareAmount = Number(offer?.sellPrice || stock?.costPerUnit || 0);

    const bookingState = {
      flightId,
      cardId,
      offerId: offer?._id,
      stockId: stock?._id,
      isInHouse: true,
      isOffer: true,
      traceId,
      resultIndex,
      selectedFareTier: stock.cabinClass || "Economy",
      isRoundTrip: false,
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      selectedTier: {
        id: "offer-fare",
        title: stock.cabinClass || "Economy",
        priceMultiplier: 1,
        unitPrice: fareAmount,
        price: fareAmount,
      },
      selectedOffer: offer,
      flight: {
        flightId,
        cardId,
        offerId: offer?._id,
        stockId: stock?._id,
        isInHouse: true,
        resultIndex,
        totalAmount: fareAmount,
        fares: [
          {
            resultIndex,
            totalAmount: fareAmount,
            isRefundable: true,
          },
        ],
        segments: [
          {
            origin: depInfo.code,
            originCity: depInfo.city,
            destination: arrInfo.code,
            destinationCity: arrInfo.city,
            airline:
              stock.airline && !stock.airline.toLowerCase().includes("test")
                ? stock.airline
                : "Saudia",
            airlineCode,
            flightNumber,
            departure: departureDate,
            arrival: arrivalDate,
            duration: formatShortDuration(departureDate, arrivalDate),
            cabinClass: stock.cabinClass || "Economy",
          },
        ],
      },
    };

    try {
      sessionStorage.setItem(
        "selectedFlightBooking",
        JSON.stringify(bookingState)
      );
      localStorage.setItem(
        "selectedFlightBooking",
        JSON.stringify(bookingState)
      );
    } catch (e) {
      console.warn("Storage warning:", e);
    }

    navigate("/fare-quote-details", { state: bookingState });
  };

  if (!loading && flightOffers.length === 0) {
    return null;
  }

  return (
    <section
      className="py-10 md:py-14 px-4 sm:px-6 lg:px-10 xl:px-12 font-poppins bg-white dark:bg-[#0b1120] transition-colors duration-300"
      aria-label="Featured Flight Offers"
    >
      <div className="w-full max-w-[1760px] mx-auto">
        {/* Unified Card Container (Mirrored twin of OffersSection layout) */}
        <div className="w-full rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 p-3.5 sm:p-7 md:p-8 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] dark:shadow-none">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            {/* Left Column on lg+ (Flight Cards Carousel): Exact FlightCard & Backend Data */}
            <div data-animate="fade-up" data-delay="0.1" className="relative lg:col-span-8 xl:col-span-9 min-w-0 order-2 lg:order-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 py-1">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="w-full rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 animate-pulse"
                    >
                      <div className="h-32 bg-slate-200 dark:bg-slate-800" />
                      <div className="p-4 pt-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                        <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-3" />
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HorizontalCarousel
                  ariaLabel="flight offers"
                  arrowOffset="default"
                  trackClassName="gap-4 sm:gap-5 pb-3 pt-1 items-stretch"
                >
                  {flightOffers.map((offer, index) => {
                    const stock = offer?.flightRef?.stock || {};
                    const depInfo = resolveAirportInfo(stock.origin);
                    const arrInfo = resolveAirportInfo(
                      stock.destination || offer?.destination
                    );
                    const departureDate = stock.departureDate || offer?.startDate;
                    const arrivalDate = stock.arrivalDate || offer?.endDate;
                    const price = Number(
                      offer?.sellPrice || stock.costPerUnit || 0
                    );
                    const originalPrice = Number(offer?.originalPrice || 0);
                    const discountPercentage = Number(
                      offer?.discountPercentage || 0
                    );

                    const airlineDisplay =
                      stock.airline &&
                      !stock.airline.toLowerCase().includes("test")
                        ? stock.airline
                        : "Saudia";

                    return (
                      <div
                        key={offer._id || stock._id || index}
                        className="flex-none w-[88%] max-w-[305px] sm:w-[calc((100%-1.25rem)/2)] sm:max-w-none xl:w-[calc((100%-2.5rem)/3)] flex flex-col snap-start"
                      >
                        <FlightCard
                          imageUrl={offer?.images?.[0]}
                          airline={airlineDisplay}
                          flightCode={stock.flightNumber || "--"}
                          flightClass={stock.cabinClass || "Economy"}
                          departureCode={depInfo.code}
                          departureCity={depInfo.city}
                          departureTime={formatFlightTime(departureDate)}
                          arrivalCode={arrInfo.code}
                          arrivalCity={arrInfo.city}
                          arrivalTime={formatFlightTime(arrivalDate)}
                          duration={formatFlightDuration(
                            departureDate,
                            arrivalDate
                          )}
                          price={price > 0 ? price : undefined}
                          originalPrice={
                            originalPrice > price ? originalPrice : undefined
                          }
                          discountPercentage={discountPercentage}
                          onClick={() => handleCardClick(offer)}
                        />
                      </div>
                    );
                  })}
                </HorizontalCarousel>
              )}
            </div>

            {/* Right Column on lg+ (Offer Banner): Mirrored Title, Subtitle, Pill & CTA */}
            <div data-animate="slide-right" className="flex flex-col items-center text-center lg:col-span-4 xl:col-span-3 lg:items-end lg:text-right justify-center space-y-4 order-1 lg:order-2">
              <div className="space-y-3">
                {/* Main Heading */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  Exclusive Travel{" "}
                  <LiquidFillText text="Spacial Flight Offers" />
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal text-pretty">
                  Direct pilgrimage and global flight allotments with transparent fares—select any flight to proceed to instant booking.
                </p>

                {/* Highlight Tag */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                  <Plane
                    className="h-3 w-3 text-[#045C45] dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <span>Direct airline allotments &amp; transparent fares</span>
                </div>
              </div>

              {/* View all flights CTA */}
              <button
                type="button"
                onClick={() => navigate("/flight")}
                className="mt-1 sm:mt-2 w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs active:scale-95 focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2"
              >
                <span>View all flights</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightOffersSection;
