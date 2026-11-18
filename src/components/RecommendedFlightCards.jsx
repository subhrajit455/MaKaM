import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import { fetchFlights } from "./reducer/FlightSearchSlice";
import { staggerEntrance, clickSquash } from "../animations/presets";
import HorizontalCarousel from "./shared/HorizontalCarousel";
import offerService from "../services/offerService";
import makkahImg from "../assets/hero-slider/slide1-makkah-kaaba-tawaf.jpg";
import madinahImg from "../assets/hero-slider/slide2-madinah-prophet-mosque.jpg";

const DEFAULT_RECOMMENDED_FLIGHTS = [
  {
    name: "Mecca (Jeddah)",
    airport: "JED",
    route: "Delhi → Jeddah",
    duration: "Direct & 1-Stop Options",
    price: "35,000",
    image: makkahImg,
  },
  {
    name: "Madinah",
    airport: "MED",
    route: "Delhi → Madinah",
    duration: "Haramain Gateway",
    price: "36,500",
    image: madinahImg,
  },
  {
    name: "Istanbul",
    airport: "IST",
    route: "Delhi → Istanbul",
    duration: "Ottoman Heritage Route",
    price: "42,000",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Dubai",
    airport: "DXB",
    route: "Delhi → Dubai",
    duration: "Daily Direct Flights",
    price: "24,500",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Cairo",
    airport: "CAI",
    route: "Delhi → Cairo",
    duration: "Historic Islamic Route",
    price: "38,000",
    image:
      "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=900&q=80",
  },
];

const getDateString = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};

