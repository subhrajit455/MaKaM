import React, { useRef } from "react";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import CommonHeader from "../components/CommonHeader";
import HotelSearch from "./HotelSearch";
import HotelSuggestions from "../components/HotelSuggestions";
import ExclusiveOffers from "../components/offerssection/ExclusiveOffers";
import HeroSlider from "../components/shared/HeroSlider";
import HotelLoader from "../components/loader/HotelLoader";
import PremiumHotelShowcase from "../components/PremiumHotelShowcase";
import TrustAccreditationBar from "../components/trust/TrustAccreditationBar";
import TravelFaqSection from "../components/faq/TravelFaqSection";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const HotelPage = () => {
  const { loading } = useSelector((state) => state.hotelSearch || {});
  const pageRef = useRef(null);
  useScrollAnimation(pageRef);

  return (
    <div ref={pageRef}>
      {loading && <HotelLoader />}
      <div className="relative">
        <CommonHeader />
        {/* ── Modern Curated Hero Slider ── */}
        <HeroSlider
          eyebrow="Clock Tower & Haram Courtyard Stays"
          title="Hotels Steps from the Two Holy Mosques"
          subtitle="Verified walking distances to Masjid al-Haram and Al-Masjid an-Nabawi with instant room confirmation."
        />
        <div data-animate="zoom-in" data-delay="0.1" className="relative z-40 mx-auto -mt-12 sm:-mt-16 lg:-mt-24 mb-12 sm:mb-16 lg:mb-20 w-full max-w-7xl px-3 sm:px-6">
          <HotelSearch />
        </div>
      </div>
      <div data-animate="fade-up">
        <ExclusiveOffers />
      </div>
      <div data-animate="stagger" data-stagger-target=".hotel-suggestion-card, article, div.rounded-2xl">
        <HotelSuggestions
          title="Hotels in Mecca"
          description="Find available stays close to Masjid al-Haram."
          destination="JED"
        />
        <HotelSuggestions
          title="Hotels in Medina"
          description="Find available stays close to Al-Masjid an-Nabawi."
          destination="MED"
        />
      </div>
      <PremiumHotelShowcase />
      <TrustAccreditationBar />
      <TravelFaqSection defaultCategory="hotels" />
      <Footer />
    </div>
  );
};

export default HotelPage;
