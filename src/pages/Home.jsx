import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { MdVerified } from "react-icons/md";
import { PiBowlFoodFill } from "react-icons/pi";
import { FaEarthAmericas } from "react-icons/fa6";
import { RiStarSmileFill } from "react-icons/ri";
import image from "../assets/image.png";
import CommonHeader from "../components/CommonHeader";
import HomeSearchSection from "../components/home-search/HomeSearchSection";
import packageService from "../services/packageService";
import PackageCard from "../components/PackageCard";
import Footer from "../components/Footer";
import { ChevronRight } from "lucide-react";
import LiquidFillText from "../components/ui/LiquidFillText";
import TripPlannerShowcase from "../components/planner/TripPlannerShowcase";
import HorizontalCarousel from "../components/shared/HorizontalCarousel";
import TravelerReviews from "../components/reviews/TravelerReviews";
import IslamicValuesSection from "../components/IslamicValuesSection";
import { useNavigate } from "react-router-dom";
import OffersSection from "../components/offerssection/OffersSection";
import FlightOffersSection from "../components/flightoffers/FlightOffersSection";
import HeroSlider from "../components/shared/HeroSlider";

import DestinationsShowcase from "../components/destinations/DestinationsShowcase";

const CustomPackageBuilder = lazy(() => import("../components/CustomPackageBuilder"));
const HowItWorksSection = lazy(() => import("../components/howitworks/HowItWorksSection"));
const PremiumHotelShowcase = lazy(() => import("../components/PremiumHotelShowcase"));
const ZiyaratExplorerSection = lazy(() => import("../components/ziyarat/ZiyaratExplorerSection"));
const TrustAccreditationBar = lazy(() => import("../components/trust/TrustAccreditationBar"));
const TravelFaqSection = lazy(() => import("../components/faq/TravelFaqSection"));
const WhatsAppClubBanner = lazy(() => import("../components/newsletter/WhatsAppClubBanner"));
const AppDownloadBanner = lazy(() => import("../components/AppDownloadBanner"));

