import React, { useState } from "react";
import {
  Sparkles,
  Gift,
  Shield,
  CreditCard,
  CheckCircle2,
  Wifi,
  Car,
  Utensils,
  Clock,
  Eye,
  Building2,
  Dumbbell,
  Briefcase,
  Compass,
  MapPin,
  Wind,
  Coffee,
} from "lucide-react";

export const facilityIcons = {
  WiFi: Wifi,
  "Free High-Speed WiFi": Wifi,
  Parking: Car,
  "Valet Parking": Car,
  Restaurant: Utensils,
  "Halal Fine Dining Buffet": Utensils,
  "24/7 Room Service & Butler": Clock,
  "24/7 In-Room Dining": Clock,
  "Direct Haram View Rooms": Eye,
  "Direct Elevator to Haram": Building2,
  "Fitness Center & Spa": Dumbbell,
  "Executive Business Lounge": Briefcase,
  "Executive Business Center": Briefcase,
  "Prayer Hall with Kaaba View": Compass,
  "Walking Distance to Masjid an-Nabawi": MapPin,
  "Concierge & Luggage Assistance": Shield,
  "Air Conditioning": Wind,
  Breakfast: Coffee,
};

export const getFacilityIcon = (facilityName) => {
  return facilityIcons[facilityName] || CheckCircle2;
};

const HotelAccordions = ({ hotel = {} }) => {
  const [expandedSections, setExpandedSections] = useState({
    about: true,
    facilities: true,
    policies: false,
    information: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* About Section Accordion */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <button
          type="button"
          onClick={() => toggleSection("about")}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-teal-600" size={19} />
            About this property
          </h2>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-base">
            {expandedSections.about ? "−" : "+"}
          </span>
        </button>

        {expandedSections.about && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2.5">
            <p>
              {hotel.description ||
                "Experience exceptional Islamic hospitality in the heart of the holy city. Designed for spiritual reflection and sublime comfort, our property offers spacious soundproof suites, direct audio connection to the Holy Mosque, and dedicated concierge for Umrah & Hajj pilgrims."}
            </p>
            <p>
              Guest rooms are equipped with prayer mats, digital Qibla direction indicators, marble bathrooms with premium toiletries, high-definition satellite channels, and complimentary 24/7 tea and Arabic coffee stations.
            </p>
          </div>
        )}
      </div>

      {/* Facilities & Amenities Accordion */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <button
          type="button"
          onClick={() => toggleSection("facilities")}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Gift className="text-teal-600" size={19} />
            Facilities & Amenities
          </h2>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-base">
            {expandedSections.facilities ? "−" : "+"}
          </span>
        </button>

        {expandedSections.facilities && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {hotel.hotelFacilities?.map((fac, index) => {
              const IconComponent = getFacilityIcon(fac);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-teal-50/50 hover:border-teal-200 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
                    <IconComponent size={15} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {fac}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Policies Section Accordion */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <button
          type="button"
          onClick={() => toggleSection("policies")}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="text-teal-600" size={19} />
            House Policies
          </h2>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-base">
            {expandedSections.policies ? "−" : "+"}
          </span>
        </button>

        {expandedSections.policies && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-2">
            {hotel.policies?.map((policy, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs sm:text-sm text-slate-600"
              >
                <CheckCircle2
                  size={14}
                  className="text-teal-600 shrink-0 mt-0.5"
                />
                <span>{policy}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Important Info Section Accordion */}
      <div className="bg-gradient-to-br from-teal-50/70 to-emerald-50/50 rounded-2xl sm:rounded-3xl border border-teal-200/80 p-5 sm:p-7 shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("information")}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <h2 className="text-lg sm:text-xl font-extrabold text-teal-950 flex items-center gap-2">
            <CreditCard className="text-teal-700" size={19} />
            Important Information
          </h2>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 flex items-center justify-center text-teal-800 font-bold text-base shadow-2xs">
            {expandedSections.information ? "−" : "+"}
          </span>
        </button>

        {expandedSections.information && (
          <div className="mt-3.5 pt-3.5 border-t border-teal-200/60 text-xs sm:text-sm text-teal-900/90 leading-relaxed">
            <p>
              {hotel.hotelImportantInformation ||
                "Direct elevator transfer to the Haram piazza is available 24 hours. The property is strictly non-smoking. Wheelchair accessibility and assistance for elderly pilgrims can be arranged via the 24/7 concierge."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelAccordions;
