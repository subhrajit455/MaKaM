import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DeparturePlace from "../../pages/DeparturePlace";
import ArrivalPlace from "../../pages/ArrivalPlace";
import TravellerClass from "../travellerclasses/TravellerClass";
import HotelSearch from "../../pages/HotelSearch";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchFlights } from "../reducer/FlightSearchSlice";
import {
  ChevronDown,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  CalendarDays,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Building2,
  Home,
  Package,
  Search,
  Users,
  Sparkles,
} from "lucide-react";

// import { FlightAPI } from "../../configs/api";
import { toast } from "react-toastify";
// import FlightCard from "../FlightList";

import { rotateSwap, clickSquash } from "../../animations/presets";
import {
  travellingWay,
  AIRPORTS_URL,
  formatLocalDate,
  fallbackAirports,
  KNOWN_AIRPORTS,
  resolveAirport,
  _farePrice,
  _travellClass,
  _services,
} from "./airportData";
import EditTravellersGuide from "./EditTravellersGuide";

const CommonFlightHotelSearchBox = ({
  headerChange,
  onSearchSuccess,
  departureDate,
  embedded = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const fromDebounceRef = useRef(null);
  const toDebounceRef = useRef(null);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("activeTab");
    return saved === "Round Trip" ? "Round Trip" : "One Way";
  });
  const [searchbox] = useState("FLIGHT");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d;
  });

  const departurePickerRef = useRef(null);
  const returnPickerRef = useRef(null);
  const swapDegRef = useRef(0);

  const handleStartDateChange = (date) => {
    if (!date) return;
    setStartDate(date);
    if (endDate && endDate < date) {
      const nextEnd = new Date(date);
      nextEnd.setDate(nextEnd.getDate() + 3);
      setEndDate(nextEnd);
    }
  };

  const handleTabClick = (way) => {
    if (activeTab === way) return;

    setActiveTab(way);
    localStorage.setItem("activeTab", way);

    let nextEndDate = endDate;
    if (way === "Round Trip") {
      if (!endDate || endDate < startDate) {
        const nextEnd = new Date(startDate || new Date());
        nextEnd.setDate(nextEnd.getDate() + 3);
        setEndDate(nextEnd);
        nextEndDate = nextEnd;
      }
    }

    // Only auto-trigger search if the results list is open (e.g. on /flight-list or headerChange mode)
    const isListOpen = Boolean(headerChange) || location.pathname === "/flight-list";

    if (isListOpen && (way === "One Way" || way === "Round Trip")) {
      const storedFlightSearch = (() => {
        try {
          return JSON.parse(localStorage.getItem("flightSearch")) || {};
        } catch {
          return {};
        }
      })();

      const originCode = selectedFrom?.iataCode || storedFlightSearch.origin;
      const destCode = selectedTo?.iataCode || storedFlightSearch.destination;

      if (!originCode || !destCode) {
        return;
      }

      const activePassengers = travellers?.adult
        ? {
            adults: travellers?.adult ?? 1,
            children: travellers?.child ?? 0,
            infants: travellers?.infant ?? 0,
          }
        : storedFlightSearch.passengers || { adults: 1, children: 0, infants: 0 };

      const departDateStr = formatLocalDate(startDate) || storedFlightSearch.departureDate;

      const payload = {
        origin: originCode,
        destination: destCode,
        departureDate: departDateStr,
        passengers: activePassengers,
        journeyType: way === "Round Trip" ? "roundtrip" : "oneway",
      };

      if (way === "Round Trip") {
        const retDate =
          nextEndDate && !Number.isNaN(nextEndDate.getTime())
            ? formatLocalDate(nextEndDate)
            : storedFlightSearch.returnDate ||
              formatLocalDate(new Date((startDate ? startDate.getTime() : 0) + 3 * 86400000));
        payload.returnDate = retDate;
      }

      // Update stored flightSearch in localStorage
      localStorage.setItem("flightSearch", JSON.stringify(payload));
      if (travellers) {
        localStorage.setItem("travellers", JSON.stringify(travellers));
      }

      // Dispatch search to update Redux store and refresh flight results
      dispatch(fetchFlights(payload));
      if (onSearchSuccess) {
        onSearchSuccess();
      }
    }
  };

  const toggleReturnTicket = (enable) => {
    if (enable) {
      handleTabClick("Round Trip");
      let nextEnd = endDate;
      if (!endDate || endDate < startDate) {
        nextEnd = new Date(startDate || new Date());
        nextEnd.setDate(nextEnd.getDate() + 3);
        setEndDate(nextEnd);
      }
      setTimeout(() => {
        returnPickerRef.current?.setOpen(true);
      }, 120);
    } else {
      handleTabClick("One Way");
    }
  };

  const handleEndDateChange = (date) => {
    if (date) {
      setEndDate(date);
      if (activeTab === "One Way") {
        handleTabClick("Round Trip");
      }
    }
  };

  const handleReturnClick = (e) => {
    if (activeTab !== "Round Trip") {
      handleTabClick("Round Trip");
      setTimeout(() => {
        returnPickerRef.current?.setOpen(true);
      }, 100);
    } else {
      if (!e || (e.target && e.target.tagName !== "INPUT")) {
        returnPickerRef.current?.setOpen(true);
      }
    }
  };

  useEffect(() => {
    if (departureDate) {
      const d =
        departureDate instanceof Date
          ? departureDate
          : new Date(`${departureDate}T00:00:00`);
      if (!Number.isNaN(d.getTime())) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStartDate(d);
      }
    }
  }, [departureDate]);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [airportDirectory, setAirportDirectory] = useState(fallbackAirports);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [selectedClass, setSelectedClass] = useState(false);
  const [showEditTravellersGuide, setShowEditTravellersGuide] = useState(false);
  const [highlightTravellers, setHighlightTravellers] = useState(false);
  const [travellers, setTravellers] = useState({
    adult: 1,
    child: 0,
    infant: 0,
    travelClass: "Economy",
  });

  const [showNavbar] = useState(true);
  const isDisabled = !(selectedFrom && selectedTo);
  const setIsDisabled = () => {};
  const formatSuggestion = (item) => item?.name || item?.iataCode || "";
  const hasLoadedDirectoryRef = useRef(false);

  const loadFullDirectory = useCallback(() => {
    if (hasLoadedDirectoryRef.current) return;
    hasLoadedDirectoryRef.current = true;

    let cached = null;
    try {
      cached = sessionStorage.getItem("flight-airport-directory");
    } catch {
      cached = null;
    }

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAirportDirectory(parsed);
          return;
        }
      } catch {
        try {
          sessionStorage.removeItem("flight-airport-directory");
        } catch {
          /* storage error ignored */
        }
      }
    }

    fetch(AIRPORTS_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Airport directory unavailable");
        return response.json();
      })
      .then((airports) => {
        const normalized = Object.values(airports)
          .filter((airport) => airport.iata && airport.name && airport.city)
          .map((airport, index) => ({
            id: airport.icao || `${airport.iata}-${index}`,
            name: airport.city,
            airport: airport.name,
            iataCode: airport.iata,
            countryCode: airport.country || "",
          }))
          .sort((first, second) => first.name.localeCompare(second.name));

        if (normalized.length > 0) {
          setAirportDirectory(normalized);
          try {
            sessionStorage.setItem(
              "flight-airport-directory",
              JSON.stringify(normalized),
            );
          } catch {
            /* storage quota exceeded or disabled */
          }
        }
      })
      .catch(() => {});
  }, []);

  const findAirports = useCallback(
    (query) => {
      loadFullDirectory();
      const search = (query || "").trim().toLowerCase();
      if (!search) return airportDirectory.slice(0, 30);

      return airportDirectory
        .filter((airport) =>
          [airport.name, airport.airport, airport.iataCode].some((value) =>
            value?.toLowerCase().includes(search),
          ),
        )
        .slice(0, 30);
    },
    [airportDirectory, loadFullDirectory],
  );

  // Pure derived suggestion lists based on active airportDirectory and user query
  const fromSuggestions = useMemo(() => {
    if (!showFromSuggestions) return [];
    const search = (fromQuery || "").trim().toLowerCase();
    if (!search) return airportDirectory.slice(0, 30);
    return airportDirectory
      .filter((airport) =>
        [airport.name, airport.airport, airport.iataCode].some((value) =>
          value?.toLowerCase().includes(search),
        ),
      )
      .slice(0, 30);
  }, [showFromSuggestions, fromQuery, airportDirectory]);

  const toSuggestions = useMemo(() => {
    if (!showToSuggestions) return [];
    const search = (toQuery || "").trim().toLowerCase();
    if (!search) return airportDirectory.slice(0, 30);
    return airportDirectory
      .filter((airport) =>
        [airport.name, airport.airport, airport.iataCode].some((value) =>
          value?.toLowerCase().includes(search),
        ),
      )
      .slice(0, 30);
  }, [showToSuggestions, toQuery, airportDirectory]);

  const setFromSuggestions = () => {};
  const setToSuggestions = () => {};
  const handleSwapLocations = (e) => {
    if (e?.currentTarget) {
      swapDegRef.current += 180;
      rotateSwap(e.currentTarget, swapDegRef.current);
    }
    const nextFrom = selectedTo;
    const nextTo = selectedFrom;
    const nextFromQuery = toQuery;
    const nextToQuery = fromQuery;

    setFromQuery(nextFromQuery);
    setToQuery(nextToQuery);
    setSelectedFrom(nextFrom);
    setSelectedTo(nextTo);
    setFromSuggestions([]);
    setToSuggestions([]);
    setShowFromSuggestions(false);
    setShowToSuggestions(false);

    if (nextFrom) {
      localStorage.setItem("selectedFrom", JSON.stringify(nextFrom));
    }
    if (nextTo) {
      localStorage.setItem("selectedTo", JSON.stringify(nextTo));
    }
  };

  const searchFlights = {
    origin: selectedFrom?.iataCode,
    destination: selectedTo?.iataCode,
    departureDate: formatLocalDate(startDate),
    passengers: {
      adults: travellers?.adult,
      children: travellers?.child,
      infants: travellers?.infant,
    },
    journeyType: activeTab === "Round Trip" ? "roundtrip" : "oneway",
  };

  if (activeTab === "Round Trip") {
    searchFlights.returnDate = formatLocalDate(endDate);
  }

  const handleFlightSearch = (overrideTravellers) => {
    const activeTravellers = overrideTravellers || travellers;

    if (activeTab === "Round Trip") {
      if (!endDate || Number.isNaN(endDate.getTime())) {
        toast.warning("Please select a return date for your round trip flight.");
        setTimeout(() => returnPickerRef.current?.setOpen(true), 100);
        return false;
      }
      if (endDate < startDate) {
        toast.warning("Return date cannot be earlier than departure date.");
        setTimeout(() => returnPickerRef.current?.setOpen(true), 100);
        return false;
      }
    }

    const payload = {
      origin: selectedFrom?.iataCode,
      destination: selectedTo?.iataCode,
      departureDate: formatLocalDate(startDate),
      passengers: {
        adults: activeTravellers?.adult ?? 1,
        children: activeTravellers?.child ?? 0,
        infants: activeTravellers?.infant ?? 0,
      },
      journeyType: activeTab === "Round Trip" ? "roundtrip" : "oneway",
    };

    if (activeTab === "Round Trip") {
      payload.returnDate = formatLocalDate(endDate);
    }

    // Save search payload
    localStorage.setItem("flightSearch", JSON.stringify(payload));
    if (activeTravellers) {
      localStorage.setItem("travellers", JSON.stringify(activeTravellers));
    }
    if (selectedFrom) {
      localStorage.setItem("selectedFrom", JSON.stringify(selectedFrom));
    }
    if (selectedTo) {
      localStorage.setItem("selectedTo", JSON.stringify(selectedTo));
    }
    // Dispatch API
    dispatch(fetchFlights(payload));
    if (onSearchSuccess) {
      onSearchSuccess();
    }
    return true;
  };

  const handleTravellerDone = (updatedTravellers) => {
    const active = updatedTravellers || travellers;
    if (active) {
      localStorage.setItem("travellers", JSON.stringify(active));
    }
    if (headerChange) {
      handleFlightSearch(active);
    }
  };

  const handleQuickSetTravellers = (targetAdults = 2) => {
    const updatedTravellers = {
      ...travellers,
      adult: targetAdults,
      child: 0,
      infant: 0,
    };
    setTravellers(updatedTravellers);
    setShowEditTravellersGuide(false);
    setHighlightTravellers(false);
    setSelectedClass(false);
    handleFlightSearch(updatedTravellers);
  };

  const renderEditTravellersGuide = () => {
    if (!showEditTravellersGuide) return null;

    return (
      <div className="mb-4 w-full rounded-2xl border border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-r from-emerald-50 via-teal-50/90 to-white dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 p-4 sm:p-4.5 shadow-md transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#085c44] text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">
                  Multiple Travellers Guidance
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Previously searched for 1 Person)
                </span>
              </div>
              <h4 className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Want to book for 2 or more travellers?
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                You previously searched for <strong>1 person</strong>. In flight bookings, airline fares and seat quotas are locked to the search. 
                Please edit the number of travellers in <strong className="text-[#085c44] dark:text-emerald-300 underline">TRAVELLERS &amp; CLASS</strong> below (e.g. 2 or 3) and search again to get verified fares and seats for all passengers.
              </p>

              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Quick Select &amp; Search:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickSetTravellers(2)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#085c44] hover:bg-[#064e3b] text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Set 2 Travellers &amp; Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSetTravellers(3)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Set 3 Travellers &amp; Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClass(true);
                    setHighlightTravellers(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                >
                  <span>Edit in TRAVELLERS &amp; CLASS</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowEditTravellersGuide(false);
              setHighlightTravellers(false);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition"
            title="Dismiss suggestion"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const handleFromChange = (e) => {
    const value = e.target.value;

    setFromQuery(value);
    setSelectedFrom(null);

    // Cancel previous timer
    clearTimeout(fromDebounceRef.current);

    // Start a new timer
    fromDebounceRef.current = setTimeout(() => {
      setFromSuggestions(findAirports(value));
      setShowFromSuggestions(true);
    }, 500);
  };

  const handleToChange = (e) => {
    const value = e.target.value;

    setToQuery(value);
    setSelectedTo(null);

    // Cancel previous timer
    clearTimeout(toDebounceRef.current);

    // Start a new timer
    toDebounceRef.current = setTimeout(() => {
      setToSuggestions(findAirports(value));
      setShowToSuggestions(true);
    }, 500);
  };

  // Synchronize state from location state or flightSearch in localStorage
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    // Only restore previous search data if user is actively modifying a search (e.g. on /flight-list or headerChange)
    const isEditingSearch =
      Boolean(headerChange) ||
      location.pathname === "/flight-list" ||
      Boolean(location.state?.flights);

    if (!isEditingSearch || embedded) {
      return;
    }

    let savedSearch = null;
    try {
      savedSearch =
        location.state?.flights?.[0]?.searchFlights ||
        JSON.parse(localStorage.getItem("flightSearch"));
    } catch {
      savedSearch = null;
    }

    let stateFrom = location.state?.flights?.[0]?.selectedFrom;
    let stateTo = location.state?.flights?.[0]?.selectedTo;

    if (!stateFrom) {
      try {
        stateFrom = JSON.parse(localStorage.getItem("selectedFrom"));
      } catch {
        stateFrom = null;
      }
    }

    if (!stateTo) {
      try {
        stateTo = JSON.parse(localStorage.getItem("selectedTo"));
      } catch {
        stateTo = null;
      }
    }

    if (savedSearch?.origin) {
      const resolvedFrom = resolveAirport(
        savedSearch.origin,
        airportDirectory,
        stateFrom?.iataCode === savedSearch.origin ? stateFrom : null,
      );
      setSelectedFrom(resolvedFrom);
      setFromQuery(resolvedFrom?.name || savedSearch.origin);
    } else if (stateFrom) {
      setSelectedFrom(stateFrom);
      setFromQuery(stateFrom.name || stateFrom.iataCode || "");
    }

    if (savedSearch?.destination) {
      const resolvedTo = resolveAirport(
        savedSearch.destination,
        airportDirectory,
        stateTo?.iataCode === savedSearch.destination ? stateTo : null,
      );
      setSelectedTo(resolvedTo);
      setToQuery(resolvedTo?.name || savedSearch.destination);
    } else if (stateTo) {
      setSelectedTo(stateTo);
      setToQuery(stateTo.name || stateTo.iataCode || "");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Departure Date: Always show current date on landing page (!headerChange) and never allow past dates
    if (headerChange && savedSearch?.departureDate) {
      const d = new Date(`${savedSearch.departureDate}T00:00:00`);
      if (!Number.isNaN(d.getTime()) && d >= today) {
        setStartDate(d);
      } else {
        setStartDate(new Date());
      }
    } else {
      setStartDate(new Date());
    }

    // Return Date: Ensure return date is always after or equal to departure date
    if (headerChange && savedSearch?.returnDate) {
      const d = new Date(`${savedSearch.returnDate}T00:00:00`);
      if (!Number.isNaN(d.getTime()) && d >= today) {
        setEndDate(d);
      } else {
        const nextEnd = new Date();
        nextEnd.setDate(nextEnd.getDate() + 3);
        setEndDate(nextEnd);
      }
    } else {
      const nextEnd = new Date();
      nextEnd.setDate(nextEnd.getDate() + 3);
      setEndDate(nextEnd);
    }

    if (savedSearch?.journeyType) {
      const jt = String(savedSearch.journeyType).toLowerCase();
      if (jt.includes("round")) {
        setActiveTab("Round Trip");
      } else {
        setActiveTab("One Way");
      }
    }

    if (savedSearch?.passengers) {
      setTravellers((prev) => ({
        ...prev,
        adult: savedSearch.passengers.adults ?? prev.adult,
        child: savedSearch.passengers.children ?? prev.child,
        infant: savedSearch.passengers.infants ?? prev.infant,
      }));
    }

    if (location.state?.editTravellersPrompt) {
      setShowEditTravellersGuide(true);
      setSelectedClass(true);
      setHighlightTravellers(true);
    } else if (location.state?.openTravellersDropdown) {
      setSelectedClass(true);
    }
  }, [location.state, location.pathname, headerChange, embedded, airportDirectory]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab]);

  return (
    <>
      {headerChange ? (
        <div className="relative w-full px-2 sm:px-4 py-3 z-40">
          <div className="relative flex flex-col items-center max-w-7xl mx-auto w-full">
            {/* Flight Search Card Container */}
            {searchbox === "FLIGHT" && (
              <div className="relative w-full rounded-[28px] border border-white/40 dark:border-white/15 bg-white/25 dark:bg-slate-900/45 backdrop-blur-xl p-4 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)] transition-all">
                <EditTravellersGuide
                  show={showEditTravellersGuide}
                  onQuickSet={handleQuickSetTravellers}
                  onOpenClass={() => {
                    setSelectedClass(true);
                    setHighlightTravellers(true);
                  }}
                  onDismiss={() => {
                    setShowEditTravellersGuide(false);
                    setHighlightTravellers(false);
                  }}
                />
                {/* Trip Type Selector */}
                <div className="w-full flex items-center justify-start mb-3.5">
                  <div className="inline-flex items-center gap-2 flex-wrap">
                    {travellingWay?.map((way, index) => {
                      const isActive = activeTab === way;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleTabClick(way)}
                          className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs cursor-pointer transition-all duration-200 whitespace-nowrap ${
                            isActive
                              ? "bg-white text-[#085c44] font-bold shadow-sm border border-white"
                              : "bg-white/55 hover:bg-white/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-semibold border border-white/55 dark:border-white/15 backdrop-blur-sm"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full transition-colors ${
                              isActive ? "bg-[#085c44]" : "bg-slate-400/90"
                            }`}
                          />
                          <span>{way}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(activeTab === "One Way" || activeTab === "Round Trip") && (
                  <div className="relative">
                    {/* 4 Separated Modular Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2.15fr_1.45fr_1.4fr] gap-2.5 lg:gap-3 overflow-visible">
                      {/* CARD 1 & CARD 2: FROM & TO WITH BRIDGE SWAP BUTTON */}
                      <div className="sm:col-span-2 lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:gap-3 relative">
                        {/*Swap Button Bridging Card 1 & Card 2*/}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwapLocations(e);
                          }}
                          title="Swap Departure & Arrival"
                          className="flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 sm:rotate-0 w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#085c44] hover:text-white hover:border-[#085c44] items-center justify-center shadow-sm z-30 cursor-pointer transition-all duration-200 active:scale-95"
                        >
                          <ArrowLeftRight size={13} strokeWidth={2.2} />
                        </button>

                        {/* CARD 1: FROM */}
                        <div
                          onClick={() => {
                            setFromSuggestions(findAirports(fromQuery));
                            setShowFromSuggestions(true);
                          }}
                          className="departure-field-container pro-card pro-card-press relative rounded-2xl bg-white/95 hover:bg-white dark:bg-slate-900/95 border border-white/85 dark:border-slate-700/80 focus-within:border-[#085c44]/70 hover:border-[#085c44]/50 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] cursor-pointer group px-4 sm:px-5 py-3.5 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <PlaneTakeoff className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                FROM
                              </p>
                            </div>
                            {selectedFrom?.iataCode && (
                              <span className="text-[10px] font-bold tracking-wider text-[#085c44] dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                                {selectedFrom.iataCode}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={fromQuery}
                            onFocus={() => {
                              setFromSuggestions(findAirports(fromQuery));
                              setShowFromSuggestions(true);
                              setShowToSuggestions(false);
                              setToSuggestions([]);
                            }}
                            onChange={handleFromChange}
                            placeholder="City or airport"
                            className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight placeholder:text-slate-400 placeholder:font-semibold outline-none bg-transparent w-full truncate"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                            {selectedFrom?.airport || "Select departure airport"}
                          </p>

                          <DeparturePlace
                            fromSuggestions={fromSuggestions}
                            showFromSuggestions={showFromSuggestions}
                            setFromQuery={setFromQuery}
                            formatSuggestion={formatSuggestion}
                            selectedFrom={selectedFrom}
                            setSelectedFrom={setSelectedFrom}
                            setFromSuggestions={setFromSuggestions}
                            setShowFromSuggestions={setShowFromSuggestions}
                            isDisabled={isDisabled}
                            setIsDisabled={setIsDisabled}
                            showToSuggestions={showToSuggestions}
                          />
                        </div>

                        {/* CARD 2: TO */}
                        <div
                          onClick={() => {
                            setToSuggestions(findAirports(toQuery));
                            setShowToSuggestions(true);
                          }}
                          className="arrival-field-container pro-card pro-card-press relative rounded-2xl bg-white/95 hover:bg-white dark:bg-slate-900/95 border border-white/85 dark:border-slate-700/80 focus-within:border-[#085c44]/70 hover:border-[#085c44]/50 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] cursor-pointer group px-4 sm:px-5 py-3.5 sm:pl-6 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <PlaneLanding className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                TO
                              </p>
                            </div>
                            {selectedTo?.iataCode && (
                              <span className="text-[10px] font-bold tracking-wider text-[#085c44] dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                                {selectedTo.iataCode}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={toQuery}
                            onFocus={() => {
                              setToSuggestions(findAirports(toQuery));
                              setShowToSuggestions(true);
                              setFromSuggestions([]);
                            }}
                            onChange={handleToChange}
                            placeholder="City or airport"
                            className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight placeholder:text-slate-400 placeholder:font-semibold outline-none bg-transparent w-full truncate"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                            {selectedTo?.airport || "Select arrival airport"}
                          </p>

                          <ArrivalPlace
                            toSuggestions={toSuggestions}
                            showToSuggestions={showToSuggestions}
                            setToQuery={setToQuery}
                            formatSuggestion={formatSuggestion}
                            selectedTo={selectedTo}
                            setToSuggestions={setToSuggestions}
                            setSelectedTo={setSelectedTo}
                            setShowToSuggestions={setShowToSuggestions}
                            setShowFromSuggestions={setShowFromSuggestions}
                            isDisabled={isDisabled}
                            setIsDisabled={setIsDisabled}
                          />
                        </div>
                      </div>

                      {/* CARD 3: DATE SECTION (Single Departure or Round Trip) */}
                      {activeTab !== "Round Trip" ? (
                        /* Single Departure Mode with "Book also Return Ticket" Action */
                        <div
                          onClick={() => {
                            departurePickerRef.current?.setOpen(true);
                          }}
                          className="pro-card pro-card-interactive pro-card-press rounded-2xl bg-white/85 hover:bg-white/95 dark:bg-slate-900/95 border border-white/85 dark:border-slate-700/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] px-4 sm:px-5 py-3.5 flex flex-col justify-between cursor-pointer group relative overflow-visible"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <CalendarDays className="w-3.5 h-3.5 text-[#085c44] dark:text-emerald-400 shrink-0" />
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                DEPARTURE
                              </p>
                            </div>

                            <DatePicker
                              ref={departurePickerRef}
                              selected={startDate}
                              onChange={handleStartDateChange}
                              dateFormat="d MMM''yy"
                              minDate={new Date()}
                              wrapperClassName="w-full"
                              popperClassName="z-[99999]"
                              customInput={
                                <div className="flex items-baseline gap-1.5 mt-1 cursor-pointer select-none">
                                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                                    {startDate ? startDate.getDate() : "--"}
                                  </span>
                                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {startDate
                                      ? `${startDate.toLocaleString("en-US", { month: "short" })}'${String(startDate.getFullYear()).slice(-2)}`
                                      : ""}
                                  </span>
                                </div>
                              }
                              renderCustomHeader={({
                                monthDate,
                                decreaseMonth,
                                increaseMonth,
                              }) => (
                                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-2xl">
                                  <button
                                    type="button"
                                    onClick={decreaseMonth}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-[#045C45] dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition active:scale-90 cursor-pointer"
                                    aria-label="Previous Month"
                                  >
                                    <ArrowLeft size={15} />
                                  </button>
                                  <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {monthDate.toLocaleString("default", {
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={increaseMonth}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-[#045C45] dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition active:scale-90 cursor-pointer"
                                    aria-label="Next Month"
                                  >
                                    <ArrowRight size={15} />
                                  </button>
                                </div>
                              )}
                            >
                              <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between gap-2 rounded-b-2xl">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Quick Pick:
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartDateChange(new Date());
                                      departurePickerRef.current?.setOpen(false);
                                    }}
                                    className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200/90 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 hover:text-[#045C45] dark:hover:text-emerald-300 transition-all text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
                                  >
                                    Today
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const d = new Date();
                                      d.setDate(d.getDate() + 1);
                                      handleStartDateChange(d);
                                      departurePickerRef.current?.setOpen(false);
                                    }}
                                    className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200/90 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 hover:text-[#045C45] dark:hover:text-emerald-300 transition-all text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
                                  >
                                    Tomorrow
                                  </button>
                                </div>
                              </div>
                            </DatePicker>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal truncate">
                              {startDate
                                ? startDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                  })
                                : ""}
                            </p>
                          </div>

                          {/* "Book also Return Ticket" Interactive Component */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReturnTicket(true);
                            }}
                            className="mt-2 w-full py-1.5 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-dashed border-teal-300 dark:border-emerald-600/60 text-teal-800 dark:text-emerald-300 transition-all flex items-center justify-between group/return cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <div className="flex items-center gap-1.5 text-[11px] font-bold">
                              <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400 group-hover/return:rotate-90 transition-transform duration-200" />
                              <span>Book also Return Ticket</span>
                            </div>
                            <span className="text-[9px] font-bold text-teal-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-2xs">
                              Round Trip
                            </span>
                          </button>
                        </div>
                      ) : (
                        /* Dual Mode: DEPARTURE + RETURN */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Departure Half */}
                          <div
                            onClick={() => {
                              departurePickerRef.current?.setOpen(true);
                            }}
                            className="pro-card pro-card-interactive pro-card-press rounded-2xl bg-white/85 hover:bg-white/95 dark:bg-slate-900/95 border border-white/85 dark:border-slate-700/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] px-3 py-2.5 flex flex-col justify-between cursor-pointer group relative overflow-visible"
                          >
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <CalendarDays className="w-3.5 h-3.5 text-[#085c44] dark:text-emerald-400 shrink-0" />
                              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                DEPARTURE
                              </p>
                            </div>

                            <DatePicker
                              ref={departurePickerRef}
                              selected={startDate}
                              onChange={handleStartDateChange}
                              dateFormat="d MMM''yy"
                              minDate={new Date()}
                              wrapperClassName="w-full"
                              popperClassName="z-[99999]"
                              customInput={
                                <div className="flex items-baseline gap-1 mt-0.5 cursor-pointer select-none">
                                  <span className="text-lg font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                                    {startDate ? startDate.getDate() : "--"}
                                  </span>
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                    {startDate
                                      ? `${startDate.toLocaleString("en-US", { month: "short" })}'${String(startDate.getFullYear()).slice(-2)}`
                                      : ""}
                                  </span>
                                </div>
                              }
                            />

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                              {startDate
                                ? startDate.toLocaleDateString("en-US", { weekday: "short" })
                                : ""}
                            </p>
                          </div>

                          {/* Return Half */}
                          <div
                            onClick={(e) => {
                              handleReturnClick(e);
                            }}
                            className="pro-card pro-card-interactive pro-card-press rounded-2xl bg-white/95 hover:bg-white dark:bg-slate-900/95 border border-emerald-300 dark:border-emerald-600/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] px-3 py-2.5 flex flex-col justify-between cursor-pointer group relative overflow-visible ring-1 ring-emerald-400/20"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                                <CalendarDays className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">
                                  RETURN
                                </p>
                              </div>
                              <button
                                type="button"
                                title="Remove Return (Switch to One Way)"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReturnTicket(false);
                                }}
                                className="p-0.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>

                            <DatePicker
                              ref={returnPickerRef}
                              selected={endDate}
                              onChange={handleEndDateChange}
                              dateFormat="d MMM''yy"
                              minDate={startDate || new Date()}
                              wrapperClassName="w-full"
                              popperClassName="z-[99999]"
                              customInput={
                                <div className="flex items-baseline gap-1 mt-0.5 cursor-pointer select-none">
                                  <span className="text-lg font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                                    {endDate ? endDate.getDate() : "--"}
                                  </span>
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                    {endDate
                                      ? `${endDate.toLocaleString("en-US", { month: "short" })}'${String(endDate.getFullYear()).slice(-2)}`
                                      : ""}
                                  </span>
                                </div>
                              }
                            >
                              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-1 text-[10px]">
                                <span className="text-slate-400 font-bold uppercase">Quick:</span>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const d = new Date(startDate || new Date());
                                      d.setDate(d.getDate() + 3);
                                      handleEndDateChange(d);
                                      returnPickerRef.current?.setOpen(false);
                                    }}
                                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 border text-slate-700 text-[10px] font-semibold"
                                  >
                                    +3D
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const d = new Date(startDate || new Date());
                                      d.setDate(d.getDate() + 7);
                                      handleEndDateChange(d);
                                      returnPickerRef.current?.setOpen(false);
                                    }}
                                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 border text-slate-700 text-[10px] font-semibold"
                                  >
                                    +7D
                                  </button>
                                </div>
                              </div>
                            </DatePicker>

                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate mt-0.5">
                              {endDate
                                ? `${endDate.toLocaleDateString("en-US", { weekday: "short" })}${
                                    startDate && endDate > startDate
                                      ? ` (${Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))}d)`
                                      : ""
                                  }`
                                : "Pick return"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* CARD 4: TRAVELLERS & CLASS + VERTICAL SEARCH FLIGHTS BUTTON */}
                      <div className="pro-card rounded-2xl bg-white/95 hover:bg-white dark:bg-slate-900/95 border border-white/85 dark:border-slate-700/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] p-2 pl-4 sm:pl-5 flex items-stretch justify-between gap-3">
                        <div className="flex-1 min-w-0 py-1.5 flex flex-col justify-between">
                          <TravellerClass
                            travellers={travellers}
                            setTravellers={setTravellers}
                            setSelectedClass={setSelectedClass}
                            selectedClass={selectedClass}
                            isHighlighted={highlightTravellers}
                            onDone={handleTravellerDone}
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={(e) => {
                            clickSquash(e.currentTarget);
                            handleFlightSearch();
                          }}
                          className={`pro-card-press shrink-0 w-[86px] sm:w-[92px] rounded-xl bg-[#085c44] hover:bg-[#064e3b] text-white shadow-md flex flex-col items-center justify-center gap-1.5 px-3 py-3 ${
                            isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <Search className="w-4 h-4 shrink-0 stroke-[2.2]" />
                          <span className="text-xs font-bold leading-tight text-center">
                            Search
                            <br />
                            Flights
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {searchbox === "HOTEL" && <HotelSearch searchbox={searchbox} />}
          </div>
        </div>
      ) : (
        <div className={embedded ? "w-full relative z-40 pointer-events-auto" : "w-full px-1 sm:px-4 relative z-40 pointer-events-auto"}>
          <div className="relative flex flex-col items-center justify-center">
            {searchbox === "FLIGHT" && (
              <div
                className={
                  embedded
                    ? "relative w-full bg-transparent p-0 pointer-events-auto"
                    : "relative w-full rounded-[28px] border border-white/40 dark:border-white/15 bg-white/25 dark:bg-slate-900/45 backdrop-blur-xl p-4 sm:p-6 lg:p-7 shadow-[0_24px_60px_rgba(15,23,42,0.22)] pointer-events-auto"
                }
              >
                <EditTravellersGuide
                  show={showEditTravellersGuide}
                  onQuickSet={handleQuickSetTravellers}
                  onOpenClass={() => {
                    setSelectedClass(true);
                    setHighlightTravellers(true);
                  }}
                  onDismiss={() => {
                    setShowEditTravellersGuide(false);
                    setHighlightTravellers(false);
                  }}
                />
                {/* Trip Type Selector Chips (• One Way / • Round Trip / • Multi City) */}
                <div className="w-full flex items-center justify-between mb-3.5">
                  <div className="inline-flex w-full sm:w-auto gap-2 flex-wrap">
                    {travellingWay?.map((way, index) => {
                      const isActive = activeTab === way;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleTabClick(way)}
                          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs cursor-pointer transition-all duration-200 whitespace-nowrap ${
                            isActive
                              ? "bg-white dark:bg-slate-800 text-[#085c44] dark:text-emerald-300 font-bold shadow-sm border border-white dark:border-slate-700"
                              : "bg-white/55 hover:bg-white/80 dark:bg-slate-800/55 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border border-white/55 dark:border-slate-700/60 backdrop-blur-sm"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full transition-colors ${
                              isActive
                                ? "bg-[#085c44] dark:bg-emerald-400"
                                : "bg-slate-400/90 dark:bg-slate-500"
                            }`}
                          />
                          <span>{way}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* One Way & Round Trip — Separated Modular Cards */}
                {(activeTab === "Round Trip" || activeTab === "One Way") && (
                  <div className="relative z-30 w-full mx-auto">
                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 ${
                        activeTab === "Round Trip"
                          ? "lg:grid-cols-[2fr_1.6fr_1.4fr]"
                          : "lg:grid-cols-[2.2fr_1.2fr_1.4fr]"
                      } gap-2.5 lg:gap-3 items-stretch`}
                    >
                      {/* Card 1 & Card 2: FROM & TO with Bridge Swap Badge */}
                      <div className="sm:col-span-2 lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:gap-3 relative">
                        {/* Card 1: FROM */}
                        <div
                          onClick={() => {
                            setFromSuggestions(findAirports(fromQuery));
                            setShowFromSuggestions(true);
                          }}
                          className="departure-field-container pro-card pro-card-interactive pro-card-press relative rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-white/85 dark:border-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white dark:hover:bg-slate-900 cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[86px]"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              <PlaneTakeoff size={13} className="text-[#085c44] dark:text-emerald-400 shrink-0" />
                              <span>From</span>
                            </div>
                            {selectedFrom?.iataCode && (
                              <span className="text-[10px] font-extrabold tracking-wider text-[#085c44] dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                {selectedFrom.iataCode}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={fromQuery}
                            onFocus={() => {
                              setFromSuggestions(findAirports(fromQuery));
                              setShowFromSuggestions(true);
                              setToSuggestions([]);
                            }}
                            onChange={handleFromChange}
                            placeholder="City or airport"
                            className="w-full text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight placeholder:text-slate-400 placeholder:font-semibold outline-none bg-transparent truncate"
                          />
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {selectedFrom?.airport || "Select departure airport"}
                          </p>

                          <DeparturePlace
                            fromSuggestions={fromSuggestions}
                            showFromSuggestions={showFromSuggestions}
                            setFromQuery={setFromQuery}
                            formatSuggestion={formatSuggestion}
                            selectedFrom={selectedFrom}
                            setSelectedFrom={setSelectedFrom}
                            setFromSuggestions={setFromSuggestions}
                            setShowFromSuggestions={setShowFromSuggestions}
                            setIsDisabled={setIsDisabled}
                          />
                        </div>

                        {/* Swap Button Bridging Card 1 & Card 2 */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwapLocations(e);
                          }}
                          title="Swap Departure & Arrival"
                          className="pro-card-press flex absolute right-4 top-1/2 -translate-y-1/2 rotate-90 sm:rotate-0 sm:right-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-7.5 h-7.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-[#085c44] dark:text-emerald-400 hover:bg-[#085c44] hover:text-white hover:border-[#085c44] items-center justify-center shadow-md z-30 cursor-pointer transition-colors duration-200"
                        >
                          <ArrowLeftRight size={13} strokeWidth={2.2} />
                        </button>

                        {/* Card 2: TO */}
                        <div
                          onClick={() => {
                            setToSuggestions(findAirports(toQuery));
                            setShowToSuggestions(true);
                          }}
                          className="arrival-field-container pro-card pro-card-interactive pro-card-press relative rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-white/85 dark:border-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 sm:pl-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white dark:hover:bg-slate-900 cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[86px]"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              <PlaneLanding size={13} className="text-[#085c44] dark:text-emerald-400 shrink-0" />
                              <span>To</span>
                            </div>
                            {selectedTo?.iataCode && (
                              <span className="text-[10px] font-extrabold tracking-wider text-[#085c44] dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                {selectedTo.iataCode}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={toQuery}
                            onFocus={() => {
                              setToSuggestions(findAirports(toQuery));
                              setShowToSuggestions(true);
                              setFromSuggestions([]);
                            }}
                            onChange={handleToChange}
                            placeholder="City or airport"
                            className="w-full text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight placeholder:text-slate-400 placeholder:font-semibold outline-none bg-transparent truncate"
                          />
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {selectedTo?.airport || "Select arrival airport"}
                          </p>

                          <ArrivalPlace
                            toSuggestions={toSuggestions}
                            showToSuggestions={showToSuggestions}
                            setToQuery={setToQuery}
                            formatSuggestion={formatSuggestion}
                            selectedTo={selectedTo}
                            setToSuggestions={setToSuggestions}
                            setSelectedTo={setSelectedTo}
                            setShowToSuggestions={setShowToSuggestions}
                            setIsDisabled={setIsDisabled}
                          />
                        </div>
                      </div>

                      {/* Card 3: DATE SECTION */}
                      {activeTab !== "Round Trip" ? (
                        /* Single Departure Mode with "Book also Return Ticket" Action */
                        <div
                          onClick={() => {
                            departurePickerRef.current?.setOpen(true);
                          }}
                          className="pro-card pro-card-interactive pro-card-press relative rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-white/85 dark:border-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white dark:hover:bg-slate-900 cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[86px]"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                              <CalendarDays size={13} className="text-[#085c44] dark:text-emerald-400 shrink-0" />
                              <span>Departure</span>
                            </div>

                            <DatePicker
                              ref={departurePickerRef}
                              selected={startDate}
                              onChange={handleStartDateChange}
                              dateFormat="d MMM''yy"
                              minDate={new Date()}
                              wrapperClassName="w-full"
                              popperClassName="z-[99999]"
                              showPopperArrow={false}
                              customInput={
                                <div className="flex items-baseline gap-1 mt-0.5 cursor-pointer select-none">
                                  <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                                    {startDate ? startDate.getDate() : "--"}
                                  </span>
                                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {startDate
                                      ? `${startDate.toLocaleString("en-US", { month: "short" })}'${String(startDate.getFullYear()).slice(-2)}`
                                      : ""}
                                  </span>
                                </div>
                              }
                            >
                              <div className="pt-2 pb-0.5 px-0.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px] w-full">
                                <span className="text-slate-400 dark:text-slate-500 pl-0.5 text-[10px] uppercase font-bold tracking-wider shrink-0">Quick:</span>
                                <div className="flex gap-1 items-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const d = new Date();
                                      handleStartDateChange(d);
                                      departurePickerRef.current?.setOpen(false);
                                    }}
                                    className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 hover:text-[#085c44] dark:hover:text-emerald-300 transition-colors text-[11px] font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
                                  >
                                    Today
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const d = new Date();
                                      d.setDate(d.getDate() + 1);
                                      handleStartDateChange(d);
                                      departurePickerRef.current?.setOpen(false);
                                    }}
                                    className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 hover:text-[#085c44] dark:hover:text-emerald-300 transition-colors text-[11px] font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
                                  >
                                    Tomorrow
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const d = new Date();
                                      d.setDate(d.getDate() + 7);
                                      handleStartDateChange(d);
                                      departurePickerRef.current?.setOpen(false);
                                    }}
                                    className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 hover:text-[#085c44] dark:hover:text-emerald-300 transition-colors text-[11px] font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
                                  >
                                    +1 Wk
                                  </button>
                                </div>
                              </div>
                            </DatePicker>

                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                              {startDate
                                ? startDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                  })
                                : ""}
                            </p>
                          </div>

                          {/* "Book also Return Ticket" Interactive Component */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReturnTicket(true);
                            }}
                            className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-dashed border-teal-300 dark:border-emerald-600/60 text-teal-800 dark:text-emerald-300 transition-all flex items-center justify-between group/return cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400 group-hover/return:rotate-90 transition-transform duration-200" />
                              <span>Book also Return Ticket</span>
                            </div>
                            <span className="text-[10px] font-semibold text-teal-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md shadow-2xs">
                              Round Trip
                            </span>
                          </button>
                        </div>
                      ) : (
                        /* Dual Mode: DEPARTURE + RETURN */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Departure Half */}
                          <div
                            onClick={() => {
                              departurePickerRef.current?.setOpen(true);
                            }}
                            className="pro-card pro-card-interactive pro-card-press relative rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-white/85 dark:border-slate-800 px-3 py-2.5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white dark:hover:bg-slate-900 cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[86px]"
                          >
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                              <CalendarDays size={13} className="text-[#085c44] dark:text-emerald-400 shrink-0" />
                              <span>Departure</span>
                            </div>

                            <DatePicker
                              ref={departurePickerRef}
                              selected={startDate}
                              onChange={handleStartDateChange}
                              dateFormat="d MMM''yy"
                              minDate={new Date()}
                              wrapperClassName="w-full"
                              popperClassName="z-[99999]"
                              showPopperArrow={false}
                              customInput={
                                <div className="flex items-baseline gap-1 mt-0.5 cursor-pointer select-none">
                                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                                    {startDate ? startDate.getDate() : "--"}
                                  </span>
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    {startDate
                                      ? `${startDate.toLocaleString("en-US", { month: "short" })}'${String(startDate.getFullYear()).slice(-2)}`
                                      : ""}
                                  </span>
                                </div>
                              }
                            />

                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                              {startDate
                                ? startDate.toLocaleDateString("en-US", { weekday: "short" })
                                : ""}
                            </p>
                          </div>

                          {/* Return Half */}
                          <div
                            onClick={(e) => {
                              handleReturnClick(e);
                            }}
                            className="pro-card pro-card-interactive pro-card-press relative rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-emerald-300/90 dark:border-emerald-600/90 px-3 py-2.5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white dark:hover:bg-slate-900 cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[86px] ring-1 ring-emerald-400/20"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                <CalendarDays size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Return</span>
                              </div>
                              <button
                                type="button"
                                title="Remove Return (Switch to One Way)"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReturnTicket(false);
                                }}
                                className="p-0.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>

                            <DatePicker
                              ref={returnPickerRef}
                              selected={endDate}
                              onChange={handleEndDateChange}
                              dateFormat="d MMM''yy"
                              minDate={startDate || new Date()}
                              wrapperClassName="w-full"
                              popperClassName="z-[99999]"
                              showPopperArrow={false}
                              customInput={
                                <div className="flex items-baseline gap-1 mt-0.5 cursor-pointer select-none">
                                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                                    {endDate ? endDate.getDate() : "--"}
                                  </span>
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    {endDate
                                      ? `${endDate.toLocaleString("en-US", { month: "short" })}'${String(endDate.getFullYear()).slice(-2)}`
                                      : ""}
                                  </span>
                                </div>
                              }
                            >
                              <div className="pt-2 pb-0.5 px-0.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px] w-full">
                                <span className="text-slate-400 dark:text-slate-500 pl-0.5 text-[10px] uppercase font-bold tracking-wider shrink-0">Quick:</span>
                                <div className="flex gap-1 items-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const d = new Date(startDate || new Date());
                                      d.setDate(d.getDate() + 3);
                                      handleEndDateChange(d);
                                      returnPickerRef.current?.setOpen(false);
                                    }}
                                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 border text-slate-700 text-[10px] font-semibold"
                                  >
                                    +3D
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const d = new Date(startDate || new Date());
                                      d.setDate(d.getDate() + 7);
                                      handleEndDateChange(d);
                                      returnPickerRef.current?.setOpen(false);
                                    }}
                                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 border text-slate-700 text-[10px] font-semibold"
                                  >
                                    +7D
                                  </button>
                                </div>
                              </div>
                            </DatePicker>

                            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-1 truncate">
                              {endDate
                                ? `${endDate.toLocaleDateString("en-US", { weekday: "short" })}${
                                    startDate && endDate > startDate
                                      ? ` (${Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))}d)`
                                      : ""
                                  }`
                                : "Pick return"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Card 4: TRAVELLERS & CLASS + Integrated Vertical Search Flights Button */}
                      <div className="pro-card relative rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-white/85 dark:border-slate-800 p-1.5 pl-4 sm:pl-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white dark:hover:bg-slate-900 flex items-stretch justify-between gap-2 min-h-[82px] sm:min-h-[86px]">
                        <TravellerClass
                          travellers={travellers}
                          setTravellers={setTravellers}
                          setSelectedClass={setSelectedClass}
                          selectedClass={selectedClass}
                          isHighlighted={highlightTravellers}
                          isDisabled={isDisabled}
                          setIsDisabled={setIsDisabled}
                          onDone={handleTravellerDone}
                        />

                        <button
                          type="button"
                          onClick={(e) => {
                            clickSquash(e.currentTarget);
                            const ok = handleFlightSearch();
                            if (!ok) return;
                            const storedSearch = (() => {
                              try {
                                return JSON.parse(localStorage.getItem("flightSearch"));
                              } catch {
                                return null;
                              }
                            })();
                            navigate("/flight-list", {
                              state: {
                                flights: [
                                  {
                                    searchFlights: storedSearch || searchFlights,
                                    selectedFrom: selectedFrom,
                                    selectedTo: selectedTo,
                                    showNavbar: showNavbar,
                                  },
                                ],
                              },
                            });
                          }}
                          className="pro-card-press shrink-0 w-[86px] sm:w-[92px] rounded-xl bg-[#085c44] hover:bg-[#064e3b] text-white font-bold text-xs sm:text-[13px] leading-tight flex flex-col items-center justify-center gap-0.5 shadow-sm cursor-pointer px-2 py-2 sm:py-2.5"
                        >
                          <span>Search</span>
                          <span>Flights</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {searchbox === "HOTEL" && (
              <HotelSearch
                handleFlightSearch={handleFlightSearch}
                onSearchSuccess={onSearchSuccess}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CommonFlightHotelSearchBox;
