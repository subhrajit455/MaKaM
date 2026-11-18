import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  Hotel,
  Package,
  Tag,
  Calendar,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard,
  XCircle,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import bookingService from "../../services/bookingService";
import {
  getStatusBadge,
  formatBookingCurrency,
  formatBookingDate,
} from "./bookingUtils";

const STATUS_FILTERS = [
  { id: "all", label: "All Bookings" },
  { id: "confirmed", label: "Confirmed" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "failed", label: "Failed" },
];

const VERTICAL_META = {
  flight: {
    label: "Flight",
    icon: Plane,
    iconBg: "bg-teal-50 text-teal-700",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    borderHover: "hover:border-teal-300",
    targetTab: "flight",
  },
  hotel: {
    label: "Hotel",
    icon: Hotel,
    iconBg: "bg-orange-50 text-orange-600",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    borderHover: "hover:border-orange-300",
    targetTab: "hotel",
  },
  package: {
    label: "Package",
    icon: Package,
    iconBg: "bg-emerald-50 text-emerald-700",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    borderHover: "hover:border-emerald-300",
    targetTab: "package",
  },
  offer: {
    label: "Special Offer",
    icon: Tag,
    iconBg: "bg-purple-50 text-purple-700",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    borderHover: "hover:border-purple-300",
    targetTab: null,
  },
};

function resolveId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

function resolveBookingPresentation(booking) {
  const type = String(booking.bookingType || "").toLowerCase();
  const details = booking.details || {};
  const itemType = String(details.itemType || "").toLowerCase();

  const routeText =
    details.origin && details.destination
      ? `${details.origin} → ${details.destination}`
      : details.destination || "";

  let title = details.title || "";
  if (!title) {
    if (type === "flight") {
      title = routeText || details.airline || "Flight Booking";
    } else if (type === "hotel") {
      title = details.hotelName || details.destination || "Hotel Reservation";
    } else if (type === "package") {
      title = details.destination || "Tour Package";
    } else {
      title = routeText || details.hotelName || "Travel Booking";
    }
  }

  const subtitleParts = [];
  if (type === "offer" && itemType) {
    subtitleParts.push(
      itemType.charAt(0).toUpperCase() + itemType.slice(1) + " Offer"
    );
  }
  if (details.airline) {
    subtitleParts.push(
      details.flightNumber
        ? `${details.airline} (${details.flightNumber})`
        : details.airline
    );
  } else if (details.flightNumber) {
    subtitleParts.push(`Flight ${details.flightNumber}`);
  }
  if (details.hotelName && details.hotelName !== title) {
    subtitleParts.push(details.hotelName);
  }
  if (details.roomType) {
    subtitleParts.push(details.roomType);
  }
  if (routeText && routeText !== title) {
    subtitleParts.push(routeText);
  }

  return {
    type,
    itemType,
    title,
    subtitle: subtitleParts.join(" • "),
    routeText,
  };
}

