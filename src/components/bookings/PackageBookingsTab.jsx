import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  Plus,
  ArrowRight,
  MapPin,
  Plane,
  Hotel,
  ShieldCheck,
  User,
  Users,
  CreditCard,
  XCircle,
  X,
  CheckCircle2,
  FileText,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import packageService from "../../services/packageService";
import { getStatusBadge } from "./bookingUtils";

export default function PackageBookingsTab({
  packageBookings = [],
  setPackageBookings,
  isLoading = false,
  handleOpenETicket,
  handleDownloadInvoice,
  downloadingInvoiceId = null,
  downloadedInvoiceId = null,
}) {
  const [packageFilter, setPackageFilter] = useState("all");
  const [expandedPackageId, setExpandedPackageId] = useState(null);
  const [cancelPackageModalOpen, setCancelPackageModalOpen] = useState(false);
  const [cancellingPackage, setCancellingPackage] = useState(null);
  const [cancelReason, setCancelReason] = useState("Change of travel plans");
  const [isCancellingPackage, setIsCancellingPackage] = useState(false);

  const handleCancelPackage = async (e) => {
    e.preventDefault();
    if (!cancellingPackage?._id) return;
    try {
      setIsCancellingPackage(true);
      await packageService.cancelPackageBooking(cancellingPackage._id, cancelReason);
      toast.success("Package booking cancelled successfully. Inventory released.");

      if (setPackageBookings) {
        setPackageBookings((prev) =>
          prev.map((b) =>
            b._id === cancellingPackage._id ? { ...b, status: "cancelled" } : b
          )
        );
      }

      try {
        const stored = JSON.parse(
          localStorage.getItem("maqam_user_package_bookings") || "[]"
        );
        const updated = stored.map((b) =>
          b._id === cancellingPackage._id ? { ...b, status: "cancelled" } : b
        );
        localStorage.setItem("maqam_user_package_bookings", JSON.stringify(updated));
      } catch {
        // ignore
      }

      setCancelPackageModalOpen(false);
      setCancellingPackage(null);
    } catch (err) {
      console.error("Failed to cancel package booking:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to cancel booking"
      );
    } finally {
      setIsCancellingPackage(false);
    }
  };

  const handlePayPackage = async (booking) => {
    const bookingId = booking._id || booking.id || booking.bookingId;
    if (!bookingId) return;
    try {
      toast.info("Connecting to PayPal secure checkout...");
      const order = await packageService.createPayPalOrder({
        bookingId,
        amount: booking.totalPrice || booking.totalAmount || booking.amount,
        returnUrl: `${window.location.origin}/payment/paypal/success?type=package&bookingId=${bookingId}`,
        cancelUrl: `${window.location.origin}/payment/paypal/cancel?type=package&bookingId=${bookingId}`,
      });
      const redirectUrl =
        order?.redirectUrl ||
        order?.approvalUrl ||
        order?.data?.redirectUrl ||
        order?.data?.approvalUrl ||
        order?.links?.find((l) => l.rel === "approve")?.href;
      if (redirectUrl) {
        sessionStorage.setItem("lastPackageBookingId", String(bookingId));
        sessionStorage.setItem("lastPaymentBookingType", "package");
        window.location.assign(redirectUrl);
      } else {
        throw new Error(
          order?.message || "Could not acquire PayPal checkout link. Please try again."
        );
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to initiate PayPal payment."
      );
    }
  };

  const filteredPackages = packageBookings.filter((bkg) => {
    if (packageFilter === "all") return true;
    const s = (bkg.status || "").toLowerCase();
    if (packageFilter === "confirmed") return s === "confirmed";
    if (packageFilter === "pending")
      return s === "pending" || s === "initiated";
    if (packageFilter === "cancelled") return s === "cancelled";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Status Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {[
            { id: "all", label: "All Bookings", count: packageBookings.length },
            {
              id: "confirmed",
              label: "Confirmed",
              count: packageBookings.filter(
                (b) => (b.status || "").toLowerCase() === "confirmed"
              ).length,
            },
            {
              id: "pending",
              label: "Pending Payment",
              count: packageBookings.filter((b) =>
                ["pending", "initiated"].includes((b.status || "").toLowerCase())
              ).length,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: packageBookings.filter(
                (b) => (b.status || "").toLowerCase() === "cancelled"
              ).length,
            },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setPackageFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                packageFilter === f.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  packageFilter === f.id
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
          to="/package-page"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition"
        >
          <span>Explore More Packages</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Clock size={28} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Loading your package reservations...
          </p>
        </div>
      ) : packageBookings.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Package size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              No Package Bookings Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              You have not booked any customized travel packages yet. Explore our curated Umrah, Hajj & international holiday packages with swappable flights, luxury hotels, and local tours.
            </p>
          </div>
          <Link
            to="/package-page"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Browse Packages Catalog</span>
          </Link>
        </div>
      ) : (
        filteredPackages.map((bkg) => {
          const isExpanded = expandedPackageId === (bkg._id || bkg.id);
          const pkgId =
            bkg.packageId?._id || bkg.packageId || bkg.packageSnapshot?._id;
          const pkgTitle =
            bkg.packageId?.title ||
            bkg.packageSnapshot?.title ||
            "Custom Travel Package";
          const pkgDestination =
            bkg.packageId?.destination ||
            bkg.packageSnapshot?.destination ||
            "International";
          const createdDate = bkg.createdAt
            ? new Date(bkg.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recent";
          const totalAmount = bkg.totalAmount || bkg.totalPrice || bkg.details?.totalPrice || 0;
          const status = (bkg.status || "initiated").toLowerCase();
          const travellers = Array.isArray(bkg.travellers)
            ? bkg.travellers
            : [];
          const leadTraveller =
            travellers.find((t) => t.isLead) || travellers[0];

          const bundledFlight =
            bkg.packageSnapshot?.bundledFlight ||
            bkg.customSelections?.selectedFlightDetails ||
            (bkg.claimedFlightUnits?.[0]?.flightDetails) ||
            {};
          const bundledHotel =
            bkg.packageSnapshot?.bundledHotel ||
            bkg.customSelections?.selectedHotelDetails ||
            (bkg.claimedHotelUnits?.[0]?.hotelDetails) ||
            {};

          return (
            <div
              key={bkg._id || bkg.id}
              className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden transition hover:border-teal-300"
            >
              {/* Card Header */}
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    <Package size={24} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        {pkgTitle}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                        <MapPin size={11} />
                        {pkgDestination}
                      </span>
                      {getStatusBadge(status)}
                    </div>

                    <p className="text-xs text-slate-400 font-mono">
                      Booking ID: #{bkg._id || bkg.id} • Reserved on {createdDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Locked Amount
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      {bkg.quantity || 1} Unit(s) • {travellers.length || bkg.quantity || 1} Guests
                    </span>
                  </div>

                  {((bkg.status || "").toLowerCase() === "confirmed" ||
                    (bkg.paymentStatus || "").toLowerCase() === "completed" ||
                    (bkg.paymentStatus || "").toLowerCase() === "paid") &&
                    (bundledFlight.airline || bkg.claimedFlightUnits?.length > 0) && (
                    <button
                      type="button"
                      onClick={() => handleOpenETicket?.(bkg, "INHOUSE_PACKAGE_FLIGHT")}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                      title="View confirmed flight e-ticket & boarding pass"
                    >
                      <Plane size={14} />
                      <span>Flight E-Ticket</span>
                    </button>
                  )}

                  {((bkg.status || "").toLowerCase() === "confirmed" ||
                    (bkg.paymentStatus || "").toLowerCase() === "completed" ||
                    (bkg.paymentStatus || "").toLowerCase() === "paid") && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadInvoice?.({
                          vertical: "package",
                          bookingId: bkg._id || bkg.id,
                          bookingTitle: pkgTitle,
                        })
                      }
                      disabled={downloadingInvoiceId === (bkg._id || bkg.id)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 ${
                        downloadedInvoiceId === (bkg._id || bkg.id)
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : "bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                      }`}
                      title="Download official tour package tax invoice"
                    >
                      {downloadingInvoiceId === (bkg._id || bkg.id) ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-white shrink-0" />
                          <span className="hidden sm:inline">Generating Invoice...</span>
                          <span className="sm:hidden">Invoice...</span>
                        </>
                      ) : downloadedInvoiceId === (bkg._id || bkg.id) ? (
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
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPackageId(
                        isExpanded ? null : bkg._id || bkg.id
                      )
                    }
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                      isExpanded
                        ? "bg-slate-900 text-white"
                        : "bg-teal-50 text-teal-800 hover:bg-teal-100"
                    }`}
                  >
                    <span>
                      {isExpanded
                        ? "Hide Details"
                        : "View Itinerary & Travellers"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Component Tags Strip */}
              <div className="px-5 sm:px-6 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Plane size={14} className="text-teal-600" />
                  <span>
                    {bundledFlight.airline
                      ? `${bundledFlight.airline} (${bundledFlight.flightNumber || "Direct"})`
                      : "Flight Component Included"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Hotel size={14} className="text-teal-600" />
                  <span>
                    {bundledHotel.hotelName ||
                      "Hotel Accommodation Included"}
                  </span>
                </div>

                {bkg.guideSelected && (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <ShieldCheck size={14} />
                    <span>Private Tour Guide</span>
                  </div>
                )}

                {leadTraveller && (
                  <div className="flex items-center gap-1.5 ml-auto text-slate-500 text-[11px]">
                    <User size={13} />
                    <span>
                      Lead: {leadTraveller.firstName}{" "}
                      {leadTraveller.lastName}
                    </span>
                  </div>
                )}
              </div>

              {/* Expandable Full Breakdown Details */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-slate-100 bg-white space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Flight Card */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                        <Plane size={15} />
                        <span>Bundled Flight Reservation</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {bundledFlight.airline || "Scheduled Flight"}{" "}
                        {bundledFlight.flightNumber
                          ? `(${bundledFlight.flightNumber})`
                          : ""}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Route: {bundledFlight.origin || "Origin"} →{" "}
                        {bundledFlight.destination || pkgDestination}
                      </p>
                      <p className="text-xs text-slate-500">
                        Cabin Class:{" "}
                        {bundledFlight.cabinClass || "Economy Class"}
                      </p>
                    </div>

                    {/* Hotel Card */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                        <Hotel size={15} />
                        <span>Hotel Accommodation</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {bundledHotel.hotelName ||
                          "Standard Included Hotel"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Room Type:{" "}
                        {bundledHotel.roomType ||
                          bkg.customSelections?.roomType ||
                          "Standard Room"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Destination:{" "}
                        {bundledHotel.destination || pkgDestination}
                      </p>
                    </div>
                  </div>

                  {/* Travellers List */}
                  {travellers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Users size={14} className="text-teal-600" />
                        <span>
                          Registered Travellers ({travellers.length})
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {travellers.map((trav, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {trav.title ? `${trav.title} ` : ""}
                                {trav.firstName} {trav.lastName}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {trav.email ||
                                  trav.phone ||
                                  `Guest #${idx + 1}`}
                              </p>
                            </div>
                            {trav.isLead && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-teal-100 text-teal-800 shrink-0">
                                Lead
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    {pkgId && (
                      <Link
                        to={`/package-detail/${pkgId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-teal-700 transition"
                      >
                        <ExternalLink size={13} />
                        <span>View Original Package Itinerary</span>
                      </Link>
                    )}

                    <div className="flex items-center gap-2.5 ml-auto">
                      {/* If status is initiated or pending: allow PayPal payment & Cancellation */}
                      {(status === "initiated" ||
                        status === "pending") && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePayPackage(bkg)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm hover:shadow transition cursor-pointer"
                          >
                            <CreditCard size={14} />
                            <span>Complete PayPal Payment</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCancellingPackage(bkg);
                              setCancelPackageModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition cursor-pointer"
                          >
                            <XCircle size={14} />
                            <span>Cancel Booking</span>
                          </button>
                        </>
                      )}

                      {status === "confirmed" && (
                        <>
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 size={14} />
                            <span>Payment Verified & Confirmed</span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadInvoice?.({
                                vertical: "package",
                                bookingId: bkg._id || bkg.id,
                                bookingTitle: pkgTitle,
                              })
                            }
                            disabled={downloadingInvoiceId === (bkg._id || bkg.id)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                              downloadedInvoiceId === (bkg._id || bkg.id)
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                : "bg-teal-700 hover:bg-teal-800 text-white"
                            }`}
                          >
                            {downloadingInvoiceId === (bkg._id || bkg.id) ? (
                              <>
                                <Loader2 size={14} className="animate-spin text-white" />
                                <span>Generating Invoice...</span>
                              </>
                            ) : downloadedInvoiceId === (bkg._id || bkg.id) ? (
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ─── MODAL: CANCEL PACKAGE BOOKING ─── */}
      {cancelPackageModalOpen && cancellingPackage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-rose-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Cancel Package Booking
                  </h3>
                  <p className="text-xs text-slate-400">
                    Booking #{cancellingPackage._id || cancellingPackage.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancelPackageModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCancelPackage} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel your booking for{" "}
                <strong className="text-slate-900">
                  {cancellingPackage.packageId?.title ||
                    cancellingPackage.packageSnapshot?.title ||
                    "this package"}
                </strong>
                ? Held flight seats and hotel rooms will be released back to
                inventory.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                >
                  <option value="Change of travel plans">
                    Change of travel plans
                  </option>
                  <option value="Found a better package/deal">
                    Found a better package/deal
                  </option>
                  <option value="Date conflict or schedule change">
                    Date conflict or schedule change
                  </option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelPackageModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={isCancellingPackage}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isCancellingPackage && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  <span>
                    {isCancellingPackage
                      ? "Cancelling..."
                      : "Confirm Cancellation"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