const FALLBACK_PACKAGES = [
  {
    _id: "6ac4cc8fdd7f83ab2e5a4cd3",
    title: "Zam-zam Executive Pilgrimage",
    destination: "Madina",
    images: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1000",
      "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=1000",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=1000",
    ],
    bundleDiscountPercentage: 10,
    sellPrice: 85000,
    inclusions: ["Emirates Flights", "InterContinental Executive Suite", "VIP Ground Transfers"],
    itinerary: [
      { day: 1, title: "Day 1", description: "Arrival in Madinah & Hotel Check-in" },
      { day: 2, title: "Day 2", description: "Prophet's Mosque Ziyarat & Rawdah Visit" },
      { day: 3, title: "Day 3", description: "Historic Mosques (Quba, Qiblatayn, Uhud)" },
      { day: 4, title: "Day 4", description: "Private Haramain High-Speed Train Transfer" },
    ],
    validity: {
      from: "2026-10-07T00:00:00.000Z",
      to: "2026-10-15T18:29:59.999Z",
    },
    availableSlots: 3,
    priceBreakdown: [
      {
        id: "6abe105ae33c12a898c02ea1",
        title: "InterContinental Durrat Al Riyadh — Executive Suite",
        itemType: "hotel",
        retailPrice: 94000,
        details: {
          destination: "Riyadh & Madina, Saudi Arabia",
          hotelDetails: {
            hotelId: { name: "InterContinental Durrat Al Riyadh" },
            roomType: "Executive Suite",
            totalNights: 8,
          },
        },
      },
      {
        id: "6abba3790d38868cbc2e389c",
        title: "Emirates EK-512 DEL → DXB → MED",
        itemType: "flight",
        retailPrice: 21275,
        details: {
          destination: "MED",
          flightDetails: {
            airline: "Emirates",
            flightNumber: "EK-512",
            origin: "DEL",
            destination: "MED",
          },
        },
      },
    ],
  },
  {
    _id: "6aa931aecedad95f28debbda",
    title: "Makkah Premium VIP Package",
    description: "Exclusive Umrah pilgrimage package featuring luxury 5-star hotel facing the Holy Kaaba, private transfers, and dedicated scholar guidance.",
    destination: "Makkah",
    images: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1000",
      "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1000",
    ],
    bundleDiscountPercentage: 12,
    sellPrice: 45000,
    inclusions: ["Direct Flights", "5-Star Clock Tower Fairmont", "Full Halal Board", "Private Transfers"],
    itinerary: [
      { day: 1, title: "Day 1", description: "Direct Flight Arrival & Umrah Performance" },
      { day: 2, title: "Day 2", description: "Haram Worship & Scholar Q&A Session" },
      { day: 3, title: "Day 3", description: "Jabal Al-Noor & Cave of Hira Guided Tour" },
    ],
    validity: {
      from: "2026-09-15T00:00:00.000Z",
      to: "2026-09-30T18:29:59.999Z",
    },
    availableSlots: 8,
    priceBreakdown: [
      {
        itemType: "hotel",
        title: "Fairmont Makkah Clock Royal Tower",
        details: {
          hotelDetails: {
            hotelId: { name: "Fairmont Makkah Clock Royal Tower" },
            roomType: "Haram View Deluxe",
            totalNights: 7,
          },
        },
      },
      {
        itemType: "flight",
        title: "Saudia Airlines SV-757",
        details: {
          flightDetails: {
            airline: "Saudia",
            flightNumber: "SV-757",
            origin: "DEL",
            destination: "JED",
          },
        },
      },
    ],
  },
  {
    _id: "6aa92be7cedad95f28deb9ea",
    title: "Madinah Tour Special Offer Package",
    description: "Comprehensive spiritual package in the City of the Prophet, including roundtrip airfare, 4-star central hotel, daily breakfast, and private local ziyarat.",
    destination: "Madinah",
    images: [
      "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=1000",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=1000",
    ],
    bundleDiscountPercentage: 8,
    sellPrice: 45000,
    inclusions: ["Roundtrip Airfare", "Central Central Hotel", "Daily Halal Breakfast", "Private Cab Ziyarat"],
    itinerary: [
      { day: 1, title: "Day 1", description: "Arrival in Madinah & Check-in" },
      { day: 2, title: "Day 2", description: "Prophet's Mosque & Rawdah Prayer" },
      { day: 3, title: "Day 3", description: "Mount Uhud & Quba Mosque Visit" },
    ],
    validity: {
      from: "2026-09-15T00:00:00.000Z",
      to: "2026-09-30T18:29:59.999Z",
    },
    availableSlots: 12,
    priceBreakdown: [
      {
        itemType: "hotel",
        title: "Oberoi Madinah",
        details: {
          hotelDetails: {
            hotelId: { name: "The Oberoi Madinah" },
            roomType: "Premier Courtyard Room",
            totalNights: 6,
          },
        },
      },
      {
        itemType: "flight",
        title: "Flynas XY-342",
        details: {
          flightDetails: {
            airline: "Flynas",
            flightNumber: "XY-342",
            origin: "BOM",
            destination: "MED",
          },
        },
      },
    ],
  },
  {
    _id: "6aa7bffb92b1b9c8f89ae79e",
    title: "7D6N Istanbul & Cappadocia Wonders",
    description: "Explore the historic Ottoman marvels of Istanbul, Blue Mosque, Hagia Sophia, and the fairytale landscapes and hot air balloons of Cappadocia.",
    destination: "Turkey",
    images: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1000&q=80",
    ],
    bundleDiscountPercentage: 15,
    sellPrice: 62000,
    inclusions: [
      "Turkish Airlines Flights",
      "Cave Hotel in Cappadocia",
      "Bosphorus Dinner Cruise",
      "Hot Air Balloon Tour",
    ],
    itinerary: [
      { day: 1, description: "Arrival in Istanbul & Bosphorus Dinner Cruise" },
      { day: 2, description: "Hagia Sophia, Blue Mosque & Grand Bazaar" },
      { day: 3, description: "Flight to Cappadocia & check-in to Cave Hotel" },
      { day: 4, description: "Early morning hot air balloon watching & Goreme tour" },
      { day: 5, description: "Underground city of Derinkuyu & Ihlara Valley" },
      { day: 6, description: "Return flight to Istanbul & Taksim leisure" },
      { day: 7, description: "Spice Market shopping & international departure" },
    ],
    validity: {
      from: "2026-10-01T00:00:00.000Z",
      to: "2026-10-25T18:29:59.999Z",
    },
    availableSlots: 15,
    priceBreakdown: [
      {
        itemType: "hotel",
        title: "Museum Hotel Cappadocia & Sultanahmet Palace",
        details: {
          hotelDetails: {
            hotelId: { name: "Museum Hotel Cappadocia" },
            roomType: "Deluxe Cave Suite",
            totalNights: 6,
          },
        },
      },
      {
        itemType: "flight",
        title: "Turkish Airlines TK-717",
        details: {
          flightDetails: {
            airline: "Turkish Airlines",
            flightNumber: "TK-717",
            origin: "DEL",
            destination: "IST",
          },
        },
      },
    ],
  },
  {
    _id: "6aa8dca9cedad95f28dea9d5",
    title: "Morocco Heritage & Cultural Tour",
    description: "Discover the captivating culture of Marrakech, Fez Medina, historic mosques, and Atlas mountain retreats with private licensed guides.",
    destination: "Morocco",
    images: [
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80",
    ],
    bundleDiscountPercentage: 10,
    sellPrice: 45000,
    inclusions: ["Flights Included", "Boutique Riad Stay", "Halal Dining", "Atlas Mountain Day Trip"],
    itinerary: [
      { day: 1, title: "Day 1", description: "Arrival in Marrakech & Riad Welcome" },
      { day: 2, title: "Day 2", description: "Bahia Palace & Koutoubia Mosque" },
      { day: 3, title: "Day 3", description: "Atlas Mountains & Ourika Valley" },
    ],
    validity: {
      from: "2026-09-15T00:00:00.000Z",
      to: "2026-10-10T18:29:59.999Z",
    },
    availableSlots: 10,
    priceBreakdown: [],
  },
  {
    _id: "pkg-dubai",
    title: "Dubai Luxury Escape & Desert Safari",
    description: "5-star Arabian Gulf holiday with luxury Dubai Marina accommodation, thrilling 4x4 desert safari, and private city excursions.",
    destination: "Dubai",
    images: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1000&q=80",
    ],
    bundleDiscountPercentage: 10,
    sellPrice: 55000,
    inclusions: ["Emirates Direct Flights", "5-Star Marina Hotel", "Desert Safari BBQ", "Burj Khalifa At The Top"],
    itinerary: [
      { day: 1, title: "Day 1", description: "Arrival in Dubai & Marina Dhow Cruise" },
      { day: 2, title: "Day 2", description: "Burj Khalifa, Dubai Mall & Fountain Show" },
      { day: 3, title: "Day 3", description: "Afternoon 4x4 Desert Safari & BBQ Dinner" },
    ],
    validity: {
      from: "2026-10-01T00:00:00.000Z",
      to: "2026-10-20T18:29:59.999Z",
    },
    availableSlots: 6,
    priceBreakdown: [
      {
        itemType: "flight",
        title: "Emirates EK-501",
        details: {
          flightDetails: {
            airline: "Emirates",
            flightNumber: "EK-501",
            origin: "BOM",
            destination: "DXB",
          },
        },
      },
    ],
  },
];

