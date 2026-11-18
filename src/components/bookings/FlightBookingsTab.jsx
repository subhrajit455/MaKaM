import React from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  Clock,
  Plus,
  Download,
  FileText,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Users,
  CreditCard,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import eticketService from "../../services/eticketService";
import { getStatusBadge } from "./bookingUtils";

export default function FlightBookingsTab({
  flightBookings = [],
  isLoading = false,
  flightFilter = "all",
  setFlightFilter,
  expandedFlightId = null,
  setExpandedFlightId,
  handleOpenETicket,
  handleDownloadInvoice,
  downloadingInvoiceId = null,
  downloadedInvoiceId = null,
  handlePayHeldBooking,
  onRequestCancel,
}) {
  const filteredFlights = flightBookings.filter((bkg) => {
    if (flightFilter === "all") return true;
    const s = (bkg.status || "").toLowerCase();
    if (flightFilter === "confirmed") return s === "confirmed" || s === "ticketed";
    if (flightFilter === "pending")
      return s === "pending" || s === "initiated" || s === "awaiting_payment";
    if (flightFilter === "cancelled") return s === "cancelled";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Status Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {[
            { id: "all", label: "All Flights", count: flightBookings.length },
            {
              id: "confirmed",
              label: "Confirmed / Ticketed",
              count: flightBookings.filter((b) =>
                ["confirmed", "ticketed"].includes((b.status || "").toLowerCase())
              ).length,
            },
            {
              id: "pending",
              label: "Pending Payment",
              count: flightBookings.filter((b) =>
                ["pending", "initiated", "awaiting_payment"].includes(
                  (b.status || "").toLowerCase()
                )
              ).length,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: flightBookings.filter(
                (b) => (b.status || "").toLowerCase() === "cancelled"
              ).length,
            },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFlightFilter?.(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                flightFilter === f.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  flightFilter === f.id
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
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition"
        >
          <Plus size={14} />
          <span>Book New Flight</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Clock size={28} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Loading your flight bookings...
          </p>
        </div>
      ) : flightBookings.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Plane size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              No Flight Bookings Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              You have not made any flight bookings yet. Search and book flights to domestic and international destinations.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md transition"
          >
            <Plus size={16} />
            <span>Search Flights</span>
          </Link>
        </div>
      ) : filteredFlights.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
          No flights found matching the selected filter.
        </div>
      ) : (
        filteredFlights.map((bkg) => {
          const id = bkg._id || bkg.id || bkg.bookingId;
          const isExpanded = expandedFlightId === id;
          const pnr = bkg.pnr || bkg.airlinePnr || bkg.srdvPnr || bkg.providerBookingId;
          const status = (bkg.status || "confirmed").toLowerCase();
          const isConfirmed = ["confirmed", "completed"].includes(status) || Boolean(bkg.voucherStatus);
          const isPending = !isConfirmed && ["pending", "initiated", "awaiting_payment"].includes(status);
          const totalAmount = bkg.totalPrice || bkg.totalAmount || bkg.amount || 0;
          const airlineName =
            bkg.airline ||
            bkg.airlineName ||
            bkg.segments?.[0]?.Airline?.AirlineName ||
            "Commercial Flight";
          const flightNo =
            bkg.flightNumber ||
            bkg.segments?.[0]?.Airline?.FlightNumber ||
            "";
          const origin =
            bkg.origin ||
            bkg.segments?.[0]?.Origin?.AirportCode ||
            "DEL";
          const destination =
            bkg.destination ||
            bkg.segments?.[bkg.segments.length - 1]?.Destination?.AirportCode ||
            "BOM";
          const passengers = Array.isArray(bkg.passengers) ? bkg.passengers : [];
          const leadPax =
            passengers.find((p) => p.isLeadPax || p.isLead) || passengers[0];
          const leadPaxName = leadPax
            ? `${leadPax.title || leadPax.Title || ""} ${leadPax.firstName || leadPax.FirstName || ""} ${leadPax.lastName || leadPax.LastName || ""}`.trim()
            : "Lead Passenger";

          return (
            <div
              key={id}
              className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden transition hover:border-teal-300"
            >
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                    <Plane size={24} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        {origin} → {destination}
                      </h3>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {airlineName} {flightNo ? `(${flightNo})` : ""}
                      </span>
                      {pnr && (
                        <span className="text-xs font-mono font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          PNR: {pnr}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        bkg.bookingSource === "SRDV_LIVE"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {bkg.sourceLabel || (bkg.isOffer ? "In-House Offer" : bkg.isMaster ? "In-House Inventory" : "Live Supplier")}
                      </span>
                      {getStatusBadge(status)}
                    </div>

                    <p className="text-xs text-slate-400 font-mono">
                      Booking #{id} • {leadPaxName} • {passengers.length || 1} Traveller(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Fare
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900">
                      ₹{Number(totalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {isConfirmed ? (
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenETicket?.(bkg, bkg.isOffer || bkg.bookingType === "offer" ? "INHOUSE_OFFER_FLIGHT" : "LIVE_FLIGHT")}
                        className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                        title="View verified carrier e-ticket & boarding pass"
                      >
                        <Plane size={14} />
                        <span>View E-Ticket</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const bId = bkg._id || bkg.id;
                            const sType = bkg.isOffer || bkg.bookingType === "offer" ? "INHOUSE_OFFER_FLIGHT" : "LIVE_FLIGHT";
                            let ticket;
                            if (sType === "INHOUSE_OFFER_FLIGHT") {
                              ticket = await eticketService.getOfferFlightETicket(bId, bkg);
                            } else {
                              ticket = await eticketService.getLiveFlightETicket(bId, bkg);
                            }
                            const tPnr = ticket.pnr || ticket.customerPnr || bkg.pnr || "TICKET";
                            eticketService.downloadETicketDocument(ticket, `ETicket-${tPnr}.html`);
                            toast.success("E-Ticket document downloaded successfully!");
                          } catch (err) {
                            toast.error(err?.message || "Failed to download e-ticket");
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs bg-teal-800 hover:bg-teal-900 text-white active:scale-95"
                        title="Download official carrier E-Ticket HTML document"
                      >
                        <Download size={14} />
                        <span className="hidden sm:inline">Download E-Ticket</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadInvoice?.({
                            vertical: "flight",
                            bookingId: id,
                            bookingTitle: `${origin} → ${destination}`,
                          })
                        }
                        disabled={downloadingInvoiceId === id}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 ${
                          downloadedInvoiceId === id
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : "bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                        }`}
                        title="Download official airline tax invoice"
                      >
                        {downloadingInvoiceId === id ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-white shrink-0" />
                            <span className="hidden sm:inline">Generating Invoice...</span>
                            <span className="sm:hidden">Invoice...</span>
                          </>
                        ) : downloadedInvoiceId === id ? (
                          <>
                            <Check size={14} className="text-emerald-700 shrink-0" />
                            <span>Downloaded</span>
                          </>
                        ) : (
                          <>
                            <FileText size={14} className="shrink-0" />
                            <span>Download Invoice</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold">
                      <Clock size={13} />
                      <span>Ticket Locked (Payment Pending)</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedFlightId?.(isExpanded ? null : id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                      isExpanded
                        ? "bg-slate-900 text-white"
                        : "bg-teal-50 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    <span>{isExpanded ? "Hide" : "Details"}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Flight Details */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Airline & Flight
                      </span>
                      <p className="font-extrabold text-sm text-slate-900">
                        {airlineName} {flightNo}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Sector / Route
                      </span>
                      <p className="font-extrabold text-sm text-slate-900">
                        {origin} → {destination}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        E-Ticket Numbers
                      </span>
                      <p className="font-mono text-xs font-bold text-teal-800">
                        {bkg.ticketNumber || bkg.eTicketNumber || (isConfirmed ? "Issued by Carrier" : "Pending Payment")}
                      </p>
                    </div>
                  </div>

                  {passengers.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Users size={14} className="text-teal-600" />
                        <span>Passenger Details ({passengers.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {passengers.map((pax, idx) => {
                          const pName = `${pax.title || pax.Title || ""} ${pax.firstName || pax.FirstName || ""} ${pax.lastName || pax.LastName || ""}`.trim();
                          const tNo = pax.ticketNumber || pax.TicketNumber || "";
                          return (
                            <div
                              key={idx}
                              className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-bold text-slate-900">{pName || `Passenger ${idx + 1}`}</p>
                                <p className="text-[11px] text-slate-400">{pax.passengerType || "Adult"}</p>
                              </div>
                              {tNo && (
                                <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                                  Tkt: {tNo}
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
                        onClick={() => handlePayHeldBooking?.(bkg, "flight")}
                        className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <CreditCard size={14} />
                        <span>Complete PayPal Payment</span>
                      </button>
                    )}

                    {isConfirmed && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadInvoice?.({
                              vertical: "flight",
                              bookingId: id,
                              bookingTitle: `${origin} → ${destination}`,
                            })
                          }
                          disabled={downloadingInvoiceId === id}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                            downloadedInvoiceId === id
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-teal-700 hover:bg-teal-800 text-white"
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
                          onClick={() => onRequestCancel?.(bkg, "flight")}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle size={14} />
                          <span>Cancel Flight Booking</span>
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