const RecommendedFlightCards = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openingAirport, setOpeningAirport] = useState("");
  const [flightRoutes, setFlightRoutes] = useState(DEFAULT_RECOMMENDED_FLIGHTS);
  const cardsContainerRef = useRef(null);

  useEffect(() => {
    let active = true;
    offerService
      .getOffers({ itemType: "flight", limit: 6 })
      .then((offers) => {
        if (!active || !Array.isArray(offers) || offers.length === 0) return;
        const mapped = offers
          .map((o, idx) => {
            const stock = o.flightRef?.stock || {};
            const origin = stock.origin || "DEL";
            const destination = stock.destination || "JED";
            const airline = stock.airline || o.title || "Direct Carrier";
            const priceVal = Number(o.sellPrice || stock.costPerUnit || 0);
            if (!destination || priceVal <= 0) return null;
            return {
              id: o._id || o.id,
              name: `${destination} (${airline})`,
              airport: destination,
              origin,
              route: `${origin} → ${destination}`,
              duration: stock.flightNumber ? `Flight ${stock.flightNumber}` : "Verified Allotment",
              price: priceVal.toLocaleString("en-IN"),
              image:
                (Array.isArray(o.images) && o.images[0]) ||
                DEFAULT_RECOMMENDED_FLIGHTS[idx % DEFAULT_RECOMMENDED_FLIGHTS.length].image,
            };
          })
          .filter(Boolean);
        if (mapped.length >= 2) {
          setFlightRoutes(mapped);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll(".rec-flight-card");
      if (cards.length > 0) {
        staggerEntrance(cards, { stagger: 70, startDelay: 100 });
      }
    }
  }, [flightRoutes.length]);

  const getAirportObj = (airportCode, name) => {
    const map = {
      DEL: {
        id: 1,
        name: "Delhi",
        airport: "Indira Gandhi International Airport",
        iataCode: "DEL",
        countryCode: "IN",
      },
      JED: {
        id: "JED",
        name: "Jeddah",
        airport: "King Abdulaziz International Airport",
        iataCode: "JED",
        countryCode: "SA",
      },
      MED: {
        id: "MED",
        name: "Medina",
        airport: "Prince Mohammad Bin Abdulaziz International Airport",
        iataCode: "MED",
        countryCode: "SA",
      },
      IST: {
        id: "IST",
        name: "Istanbul",
        airport: "Istanbul Airport",
        iataCode: "IST",
        countryCode: "TR",
      },
      CMN: {
        id: "CMN",
        name: "Casablanca",
        airport: "Mohammed V International Airport",
        iataCode: "CMN",
        countryCode: "MA",
      },
      TIR: {
        id: "TIR",
        name: "Tirana",
        airport: "Tirana International Airport",
        iataCode: "TIR",
        countryCode: "AL",
      },
    };
    return (
      map[airportCode] || {
        id: airportCode,
        name: name || airportCode,
        airport: `${name || airportCode} Airport`,
        iataCode: airportCode,
        countryCode: "",
      }
    );
  };

  const openFlightSearch = async (destination, airport) => {
    setOpeningAirport(airport);
    const departureDate = getDateString();
    const searchParams = {
      origin: "DEL",
      destination: airport,
      departureDate,
      passengers: { adults: 1, children: 0, infants: 0 },
      journeyType: "oneway",
    };

    const originAirport = getAirportObj("DEL", "Delhi");
    const destAirport = getAirportObj(airport, destination);

    try {
      await dispatch(fetchFlights(searchParams)).unwrap();
      localStorage.setItem("flightSearch", JSON.stringify(searchParams));
      localStorage.setItem("selectedFrom", JSON.stringify(originAirport));
      localStorage.setItem("selectedTo", JSON.stringify(destAirport));
      navigate("/flight-list", {
        state: {
          flights: [
            {
              searchFlights: searchParams,
              selectedFrom: originAirport,
              selectedTo: destAirport,
              showNavbar: true,
            },
          ],
        },
      });
    } catch (error) {
      console.error(`Unable to load flights for ${destination}:`, error);
      setOpeningAirport("");
    }
  };

  return (
    <section className="border-b border-gray-200 dark:border-slate-800 bg-[#f7f7f7] dark:bg-[#070c18] px-4 py-10 font-poppins sm:px-6 lg:px-10 xl:px-12 md:py-14 transition-colors">
      <div className="mx-auto w-full max-w-[1760px]">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              Recommended flights
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white md:text-3xl">
              Popular destinations from Delhi
            </h2>
          </div>
          <p className="text-sm text-gray-500"></p>
        </div>

        <HorizontalCarousel ariaLabel="recommended flights" trackRef={cardsContainerRef} trackClassName="gap-4 pb-3">
          {flightRoutes.map((flight, idx) => (
            <article
              key={flight.id || `${flight.airport}-${idx}`}
              className="rec-flight-card group flex flex-none w-[78%] min-w-[240px] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] lg:w-[calc(25%-0.75rem)] flex-col snap-start overflow-hidden rounded-2xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800 shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[1.35/1] overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={flight.image}
                  alt={`${flight.name} destination`}
                  loading="lazy"
                  width="400"
                  height="296"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col px-3.5 py-3">
                <h3 className="text-base font-bold text-[#045C45] dark:text-emerald-400">
                  {flight.name}
                </h3>
                <div
                  className="mt-1 flex items-center gap-0.5 text-amber-400"
                  aria-label="5 star destination"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={13} fill="currentColor" />
                  ))}
                </div>
                <div className="mt-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <Clock size={14} className="shrink-0 text-slate-500 dark:text-slate-400" />
                    {flight.duration}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0 text-slate-500 dark:text-slate-400" />
                    {flight.route}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#F6F4EF] dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800">
                <div className="px-3.5 py-2">
                  <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    Starting From
                  </p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white font-inter tabular-nums">
                    ₹ {flight.price}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    clickSquash(e.currentTarget);
                    openFlightSearch(flight.name, flight.airport);
                  }}
                  disabled={openingAirport !== ""}
                  className="flex h-13 items-center gap-1.5 bg-[#045C45] hover:bg-emerald-700 px-4 text-xs font-bold text-white transition active:scale-95 disabled:cursor-wait disabled:opacity-70 cursor-pointer"
                >
                  {openingAirport === flight.airport ? "Loading" : "Search Flights"}
                  <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  );
};

export default RecommendedFlightCards;
