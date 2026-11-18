import React from "react";
import {
  Star,
  MapPin,
  Compass,
  CalendarClock,
  PhoneCall,
  Eye,
  Utensils,
  Wifi,
  Shield,
} from "lucide-react";

const HotelHeaderInfo = ({ hotel = {} }) => {
  return (
    <>
      {/* Header / Title Box */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-extrabold text-[11px] uppercase tracking-wider">
            {hotel.city || "Makkah"}, {hotel.country || "Saudi Arabia"}
          </span>

          {/* Star rating display */}
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
            <span className="text-xs font-bold text-slate-500 ml-1">
              5-Star Certified
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
          {hotel.name}
        </h1>

        {hotel.tagline && (
          <p className="text-xs sm:text-sm text-teal-800 font-semibold mb-3">
            {hotel.tagline}
          </p>
        )}

        {/* Location & Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="text-teal-600 shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                Property Address
              </span>
              <span className="text-slate-600 leading-snug">
                {hotel.address || "Abraj Al Bait Complex"}, {hotel.city || "Makkah"}, {hotel.country || "Saudi Arabia"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Compass className="text-amber-600 shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                Distance to Sanctuary
              </span>
              <span className="text-emerald-700 font-bold">
                {hotel.distanceToHaram || "Adjacent to Masjid Al Haram (0 meters)"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarClock className="text-teal-600 shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                Check-in & Check-out
              </span>
              <span>
                In: {hotel?.checkinCheckoutTimes?.checkin_start || "16:00"} | Out: {hotel?.checkinCheckoutTimes?.checkout || "12:00"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <PhoneCall className="text-teal-600 shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                Concierge Support
              </span>
              <span>{hotel.phone || "+966 12 571 7777"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs text-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-1.5">
            <Eye size={15} />
          </div>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            View
          </p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5">
            Haram & Kaaba
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs text-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-1.5">
            <Utensils size={15} />
          </div>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Dining
          </p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5">
            100% Halal Buffet
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs text-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
            <Wifi size={15} />
          </div>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Internet
          </p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5">
            Free High-Speed
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs text-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-1.5">
            <Shield size={15} />
          </div>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Cancellation
          </p>
          <p className="text-xs sm:text-sm font-extrabold text-emerald-600 mt-0.5">
            Free before stay
          </p>
        </div>
      </div>
    </>
  );
};

export default HotelHeaderInfo;