const Home = () => {
  const navigator = useNavigate();
  const [packagesList, setPackagesList] = useState(FALLBACK_PACKAGES);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const features = [
    {
      name: "Verified Haram Stays",
      icon: MdVerified,
    },
    {
      name: "Certified Halal Dining",
      icon: PiBowlFoodFill,
    },
    {
      name: "Prime Courtyard Access",
      icon: RiStarSmileFill,
    },
    {
      name: "Licensed Ground Transfers",
      icon: FaEarthAmericas,
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchLivePackages = async () => {
      try {
        setIsLoadingPackages(true);
        const data = await packageService.getPackages({ limit: 8 });
        const pkgs =
          data?.packages ||
          data?.data?.packages ||
          data?.data ||
          (Array.isArray(data) ? data : []);
        if (isMounted && Array.isArray(pkgs) && pkgs.length > 0) {
          setPackagesList(pkgs);
        }
      } catch (error) {
        console.warn("Could not fetch live packages, displaying curated packages:", error);
      } finally {
        if (isMounted) setIsLoadingPackages(false);
      }
    };

    fetchLivePackages();
    return () => {
      isMounted = false;
    };
  }, []);



  const homeContainerRef = useRef(null);
  useScrollAnimation(homeContainerRef, [packagesList]);

  return (
    <div ref={homeContainerRef} className="overflow-x-clip bg-white dark:bg-[#0b1120]">
      {/* HERO  —  Full screen, all breakpoints */}
      <div className="relative">
        <CommonHeader />

        {/* ── Modern Curated Hero Slider ── */}
        <HeroSlider
          eyebrow="Verified Makkah & Madinah Travel"
          title="Sacred Journeys, Effortlessly Arranged"
          subtitle="Book verified hotels steps from Haram, direct flights to Jeddah & Madinah, and guided Ziyarat packages with transparent pricing."
        />

        <HomeSearchSection />
      </div>

      <DestinationsShowcase />

      <OffersSection />

      <FlightOffersSection />

      <Suspense fallback={null}>
        <HowItWorksSection />
      </Suspense>

      {/* Trip Concierge & Smart Journey Planner */}
      <TripPlannerShowcase onLaunchPlanner={() => navigator("/ai-package-generator")} />

      {/* ── RECOMMENDED PACKAGES SECTION (Horizontal Carousel with Click-Scrolling) ── */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-10 xl:px-12 font-jakarta bg-white dark:bg-[#0b1120] transition-colors duration-300">
        <div className="w-full max-w-[1760px] mx-auto">
          {/* Section Header */}
          <div data-animate="fade-up" className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Recommended <LiquidFillText text="Packages" />
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                All-inclusive, verified Umrah and international holiday packages featuring roundtrip flights, 5★ Haram accommodations, private ground logistics, and guaranteed slot availability.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigator("/package-page")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>View All Packages</span>
                <ChevronRight size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Horizontal Packages Carousel (Exact-fit Cards without remaining card cut-offs) */}
          <div data-animate="stagger" data-stagger-target=".snap-start">
            <HorizontalCarousel
              ariaLabel="packages"
              arrowOffset="padding"
              trackClassName="gap-6 py-3 px-0 items-stretch"
            >
            {isLoadingPackages ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`pkg-skel-${i}`}
                  className="flex-none w-[84vw] max-w-[340px] sm:w-[calc((100%-1.5rem)/2)] sm:max-w-none lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)] flex flex-col snap-start"
                >
                  <div className="w-full h-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse p-4 flex flex-col justify-between">
                    <div className="w-full h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="space-y-2 mt-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              packagesList.map((pkg, index) => (
                <div
                  key={pkg._id || pkg.id || index}
                  className="flex-none w-[84vw] max-w-[340px] sm:w-[calc((100%-1.5rem)/2)] sm:max-w-none lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)] flex flex-col snap-start"
                >
                  <PackageCard pkg={pkg} />
                </div>
              ))
            )}
            </HorizontalCarousel>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <PremiumHotelShowcase />
        <ZiyaratExplorerSection />
      </Suspense>




      {/* ── TRAVELER REVIEWS SECTION ── */}
      <TravelerReviews />

      {/* ── EXPERIENCE TRAVEL THROUGH ISLAMIC VALUES ── */}
      <IslamicValuesSection />

      <Suspense fallback={null}>
        <TrustAccreditationBar />
        <TravelFaqSection />
        <WhatsAppClubBanner />
        <AppDownloadBanner />
      </Suspense>

      <section className="bg-white dark:bg-[#0b1120] py-12 sm:py-16 px-4 sm:px-6 lg:px-10 xl:px-12 font-poppins transition-colors">
        <div className="w-full max-w-[1760px] mx-auto grid md:grid-cols-[1fr_minmax(280px,400px)] gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div data-animate="slide-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              About GoMaqam — Your Trusted Pilgrimage &amp; Halal Travel Partner
            </h2>

            <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
              GoMaqam is a premier pilgrimage and travel concierge committed to providing seamless, verified Hajj, Umrah, and halal-friendly journeys worldwide. Through direct partnerships with certified airlines and 4★ &amp; 5★ luxury properties adjacent to Masjid al-Haram and the Prophet&apos;s Mosque, we guarantee transparent wholesale pricing, verified Nusuk slot coordination, and 24/7 on-ground multilingual support.
            </p>

            <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
              From bespoke family Umrah packages and VIP Haramain high-speed rail transfers to dedicated Rawdah guides and curated halal culinary trails, our mission is to ensure every moment of your pilgrimage is spiritually uplifting, impeccably organized, and entirely stress-free.
            </p>

            {/* Why Choose */}
            <h3 className="mt-8 font-semibold text-gray-900 dark:text-white">Why Choose Us</h3>

            <div data-animate="stagger" data-stagger-target="div" className="flex flex-wrap gap-4 mt-4">
              {features.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 dark:border dark:border-teal-800/40 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <Icon size={18} />
                    {item.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Images */}
          <div data-animate="zoom-in" data-delay="0.2" className=" flex justify-center">
            {/* Back Image */}
            <img
              src={image}
              alt="Decorative background"
              loading="lazy"
              width="360"
              height="360"
              className="w-full max-w-[360px] h-auto"
            />
          </div>
        </div>
      </section>

      {/* ── Custom Package Builder Modal (opened from hero AI Custom Package btn) ── */}
      {showCustomForm && (
        <Suspense fallback={null}>
          <CustomPackageBuilder
            open={showCustomForm}
            onClose={() => setShowCustomForm(false)}
          />
        </Suspense>
      )}
      <Footer />
    </div>
  );
};

export default Home;
