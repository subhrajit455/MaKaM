import React from "react";
import { CheckCircle2, CreditCard, Phone, ArrowRight } from "lucide-react";

const HotelStickyPricingCard = ({
  ratingValue = 9.2,
  ratingLabel = "Exceptional",
  hotel = {},
  displayPrice = "₹18,500",
  setIsReservationModalOpen,
}) => {
  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-lg shadow-slate-200/50 relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

        {/* Rating Card */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              {Number(ratingValue).toFixed(1)}
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm block">
                {ratingLabel}
              </span>
              <span className="text-[11px] text-slate-400">
                {hotel.reviewCount || 1840}+ reviews
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider">
            Best Rate
          </span>
        </div>

        {/* Price Display */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Starting From
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {displayPrice}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / night
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> Includes all taxes, VAT & fees
          </p>
        </div>

        {/* Feature Bullet Points */}
        <div className="space-y-2 py-3.5 border-t border-b border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Free cancellation before check-in</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Instant confirmation & e-voucher</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>No booking fees or hidden charges</span>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={() => setIsReservationModalOpen(true)}
          className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-teal-600/30 hover:shadow-xl transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <CreditCard size={17} />
          Reserve Room
        </button>

        <p className="text-center text-[10px] text-slate-400 font-medium mt-3">
          🔒 Secure 256-bit SSL encrypted booking
        </p>
      </div>

      {/* Need Help Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 text-teal-400 flex items-center justify-center">
            <Phone size={16} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm">
              Need Pilgrimage Assistance?
            </h4>
            <p className="text-[11px] text-slate-300">
              Our travel experts are available 24/7
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 mt-2">
          Call our multilingual helpline for custom room views, Haram transfers, or group bookings.
        </p>
        <a
          href="tel:+966125717777"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-300 hover:text-teal-200"
        >
          Call +966 12 571 7777 <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );
};

export default HotelStickyPricingCard;
