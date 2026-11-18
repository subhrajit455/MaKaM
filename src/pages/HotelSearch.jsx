import { useState, useRef, useEffect, useId } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MapPin,
  Calendar,
  CalendarCheck2,
  Search,
  Users,
  ChevronDown,
  Moon,
} from "lucide-react";
import HotelDatePicker from "../components/datepicker/HotelDatePicker";
import RoomGuestSelector from "../components/roomguestselector/RoomGuestSelector";
import CityWithCountry from "../components/citywithcountry/CityWithCountry";
import { fetchHotels } from "../components/reducer/HotelSearchSlice";
import {
  getCityName,
  clearCityData,
} from "../components/reducer/NationalismSlice";
import {
  startOfLocalDay,
  addCalendarDays,
  diffCalendarDays,
  formatPlainDateISO,
} from "../utils/hotelDateUtils";

const readInitialCity = (embedded) => {
  if (embedded) return null;
  try {
    const savedCity = JSON.parse(localStorage.getItem("cityname"));
    if (savedCity && savedCity.cityId && savedCity.cityName) {
      return savedCity;
    }
  } catch {
    localStorage.removeItem("cityname");
  }
  return null;
};

const HotelSearch = ({ onSearchSuccess, embedded = false }) => {
  const debounceRef = useRef(null);
  const cityWrapperRef = useRef(null);
  const cityInputRef = useRef(null);
  const checkInTriggerRef = useRef(null);
  const checkOutTriggerRef = useRef(null);
  const roomGuestTriggerRef = useRef(null);
  const roomGuestRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cityInputId = useId();
  const cityHelperId = useId();
  const cityListboxId = useId();
  const checkInDialogId = useId();
  const checkOutDialogId = useId();
  const roomGuestDialogId = useId();

  const { cityData } = useSelector((state) => state.region);

  const [checkInDate, setCheckInDate] = useState(() => startOfLocalDay(new Date()));
  const [checkOutDate, setCheckOutDate] = useState(() => addCalendarDays(new Date(), 1));
  // Single active popover keeps Check-in, Check-out, and Rooms & Guests mutually exclusive
  const [activePopover, setActivePopover] = useState(null);

  // Destination City state (can be any international city)
  const [initialCity] = useState(() => readInitialCity(embedded));
  const [cityname, setCityname] = useState(() => initialCity?.cityName || "");
  const [cityId, setCityId] = useState(() => initialCity?.cityId || "");
  const [destinationCountryCode, setDestinationCountryCode] = useState(
    () => initialCity?.countryCode || "",
  );
  const [destinationCountry, setDestinationCountry] = useState(
    () => initialCity?.country || "",
  );
  const [isCitySelected, setIsCitySelected] = useState(() => Boolean(initialCity));
  const [cityError, setCityError] = useState("");

  // Occupancy state (Default: 1 Room, 1 Adult, 0 Children)
  const [roomCount, setRoomCount] = useState(1);
  const [adultCount, setAdultCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [childAges, setChildAges] = useState([]);

  const nightsCount = Math.max(1, diffCalendarDays(checkInDate, checkOutDate));
  const showCitySuggestions =
    cityname.trim() !== "" &&
    !isCitySelected &&
    Array.isArray(cityData?.data) &&
    cityData.data.length > 0;

  const handleCheckInChange = (nextDate) => {
    const normalized = startOfLocalDay(nextDate);
    setCheckInDate(normalized);
    if (diffCalendarDays(normalized, checkOutDate) < 1) {
      setCheckOutDate(addCalendarDays(normalized, 1));
    }
  };

  const handleCheckOutChange = (nextDate) => {
    const normalized = startOfLocalDay(nextDate);
    if (diffCalendarDays(checkInDate, normalized) < 1) {
      setCheckOutDate(addCalendarDays(checkInDate, 1));
      return;
    }
    setCheckOutDate(normalized);
  };

  // Click-outside & Escape handling for Rooms & Guests popover
  useEffect(() => {
    if (activePopover !== "rooms") return;

    const handleClickOutside = (event) => {
      const insidePanel = roomGuestRef.current?.contains(event.target);
      const insideTrigger = roomGuestTriggerRef.current?.contains(event.target);
      if (!insidePanel && !insideTrigger) {
        setActivePopover(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActivePopover(null);
        roomGuestTriggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePopover]);

  // Click-outside & Escape handling for City autocomplete dropdown
  useEffect(() => {
    if (!showCitySuggestions) return;

    const handleClickOutside = (event) => {
      if (!cityWrapperRef.current?.contains(event.target)) {
        dispatch(clearCityData());
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        dispatch(clearCityData());
        cityInputRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCitySuggestions, dispatch]);

  const hotelPayload = {
    cityId,
    countryCode: destinationCountryCode,
    guestNationality: "IN",
    checkIn: formatPlainDateISO(checkInDate),
    checkOut: formatPlainDateISO(checkOutDate),
    rooms: [
      {
        adults: adultCount,
        children: childrenCount,
        childAges,
      },
    ],
    minRating: 3,
    maxRating: 5,
  };

  const handleHotelSearch = () => {
    const trimmedCity = cityname.trim();

    if (!trimmedCity || !cityId) {
      const message =
        "Please select a destination city from the suggestions list.";
      setCityError(message);
      toast.error(message);
      cityInputRef.current?.focus();
      return false;
    }

    setCityError("");
    const payload = {
      ...hotelPayload,
      cityId,
      cityName: trimmedCity,
      countryCode: destinationCountryCode || "",
      guestNationality: "IN",
    };

    localStorage.setItem("hotelSearch", JSON.stringify(payload));
    dispatch(fetchHotels(payload));
    return true;
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const isValidSearch = handleHotelSearch();
    if (!isValidSearch) return;

    if (onSearchSuccess) {
      onSearchSuccess();
    }

    navigate("/hotel", {
      state: {
        hotels: [{ roomCount }],
      },
    });
  };

  const handleCitySearch = (e) => {
    const value = e.target.value;

    setCityname(value);
    setCityId("");
    setDestinationCountry("");
    setDestinationCountryCode("");
    setIsCitySelected(false);
    if (cityError) setCityError("");

    if (!value.trim()) {
      localStorage.removeItem("cityname");
      dispatch(clearCityData());
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const search = value.trim();

      if (search.length < 2) {
        dispatch(clearCityData());
        return;
      }

      dispatch(
        getCityName({
          userInput: search,
          countryCode: "",
        }),
      );
    }, 400);
  };

  const formatCardDate = (date) => ({
    day: date.getDate(),
    monthYear: `${date.toLocaleString("en-US", { month: "short" })}'${String(
      date.getFullYear(),
    ).slice(-2)}`,
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
  });

  const checkInDisplay = formatCardDate(checkInDate);
  const checkOutDisplay = formatCardDate(checkOutDate);

  const occupancySummary = `${roomCount} Room${roomCount > 1 ? "s" : ""}, ${adultCount} Adult${
    adultCount > 1 ? "s" : ""
  }${childrenCount > 0 ? `, ${childrenCount} Child${childrenCount > 1 ? "ren" : ""}` : ""}`;

  const togglePopover = (key) => {
    dispatch(clearCityData());
    setActivePopover((prev) => (prev === key ? null : key));
  };

  return (
    <search aria-label="Hotel search" className="block w-full mx-auto">
      <form
        onSubmit={handleFormSubmit}
        noValidate
        className={
          embedded
            ? "w-full mx-auto"
            : "relative w-full mx-auto rounded-[28px] border border-white/45 dark:border-white/15 bg-white/30 dark:bg-slate-900/50 backdrop-blur-xl p-3.5 sm:p-5 lg:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)] transition-colors duration-200"
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1.15fr_auto] gap-2.5 lg:gap-3 items-stretch overflow-visible relative">
          {/* CARD 1: CITY / AREA */}
          <div
            ref={cityWrapperRef}
            className={`relative min-w-0 rounded-2xl bg-white/95 hover:bg-white dark:bg-slate-900/95 border shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] px-4 sm:px-5 py-3 min-h-[86px] flex flex-col justify-between transition-colors duration-150 ${
              cityError
                ? "border-red-500 dark:border-red-400 ring-2 ring-red-500/15"
                : "border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-700/35 focus-within:border-[#085c44] focus-within:ring-2 focus-within:ring-[#085c44]/15"
            } ${showCitySuggestions ? "z-50" : "z-20"}`}
          >
            <label
              htmlFor={cityInputId}
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              <MapPin
                size={13}
                className="text-[#085c44] dark:text-emerald-400 shrink-0"
                aria-hidden="true"
              />
              <span>City / Area</span>
            </label>

            <input
              ref={cityInputRef}
              id={cityInputId}
              name="city"
              type="text"
              value={cityname}
              onChange={handleCitySearch}
              onFocus={() => setActivePopover(null)}
              placeholder="Where are you staying?"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="search"
              required
              aria-invalid={Boolean(cityError)}
              aria-describedby={cityHelperId}
              aria-controls={cityListboxId}
              aria-expanded={showCitySuggestions}
              className="mt-0.5 w-full bg-transparent text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight placeholder:text-slate-400 placeholder:font-semibold truncate focus-visible:outline-none"
            />

            <p
              id={cityHelperId}
              role={cityError ? "alert" : undefined}
              className={`text-[11px] mt-0.5 truncate ${
                cityError
                  ? "font-semibold text-red-600 dark:text-red-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {cityError
                ? cityError
                : destinationCountry
                  ? `Selected: ${destinationCountry.toUpperCase()}`
                  : "Search Makkah, Madinah, or any city"}
            </p>

            {showCitySuggestions && (
              <CityWithCountry
                id={cityListboxId}
                cityData={cityData}
                setCityname={(value) => {
                  setCityname(value);
                  setIsCitySelected(true);
                  setCityError("");
                }}
                setCityId={(value) => {
                  setCityId(value);
                  setIsCitySelected(true);
                }}
                setCountryCode={(value) => {
                  setDestinationCountryCode(value);
                  setIsCitySelected(true);
                }}
                onCitySelect={(selectedCity) => {
                  setIsCitySelected(true);
                  setCityError("");
                  if (selectedCity?.country) {
                    setDestinationCountry(selectedCity.country);
                  }
                  dispatch(clearCityData());
                }}
              />
            )}
          </div>

          {/* CARD 2: CHECK-IN DATE */}
          <div
            className={`relative min-w-0 ${
              activePopover === "checkIn" ? "z-50" : "z-30"
            }`}
          >
            <button
              ref={checkInTriggerRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={activePopover === "checkIn"}
              aria-controls={checkInDialogId}
              onClick={() => togglePopover("checkIn")}
              className={`w-full h-full min-h-[86px] rounded-2xl bg-white/95 hover:bg-white dark:bg-slate-900/95 border shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] px-4 sm:px-5 py-3 flex flex-col justify-between text-left cursor-pointer transition-all duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#085c44] focus-visible:outline-offset-2 ${
                activePopover === "checkIn"
                  ? "border-[#085c44] ring-2 ring-[#085c44]/15"
                  : "border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-700/35"
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Calendar
                    size={13}
                    className="text-[#085c44] dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Check-In</span>
                </span>
                <ChevronDown
                  size={13}
                  aria-hidden="true"
                  className={`text-slate-400 transition-transform duration-150 shrink-0 ${
                    activePopover === "checkIn" ? "rotate-180 text-[#085c44]" : ""
                  }`}
                />
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight tabular-nums">
                  {checkInDisplay.day}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {checkInDisplay.monthYear}
                </span>
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {checkInDisplay.weekday}
              </span>
            </button>

            <HotelDatePicker
              id={checkInDialogId}
              open={activePopover === "checkIn"}
              setOpen={(isOpen) => setActivePopover(isOpen ? "checkIn" : null)}
              selectedDate={checkInDate}
              setSelectedDate={handleCheckInChange}
              type="checkIn"
              align="left"
              triggerRef={checkInTriggerRef}
            />
          </div>

          {/* CARD 3: CHECK-OUT DATE */}
          <div
            className={`relative min-w-0 ${
              activePopover === "checkOut" ? "z-50" : "z-30"
            }`}
          >
            <button
              ref={checkOutTriggerRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={activePopover === "checkOut"}
              aria-controls={checkOutDialogId}
              onClick={() => togglePopover("checkOut")}
              className={`w-full h-full min-h-[86px] rounded-2xl bg-white/95 hover:bg-white dark:bg-slate-900/95 border shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] px-4 sm:px-5 py-3 flex flex-col justify-between text-left cursor-pointer transition-all duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#085c44] focus-visible:outline-offset-2 ${
                activePopover === "checkOut"
                  ? "border-[#085c44] ring-2 ring-[#085c44]/15"
                  : "border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-700/35"
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <CalendarCheck2
                    size={13}
                    className="text-[#085c44] dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Check-Out</span>
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/70 text-[10px] font-bold text-[#085c44] dark:text-emerald-300 shrink-0">
                  <Moon size={9} aria-hidden="true" />
                  {nightsCount} {nightsCount === 1 ? "Night" : "Nights"}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight tabular-nums">
                  {checkOutDisplay.day}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {checkOutDisplay.monthYear}
                </span>
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {checkOutDisplay.weekday}
              </span>
            </button>

            <HotelDatePicker
              id={checkOutDialogId}
              open={activePopover === "checkOut"}
              setOpen={(isOpen) => setActivePopover(isOpen ? "checkOut" : null)}
              selectedDate={checkOutDate}
              setSelectedDate={handleCheckOutChange}
              type="checkOut"
              checkInDate={checkInDate}
              minDate={addCalendarDays(checkInDate, 1)}
              align="left"
              triggerRef={checkOutTriggerRef}
            />
          </div>

          {/* CARD 4: ROOMS & GUESTS */}
          <div
            className={`relative min-w-0 ${
              activePopover === "rooms" ? "z-50" : "z-20"
            }`}
          >
            <button
              ref={roomGuestTriggerRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={activePopover === "rooms"}
              aria-controls={roomGuestDialogId}
              onClick={() => togglePopover("rooms")}
              className={`w-full h-full min-h-[86px] rounded-2xl bg-white/95 hover:bg-white dark:bg-slate-900/95 border shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] px-4 sm:px-5 py-3 flex flex-col justify-between text-left cursor-pointer transition-all duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#085c44] focus-visible:outline-offset-2 ${
                activePopover === "rooms"
                  ? "border-[#085c44] ring-2 ring-[#085c44]/15"
                  : "border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-700/35"
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Users
                    size={13}
                    className="text-[#085c44] dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Rooms &amp; Guests</span>
                </span>
                <ChevronDown
                  size={13}
                  aria-hidden="true"
                  className={`text-slate-400 transition-transform duration-150 shrink-0 ${
                    activePopover === "rooms" ? "rotate-180 text-[#085c44]" : ""
                  }`}
                />
              </div>

              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight mt-0.5 truncate w-full">
                {occupancySummary}
              </span>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                Configure rooms &amp; travellers
              </span>
            </button>

            {activePopover === "rooms" && (
              <div
                id={roomGuestDialogId}
                ref={roomGuestRef}
                role="dialog"
                aria-modal="false"
                aria-label="Configure rooms and guests"
                className="absolute top-full left-0 sm:left-auto sm:right-0 z-[9999] mt-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-slate-200 dark:border-slate-700 max-w-[calc(100vw-1.5rem)] origin-top-right"
                onClick={(e) => e.stopPropagation()}
              >
                <RoomGuestSelector
                  openRoomguestselector={activePopover === "rooms"}
                  setOpenroomguestselector={(isOpen) =>
                    setActivePopover(isOpen ? "rooms" : null)
                  }
                  roomCount={roomCount}
                  setRoomCount={setRoomCount}
                  adultCount={adultCount}
                  setAdultCount={setAdultCount}
                  childrenCount={childrenCount}
                  setChildrenCount={setChildrenCount}
                  childAges={childAges}
                  setChildAges={setChildAges}
                  triggerRef={roomGuestTriggerRef}
                />
              </div>
            )}
          </div>

          {/* CARD 5: SEARCH HOTELS CTA */}
          <button
            type="submit"
            className="sm:col-span-2 lg:col-span-1 lg:min-w-[138px] min-h-[54px] lg:min-h-[86px] rounded-2xl bg-[#085c44] hover:bg-[#064e3b] active:scale-[0.985] text-white font-bold text-sm leading-tight flex items-center justify-center lg:flex-col gap-2 lg:gap-1 shadow-[0_10px_24px_-6px_rgba(8,92,68,0.45)] transition-all duration-150 cursor-pointer px-5 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#085c44] dark:focus-visible:outline-emerald-400"
          >
            <Search size={18} strokeWidth={2.5} aria-hidden="true" />
            <span>Search Hotels</span>
          </button>
        </div>
      </form>
    </search>
  );
};

export default HotelSearch;
