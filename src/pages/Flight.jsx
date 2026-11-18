import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import "react-datepicker/dist/react-datepicker.css";
import CommonFlightHotelSearchBox from "../components/commonflighthotelsearchbox/CommonFlightHotelSearchBox";
import CommonHeader from "../components/CommonHeader";
import PopularSaudiFlightsSection from "../components/flightoffers/PopularSaudiFlightsSection";
import FlightBoardingGuide from "../components/flight/FlightBoardingGuide";
import HeroSlider from "../components/shared/HeroSlider";
import FlightLoader from "../components/loader/FlightLoader";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const FlightSearch = () => {
  const { loading } = useSelector((state) => state.flightSearch || {});
  const flightPageRef = useRef(null);
  useScrollAnimation(flightPageRef);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [selectedClass, setSelectedClass] = useState(false);
  const [selectedFare, setSelectedFare] = useState("Regular Fare");
  const [travellers, setTravellers] = useState({
    adult: 1,
    child: 0,
    infant: 0,
    travelClass: "Economy",
  });

  return (
    <div ref={flightPageRef}>
      {loading && <FlightLoader />}
      <div className="relative">
        <div className="relative">
          <CommonHeader />
        </div>
        {/* ── Modern Curated Hero Slider ── */}
        <HeroSlider
          eyebrow="Direct Pilgrimage & Global Airfare"
          title="Flights to Jeddah, Madinah & Beyond"
          subtitle="Compare live full-service and Umrah-friendly fares with transparent baggage and flexible dates."
        />
        <div data-animate="zoom-in" data-delay="0.1" className="relative z-40 mx-auto -mt-12 sm:-mt-16 lg:-mt-24 mb-12 sm:mb-16 lg:mb-20 w-full max-w-[1760px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <CommonFlightHotelSearchBox
            selectedFrom={selectedFrom}
            setSelectedFrom={setSelectedFrom}
            selectedTo={selectedTo}
            setSelectedTo={setSelectedTo}
            travellers={travellers}
            setTravellers={setTravellers}
            setSelectedClass={setSelectedClass}
            selectedClass={selectedClass}
            selectedFare={selectedFare}
            setSelectedFare={setSelectedFare}
          />
        </div>
      </div>

      {/* ── Popular Flights to Saudi Section ── */}
      <div data-animate="fade-up">
        <PopularSaudiFlightsSection />
      </div>

      {/* ── Step-by-Step Flight Boarding Guide ── */}
      <div data-animate="fade-up" data-delay="0.1">
        <FlightBoardingGuide />
      </div>

      <Footer />
    </div>
  );
};

export default FlightSearch;
