import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../store/authContext";
import {
  FileText,
  Hotel,
  Plane,
  RefreshCw,
  Package,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";
import CommonHeader from "./CommonHeader";
import api from "./stores/api";
import { VisaAPI } from "../configs/api";
import packageService from "../services/packageService";
import flightService from "../services/flightService";
import hotelService from "../services/hotelService";
import bookingService from "../services/bookingService";
import invoiceService from "../services/invoiceService";
import offerService from "../services/offerService";
import paymentService from "../services/paymentService";
import ETicketModal from "./eticket/ETicketModal";
import eticketService, { isPaymentConfirmed } from "../services/eticketService";

import AllBookingsTab from "./bookings/AllBookingsTab";
import VisaBookingsTab from "./bookings/VisaBookingsTab";
import FlightBookingsTab from "./bookings/FlightBookingsTab";
import HotelBookingsTab from "./bookings/HotelBookingsTab";
import PackageBookingsTab from "./bookings/PackageBookingsTab";
import CancelBookingModal from "./bookings/CancelBookingModal";

export default function Bookings({ embedded = false } = {}) {
  const navigate = useNavigate();
  const { isAuthenticated: ctxAuth } = useAuth();
  const reduxAuth = useSelector((state) => state.auth.isAuthenticated);
  const isAuthenticated = ctxAuth || reduxAuth;

  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const resolveOfferTab = () => {
    try {
      const lastData = JSON.parse(sessionStorage.getItem("lastOfferBookingData") || "{}");
      const itemType = (
        lastData.offerSnapshot?.itemType ||
        lastData.offerSnapshot?.type ||
        lastData.offer?.itemType ||
        lastData.itemType ||
        ""
      ).toLowerCase();
      if (itemType === "hotel" || lastData.offerSnapshot?.hotelId || lastData.offer?.hotelId) {
        return "hotel";
      }
    } catch {
      // ignore storage errors
    }
    return "flight";
  };

  const resolveBookingTab = (params) => {
    const typeVal = (params.get("type") || "").toLowerCase();
    const tabVal = (params.get("tab") || "").toLowerCase();

    if (["all", "package", "flight", "hotel"].includes(typeVal)) {
      return typeVal;
    }
    if (["visa", "applications", "my-applications"].includes(typeVal)) {
      return "visa";
    }
    if (typeVal === "offer") {
      return resolveOfferTab();
    }

    if (["visa", "applications", "my-applications"].includes(tabVal)) {
      return "visa";
    }
    if (["all", "package", "flight", "hotel"].includes(tabVal)) {
      return tabVal;
    }
    if (tabVal === "offer") {
      return resolveOfferTab();
    }

    return "all";
  };

  const [activeTab, setActiveTab] = useState(() => resolveBookingTab(searchParams)); // "all" | "package" | "visa" | "flight" | "hotel"
  const [prevSearch, setPrevSearch] = useState(location.search);
  const [allBookingsTotal, setAllBookingsTotal] = useState(0);
  const [allBookingsRefreshKey, setAllBookingsRefreshKey] = useState(0);

  // Status filters
  const initialHotelStatus = searchParams.get("status");
  const [flightFilter, setFlightFilter] = useState("all");
  const [hotelFilter, setHotelFilter] = useState(
    initialHotelStatus && ["confirmed", "pending", "cancelled", "all"].includes(initialHotelStatus.toLowerCase())
      ? initialHotelStatus.toLowerCase()
      : "all"
  );

  if (location.search !== prevSearch) {
    setPrevSearch(location.search);
    const hasExplicitBookingParam =
      searchParams.has("type") ||
      ["visa", "applications", "my-applications", "package", "flight", "hotel", "offer", "all", "my-bookings"].includes(
        (searchParams.get("tab") || "").toLowerCase()
      );
    if (hasExplicitBookingParam) {
      const nextTab = resolveBookingTab(searchParams);
      if (nextTab !== activeTab) {
        setActiveTab(nextTab);
      }
    }
    const s = searchParams.get("status");
    if (s && ["confirmed", "pending", "cancelled", "all"].includes(s.toLowerCase())) {
      setHotelFilter(s.toLowerCase());
      setFlightFilter(s.toLowerCase());
    }
  }

  // If customer returns from PayPal with token, seamlessly route to PaymentSuccessPage to capture
  useEffect(() => {
    const token = searchParams.get("token") || searchParams.get("orderId");
    if (token) {
      navigate(`/payment/paypal/success${location.search}`, { replace: true });
    }
  }, [location.search, navigate, searchParams]);

  // Bookings state
  const [packageBookings, setPackageBookings] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  const [visaGroups, setVisaGroups] = useState([]);
  const [isLoadingVisas, setIsLoadingVisas] = useState(false);

  const [hotelBookings, setHotelBookings] = useState([]);
  const [flightBookings, setFlightBookings] = useState([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [expandedFlightId, setExpandedFlightId] = useState(null);
  const [expandedHotelId, setExpandedHotelId] = useState(null);

  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const [downloadedInvoiceId, setDownloadedInvoiceId] = useState(null);

  // Cancellation modal state for Flight / Hotel
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingItem, setCancellingItem] = useState(null);
  const [cancellingType, setCancellingType] = useState("flight");
  const [isCancellingGeneral, setIsCancellingGeneral] = useState(false);
  const [generalCancelReason, setGeneralCancelReason] = useState("Change of travel plans");

  // E-Ticket Viewer Modal State
  const [eTicketModalOpen, setETicketModalOpen] = useState(false);
  const [activeETicket, setActiveETicket] = useState(null);
  const [isLoadingETicket, setIsLoadingETicket] = useState(false);
  const [eTicketError, setETicketError] = useState(null);

  const handleOpenETicket = async (bkg, serviceType = "LIVE_FLIGHT") => {
    if (!isPaymentConfirmed(bkg)) {
      toast.warning("Payment must be confirmed before your e-ticket can be generated.");
      return;
    }

    setETicketModalOpen(true);
    setIsLoadingETicket(true);
    setETicketError(null);
    setActiveETicket(null);

    try {
      const bookingId = bkg._id || bkg.id || bkg.bookingId;
      let ticketData = null;

      if (serviceType === "INHOUSE_OFFER_FLIGHT" || bkg.isOffer || bkg.bookingType === "offer") {
        ticketData = await eticketService.getOfferFlightETicket(bookingId, bkg);
      } else if (serviceType === "INHOUSE_PACKAGE_FLIGHT" || bkg.bookingType === "package") {
        ticketData = await eticketService.getPackageFlightETicket(bookingId, bkg);
      } else {
        ticketData = await eticketService.getLiveFlightETicket(bookingId, bkg);
      }

      if (!ticketData) {
        throw new Error("Unable to synthesize valid carrier ticket structure.");
      }
      setActiveETicket(ticketData);
    } catch (err) {
      console.error("Failed to load e-ticket:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load verified e-ticket.";
      setETicketError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingETicket(false);
    }
  };

  const handleDownloadInvoice = async ({ vertical = "package", bookingId, masterBookingId }) => {
    const id = bookingId;
    if (!id) {
      toast.error(`Unable to identify booking reference for this ${vertical} reservation.`);
      return;
    }

    try {
      setDownloadingInvoiceId(id);
      const res = await invoiceService.downloadInvoice({
        vertical,
        bookingId: String(id),
        ...(masterBookingId ? { masterBookingId: String(masterBookingId) } : {}),
      });

      setDownloadedInvoiceId(id);
      toast.success(`Official invoice downloaded: ${res.filename}`);
      setTimeout(() => setDownloadedInvoiceId((prev) => (prev === id ? null : prev)), 3500);
    } catch (err) {
      console.error(`${vertical} invoice download failed:`, err);
      const status = err?.response?.status;
      const message = err?.message || "";

      if (status === 401) {
        toast.error("Your session has expired. Please log in again to download your invoice.");
      } else if (status === 403) {
        toast.error("Access denied: You are only authorized to view invoices for your own bookings.");
      } else if (status === 404 || /not found/i.test(message)) {
        toast.warn(`Invoice not found on the server for this ${vertical} booking.`);
      } else {
        toast.error(message || "Failed to download invoice. Please try again later.");
      }
    } finally {
      setDownloadingInvoiceId((prev) => (prev === id ? null : prev));
    }
  };

  const handleDownloadHotelInvoice = (bkg) => {
    const id = bkg._id || bkg.id || bkg.bookingId || bkg.providerBookingId;
    return handleDownloadInvoice({ vertical: "hotel", bookingId: id });
  };

  const fetchPackageBookings = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingPackages(true);
      const list = await packageService.getUserPackageBookings();

      let generalBookings = [];
      try {
        const genRes = await api.get("/api/v1/bookings");
        const genList =
          genRes.data?.data || genRes.data?.bookings || genRes.data || [];
        if (Array.isArray(genList)) {
          generalBookings = genList.filter(
            (b) =>
              (b.bookingType || "").toLowerCase() === "package" ||
              (b.bookingType || "").toLowerCase() === "custom_package" ||
              b.packageId
          );
        }
      } catch {
        // ignore
      }

      let cachedBookings = [];
      try {
        const cached = localStorage.getItem("maqam_user_package_bookings");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) cachedBookings = parsed;
        }
      } catch {
        // ignore
      }

      const combined = [...list, ...cachedBookings, ...generalBookings];
      const seen = new Set();
      const uniqueList = [];
      for (const item of combined) {
        const id = String(item._id || item.id || item.bookingId || "");
        const itemId = String(item.itemId?._id || item.itemId || "");
        if (id && !seen.has(id) && (!itemId || !seen.has(itemId))) {
          if (itemId) seen.add(itemId);
          seen.add(id);
          uniqueList.push(item);
        }
      }

      setPackageBookings(uniqueList);
    } catch (error) {
      console.warn("Error fetching package bookings:", error);
      setPackageBookings([]);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const fetchVisaGroups = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingVisas(true);
      const response = await api.get(VisaAPI.UserGroupsApi);
      const data = response.data?.data || response.data || [];
      setVisaGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching visa applications:", error);
    } finally {
      setIsLoadingVisas(false);
    }
  };

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingHotels(true);

      const [flightRes, hotelRes, masterRes, offerRes] = await Promise.allSettled([
        flightService.getMyFlightBookings(),
        hotelService.getMyHotelBookings(),
        bookingService.getMasterBookings(),
        offerService.getUserOfferBookings(),
      ]);

      const domainFlights =
        flightRes.status === "fulfilled" && Array.isArray(flightRes.value)
          ? flightRes.value.map((f) => ({
              ...f,
              bookingSource: f.srdvTraceId || f.srdvResultIndex || f.segments?.[0]?.Airline?.AirlineName
                ? "SRDV_LIVE"
                : "INHOUSE",
              sourceLabel: f.srdvTraceId ? "Live SRDV Flight" : "In-House Flight",
            }))
          : [];

      const domainHotels =
        hotelRes.status === "fulfilled" && Array.isArray(hotelRes.value)
          ? hotelRes.value.map((h) => ({
              ...h,
              bookingSource: h.srdvBookingId || h.hotelCode ? "SRDV_LIVE" : "INHOUSE",
              sourceLabel: h.srdvBookingId ? "Live SRDV Hotel" : "In-House Hotel",
            }))
          : [];

      const allMaster =
        masterRes.status === "fulfilled" && Array.isArray(masterRes.value)
          ? masterRes.value
          : [];

      const masterFlights = allMaster
        .filter((b) => (b.bookingType || "").toLowerCase() === "flight")
        .map((b) => {
          const d = b.details || {};
          const routeParts =
            typeof d.destination === "string" && d.destination.includes("-")
              ? d.destination.split("-").map((part) => part.trim())
              : [];
          return {
            ...b,
            isMaster: true,
            bookingSource: "MASTER_SYSTEM",
            sourceLabel: "In-House Flight Inventory",
            airline: d.airline || b.flightDetails?.airline || b.itemId?.airline || "Scheduled Flight",
            flightNumber: d.flightNumber || b.flightDetails?.flightNumber || b.itemId?.flightNumber || "",
            origin: d.origin || routeParts[0] || b.flightDetails?.departureCity || b.itemId?.departureCity || "DEL",
            destination: routeParts[1] || d.destination || b.flightDetails?.arrivalCity || b.itemId?.arrivalCity || "JED",
            passengers: Array.isArray(b.passengers)
              ? b.passengers
              : Array.from({ length: Number(d.passengers) || 0 }),
            totalPrice: d.totalPrice ?? b.totalPrice ?? b.amount ?? 0,
            status: b.status || "confirmed",
            pnr: b.flightDetails?.pnr || b.pnr || "CONFIRMED",
          };
        });

      const masterHotels = allMaster
        .filter((b) => (b.bookingType || "").toLowerCase() === "hotel")
        .map((b) => {
          const d = b.details || {};
          return {
            ...b,
            isMaster: true,
            bookingSource: "MASTER_SYSTEM",
            sourceLabel: "In-House Hotel Inventory",
            hotelName: d.hotelName || d.title || b.hotelDetails?.hotelName || b.itemId?.name || d.destination || "Direct Hotel Reservation",
            roomName: d.roomType || b.roomName || b.itemId?.roomType || "Standard Suite",
            destination: d.destination || b.hotelDetails?.city || b.itemId?.city || "Makkah / Madinah",
            guests: Array.isArray(b.guests)
              ? b.guests
              : Array.isArray(b.passengers)
              ? b.passengers
              : Array.from({ length: Number(d.passengers) || 0 }),
            totalPrice: d.totalPrice ?? b.totalPrice ?? b.amount ?? 0,
            status: b.status || "confirmed",
            checkIn: d.departureDate || b.hotelDetails?.checkIn || b.checkIn,
            checkOut: d.returnDate || b.hotelDetails?.checkOut || b.checkOut,
            voucherRef: b.bookingId || b._id,
          };
        });

      const offerBookings =
        offerRes.status === "fulfilled" && Array.isArray(offerRes.value)
          ? offerRes.value
          : [];

      const offerFlights = [];
      const offerHotels = [];

      for (const ob of offerBookings) {
        const itemType = (
          ob.offerSnapshot?.itemType ||
          ob.offer?.itemType ||
          ob.itemType ||
          ""
        ).toLowerCase();
        const isHotelOffer =
          itemType === "hotel" ||
          Boolean(ob.offerSnapshot?.hotelId) ||
          Boolean(ob.offer?.hotelId);

        if (isHotelOffer) {
          offerHotels.push({
            ...ob,
            isOffer: true,
            bookingSource: "INHOUSE_OFFER",
            sourceLabel: "In-House Special Offer",
            bookingType: "offer",
            hotelName:
              ob.offerSnapshot?.title ||
              ob.offer?.title ||
              ob.title ||
              "Special Hotel Offer",
            roomName:
              ob.offerSnapshot?.description ||
              ob.roomName ||
              "Standard Offer Allocation",
            totalPrice: ob.totalAmount || ob.totalPrice || ob.amount || 0,
            status: ob.status || ob.bookingStatus || "confirmed",
            guests: ob.travellers || [],
            checkIn: ob.offerSnapshot?.validFrom || ob.createdAt,
            checkOut: ob.offerSnapshot?.validUntil,
          });
        } else {
          offerFlights.push({
            ...ob,
            isOffer: true,
            bookingSource: "INHOUSE_OFFER",
            sourceLabel: "In-House Special Offer",
            bookingType: "offer",
            airline:
              ob.offerSnapshot?.title ||
              ob.offer?.title ||
              ob.title ||
              "Special Flight Offer",
            flightNumber:
              ob.offerSnapshot?.flightNumber ||
              ob.offer?.flightNumber ||
              ob.flightNumber ||
              "Offer Flight",
            origin:
              ob.offerSnapshot?.origin ||
              ob.offer?.origin ||
              ob.origin ||
              "DEL",
            destination:
              ob.offerSnapshot?.destination ||
              ob.offer?.destination ||
              ob.destination ||
              "JED",
            passengers: ob.travellers || [],
            totalPrice: ob.totalAmount || ob.totalPrice || ob.amount || 0,
            status: ob.status || ob.bookingStatus || "confirmed",
            pnr: ob.pnr || ob.airlinePnr || ob.offerSnapshot?.pnr || "OFFER-PNR",
          });
        }
      }

      // Merge and deduplicate flights
      const mergedFlights = [...domainFlights];
      const seenFlightIds = new Set(
        domainFlights.map((f) => String(f._id || f.id || f.bookingId))
      );
      for (const mf of [...offerFlights, ...masterFlights]) {
        const id = String(mf._id || mf.id || mf.bookingId || "");
        const itemId = String(mf.itemId?._id || mf.itemId || "");
        if (id && !seenFlightIds.has(id) && (!itemId || !seenFlightIds.has(itemId))) {
          seenFlightIds.add(id);
          if (itemId) seenFlightIds.add(itemId);
          mergedFlights.push(mf);
        }
      }

      // Merge and deduplicate hotels
      const mergedHotels = [...domainHotels];
      const seenHotelIds = new Set(
        domainHotels.map((h) => String(h._id || h.id || h.bookingId))
      );
      for (const mh of [...offerHotels, ...masterHotels]) {
        const id = String(mh._id || mh.id || mh.bookingId || "");
        const itemId = String(mh.itemId?._id || mh.itemId || "");
        if (id && !seenHotelIds.has(id) && (!itemId || !seenHotelIds.has(itemId))) {
          seenHotelIds.add(id);
          if (itemId) seenHotelIds.add(itemId);
          mergedHotels.push(mh);
        }
      }

      setFlightBookings(mergedFlights);
      setHotelBookings(mergedHotels);
    } catch (error) {
      console.warn("Bookings not found or error:", error);
      setHotelBookings([]);
      setFlightBookings([]);
    } finally {
      setIsLoadingHotels(false);
    }
  };

  const handlePayHeldBooking = async (bkg, type) => {
    const bookingId = bkg._id || bkg.id || bkg.bookingId;
    if (!bookingId) return;
    try {
      toast.info("Connecting to PayPal secure checkout...");
      const actualType = bkg.isOffer || bkg.bookingType === "offer" ? "offer" : type;
      const orderRes = await paymentService.createPayPalOrder({
        bookingId,
        bookingType: actualType,
        amount: bkg.totalPrice || bkg.totalAmount || bkg.amount,
        returnUrl: `${window.location.origin}/payment/paypal/success?type=${actualType}&bookingId=${bookingId}`,
        cancelUrl: `${window.location.origin}/payment/paypal/cancel?type=${actualType}&bookingId=${bookingId}`,
      });
      if (orderRes?.redirectUrl) {
        if (actualType === "offer") {
          sessionStorage.setItem("lastOfferBookingId", String(bookingId));
          sessionStorage.setItem("lastPaymentBookingType", "offer");
        } else if (type === "flight") {
          sessionStorage.setItem("lastFlightBookingId", String(bookingId));
          sessionStorage.setItem("lastPaymentBookingType", "flight");
        } else if (type === "hotel") {
          sessionStorage.setItem("lastHotelBookingId", String(bookingId));
          sessionStorage.setItem("lastPaymentBookingType", "hotel");
        } else if (type === "package") {
          sessionStorage.setItem("lastPackageBookingId", String(bookingId));
          sessionStorage.setItem("lastPaymentBookingType", "package");
        } else if (type === "visa") {
          sessionStorage.setItem("lastVisaBookingId", String(bookingId));
          sessionStorage.setItem("lastPaymentBookingType", "visa");
        }
        window.location.assign(orderRes.redirectUrl);
      } else {
        throw new Error("Could not acquire PayPal approval URL.");
      }
    } catch (err) {
      console.error("Payment resumption error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to initiate PayPal payment."
      );
    }
  };

  const handleConfirmCancelGeneral = async (e) => {
    e.preventDefault();
    if (!cancellingItem) return;
    const bookingId =
      cancellingItem._id || cancellingItem.id || cancellingItem.bookingId;
    if (!bookingId) return;

    try {
      setIsCancellingGeneral(true);
      if (cancellingType === "master") {
        await bookingService.cancelMasterBooking(bookingId, {
          reason: generalCancelReason,
        });
      } else if (cancellingItem.isOffer || cancellingItem.bookingType === "offer") {
        await offerService.cancelBooking(bookingId, generalCancelReason);
      } else if (cancellingType === "flight") {
        await flightService.cancelFlightBooking(bookingId);
      } else if (cancellingType === "hotel") {
        await hotelService.cancelHotelBooking(bookingId);
      } else {
        await bookingService.cancelMasterBooking(bookingId, {
          reason: generalCancelReason,
        });
      }
      const cancelledLabel =
        cancellingType === "master"
          ? "Booking"
          : cancellingItem.isOffer || cancellingItem.bookingType === "offer"
          ? "Offer booking"
          : cancellingType === "flight"
          ? "Flight booking"
          : "Hotel booking";
      toast.success(`${cancelledLabel} cancelled successfully.`);
      setCancelModalOpen(false);
      setCancellingItem(null);
      setAllBookingsRefreshKey((k) => k + 1);
      fetchBookings();
    } catch (err) {
      console.error("Cancellation error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to cancel booking."
      );
    } finally {
      setIsCancellingGeneral(false);
    }
  };

  const onRequestCancel = (bkg, type) => {
    setCancellingItem(bkg);
    setCancellingType(type);
    setCancelModalOpen(true);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    const loadAll = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      fetchPackageBookings();
      fetchVisaGroups();
      fetchBookings();
    };
    loadAll();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className={embedded ? "font-poppins text-slate-800" : "min-h-screen bg-[#f7f9fc] font-poppins text-slate-800"}>
      {!embedded && <CommonHeader title="My Bookings & Applications" />}

      <main className={embedded ? "w-full pb-8" : "max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28"}>
        {/* Page Top Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Bookings & Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your international visa applications, hotel reservations, and travel documents in real-time.
          </p>
        </div>

        {/* Not Authenticated Warning */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm max-w-lg mx-auto space-y-4 my-10">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Clock size={32} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Sign In to View Applications
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Please log in to your Maqam Travels account to view your active visa application batches, applicant statuses, and hotel bookings.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
            >
              Log In to My Account
            </button>
          </div>
        ) : (
          <>
            {/* Tabs Selector */}
            <div
              role="tablist"
              aria-label="Booking categories"
              className="flex items-center gap-2 sm:gap-2.5 border-b border-slate-200 pb-3 mb-6 overflow-x-auto sm:flex-wrap scrollbar-none"
            >
              <button
                type="button"
                role="tab"
                id="tab-all-bookings"
                aria-selected={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 border ${
                  activeTab === "all"
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm after:content-[''] after:absolute after:inset-x-3 after:-bottom-1 after:h-[3px] after:rounded-full after:bg-teal-700"
                    : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <Layers size={16} />
                <span>All Bookings</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    activeTab === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {allBookingsTotal}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-package-bookings"
                aria-selected={activeTab === "package"}
                onClick={() => setActiveTab("package")}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 border ${
                  activeTab === "package"
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm after:content-[''] after:absolute after:inset-x-3 after:-bottom-1 after:h-[3px] after:rounded-full after:bg-teal-700"
                    : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <Package size={16} />
                <span>Package Bookings</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    activeTab === "package"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {packageBookings.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-visa-bookings"
                aria-selected={activeTab === "visa"}
                onClick={() => setActiveTab("visa")}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 border ${
                  activeTab === "visa"
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm after:content-[''] after:absolute after:inset-x-3 after:-bottom-1 after:h-[3px] after:rounded-full after:bg-teal-700"
                    : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <FileText size={16} />
                <span>Visa Applications</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    activeTab === "visa"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {visaGroups.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-flight-bookings"
                aria-selected={activeTab === "flight"}
                onClick={() => setActiveTab("flight")}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 border ${
                  activeTab === "flight"
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm after:content-[''] after:absolute after:inset-x-3 after:-bottom-1 after:h-[3px] after:rounded-full after:bg-teal-700"
                    : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <Plane size={16} />
                <span>Flight Bookings</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    activeTab === "flight"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {flightBookings.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-hotel-bookings"
                aria-selected={activeTab === "hotel"}
                onClick={() => setActiveTab("hotel")}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 border ${
                  activeTab === "hotel"
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm after:content-[''] after:absolute after:inset-x-3 after:-bottom-1 after:h-[3px] after:rounded-full after:bg-teal-700"
                    : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <Hotel size={16} />
                <span>Hotel Bookings</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    activeTab === "hotel"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {hotelBookings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAllBookingsRefreshKey((k) => k + 1);
                  fetchPackageBookings();
                  fetchVisaGroups();
                  fetchBookings();
                  toast.info("Refreshed all bookings and applications");
                }}
                className="ml-auto p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-slate-50 transition cursor-pointer shrink-0"
                title="Refresh"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* TAB CONTENT 0: ALL BOOKINGS (UNIFIED MASTER API) */}
            {activeTab === "all" && (
              <div role="tabpanel" aria-labelledby="tab-all-bookings">
                <AllBookingsTab
                  refreshKey={allBookingsRefreshKey}
                  onTotalChange={setAllBookingsTotal}
                  onSelectVerticalTab={setActiveTab}
                  handleOpenETicket={handleOpenETicket}
                  handleDownloadInvoice={handleDownloadInvoice}
                  downloadingInvoiceId={downloadingInvoiceId}
                  downloadedInvoiceId={downloadedInvoiceId}
                  handlePayHeldBooking={handlePayHeldBooking}
                  onRequestCancel={onRequestCancel}
                />
              </div>
            )}

            {/* TAB CONTENT 1: VISA APPLICATIONS */}
            {activeTab === "visa" && (
              <div role="tabpanel" aria-labelledby="tab-visa-bookings">
                <VisaBookingsTab
                  visaGroups={visaGroups}
                  isLoadingVisas={isLoadingVisas}
                />
              </div>
            )}

            {/* TAB CONTENT 2: FLIGHT BOOKINGS */}
            {activeTab === "flight" && (
              <div role="tabpanel" aria-labelledby="tab-flight-bookings">
                <FlightBookingsTab
                  flightBookings={flightBookings}
                  isLoading={isLoadingHotels}
                  flightFilter={flightFilter}
                  setFlightFilter={setFlightFilter}
                  expandedFlightId={expandedFlightId}
                  setExpandedFlightId={setExpandedFlightId}
                  handleOpenETicket={handleOpenETicket}
                  handleDownloadInvoice={handleDownloadInvoice}
                  downloadingInvoiceId={downloadingInvoiceId}
                  downloadedInvoiceId={downloadedInvoiceId}
                  handlePayHeldBooking={handlePayHeldBooking}
                  onRequestCancel={onRequestCancel}
                />
              </div>
            )}

            {/* TAB CONTENT 3: HOTEL BOOKINGS */}
            {activeTab === "hotel" && (
              <div role="tabpanel" aria-labelledby="tab-hotel-bookings">
                <HotelBookingsTab
                  hotelBookings={hotelBookings}
                  isLoading={isLoadingHotels}
                  hotelFilter={hotelFilter}
                  setHotelFilter={setHotelFilter}
                  expandedHotelId={expandedHotelId}
                  setExpandedHotelId={setExpandedHotelId}
                  handleDownloadHotelInvoice={handleDownloadHotelInvoice}
                  downloadingInvoiceId={downloadingInvoiceId}
                  downloadedInvoiceId={downloadedInvoiceId}
                  handlePayHeldBooking={handlePayHeldBooking}
                  onRequestCancel={onRequestCancel}
                />
              </div>
            )}

            {/* TAB CONTENT 4: PACKAGE BOOKINGS */}
            {activeTab === "package" && (
              <div role="tabpanel" aria-labelledby="tab-package-bookings">
                <PackageBookingsTab
                  packageBookings={packageBookings}
                  setPackageBookings={setPackageBookings}
                  isLoading={isLoadingPackages}
                  handleOpenETicket={handleOpenETicket}
                  handleDownloadInvoice={handleDownloadInvoice}
                  downloadingInvoiceId={downloadingInvoiceId}
                  downloadedInvoiceId={downloadedInvoiceId}
                />
              </div>
            )}
          </>
        )}

        {/* ─── MODAL: CANCEL FLIGHT / HOTEL BOOKING ─── */}
        <CancelBookingModal
          isOpen={cancelModalOpen && Boolean(cancellingItem)}
          onClose={() => setCancelModalOpen(false)}
          item={cancellingItem}
          type={cancellingType}
          reason={generalCancelReason}
          setReason={setGeneralCancelReason}
          onConfirm={handleConfirmCancelGeneral}
          isCancelling={isCancellingGeneral}
        />

        {/* Flight E-Ticket Modal */}
        <ETicketModal
          isOpen={eTicketModalOpen}
          onClose={() => {
            setETicketModalOpen(false);
            setActiveETicket(null);
            setETicketError(null);
          }}
          ticket={activeETicket}
          loading={isLoadingETicket}
          error={eTicketError}
        />
      </main>
    </div>
  );
}
