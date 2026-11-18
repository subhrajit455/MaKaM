import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import CommonHeader from "./CommonHeader";
import {
  PlaneTakeoff,
  PlaneLanding,
  Plane,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import FlightSearch from "../pages/Flight";
import HotelSearch from "../pages/HotelSearch";
import CommonFlightHotelSearchBox from "./commonflighthotelsearchbox/CommonFlightHotelSearchBox";
import { fetchFlights, getFareQuote } from "./reducer/FlightSearchSlice";
import FlightLoader from "./loader/FlightLoader";
import MoreFlightDetails from "./modal/MoreFlightDetails";
import ViewPricesModal from "./modal/ViewPricesModal";
import api from "./stores/api";
import { toast } from "react-toastify";
import AnimatedNumber from "./shared/AnimatedNumber";
import { staggerEntrance, clickSquash } from "../animations/presets";
import { INTERNATIONAL_AIRPORTS } from "../utils/airportLocator";
import {
  formatDate,
  getBaseDate,
  buildFallbackDates,
  addDays,
  getTripLength,
  getFlightNetFare,
  getFlightUnitFare,
} from "./flights/flightUtils";
import FlightFiltersSidebar from "./flights/FlightFiltersSidebar";
import FlightFiltersDrawer from "./flights/FlightFiltersDrawer";
import FlightSearchResultCard from "./flights/FlightSearchResultCard";
import FlightPagination from "./flights/FlightPagination";

const FlightCard = () => {
  const navigate = useNavigate();
  const dateStripRef = useRef(null);
  const { state } = useLocation();
  const dispatch = useDispatch();
  const { flightsData, loading, error } = useSelector(
    (state) => state.flightSearch,
  );

  const [_searchRefreshKey, setSearchRefreshKey] = useState(0);

  const searchParams = (() => {
    try {
      return (
        state?.flights?.[0]?.searchFlights ||
        JSON.parse(localStorage.getItem("flightSearch")) ||
        {}
      );
    } catch {
      return {};
    }
  })();

  const searchPax = searchParams.passengers || {};
  const adultCount = Math.max(
    1,
    Number(searchPax.adults ?? searchPax.adult ?? 1),
  );
  const childCount = Math.max(
    0,
    Number(searchPax.children ?? searchPax.child ?? 0),
  );
  const infantCount = Math.max(
    0,
    Number(searchPax.infants ?? searchPax.infant ?? 0),
  );
  const totalPassengerCount = adultCount + childCount + infantCount;
  const paxMultiplier = adultCount + childCount * 0.75 + infantCount * 0.1;

  const routeOrigin = searchParams.origin;
  const routeDest = searchParams.destination;
  const routeJourneyType = searchParams.journeyType;
  const routeReturnDate = searchParams.returnDate;
  const routeDepartureDate = searchParams.departureDate;

  const outboundFlights =
    flightsData?.data?.data?.outbound ||
    flightsData?.data?.outbound ||
    flightsData?.outbound ||
    [];

  const rawInboundFlights =
    flightsData?.data?.data?.inbound ||
    flightsData?.data?.inbound ||
    flightsData?.inbound ||
    [];

  const normalizedJourneyType = useMemo(() => {
    const raw = String(routeJourneyType || "").toLowerCase().trim();
    if (raw.includes("round")) return "roundtrip";
    if (raw.includes("multi")) return "multicity";
    if (raw.includes("one")) return "oneway";
    return raw;
  }, [routeJourneyType]);

  const isMultiCity = normalizedJourneyType === "multicity";
  const isRoundTrip =
    normalizedJourneyType === "roundtrip" ||
    (!["oneway", "multicity"].includes(normalizedJourneyType) &&
      Boolean(routeReturnDate));

  const inboundFlights = !isRoundTrip ? [] : rawInboundFlights;

  const [rawActiveLeg, setActiveLeg] = useState("outbound");
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [rawSelectedInbound, setSelectedInbound] = useState(null);

  const activeLeg = isRoundTrip ? rawActiveLeg : "outbound";
  const selectedInbound = isRoundTrip ? rawSelectedInbound : null;

  const flightsdata =
    isRoundTrip && activeLeg === "inbound" ? inboundFlights : outboundFlights;

  const traceId =
    flightsData?.data?.data?.traceId ||
    flightsData?.data?.traceId ||
    flightsData?.traceId;

  const getFlightFare = useCallback(
    (f) => {
      if (!f) return 0;
      if (f.selectedTier?.price) return Number(f.selectedTier.price);
      const unit = getFlightUnitFare(f);
      return Math.round(unit * (paxMultiplier || 1));
    },
    [paxMultiplier],
  );

  const maxPrice =
    flightsdata.length > 0
      ? Math.max(...flightsdata.map((f) => getFlightFare(f)))
      : 0;

  const minPrice =
    flightsdata.length > 0
      ? Math.min(...flightsdata.map((f) => getFlightFare(f)))
      : 0;

  const [selected, setSelected] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  // Accordion open/close states managed within FlightFiltersSidebar & FlightFiltersDrawer
  const [openFareQuote, setOpenFareQuote] = useState(false);
  const [selectedFlightForModal, setSelectedFlightForModal] = useState(null);
  const [openViewPrices, setOpenViewPrices] = useState(false);
  const [selectedFlightForPrices, setSelectedFlightForPrices] = useState(null);
  const [departure, setDeparture] = useState(24);
  const [arrival, setArrival] = useState(24);
  const [userPriceFilter, setPrice] = useState(null);
  const price =
    userPriceFilter !== null && maxPrice > 0 && userPriceFilter <= maxPrice
      ? userPriceFilter
      : maxPrice;

  const defaultDepartureDate =
    formatDate(routeDepartureDate) || formatDate(new Date());
  const [selectedActiveDate, setActiveDate] = useState("");
  const activeDate = selectedActiveDate || defaultDepartureDate;

  const [calendarDates, setCalendarDates] = useState(() =>
    buildFallbackDates(getBaseDate(defaultDepartureDate), 120),
  );

  const isFlightSelected = (f) => {
    if (!f) return false;
    const currentSelected =
      activeLeg === "outbound" ? selectedOutbound : selectedInbound;
    if (!currentSelected) return false;
    const curIdx =
      currentSelected.resultIndex || currentSelected.fares?.[0]?.resultIndex;
    const fIdx = f.resultIndex || f.fares?.[0]?.resultIndex;
    return Boolean(curIdx && fIdx && curIdx === fIdx);
  };

  const handleBookFlights = async () => {
    const hasOutbound = Boolean(selectedOutbound);
    const hasInbound = Boolean(selectedInbound);

    if (!hasOutbound && !hasInbound) {
      toast.warning(
        "Please select at least one flight to proceed with booking.",
      );
      return;
    }

    if (isRoundTrip && (!hasOutbound || !hasInbound)) {
      if (!hasOutbound) {
        toast.warning("Please select a departure flight.");
        setActiveLeg("outbound");
        return;
      }
      if (!hasInbound) {
        toast.warning(
          "Please select a return flight to complete your round trip booking.",
        );
        setActiveLeg("inbound");
        return;
      }
    }

    const isBoth = hasOutbound && hasInbound;
    const primaryFlight = selectedOutbound || selectedInbound;
    const secFlight = isBoth ? selectedInbound : null;

    const outResultIndex = String(
      selectedOutbound?.selectedTier?.resultIndex ||
        selectedOutbound?.resultIndex ||
        selectedOutbound?.fares?.[0]?.resultIndex ||
        "",
    ).trim();
    const inResultIndex = String(
      selectedInbound?.selectedTier?.resultIndex ||
        selectedInbound?.resultIndex ||
        selectedInbound?.fares?.[0]?.resultIndex ||
        "",
    ).trim();

    const combinedResultIndex = isBoth
      ? [outResultIndex, inResultIndex].filter(Boolean)
      : outResultIndex || inResultIndex;

    const resolvedTraceId = String(
      traceId ||
        flightsData?.data?.data?.traceId ||
        flightsData?.data?.traceId ||
        flightsData?.traceId ||
        primaryFlight?.traceId ||
        "",
    ).trim();

    const primaryResultIndex = outResultIndex || inResultIndex;
    let verifiedQuote =
      primaryFlight?.selectedTier?.verifiedFareQuote ||
      primaryFlight?.verifiedFareQuote ||
      null;

    if (!verifiedQuote && resolvedTraceId && primaryResultIndex && !primaryFlight?.isInHouse) {
      try {
        const res = await dispatch(
          getFareQuote({
            traceId: resolvedTraceId,
            resultIndex: primaryResultIndex,
          }),
        ).unwrap();
        verifiedQuote = res?.data || res;
      } catch (err) {
        toast.error(
          typeof err === "string"
            ? err
            : err?.message || "Failed to verify live fare quote. Please try again.",
        );
        return;
      }
    }

    const quoteBaseFare = Number(
      verifiedQuote?.fare?.baseFare ?? verifiedQuote?.BaseFare ?? 0,
    );
    const quoteTaxes = Number(
      verifiedQuote?.fare?.tax ??
        verifiedQuote?.fare?.taxes ??
        verifiedQuote?.Tax ??
        0,
    );
    const quoteTotal =
      Number(
        verifiedQuote?.fare?.offeredFare ||
          verifiedQuote?.fare?.publishedFare ||
          verifiedQuote?.OfferedFare ||
          verifiedQuote?.PublishedFare ||
          0,
      ) || quoteBaseFare + quoteTaxes;

    const outUnit =
      quoteTotal > 0
        ? Math.round(quoteTotal)
        : selectedOutbound?.selectedTier?.unitPrice ??
          getFlightUnitFare(selectedOutbound);
    const inUnit =
      selectedInbound?.selectedTier?.unitPrice ??
      getFlightUnitFare(selectedInbound);
    const outTotal =
      quoteTotal > 0
        ? Math.round(quoteTotal * (paxMultiplier || 1))
        : selectedOutbound?.selectedTier?.price ??
          getFlightFare(selectedOutbound);
    const inTotal =
      selectedInbound?.selectedTier?.price ?? getFlightFare(selectedInbound);
    const totalFare = outTotal + inTotal;
    const totalUnit = outUnit + inUnit;

    const outTier = selectedOutbound?.selectedTier?.title || "Saver Fare";
    const inTier = selectedInbound?.selectedTier?.title || "Saver Fare";
    const tierTitle = isBoth
      ? `${outTier} + ${inTier}`
      : selectedOutbound
        ? outTier
        : inTier;

    const bookingState = {
      traceId: resolvedTraceId,
      resultIndex: combinedResultIndex,
      selectedFareTier: tierTitle,
      verifiedFareQuote: verifiedQuote,
      flight: primaryFlight
        ? {
            ...primaryFlight,
            resultIndex: primaryResultIndex || primaryFlight.resultIndex,
            netFare: getFlightNetFare(primaryFlight) || outUnit,
            retailFare: outUnit,
          }
        : null,
      returnFlight: secFlight
        ? {
            ...secFlight,
            resultIndex: inResultIndex || secFlight.resultIndex,
            netFare: getFlightNetFare(secFlight) || inUnit,
            retailFare: inUnit,
          }
        : null,
      isRoundTrip: isBoth,
      passengers: {
        adults: adultCount,
        children: childCount,
        infants: infantCount,
      },
      selectedTier: {
        id: isBoth ? "roundtrip-saver" : "flight-saver",
        title: tierTitle,
        resultIndex: primaryResultIndex,
        priceMultiplier: 1,
        unitPrice: totalUnit,
        price: totalFare,
        verifiedFareQuote: verifiedQuote,
      },
      timestamp: Date.now(),
    };

    let cleanBookingState;
    try {
      cleanBookingState = JSON.parse(JSON.stringify(bookingState));
      sessionStorage.setItem(
        "selectedFlightBooking",
        JSON.stringify(cleanBookingState),
      );
      localStorage.setItem(
        "selectedFlightBooking",
        JSON.stringify(cleanBookingState),
      );
    } catch (e) {
      console.warn("Could not cache flight booking:", e);
      cleanBookingState = bookingState;
    }

    navigate("/fare-quote-details", {
      state: cleanBookingState,
    });
  };

  const handleDirectBook = async (f) => {
    const fIdx = String(
      f?.selectedTier?.resultIndex ||
        f?.resultIndex ||
        f?.fares?.[0]?.resultIndex ||
        "",
    ).trim();
    const resolvedTraceId = String(
      traceId ||
        flightsData?.data?.data?.traceId ||
        flightsData?.data?.traceId ||
        flightsData?.traceId ||
        f?.traceId ||
        "",
    ).trim();

    let verifiedQuote =
      f?.selectedTier?.verifiedFareQuote || f?.verifiedFareQuote || null;

    if (!verifiedQuote && resolvedTraceId && fIdx && !f?.isInHouse) {
      try {
        const res = await dispatch(
          getFareQuote({
            traceId: resolvedTraceId,
            resultIndex: fIdx,
          }),
        ).unwrap();
        verifiedQuote = res?.data || res;
      } catch (err) {
        toast.error(
          typeof err === "string"
            ? err
            : err?.message || "Failed to verify live fare quote. Please try again.",
        );
        return;
      }
    }

    const quoteBaseFare = Number(
      verifiedQuote?.fare?.baseFare ?? verifiedQuote?.BaseFare ?? 0,
    );
    const quoteTaxes = Number(
      verifiedQuote?.fare?.tax ??
        verifiedQuote?.fare?.taxes ??
        verifiedQuote?.Tax ??
        0,
    );
    const quoteTotal =
      Number(
        verifiedQuote?.fare?.offeredFare ||
          verifiedQuote?.fare?.publishedFare ||
          verifiedQuote?.OfferedFare ||
          verifiedQuote?.PublishedFare ||
          0,
      ) || quoteBaseFare + quoteTaxes;

    const unitFare =
      quoteTotal > 0
        ? Math.round(quoteTotal)
        : f?.selectedTier?.unitPrice ?? getFlightUnitFare(f);
    const totalFare =
      quoteTotal > 0
        ? Math.round(quoteTotal * (paxMultiplier || 1))
        : f?.selectedTier?.price ?? Math.round(unitFare * (paxMultiplier || 1));
    const netUnit = getFlightNetFare(f) || unitFare;

    const bookingState = {
      traceId: resolvedTraceId,
      resultIndex: fIdx,
      selectedFareTier: f?.selectedTier?.title || "Saver Fare",
      verifiedFareQuote: verifiedQuote,
      flight: {
        ...f,
        resultIndex: fIdx || f?.resultIndex,
        netFare: netUnit,
        retailFare: unitFare,
      },
      returnFlight: null,
      isRoundTrip: false,
      passengers: {
        adults: adultCount,
        children: childCount,
        infants: infantCount,
      },
      selectedTier: {
        id: f?.selectedTier?.id || "saver",
        title: f?.selectedTier?.title || "Saver Fare",
        resultIndex: fIdx,
        priceMultiplier: f?.selectedTier?.priceMultiplier || 1,
        unitPrice: unitFare,
        price: totalFare,
        verifiedFareQuote: verifiedQuote,
      },
      timestamp: Date.now(),
    };

    let cleanBookingState;
    try {
      cleanBookingState = JSON.parse(JSON.stringify(bookingState));
      sessionStorage.setItem(
        "selectedFlightBooking",
        JSON.stringify(cleanBookingState),
      );
      localStorage.setItem(
        "selectedFlightBooking",
        JSON.stringify(cleanBookingState),
      );
    } catch (e) {
      console.warn("Could not cache flight booking:", e);
      cleanBookingState = bookingState;
    }

    navigate("/fare-quote-details", {
      state: cleanBookingState,
    });
  };

  // Tooltip states managed within FlightFiltersSidebar & FlightFiltersDrawer
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    let active = true;
    const departureDate =
      formatDate(routeDepartureDate) || formatDate(new Date());
    const baseDate = getBaseDate(departureDate);
    const initialDates = buildFallbackDates(baseDate, 120);

    const loadCalendarFares = async () => {
      if (!routeOrigin || !routeDest) {
        if (active) setCalendarDates(initialDates);
        return;
      }

      // Check if route is international (SRDV sandbox only supports domestic India for calendar fares)
      const origCode = String(routeOrigin).trim().toUpperCase();
      const destCode = String(routeDest).trim().toUpperCase();
      const origAirport = INTERNATIONAL_AIRPORTS.find((a) => a.iataCode === origCode);
      const destAirport = INTERNATIONAL_AIRPORTS.find((a) => a.iataCode === destCode);
      const isDomesticIndianRoute =
        (!origAirport || origAirport.countryCode === "IN") &&
        (!destAirport || destAirport.countryCode === "IN");

      // Circuit breaker check: if previously 502/unsupported in this session, skip API calls
      const isCalDisabled = sessionStorage.getItem("srdv_cal_fare_disabled") === "true";

      if (!isDomesticIndianRoute || isCalDisabled) {
        if (active) setCalendarDates(initialDates);
        return;
      }

      if (active) setCalendarDates(initialDates);

      const fareDates = new Map();
      const tripLength = getTripLength(
        departureDate,
        formatDate(routeReturnDate),
      );

      try {
        // Step 1: Probe with offset 0 first to prevent 4 simultaneous 502 errors
        const firstRes = await api.post("/api/v1/flights/calendar-fare", {
          origin: routeOrigin,
          destination: routeDest,
          departDate: addDays(baseDate, 0),
          returnDate:
            normalizedJourneyType === "roundtrip"
              ? addDays(baseDate, tripLength)
              : null,
          journeyType:
            normalizedJourneyType === "roundtrip" ? "roundtrip" : "oneway",
          fareType: 1,
        });

        const firstFares = firstRes?.data?.data?.results || [];
        firstFares.forEach((item) => {
          const date = formatDate(item.departureDate);
          const fare = Number(item.totalAmount ?? item.fare ?? 0);
          if (!date || !fare) return;
          fareDates.set(date, {
            date,
            fare,
            lowFare: Boolean(item.isLowestFareOfMonth),
          });
        });

        // Step 2: Since offset 0 succeeded, fetch remaining offsets in parallel
        const remainingOffsets = [30, 60, 90];
        const remainingRequests = remainingOffsets.map((offset) =>
          api
            .post("/api/v1/flights/calendar-fare", {
              origin: routeOrigin,
              destination: routeDest,
              departDate: addDays(baseDate, offset),
              returnDate:
                normalizedJourneyType === "roundtrip"
                  ? addDays(addDays(baseDate, offset), tripLength)
                  : null,
              journeyType:
                normalizedJourneyType === "roundtrip" ? "roundtrip" : "oneway",
              fareType: 1,
            })
            .catch(() => null),
        );

        const responses = await Promise.allSettled(remainingRequests);
        if (!active) return;

        responses.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const fares = result.value?.data?.data?.results || [];
          fares.forEach((item) => {
            const date = formatDate(item.departureDate);
            const fare = Number(item.totalAmount ?? item.fare ?? 0);
            if (!date || !fare) return;

            const current = fareDates.get(date);
            if (!current || fare < current.fare) {
              fareDates.set(date, {
                date,
                fare,
                lowFare: Boolean(item.isLowestFareOfMonth),
              });
            }
          });
        });

        const mergedDates = initialDates.map(
          (date) => fareDates.get(date.date) || date,
        );
        setCalendarDates(mergedDates);
      } catch (err) {
        // If upstream SRDV throws 502 or calendar-fare is disabled in sandbox,
        // trigger circuit breaker for current session to prevent repeating 502 calls
        const status = err?.response?.status;
        if (status === 502 || status === 400 || status === 500) {
          sessionStorage.setItem("srdv_cal_fare_disabled", "true");
        }
        if (active) setCalendarDates(initialDates);
      }
    };

    loadCalendarFares();

    return () => {
      active = false;
    };
  }, [
    routeOrigin,
    routeDest,
    normalizedJourneyType,
    routeReturnDate,
    routeDepartureDate,
  ]);

  useEffect(() => {
    if (dateStripRef.current && activeDate) {
      const activeEl = dateStripRef.current.querySelector(
        `[data-date="${activeDate}"]`,
      );
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeDate, calendarDates.length]);

  const scrollDates = (direction) => {
    if (dateStripRef.current) {
      const scrollAmount = Math.max(
        240,
        dateStripRef.current.clientWidth * 0.75,
      );
      dateStripRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const effectivePrice = price > 0 ? price : maxPrice;

  // Percentage of slider
  const percentage =
    maxPrice > minPrice
      ? ((effectivePrice - minPrice) / (maxPrice - minPrice)) * 100
      : 100;

  const stopOptions = useMemo(() => {
    let nonStop = 0;
    let oneStop = 0;
    (flightsdata || []).forEach((flight) => {
      const stops = Math.max(0, (flight.segments?.length || 1) - 1);
      if (stops === 0) nonStop++;
      else if (stops === 1) oneStop++;
    });
    return [
      { stop: 0, label: "Non Stop", count: nonStop },
      { stop: 1, label: "1 Stop", count: oneStop },
    ];
  }, [flightsdata]);

  const handleToggleStop = (stopValue) => {
    setSelectedStops((prev) =>
      prev.includes(stopValue)
        ? prev.filter((s) => s !== stopValue)
        : [...prev, stopValue]
    );
  };

  const handleResetFilters = () => {
    setSelected([]);
    setSelectedStops([]);
    setDeparture(24);
    setArrival(24);
    setPrice(null);
  };

  const activeFiltersCount =
    selected.length +
    selectedStops.length +
    (departure < 24 ? 1 : 0) +
    (arrival < 24 ? 1 : 0) +
    (price < maxPrice && price > 0 ? 1 : 0);

  const filteredFlights = useMemo(() => {
    return (flightsdata || []).filter((flight) => {
      const segments = flight.segments || [];
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1] || firstSegment;

      if (!firstSegment) return false;

      // 1. Airline filter
      if (selected.length > 0) {
        const matchesAirline = segments.some((seg) =>
          selected.includes(seg?.airlineCode)
        );
        if (!matchesAirline) return false;
      }

      // 2. Stops filter (Non Stop = 0, 1 Stop = 1)
      const stopsCount = Math.max(0, segments.length - 1);
      if (selectedStops.length > 0) {
        const matchesStop = selectedStops.some((s) => {
          if (s === 0) return stopsCount === 0;
          if (s === 1) return stopsCount === 1;
          return false;
        });
        if (!matchesStop) return false;
      }

      // 3. Departure hour filter
      let departureHour = NaN;
      if (firstSegment.departure) {
        if (firstSegment.departure.includes("T")) {
          departureHour = parseInt(
            firstSegment.departure.split("T")[1]?.slice(0, 2),
            10
          );
        } else {
          const d = new Date(firstSegment.departure);
          if (!isNaN(d)) departureHour = d.getHours();
        }
      }
      if (!isNaN(departureHour) && departureHour > departure) {
        return false;
      }

      // 4. Arrival hour filter (based on final destination arrival!)
      let arrivalHour = NaN;
      if (lastSegment.arrival) {
        if (lastSegment.arrival.includes("T")) {
          arrivalHour = parseInt(
            lastSegment.arrival.split("T")[1]?.slice(0, 2),
            10
          );
        } else {
          const d = new Date(lastSegment.arrival);
          if (!isNaN(d)) arrivalHour = d.getHours();
        }
      }
      if (!isNaN(arrivalHour) && arrivalHour > arrival) {
        return false;
      }

      // 5. Price filter
      const flightPrice = getFlightFare(flight);
      if (effectivePrice > 0 && flightPrice > Number(effectivePrice)) {
        return false;
      }

      return true;
    });
  }, [
    flightsdata,
    selected,
    selectedStops,
    departure,
    arrival,
    effectivePrice,
    getFlightFare,
  ]);

  const airlines = Object.values(
    flightsdata.reduce((acc, flight) => {
      flight.segments?.forEach((segment) => {
        if (!segment) return;

        const { airline, airlineCode } = segment;
        if (!airlineCode) return;

        const key = airlineCode.trim().toUpperCase();

        if (!acc[key]) {
          acc[key] = {
            airlineCode,
            airline: key === "6E" ? "IndiGo" : airline,
            count: 0,
          };
        }
        acc[key].count++;
      });

      return acc;
    }, {}),
  );

  // Pagination Configuration & State (20 flights per page)
  const FLIGHTS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const flightListSectionRef = useRef(null);

  // Adjust to page 1 whenever filters or active legs change
  const filterKey = `${selected.join(",")}_${selectedStops.join(",")}_${departure}_${arrival}_${effectivePrice}_${activeLeg}_${flightsdata?.length || 0}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  const totalFlights = filteredFlights.length;
  const totalPages = Math.max(1, Math.ceil(totalFlights / FLIGHTS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedFlights = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * FLIGHTS_PER_PAGE;
    return filteredFlights.slice(startIndex, startIndex + FLIGHTS_PER_PAGE);
  }, [filteredFlights, safeCurrentPage]);

  const startFlightIndex =
    totalFlights === 0 ? 0 : (safeCurrentPage - 1) * FLIGHTS_PER_PAGE + 1;
  const endFlightIndex = Math.min(
    safeCurrentPage * FLIGHTS_PER_PAGE,
    totalFlights,
  );

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      totalPages,
    ];
  }, [safeCurrentPage, totalPages]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;
    setCurrentPage(newPage);
    if (flightListSectionRef.current) {
      flightListSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!loading && paginatedFlights?.length > 0) {
      staggerEntrance(".flight-card-container", {
        stagger: 45,
        startDelay: 30,
      });
    }
  }, [loading, paginatedFlights?.length, activeLeg, safeCurrentPage]);

  const handleCheckbox = (id) => {
    console.log("Check", id);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDateSelect = (date) => {
    setActiveDate(date);
    const nextSearch = { ...searchParams, departureDate: date };
    localStorage.setItem("flightSearch", JSON.stringify(nextSearch));
    dispatch(fetchFlights(nextSearch));
  };

  return (
    <>
      <CommonHeader title="Flight" value={false} />
      {/* Flight Search Card (Responsive across mobile, tablet, and desktop) */}
      <div className="relative z-40 bg-slate-100/95 backdrop-blur-md border-b border-gray-200/80 shadow-2xs mt-16 sm:mt-20">
        <CommonFlightHotelSearchBox
          headerChange={true}
          departureDate={activeDate}
          onSearchSuccess={() => {
            setActiveDate("");
            setSearchRefreshKey((prev) => prev + 1);
          }}
        />
      </div>

      <div
        className={`max-w-[1400px] w-full mx-auto px-3 sm:px-6 pt-6 ${isRoundTrip ? "pb-32" : "pb-12"}`}
      >
        {/* Mobile & Tablet Filter Icon Bar */}
        <div className="flex justify-between items-center lg:hidden  mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {filteredFlights?.length || 0} Flights Available
            </h2>
            <p className="text-xs text-gray-500">
              {selected.length > 0
                ? `${selected.length} filter(s) applied`
                : "Filter by airline, price & time"}
            </p>
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 bg-[#00BBA7] hover:bg-[#009b8a] text-white px-4 py-2 rounded-lg font-semibold text-xs transition cursor-pointer shadow-sm"
          >
            <Filter size={16} />
            <span>
              Filters {selected.length > 0 ? `(${selected.length})` : ""}
            </span>
          </button>
        </div>

        {/* Mobile & Tablet Filter Drawer Modal */}
        <FlightFiltersDrawer
          isOpen={showFilter}
          onClose={() => setShowFilter(false)}
          activeFiltersCount={activeFiltersCount}
          filteredFlightsCount={filteredFlights.length}
          onResetFilters={handleResetFilters}
          airlines={airlines}
          selectedAirlines={selected}
          onToggleAirline={handleCheckbox}
          searchParams={searchParams}
          arrival={arrival}
          onChangeArrival={setArrival}
          price={price}
          onChangePrice={setPrice}
          minPrice={minPrice}
          maxPrice={maxPrice}
          stopOptions={stopOptions}
          selectedStops={selectedStops}
          onToggleStop={handleToggleStop}
        />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Desktop Sidebar Filters */}
          <FlightFiltersSidebar
            activeFiltersCount={activeFiltersCount}
            onResetFilters={handleResetFilters}
            airlines={airlines}
            selectedAirlines={selected}
            onToggleAirline={handleCheckbox}
            searchParams={searchParams}
            departure={departure}
            onChangeDeparture={setDeparture}
            arrival={arrival}
            onChangeArrival={setArrival}
            price={price}
            onChangePrice={setPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            stopOptions={stopOptions}
            selectedStops={selectedStops}
            onToggleStop={handleToggleStop}
          />

          {/* Main Flight Cards Container */}
          <main className="flex-1 w-full min-w-0">
            <div>
              {/* Round Trip Leg Navigation Banner */}
              {isRoundTrip && (
                <div className="mb-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Departure Tab */}
                    <div
                      onClick={() => {
                        setActiveLeg("outbound");
                        if (selectedOutbound) {
                          setSelectedFlightForPrices(selectedOutbound);
                          setOpenViewPrices(true);
                        }
                      }}
                      className={`flex-1 w-full p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                        activeLeg === "outbound"
                          ? "border-teal-500 bg-teal-50/40 shadow-xs ring-2 ring-teal-500/20"
                          : "border-gray-200/80 hover:bg-gray-50/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-100/70 px-2 py-0.5 rounded-full">
                            1. Departure Flight
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            {formatDate(searchParams.departureDate) ||
                              "Selected Date"}
                          </span>
                        </div>
                        {selectedOutbound ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-400">
                            {outboundFlights.length} flights
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <h3 className="text-base font-bold text-gray-900">
                          {searchParams.origin || "Origin"} →{" "}
                          {searchParams.destination || "Destination"}
                        </h3>
                        {selectedOutbound && (
                          <span className="text-sm font-extrabold text-teal-700">
                            ₹
                            {getFlightFare(selectedOutbound).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        )}
                      </div>
                      {selectedOutbound && (
                        <p className="mt-1 text-xs text-gray-600 truncate font-medium">
                          {selectedOutbound.segments?.[0]?.airline} (
                          {selectedOutbound.segments?.[0]?.departure
                            ?.split("T")?.[1]
                            ?.slice(0, 5)}
                          )
                        </p>
                      )}
                    </div>

                    {/* Return Tab */}
                    <div
                      onClick={() => {
                        setActiveLeg("inbound");
                        if (selectedInbound) {
                          setSelectedFlightForPrices(selectedInbound);
                          setOpenViewPrices(true);
                        }
                      }}
                      className={`flex-1 w-full p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                        activeLeg === "inbound"
                          ? "border-teal-500 bg-teal-50/40 shadow-xs ring-2 ring-teal-500/20"
                          : "border-gray-200/80 hover:bg-gray-50/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-100/70 px-2 py-0.5 rounded-full">
                            2. Return Flight
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            {formatDate(routeReturnDate) || "Return Date"}
                          </span>
                        </div>
                        {selectedInbound ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-400">
                            {inboundFlights.length} flights
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <h3 className="text-base font-bold text-gray-900">
                          {searchParams.destination || "Destination"} →{" "}
                          {searchParams.origin || "Origin"}
                        </h3>
                        {selectedInbound && (
                          <span className="text-sm font-extrabold text-teal-700">
                            ₹
                            {getFlightFare(selectedInbound).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        )}
                      </div>
                      {selectedInbound && (
                        <p className="mt-1 text-xs text-gray-600 truncate font-medium">
                          {selectedInbound.segments?.[0]?.airline} (
                          {selectedInbound.segments?.[0]?.departure
                            ?.split("T")?.[1]
                            ?.slice(0, 5)}
                          )
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div ref={flightListSectionRef} className="scroll-mt-24">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isRoundTrip
                    ? activeLeg === "outbound"
                      ? `Departure Flights: ${searchParams.origin || "Origin"} to ${searchParams.destination || "Destination"}`
                      : `Return Flights: ${searchParams.destination || "Destination"} to ${searchParams.origin || "Origin"}`
                    : isMultiCity
                      ? `Multi-City Flights: ${searchParams.origin || "Origin"} to ${searchParams.destination || "Destination"}`
                      : `Flights from ${searchParams.origin || ""} to ${searchParams.destination || ""}`}
                </h1>
              </div>
              {/* Date Selector Carousel */}
              <div className="relative w-full rounded-xl border border-gray-200 bg-white shadow-xs mt-3 overflow-hidden">
                {/* Left Arrow */}
                <button
                  type="button"
                  onClick={() => scrollDates("left")}
                  className="cursor-pointer absolute left-0 top-0 bottom-0 z-20 w-8 sm:w-10 border-r border-gray-200 bg-white/95 backdrop-blur-xs flex items-center justify-center hover:bg-gray-50 transition shadow-xs"
                  aria-label="Previous dates"
                >
                  <ChevronLeft className="h-5 w-5 text-teal-600" />
                </button>

                {/* Scroll Area */}
                <div
                  ref={dateStripRef}
                  className="flex overflow-x-auto scrollbar-hide scroll-smooth px-8 sm:px-10 divide-x divide-gray-100"
                >
                  {calendarDates.map((item) => (
                    <button
                      key={item.date}
                      type="button"
                      data-date={item.date}
                      onClick={() => handleDateSelect(item.date)}
                      className={`min-w-[100px] sm:min-w-[125px] flex-1 py-3 sm:py-3.5 cursor-pointer transition-all hover:bg-teal-50/20 text-center shrink-0
                        ${
                          activeDate === item.date
                            ? "border-b-[3px] border-b-teal-600 bg-teal-50/40"
                            : ""
                        }`}
                    >
                      <p
                        className={`text-xs sm:text-sm font-semibold ${
                          activeDate === item.date
                            ? "text-teal-700 font-bold"
                            : "text-gray-700"
                        }`}
                      >
                        {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>

                      <p
                        className={`mt-0.5 text-xs sm:text-sm font-bold ${
                          activeDate === item.date
                            ? "text-teal-700 font-extrabold"
                            : item.lowFare
                              ? "text-emerald-600 font-bold"
                              : "text-gray-900"
                        }`}
                      >
                        {item.fare
                          ? `₹ ${Number(item.fare).toLocaleString("en-IN")}`
                          : "Check fares"}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Right Arrow */}
                <button
                  type="button"
                  onClick={() => scrollDates("right")}
                  className="cursor-pointer absolute right-0 top-0 bottom-0 z-20 w-8 sm:w-10 border-l border-gray-200 bg-white/95 backdrop-blur-xs flex items-center justify-center hover:bg-gray-50 transition shadow-xs"
                  aria-label="Next dates"
                >
                  <ChevronRight className="h-5 w-5 text-teal-600" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                {loading && <FlightLoader />}

                {!loading && (
                  <>
                    {filteredFlights?.length === 0 ? (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                        <PlaneLanding className="mb-4 h-10 w-10 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-800">
                          No flights available
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-slate-500">
                          {error
                            ? "We could not load flights for this search. Please try again with different dates or airports."
                            : "No flights were found for the selected route, date, or filters."}
                        </p>
                      </div>
                    ) : (
                      paginatedFlights.map((temp, index) => (
                        <FlightSearchResultCard
                          key={index}
                          flight={temp}
                          index={index}
                          paxMultiplier={paxMultiplier}
                          totalPassengerCount={totalPassengerCount}
                          isRoundTrip={isRoundTrip}
                          activeLeg={activeLeg}
                          isSelected={isFlightSelected(temp)}
                          onViewPrices={(f) => {
                            setSelectedFlightForPrices(f);
                            setOpenViewPrices(true);
                          }}
                          onOpenDetails={(modalPayload) => {
                            setSelectedFlightForModal(modalPayload);
                            setOpenFareQuote(true);
                          }}
                        />
                      ))
                    )}

                    {/* Flights Pagination Bar */}
                    <FlightPagination
                      totalFlights={totalFlights}
                      startFlightIndex={startFlightIndex}
                      endFlightIndex={endFlightIndex}
                      safeCurrentPage={safeCurrentPage}
                      totalPages={totalPages}
                      pageNumbers={pageNumbers}
                      onPageChange={handlePageChange}
                    />

                    <MoreFlightDetails
                      openFareQuote={openFareQuote}
                      setOpenFareQuote={setOpenFareQuote}
                      flight={selectedFlightForModal}
                      traceId={
                        traceId ||
                        flightsData?.data?.data?.traceId ||
                        flightsData?.data?.traceId ||
                        flightsData?.traceId
                      }
                      resultIndex={
                        selectedFlightForModal?.resultIndex ||
                        selectedFlightForModal?.fares?.[0]?.resultIndex
                      }
                      onSelectFlight={handleDirectBook}
                    />

                    <ViewPricesModal
                      openViewPrices={openViewPrices}
                      setOpenViewPrices={setOpenViewPrices}
                      flight={selectedFlightForPrices}
                      returnFlight={
                        activeLeg === "outbound"
                          ? selectedInbound
                          : selectedOutbound
                      }
                      isRoundTrip={isRoundTrip}
                      onConfirmTier={(tier) => {
                        const priceNum = Number(tier.price || 0);
                        if (isRoundTrip) {
                          if (activeLeg === "outbound") {
                            setSelectedOutbound({
                              ...selectedFlightForPrices,
                              selectedTier: tier,
                            });
                            toast.success(
                              `Departure flight selected (${tier.title} - ₹${priceNum.toLocaleString("en-IN")})`,
                            );
                            if (!selectedInbound) {
                              setActiveLeg("inbound");
                            }
                          } else {
                            setSelectedInbound({
                              ...selectedFlightForPrices,
                              selectedTier: tier,
                            });
                            toast.success(
                              `Return flight selected (${tier.title} - ₹${priceNum.toLocaleString("en-IN")})`,
                            );
                          }
                        } else {
                          setSelectedOutbound({
                            ...selectedFlightForPrices,
                            selectedTier: tier,
                          });
                          handleDirectBook({
                            ...selectedFlightForPrices,
                            selectedTier: tier,
                          });
                        }
                      }}
                      traceId={
                        traceId ||
                        flightsData?.data?.data?.traceId ||
                        flightsData?.data?.traceId ||
                        flightsData?.traceId
                      }
                    />
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* Sticky Bottom Round-Trip / Flight Booking Bar */}
      {(isRoundTrip || selectedOutbound || selectedInbound) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 sm:px-8 py-3.5 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Selected Legs Preview */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto">
              {/* Outbound Leg */}
              <div
                onClick={() => {
                  setActiveLeg("outbound");
                  if (selectedOutbound) {
                    setSelectedFlightForPrices(selectedOutbound);
                    setOpenViewPrices(true);
                  }
                }}
                className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl border cursor-pointer transition ${
                  selectedOutbound
                    ? "bg-teal-50/70 border-teal-300 ring-1 ring-teal-400/20"
                    : "bg-gray-50 border-dashed border-gray-300 hover:bg-gray-100"
                }`}
              >
                <PlaneTakeoff className="w-4 h-4 text-teal-600 shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                    Departure
                  </span>
                  <p className="text-xs font-bold text-gray-900 truncate max-w-[170px]">
                    {selectedOutbound
                      ? `${selectedOutbound.segments?.[0]?.airline || "Flight"} • ₹${getFlightFare(selectedOutbound).toLocaleString("en-IN")}`
                      : "Choose departure flight"}
                  </p>
                </div>
                {selectedOutbound && (
                  <button
                    type="button"
                    title="Deselect departure flight"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOutbound(null);
                      toast.info("Departure flight removed");
                    }}
                    className="ml-1 p-0.5 rounded-full hover:bg-teal-200/60 text-teal-700 hover:text-teal-900 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Return Leg (in Round Trip) */}
              {isRoundTrip && (
                <>
                  <span className="text-gray-400 font-extrabold text-sm hidden sm:inline">
                    +
                  </span>

                  <div
                    onClick={() => {
                      setActiveLeg("inbound");
                      if (selectedInbound) {
                        setSelectedFlightForPrices(selectedInbound);
                        setOpenViewPrices(true);
                      }
                    }}
                    className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl border cursor-pointer transition ${
                      selectedInbound
                        ? "bg-teal-50/70 border-teal-300 ring-1 ring-teal-400/20"
                        : "bg-gray-50 border-dashed border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <PlaneLanding className="w-4 h-4 text-teal-600 shrink-0" />
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                        Return
                      </span>
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[170px]">
                        {selectedInbound
                          ? `${selectedInbound.segments?.[0]?.airline || "Flight"} • ₹${getFlightFare(selectedInbound).toLocaleString("en-IN")}`
                          : "Choose return flight"}
                      </p>
                    </div>
                    {selectedInbound && (
                      <button
                        type="button"
                        title="Deselect return flight"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInbound(null);
                          toast.info("Return flight removed");
                        }}
                        className="ml-1 p-0.5 rounded-full hover:bg-teal-200/60 text-teal-700 hover:text-teal-900 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Total Fare & Action */}
            <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto">
              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  {selectedOutbound && selectedInbound
                    ? "Total Round Trip Fare"
                    : selectedOutbound
                      ? "Departure Flight Fare"
                      : selectedInbound
                        ? "Return Flight Fare"
                        : "Total Fare"}
                  {totalPassengerCount > 1
                    ? ` (${totalPassengerCount} Travellers)`
                    : ""}
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  ₹
                  {Math.round(
                    getFlightFare(selectedOutbound) +
                      getFlightFare(selectedInbound),
                  ).toLocaleString("en-IN")}
                </p>
                {totalPassengerCount > 1 && (
                  <span className="text-[10px] text-gray-400 font-medium block">
                    (₹
                    {Math.round(
                      (getFlightFare(selectedOutbound) +
                        getFlightFare(selectedInbound)) /
                        (paxMultiplier || 1),
                    ).toLocaleString("en-IN")}{" "}
                    / adult)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBookFlights();
                }}
                disabled={!selectedOutbound && !selectedInbound}
                className={`px-8 py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all active:scale-95 whitespace-nowrap ${
                  selectedOutbound || selectedInbound
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white hover:shadow-xl hover:scale-105 cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {selectedOutbound && selectedInbound
                  ? `Book Round Trip (₹${Math.round(getFlightFare(selectedOutbound) + getFlightFare(selectedInbound)).toLocaleString("en-IN")}) →`
                  : selectedOutbound
                    ? `Book Departure (₹${Math.round(getFlightFare(selectedOutbound)).toLocaleString("en-IN")}) →`
                    : selectedInbound
                      ? `Book Return (₹${Math.round(getFlightFare(selectedInbound)).toLocaleString("en-IN")}) →`
                      : "Select a Flight"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlightCard;
