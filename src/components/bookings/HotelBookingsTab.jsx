import React from "react";
import { Link } from "react-router-dom";
import {
  Hotel,
  Clock,
  Plus,
  FileText,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Users,
  CreditCard,
  XCircle,
} from "lucide-react";
import { isPaymentConfirmed } from "../../services/eticketService";
import { getStatusBadge } from "./bookingUtils";

export default function HotelBookingsTab({
  hotelBookings = [],
  isLoading = false,
  hotelFilter = "all",
  setHotelFilter,
  expandedHotelId = null,
  setExpandedHotelId,
  handleDownloadHotelInvoice,
  downloadingInvoiceId = null,
  downloadedInvoiceId = null,
  handlePayHeldBooking,
  onRequestCancel,
}) {
  const filteredHotels = hotelBookings.filter((bkg) => {
    if (hotelFilter === "all") return true;
    const s = (bkg.status || "").toLowerCase();
    if (hotelFilter === "confirmed") return s === "confirmed";
    if (hotelFilter === "pending")
      return [
        "pending",
        "awaiting_payment",
        "payment_pending",
        "confirming",
        "initiated",
        "provider_pending",
        "confirming_provider",
        "payment_received",
      ].includes(s);
    if (hotelFilter === "cancelled") return s === "cancelled";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Status Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {[
            { id: "all", label: "All Hotels", count: hotelBookings.length },
            {
              id: "confirmed",
              label: "Confirmed",
              count: hotelBookings.filter(
                (b) => (b.status || "").toLowerCase() === "confirmed"
              ).length,
            },
            {
              id: "pending",
              label: "Pending",
              count: hotelBookings.filter((b) =>
                [
                  "pending",
                  "awaiting_payment",
                  "initiated",
                  "provider_pending",
                  "confirming_provider",
                  "payment_received",
                ].includes((b.status || "").toLowerCase())
              ).length,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: hotelBookings.filter(
                (b) => (b.status || "").toLowerCase() === "cancelled"
              ).length,
            },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setHotelFilter?.(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                hotelFilter === f.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  hotelFilter === f.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <Link
          to="/hotel"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition"
        >
          <Plus size={14} />
          <span>Search Hotels</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Clock size={28} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Loading your hotel reservations...
          </p>
        </div>
      ) : hotelBookings.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Hotel size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              No Hotel Bookings Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              You have not made any hotel reservations yet. Browse top-rated hotels and suites in Makkah, Madinah, and international destinations.
            </p>
          </div>
          <Link
            to="/hotel"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-emerald-600 hover:from-orange-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition"
          >
            <Plus size={16} />
            <span>Search Hotels</span>
          </Link>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
          No hotel bookings found matching the selected filter.
        </div>
      ) : (
        filteredHotels.map((bkg) => {
          const id = bkg._id || bkg.id || bkg.bookingId;
          const isExpanded = expandedHotelId === id;
          const status = (bkg.status || "confirmed").toLowerCase();
          const isConfirmed = ["confirmed", "completed"].includes(status) || Boolean(bkg.voucherStatus);
          const isProviderPending = ["provider_pending", "confirming_provider", "confirming", "payment_received"].includes(status);
          const hasPaid = isPaymentConfirmed(bkg) || isProviderPending || isConfirmed;
          const isPending = !isConfirmed && !isProviderPending && ["pending", "awaiting_payment", "initiated"].includes(status);
          const totalAmount = bkg.totalPrice || bkg.totalAmount || bkg.amount || 0;
          const voucherRef = bkg.voucherRef || bkg.providerBookingId || bkg.bookingRefNo || bkg.voucherCode || bkg.confirmationNo;
          const hotelName = bkg.hotelName || bkg.hotelSnapshot?.name || bkg.hotel?.name || "Hotel Reservation";
          const roomName = bkg.roomName || bkg.roomSnapshots?.[0]?.roomName || bkg.roomSnapshots?.[0]?.name || bkg.rooms?.[0]?.name || "Standard Room";
          const checkIn = bkg.checkIn ? new Date(bkg.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Check-in";
          const checkOut = bkg.checkOut ? new Date(bkg.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Check-out";
          const guests = Array.isArray(bkg.guests) ? bkg.guests : [];
          const leadGuest = guests[0] || {};
          const leadName = `${leadGuest.title || ""} ${leadGuest.firstName || ""} ${leadGuest.lastName || ""}`.trim() || "Lead Guest";

          return (
            <div
              key={id}
              className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden transition hover:border-orange-300"
            >
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                    <Hotel size={24} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        {hotelName}
                      </h3>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {roomName}
                      </span>
                      {voucherRef && (
                        <span className="text-xs font-mono font-black text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                          Ref: {voucherRef}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        bkg.bookingSource === "SRDV_LIVE"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {bkg.sourceLabel || (bkg.isOffer ? "In-House Offer" : bkg.isMaster ? "In-House Inventory" : "Live Supplier")}
                      </span>
                      {getStatusBadge(status)}
                    </div>

                    <p className="text-xs text-slate-400 font-mono">
                      Booking #{id} • {checkIn} to {checkOut} • {leadName} • {guests.length || 1} Guest(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Rate
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900">
                      ₹{Number(totalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {isConfirmed && !isProviderPending ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadHotelInvoice?.(bkg)}
                        disabled={downloadingInvoiceId === id}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 ${
                          downloadedInvoiceId === id
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : "bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                        }`}
                        title="Download official hotel tax invoice"
                      >
                        {downloadingInvoiceId === id ? (
                          <>
                            <Loader2 size={15} className="animate-spin text-white shrink-0" />
                            <span>Generating Invoice...</span>
                          </>
                        ) : downloadedInvoiceId === id ? (
                          <>
                            <Check size={15} className="text-emerald-700 shrink-0" />
                            <span>Invoice Downloaded</span>
                          </>
                        ) : (
                          <>
                            <FileText size={15} className="shrink-0" />
                            <span>Download Invoice</span>
                          </>
                        )}
                      </button>
                    ) : isPending ? (
                      <button
                        type="button"
                        onClick={() => handlePayHeldBooking?.(bkg, "hotel")}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition cursor-pointer active:scale-95"
                      >
                        <CreditCard size={14} />
                        <span>Pay Now</span>
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setExpandedHotelId?.(isExpanded ? null : id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                        isExpanded
                          ? "bg-slate-900 text-white"
                          : "bg-orange-50 text-orange-800 hover:bg-orange-100"
                      }`}
                    >
                      <span>{isExpanded ? "Hide" : "Details"}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Hotel Details */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Hotel & Destination
                      </span>
                      <p className="font-extrabold text-sm text-slate-900">
                        {hotelName}
                      </p>
                      <p className="text-xs text-slate-500">{bkg.destination || "Confirmed Property"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Dates & Duration
                      </span>
                      <p className="font-extrabold text-sm text-slate-900">
                        {checkIn} - {checkOut}
                      </p>
                      <p className="text-xs text-slate-500">
                        {bkg.nights || 1} Night(s) • {roomName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Voucher / Confirmation
                      </span>
                      <p className="font-mono text-xs font-bold text-orange-800">
                        {voucherRef || (isConfirmed ? "Confirmed by Property" : "Pending Supplier Confirmation")}
                      </p>
                    </div>
                  </div>

                  {guests.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Users size={14} className="text-orange-600" />
                        <span>Guest Details ({guests.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {guests.map((g, idx) => {
                          const gName = `${g.title || ""} ${g.firstName || ""} ${g.lastName || ""}`.trim();
                          return (
                            <div
                              key={idx}
                              className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-bold text-slate-900">{gName || `Guest ${idx + 1}`}</p>
                                <p className="text-[11px] text-slate-400">{g.type || g.passengerType || (idx === 0 ? "Lead Guest" : "Guest")}</p>
                              </div>
                              {g.age && (
                                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  Age: {g.age}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handlePayHeldBooking?.(bkg, "hotel")}
                        className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CreditCard size={14} />
                        <span>Complete PayPal Payment</span>
                      </button>
                    )}

                    {isConfirmed && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDownloadHotelInvoice?.(bkg)}
                          disabled={downloadingInvoiceId === id}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                            downloadedInvoiceId === id
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-orange-600 hover:bg-orange-700 text-white"
                          }`}
                        >
                          {downloadingInvoiceId === id ? (
                            <>
                              <Loader2 size={14} className="animate-spin text-white" />
                              <span>Generating Invoice...</span>
                            </>
                          ) : downloadedInvoiceId === id ? (
                            <>
                              <Check size={14} className="text-emerald-700" />
                              <span>Invoice Downloaded</span>
                            </>
                          ) : (
                            <>
                              <FileText size={14} />
                              <span>Download Tax Invoice</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onRequestCancel?.(bkg, "hotel")}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle size={14} />
                          <span>Cancel Hotel Reservation</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