export default function AllBookingsTab({
  refreshKey = 0,
  onTotalChange,
  onSelectVerticalTab,
  handleOpenETicket,
  handleDownloadInvoice,
  downloadingInvoiceId = null,
  downloadedInvoiceId = null,
  handlePayHeldBooking,
  onRequestCancel,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadBookings = useCallback(
    async (isCancelled = () => false) => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const res = await bookingService.getBookingsPage({
          status: statusFilter,
          page,
          limit,
        });
        if (isCancelled()) return;
        setBookings(res.bookings);
        setMeta(res.meta);
        if (statusFilter === "all") {
          onTotalChange?.(res.meta.total);
        }
      } catch (err) {
        if (isCancelled()) return;
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;
        if (status === 401) {
          setErrorMsg(
            serverMsg || "Your session has expired. Please log in again to view your bookings."
          );
        } else {
          setErrorMsg(
            serverMsg || err?.message || "Unable to load your bookings right now."
          );
        }
        setBookings([]);
      } finally {
        if (!isCancelled()) {
          setIsLoading(false);
        }
      }
    },
    [statusFilter, page, limit, onTotalChange]
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      await loadBookings(() => cancelled);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [loadBookings, refreshKey]);

  const handleStatusChange = (nextStatus) => {
    setStatusFilter(nextStatus);
    setPage(1);
    setExpandedId(null);
  };

  const totalPages = meta.totalPages || 0;
  const totalCount = meta.total || 0;
  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="space-y-4">
      {/* Server-side Lifecycle Status Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleStatusChange(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === f.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{f.label}</span>
              {statusFilter === f.id && !isLoading && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20 text-white">
                  {totalCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <span className="text-xs font-medium text-slate-500">
          {totalCount > 0
            ? `Showing ${startItem}–${endItem} of ${totalCount}`
            : "Unified Booking History"}
        </span>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Clock size={28} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Loading your bookings...
          </p>
        </div>
      ) : errorMsg ? (
        <div className="rounded-3xl bg-white border border-rose-200 p-8 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Could Not Load Bookings
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {errorMsg}
          </p>
          <button
            type="button"
            onClick={() => loadBookings()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Calendar size={30} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {statusFilter === "all"
                ? "No Bookings Found"
                : `No ${statusFilter} bookings found`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {statusFilter === "all"
                ? "You haven't made any flight, hotel, package, or special offer bookings yet."
                : `You do not have any bookings with status "${statusFilter}". Try switching the filter to view all bookings.`}
            </p>
          </div>
          {statusFilter !== "all" ? (
            <button
              type="button"
              onClick={() => handleStatusChange("all")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Show All Bookings
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition"
              >
                <span>Search Flights</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                to="/package-page"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition"
              >
                <span>Browse Packages</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3.5">
            {bookings.map((bkg) => {
              const masterId = String(bkg._id || bkg.id || "");
              const domainItemId = resolveId(bkg.itemId) || masterId;
              const paymentRefId = resolveId(bkg.paymentId);
              const status = String(bkg.status || "pending").toLowerCase();
              const isExpanded = expandedId === masterId;
              const details = bkg.details || {};
              const { type, itemType, title, subtitle } =
                resolveBookingPresentation(bkg);
              const vMeta = VERTICAL_META[type] || VERTICAL_META.package;
              const VerticalIcon = vMeta.icon;

              const departureStr = formatBookingDate(details.departureDate);
              const returnStr = formatBookingDate(details.returnDate);
              const createdStr = formatBookingDate(bkg.createdAt);
              const cancelledStr = formatBookingDate(bkg.cancelledAt, true);
              const passengersCount = details.passengers;
              const totalPrice = details.totalPrice;
              const currency = details.currency || "INR";

              const isConfirmedOrCompleted =
                status === "confirmed" || status === "completed";
              const isPending = status === "pending";
              const isFlightLike =
                type === "flight" || (type === "offer" && itemType === "flight");
              const invoiceVertical =
                type === "offer" && itemType ? itemType : type || "package";
              const targetVerticalTab =
                type === "offer"
                  ? itemType === "hotel"
                    ? "hotel"
                    : "flight"
                  : vMeta.targetTab;

              const remarksList = Array.isArray(bkg.remarks) ? bkg.remarks : [];

              return (
                <article
                  key={masterId}
                  className={`rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden transition ${vMeta.borderHover}`}
                >
                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Vertical Icon & Summary */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl ${vMeta.iconBg} flex items-center justify-center shadow-2xs shrink-0`}
                      >
                        <VerticalIcon size={23} />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 break-words">
                            {title}
                          </h3>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${vMeta.badgeClass}`}
                          >
                            {vMeta.label}
                          </span>
                          {getStatusBadge(status)}
                        </div>

                        {subtitle && (
                          <p className="text-xs font-semibold text-slate-600">
                            {subtitle}
                          </p>
                        )}

                        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-slate-500">
                          {departureStr && (
                            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                              <Calendar size={12} className="text-teal-600" />
                              <span>
                                {departureStr}
                                {returnStr ? ` → ${returnStr}` : ""}
                              </span>
                            </span>
                          )}
                          {Number(passengersCount) > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Users size={12} className="text-slate-400" />
                              <span>
                                {passengersCount} Traveller
                                {Number(passengersCount) > 1 ? "s" : ""}
                              </span>
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-slate-400">
                            #{masterId.slice(-8).toUpperCase()}
                            {createdStr ? ` • Booked ${createdStr}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-5 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0">
                      {totalPrice !== undefined && totalPrice !== null && (
                        <div className="text-left lg:text-right">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Total Amount
                          </span>
                          <span className="text-lg sm:text-xl font-black text-slate-900">
                            {formatBookingCurrency(totalPrice, currency)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {isPending && Number(totalPrice) > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handlePayHeldBooking?.(
                                {
                                  ...bkg,
                                  _id: domainItemId,
                                  totalPrice,
                                },
                                itemType || type || "flight"
                              )
                            }
                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition cursor-pointer active:scale-95"
                          >
                            <CreditCard size={14} />
                            <span>Pay Now</span>
                          </button>
                        )}

                        {isConfirmedOrCompleted && isFlightLike && (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenETicket?.(
                                {
                                  ...bkg,
                                  _id: domainItemId,
                                  masterBookingId: masterId,
                                },
                                type === "offer"
                                  ? "INHOUSE_OFFER_FLIGHT"
                                  : "LIVE_FLIGHT"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer active:scale-95"
                          >
                            <Plane size={14} />
                            <span>View E-Ticket</span>
                          </button>
                        )}

                        {isConfirmedOrCompleted && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadInvoice?.({
                                vertical: invoiceVertical,
                                bookingId: domainItemId,
                                masterBookingId: masterId,
                                bookingTitle: title,
                              })
                            }
                            disabled={downloadingInvoiceId === domainItemId}
                            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 ${
                              downloadedInvoiceId === domainItemId
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                : "bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            }`}
                          >
                            {downloadingInvoiceId === domainItemId ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Invoice...</span>
                              </>
                            ) : downloadedInvoiceId === domainItemId ? (
                              <>
                                <Check size={14} />
                                <span>Downloaded</span>
                              </>
                            ) : (
                              <>
                                <FileText size={14} />
                                <span>Invoice</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : masterId)
                          }
                          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                            isExpanded
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span>{isExpanded ? "Hide" : "Details"}</span>
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded MasterBooking Details */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/60 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Master Booking ID
                          </span>
                          <p className="font-mono text-xs font-bold text-slate-800 break-all mt-0.5">
                            {masterId}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Service Record ID
                          </span>
                          <p className="font-mono text-xs font-bold text-slate-800 break-all mt-0.5">
                            {domainItemId || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Payment Reference
                          </span>
                          <p className="font-mono text-xs font-bold text-teal-800 break-all mt-0.5">
                            {paymentRefId || "Not Linked Yet"}
                          </p>
                        </div>
                      </div>

                      {/* Cancellation / Refund Info */}
                      {(status === "cancelled" ||
                        bkg.cancellationReason ||
                        bkg.refundAmount !== undefined) && (
                        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1">
                          <p className="font-bold text-rose-800">
                            Cancellation Summary
                            {cancelledStr ? ` • ${cancelledStr}` : ""}
                          </p>
                          {bkg.cancellationReason && (
                            <p className="text-rose-700">
                              Reason: {bkg.cancellationReason}
                            </p>
                          )}
                          {bkg.refundAmount !== undefined &&
                            bkg.refundAmount !== null && (
                              <p className="font-bold text-rose-900">
                                Refund Amount:{" "}
                                {formatBookingCurrency(
                                  bkg.refundAmount,
                                  currency
                                )}
                              </p>
                            )}
                        </div>
                      )}

                      {/* Operational Timeline Remarks */}
                      {remarksList.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <MessageSquare size={13} className="text-teal-600" />
                            <span>Booking Updates ({remarksList.length})</span>
                          </h4>
                          <div className="space-y-1.5">
                            {remarksList.map((remark, idx) => (
                              <div
                                key={remark._id || idx}
                                className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-start justify-between gap-3"
                              >
                                <p className="text-slate-700 font-medium">
                                  {remark.text}
                                </p>
                                {remark.createdAt && (
                                  <span className="text-[11px] text-slate-400 shrink-0">
                                    {formatBookingDate(remark.createdAt, true)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-200">
                        {targetVerticalTab && onSelectVerticalTab ? (
                          <button
                            type="button"
                            onClick={() => onSelectVerticalTab(targetVerticalTab)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition cursor-pointer"
                          >
                            <span>Open in {vMeta.label} Bookings Tab</span>
                            <ArrowRight size={13} />
                          </button>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-2.5 ml-auto">
                          {(isPending || status === "confirmed") && (
                            <button
                              type="button"
                              onClick={() => onRequestCancel?.(bkg, "master")}
                              className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle size={14} />
                              <span>Cancel Booking</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <p className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-800">{page}</span> of{" "}
                <span className="font-bold text-slate-800">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
