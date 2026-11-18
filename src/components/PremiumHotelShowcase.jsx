import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import MakkahImage from "../assets/makkah.jpg";
import MadinahImage from "../assets/hero-slider/slide2-madinah-prophet-mosque.jpg";
import HotelImage from "../assets/hotelimages01.jpg";
import IstanbulImage from "../assets/image02.jpg";
import HorizontalCarousel from "./shared/HorizontalCarousel";
import offerService from "../services/offerService";
import LiquidFillText from "./ui/LiquidFillText";

const DEFAULT_SELECTIONS = [
  {
    title: "Haram Courtyard Suites",
    description: "Verified 5-star stays facing Masjid al-Haram in Makkah",
    destination: "Makkah",
    image: MakkahImage,
  },
  {
    title: "Madinah Central Retreats",
    description: "Family-friendly sanctuaries steps from Bab as-Salam",
    destination: "Madinah",
    image: MadinahImage,
  },
  {
    title: "Executive Family Villas",
    description: "Private multi-bedroom suites with halal room service",
    destination: "Riyadh",
    image: HotelImage,
  },
];

const DEFAULT_HOTSPOTS = [
  {
    title: "Makkah Courtyard Hotels",
    image: MakkahImage,
  },
  {
    title: "Madinah Central Stays",
    image: MadinahImage,
  },
  {
    title: "Heritage City Properties",
    image: IstanbulImage,
  },
];

const PremiumHotelShowcase = () => {
  const navigate = useNavigate();
  const [luxurySelections, setLuxurySelections] = useState(DEFAULT_SELECTIONS);

  useEffect(() => {
    let active = true;
    offerService
      .getOffers({ itemType: "hotel", limit: 6 })
      .then((offers) => {
        if (!active || !Array.isArray(offers) || offers.length === 0) return;
        const mapped = offers
          .filter((o) => o && (o.title || o.hotelRef?.stock?.hotelName))
          .slice(0, 6)
          .map((o, idx) => ({
            id: o._id || o.id,
            title: o.hotelRef?.stock?.hotelName || o.title,
            description:
              o.subtitle ||
              `${o.hotelRef?.stock?.roomType || "Verified Room"} · ${o.destination || "Saudi Arabia"}`,
            destination: o.destination || "",
            price: o.sellPrice,
            image:
              (Array.isArray(o.images) && o.images[0]) ||
              DEFAULT_SELECTIONS[idx % DEFAULT_SELECTIONS.length].image,
          }));
        if (mapped.length > 0) {
          setLuxurySelections(mapped);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      aria-labelledby="premium-hotel-showcase-heading"
      className="maqam-section bg-white dark:bg-[#0b1120] px-4 py-12 font-poppins sm:px-6 lg:px-10 xl:px-12 md:py-16 transition-colors"
    >
      <div className="mx-auto max-w-[1760px] space-y-8">
        <div data-animate="fade-up" className="flex flex-col overflow-hidden rounded-2xl bg-[#F6F4EF] dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs md:flex-row md:items-center">
          <div className="shrink-0 px-6 py-7 md:w-[30%] md:px-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#00987A] dark:text-emerald-400">
              Verified Stays
            </p>
            <h2
              id="premium-hotel-showcase-heading"
              className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900 dark:text-white"
            >
              Signature Hotels &amp;{" "}
              <LiquidFillText text="Haram Proximity" />
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Hand-checked rooms and family suites with transparent walking distances and confirmed check-in vouchers.
            </p>
          </div>

          <HorizontalCarousel
            inset
            ariaLabel="luxury selections"
            className="min-w-0 md:flex-1"
            trackClassName="gap-5 px-5 pb-6 md:px-0 md:py-7 md:pr-8"
          >
            {luxurySelections.map((selection, idx) => (
              <button
                type="button"
                key={selection.id || selection.title || idx}
                onClick={() => navigate("/hotel-page")}
                className="group pro-card pro-card-interactive pro-card-press shrink-0 snap-start w-[80vw] max-w-[290px] sm:w-[270px] overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-left cursor-pointer"
              >
                <div className="relative h-42 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img
                    src={selection.image}
                    alt={selection.title}
                    loading="lazy"
                    width="290"
                    height="168"
                    className="h-full w-full object-cover pro-card-image"
                  />
                  {selection.destination && (
                    <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-lg bg-black/65 backdrop-blur-xs px-2 py-1 text-[11px] font-medium text-white">
                      <MapPin size={11} />
                      <span className="truncate max-w-[180px]">{selection.destination}</span>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white line-clamp-1">
                    {selection.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {selection.description}
                  </p>
                </div>
              </button>
            ))}
          </HorizontalCarousel>
        </div>

        <div data-animate="fade-up" data-delay="0.1" className="flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs md:flex-row md:items-center">
          <div className="flex shrink-0 flex-col gap-2 px-6 py-6 md:w-[28%] md:px-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00987A] dark:text-emerald-400">
              <Building2 size={15} />
              <span>Regional Collections</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight text-slate-900 dark:text-white">
              Browse by Holy City &amp; Hub
            </h3>
            <button
              type="button"
              onClick={() => navigate("/hotel-page")}
              className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#045C45] dark:text-emerald-400 hover:text-[#00987A] transition-colors cursor-pointer self-start"
            >
              <span>Search All Stays</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <HorizontalCarousel
            inset
            ariaLabel="premium hotspots"
            className="min-w-0 md:flex-1"
            trackClassName="gap-4 px-5 pb-6 md:px-0 md:py-7 md:pr-8"
          >
            {DEFAULT_HOTSPOTS.map((hotel) => (
              <button
                type="button"
                key={hotel.title}
                onClick={() => navigate("/hotel-page")}
                className="group pro-card pro-card-interactive pro-card-press relative h-36 shrink-0 snap-start w-[72%] min-w-[210px] max-w-[260px] sm:w-[240px] overflow-hidden rounded-2xl text-left cursor-pointer"
              >
                <img
                  src={hotel.image}
                  alt={hotel.title}
                  loading="lazy"
                  width="260"
                  height="144"
                  className="absolute inset-0 h-full w-full object-cover pro-card-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <span className="absolute bottom-3.5 left-3.5 right-3.5 text-sm font-bold leading-tight text-white">
                  {hotel.title}
                </span>
              </button>
            ))}
          </HorizontalCarousel>
        </div>
      </div>
    </section>
  );
};

export default PremiumHotelShowcase;
