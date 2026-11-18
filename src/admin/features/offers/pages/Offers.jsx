import OfferDossierModal from "../components/OfferDossierModal";
import CreateOfferModal from "../components/CreateOfferModal";
import EditOfferModal from "../components/EditOfferModal";
import BookForCustomerModal from "../components/BookForCustomerModal";
import CancelBookingModal from "../components/CancelBookingModal";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  RotateCw,
  Ticket,
  Hotel,
  Wallet,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Eye,
  Power,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Tag,
  AlertCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  Percent,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../../../components/layout/PageHeader";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import InventoryTable from "../../../components/inventory/InventoryTable";
import StockPagination from "../../../components/inventory/StockPagination";
import StatusBadge from "../../../components/common/StatusBadge";
import CrmImageUploadSection from "../../../components/common/CrmImageUploadSection";
import DeleteOfferModal from "../../../components/offers/DeleteOfferModal";

import { offersApi } from "../offersApi";
import { stocksApi } from "../../inventory/stocks/stocksApi";
import { settingsApi } from "../../settings/settingsApi";

const PAGE_SIZE = 10;

const TABS = [
  { key: "offers", label: "Retail Offers" },
  { key: "bookings", label: "Offer Bookings" },
];

const BOOKING_STATUSES = ["all", "pending", "confirmed", "cancelled", "completed"];

const emptyOfferForm = {
  itemType: "flight",
  stock: "",
  unitsPerBooking: "1",
  title: "",
  description: "",
  destination: "",
  sellPrice: "",
  originalPrice: "",
  discountPercentage: "",
  inclusions: "",
  startDate: "",
  endDate: "",
  termsAndConditions: "",
  images: [],
};

const toIso = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const toInputDateTime = (dateVal) => {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

const flightStockLabel = (stock) => {
  const cost = stock.costPerUnit ?? stock.costPerSeat ?? stock.cost ?? stock.price ?? 0;
  const costStr = cost ? ` · Cost: ₹${Number(cost).toLocaleString("en-IN")}` : "";
  return `${stock.airline ?? ""} ${stock.flightNumber ?? ""} · ${stock.origin ?? ""}→${stock.destination ?? ""} · PNR ${stock.pnr ?? "—"} · ${stock.availableUnits ?? 0} seats${costStr}`;
};

const hotelStockLabel = (stock) => {
  const cost = stock.costPerUnit ?? stock.costPerRoom ?? stock.pricePerNight ?? stock.cost ?? 0;
  const costStr = cost ? ` · Cost: ₹${Number(cost).toLocaleString("en-IN")}` : "";
  return `${stock.hotelName ?? "Hotel"} · ${stock.roomType ?? ""} · ${stock.destination ?? ""} · ${stock.availableUnits ?? 0} rooms${costStr}`;
};

const tabButton = (active) =>
  `rounded-xl px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-emerald-700 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Offers() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("offers");

  const markupQuery = useQuery({
    queryKey: ["settings", "markup"],
    queryFn: () => settingsApi.getMarkup(),
    staleTime: 60000,
  });
  const markupSettings = markupQuery.data;

  const getActiveMarkupPercent = (type = form.itemType) => {
    if (type === "flight") {
      return Number(markupSettings?.flightMarkupPercent ?? markupSettings?.markPercent ?? 12.5);
    }
    return Number(markupSettings?.hotelMarkupPercent ?? markupSettings?.markPercent ?? 15.0);
  };

  // Offers tab state
  const [itemType, setItemType] = useState("");
  const [destination, setDestination] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyOfferForm);

  // Offer 360 Details Dossier state (GET /api/v1/crm/offers/:id)
  const [viewTargetId, setViewTargetId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(false);

  // Bookings tab state
  const [bookingStatus, setBookingStatus] = useState("all");
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookTarget, setBookTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // Edit offer state — loads single offer (GET /api/v1/crm/offers/:id,
  // live stock metrics included) and submits PATCH /api/v1/crm/offers/:id.
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(emptyOfferForm);

  // Deletion state
  const [offerToDelete, setOfferToDelete] = useState(null);

  // Book-for-customer state
  const [bookForm, setBookForm] = useState({
    customerId: "",
    quantity: "1",
    method: "bank_transfer",
    referenceNumber: "",
    notes: "",
  });

  const offersQuery = useQuery({
    queryKey: ["offers", { page, itemType, destination, statusFilter }],
    queryFn: () =>
      offersApi.list({
        page,
        limit: PAGE_SIZE,
        itemType,
        destination: destination.trim(),
        isActive: statusFilter,
      }),
    placeholderData: (previous) => previous,
  });

  const bookingsQuery = useQuery({
    queryKey: ["offers", "bookings", { bookingsPage, bookingStatus }],
    queryFn: () =>
      offersApi.listBookings({
        page: bookingsPage,
        limit: PAGE_SIZE,
        status: bookingStatus === "all" ? "" : bookingStatus,
      }),
    placeholderData: (previous) => previous,
  });

  // Stock picker data for create and edit modals (loaded on demand while open).
  const activePickerType = editTarget ? editForm.itemType : form.itemType;
  const stockPickerKey = ["offer-stock-picker", activePickerType];
  const stockPickerQuery = useQuery({
    queryKey: stockPickerKey,
    queryFn: () =>
      activePickerType === "flight"
        ? stocksApi.listFlights({ page: 1, limit: 100, availableOnly: true })
        : stocksApi.listHotels({ page: 1, limit: 100, availableOnly: true }),
    enabled: createOpen || Boolean(editTarget),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [destination]);

  const invalidateOffers = () => {
    queryClient.invalidateQueries({ queryKey: ["offers"] });
  };

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => offersApi.toggleStatus(id),
    onSuccess: (data) => {
      invalidateOffers();
      queryClient.invalidateQueries({ queryKey: ["offers", "detail"] });
      queryClient.invalidateQueries({ queryKey: ["offers", "single"] });
      toast.success(
        data?.isActive !== undefined
          ? `Offer is now ${data.isActive ? "Active (Live in Portal)" : "Paused (Hidden from Portal)"}`
          : "Offer status updated",
      );
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to update offer status"),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => offersApi.create(payload),
    onSuccess: (offer) => {
      invalidateOffers();
      toast.success(
        offer?.title
          ? `Offer "${offer.title}" created successfully`
          : "Retail offer created successfully",
      );
      setCreateOpen(false);
      setForm(emptyOfferForm);
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to create offer"),
  });

  // GET /api/v1/crm/offers/:id — single offer detail for dossier view.
  const viewDetailQuery = useQuery({
    queryKey: ["offers", "detail", viewTargetId],
    queryFn: () => offersApi.getSingle(viewTargetId),
    enabled: Boolean(viewTargetId),
  });

  useEffect(() => {
    setActiveImageIndex(0);
  }, [viewTargetId]);

  const copyOfferId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Offer ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // GET /api/v1/crm/offers/:id — single offer detail with live stock metrics for edit.
  const editDetailQuery = useQuery({
    queryKey: ["offers", "single", editTarget?.id],
    queryFn: () => offersApi.getSingle(editTarget.id),
    enabled: Boolean(editTarget),
  });

  // Prefill from the table row at open time (event handler — no cascading
  // renders). GET /api/v1/crm/offers/:id still runs for the live-stock banner.
  const openEditor = (row) => {
    const stockId =
      typeof row.flightRef?.stock === "object"
        ? (row.flightRef.stock._id ?? row.flightRef.stock.id)
        : (row.flightRef?.stock ||
           (typeof row.hotelRef?.stock === "object"
             ? (row.hotelRef.stock._id ?? row.hotelRef.stock.id)
             : row.hotelRef?.stock) ||
           row.stock ||
           "");

    setEditForm({
      ...emptyOfferForm,
      stock: stockId || "",
      itemType: row.itemType ?? row.type ?? "flight",
      title: row.title ?? "",
      description: row.description ?? "",
      destination: row.destination ?? "",
      sellPrice: String(row.sellPrice ?? ""),
      originalPrice: String(row.originalPrice ?? ""),
      discountPercentage: String(row.discountPercentage ?? ""),
      unitsPerBooking: String(
        row.flightRef?.unitsPerBooking ??
          row.hotelRef?.unitsPerBooking ??
          row.unitsPerBooking ??
          1
      ),
      startDate: row.startDate ? row.startDate.slice(0, 16) : "",
      endDate: row.endDate ? row.endDate.slice(0, 16) : "",
      inclusions: Array.isArray(row.inclusions)
        ? row.inclusions.join("\n")
        : typeof row.inclusions === "string"
          ? row.inclusions
          : "",
      termsAndConditions: row.termsAndConditions ?? "",
      images: Array.isArray(row.images) ? row.images.filter(Boolean) : [],
    });
    setEditTarget(row);
  };

  // If editDetailQuery loads stock info that was not present in the table row, sync it
  useEffect(() => {
    if (!editTarget || !editDetailQuery.data) return;
    const detail = editDetailQuery.data;
    const stockId =
      typeof detail.flightRef?.stock === "object"
        ? (detail.flightRef.stock._id ?? detail.flightRef.stock.id)
        : (detail.flightRef?.stock ||
           (typeof detail.hotelRef?.stock === "object"
             ? (detail.hotelRef.stock._id ?? detail.hotelRef.stock.id)
             : detail.hotelRef?.stock) ||
           detail.stock ||
           "");
    if (stockId && !editForm.stock) {
      setEditForm((prev) => ({ ...prev, stock: stockId }));
    }
  }, [editDetailQuery.data, editTarget]);

  const updateEditField = (field, value) => setEditForm((prev) => ({ ...prev, [field]: value }));

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => offersApi.update(id, payload),
    onSuccess: (offer) => {
      invalidateOffers();
      queryClient.invalidateQueries({ queryKey: ["offers", "single"] });
      queryClient.invalidateQueries({ queryKey: ["offers", "detail"] });
      toast.success(
        offer?.title ? `Offer "${offer.title}" updated successfully` : "Retail offer updated successfully",
      );
      setEditTarget(null);
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to update offer"),
  });

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editTarget) return;
    const refKey = editForm.itemType === "flight" ? "flightRef" : "hotelRef";
    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      destination: editForm.destination.trim(),
      sellPrice: Number(editForm.sellPrice),
      originalPrice: editForm.originalPrice ? Number(editForm.originalPrice) : undefined,
      discountPercentage: editForm.discountPercentage !== "" ? Number(editForm.discountPercentage) : undefined,
      unitsPerBooking: Number(editForm.unitsPerBooking || 1),
      images: Array.isArray(editForm.images) ? editForm.images.filter(Boolean) : [],
      inclusions: editForm.inclusions.split("\n").map((line) => line.trim()).filter(Boolean),
      startDate: toIso(editForm.startDate),
      endDate: toIso(editForm.endDate),
      termsAndConditions: editForm.termsAndConditions.trim(),
    };
    if (editForm.stock) {
      payload[refKey] = {
        stock: editForm.stock,
        unitsPerBooking: Number(editForm.unitsPerBooking || 1),
      };
    }
    updateMutation.mutate({ id: editTarget.id, payload });
  };

  const bookMutation = useMutation({
    mutationFn: (payload) => offersApi.bookForCustomer(payload),
    onSuccess: (data) => {
      invalidateOffers();
      queryClient.invalidateQueries({ queryKey: ["offers", "bookings"] });
      toast.success(
        `Booking confirmed${data?.payment?.transactionId ? ` · ${data.payment.transactionId}` : ""}`,
      );
      setBookTarget(null);
      setBookForm({ customerId: "", quantity: "1", method: "bank_transfer", referenceNumber: "", notes: "" });
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to create booking"),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => offersApi.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", "bookings"] });
      invalidateOffers();
      toast.success("Booking cancelled and stock released");
      setCancelTarget(null);
      setCancelReason("");
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to cancel booking"),
  });

  const offers = offersQuery.data?.offers ?? [];
  const bookings = bookingsQuery.data?.bookings ?? [];

  const stocks = useMemo(
    () => stockPickerQuery.data?.stocks ?? [],
    [stockPickerQuery.data],
  );
  const selectedStock = useMemo(
    () => stocks.find((stock) => (stock._id ?? stock.id) === form.stock),
    [stocks, form.stock],
  );

  // Fetch individual stock details (/api/v1/crm/stocks/flights/:id or /api/v1/stock/flight/:id)
  const selectedStockDetailQuery = useQuery({
    queryKey: ["stocks", form.itemType, "single", form.stock],
    queryFn: () =>
      form.itemType === "flight"
        ? stocksApi.getFlightDetails(form.stock)
        : stocksApi.getHotelDetails(form.stock),
    enabled: Boolean(createOpen && form.stock),
  });

  // Merged stock data combining already present list data and detail payload
  const activeStock = useMemo(() => {
    if (!selectedStock && !selectedStockDetailQuery.data) return null;
    return {
      ...(selectedStock || {}),
      ...(selectedStockDetailQuery.data || {}),
    };
  }, [selectedStock, selectedStockDetailQuery.data]);

  // Extract wholesale cost from stock
  const stockWholesaleCost = useMemo(() => {
    if (!activeStock) return 0;
    const cost =
      activeStock.costPerUnit ??
      activeStock.costPerSeat ??
      activeStock.costPerRoom ??
      activeStock.cost ??
      activeStock.pricePerNight ??
      activeStock.price ??
      0;
    return Number(cost || 0);
  }, [activeStock]);

  // Live real-time margin and gross profit calculator
  const liveMarginCalc = useMemo(() => {
    const sell = Number(form.sellPrice || 0);
    const cost = stockWholesaleCost;
    if (!cost || !sell) return null;
    const grossProfit = sell - cost;
    const marginPct = sell > 0 ? Math.round((grossProfit / sell) * 100) : 0;
    const isLoss = grossProfit < 0;
    return { grossProfit, marginPct, isLoss };
  }, [form.sellPrice, stockWholesaleCost]);

  // When stock is selected from dropdown, populate already present data & stock price
  const handleStockSelect = (stockId) => {
    if (!stockId) {
      updateField("stock", "");
      return;
    }

    const stock = stocks.find((s) => (s._id ?? s.id) === stockId);
    if (!stock) {
      updateField("stock", stockId);
      return;
    }

    const wholesale = Number(
      stock.costPerUnit ??
      stock.costPerSeat ??
      stock.costPerRoom ??
      stock.cost ??
      stock.pricePerNight ??
      stock.price ??
      0
    );

    const isFlight = stock.flightNumber || stock.airline || form.itemType === "flight";
    const markupPct = getActiveMarkupPercent(isFlight ? "flight" : "hotel");
    const suggestedSell = wholesale > 0 ? Math.round(wholesale * (1 + markupPct / 100)) : "";
    const suggestedOriginal = wholesale > 0 ? Math.round(wholesale * (1 + (markupPct + 10) / 100)) : "";

    let title = form.title;
    if (!title.trim() || title === "Direct Flight to Dubai — IndiGo Special") {
      if (form.itemType === "flight") {
        title = `${stock.airline || "Flight"} ${stock.flightNumber ? stock.flightNumber + " " : ""}${stock.origin ? stock.origin + " → " : ""}${stock.destination || ""}`.trim();
      } else {
        title = `${stock.hotelName || "Hotel"} — ${stock.roomType || stock.destination || "Room"}`.trim();
      }
    }

    const startDate = toInputDateTime(stock.departureDate || stock.checkIn);
    const endDate = toInputDateTime(stock.arrivalDate || stock.checkOut);

    setForm((prev) => ({
      ...prev,
      stock: stockId,
      sellPrice: prev.sellPrice && Number(prev.sellPrice) > 0 ? prev.sellPrice : String(suggestedSell || wholesale || ""),
      originalPrice: prev.originalPrice && Number(prev.originalPrice) > 0 ? prev.originalPrice : String(suggestedOriginal || ""),
      destination: prev.destination || stock.destination || "",
      title: title || prev.title,
      startDate: prev.startDate || startDate,
      endDate: prev.endDate || endDate,
    }));

    if (wholesale > 0) {
      toast.info(`Stock selected · Wholesale cost: ${money(wholesale)} · +${markupPct}% Markup applied`);
    }
  };

  const syncStockDetailsToForm = () => {
    if (!activeStock) return;
    const wholesale = stockWholesaleCost;
    const markupPct = getActiveMarkupPercent(form.itemType);
    const suggestedSell = wholesale > 0 ? Math.round(wholesale * (1 + markupPct / 100)) : "";
    const suggestedOriginal = wholesale > 0 ? Math.round(wholesale * (1 + (markupPct + 10) / 100)) : "";

    let title = "";
    if (form.itemType === "flight") {
      title = `${activeStock.airline || "Flight"} ${activeStock.flightNumber ? activeStock.flightNumber + " " : ""}${activeStock.origin ? activeStock.origin + " → " : ""}${activeStock.destination || ""}`.trim();
    } else {
      title = `${activeStock.hotelName || "Hotel"} — ${activeStock.roomType || activeStock.destination || "Room"}`.trim();
    }

    const startDate = toInputDateTime(activeStock.departureDate || activeStock.checkIn);
    const endDate = toInputDateTime(activeStock.arrivalDate || activeStock.checkOut);

    setForm((prev) => ({
      ...prev,
      destination: activeStock.destination || prev.destination,
      title: title || prev.title,
      startDate: startDate || prev.startDate,
      endDate: endDate || prev.endDate,
      sellPrice: suggestedSell ? String(suggestedSell) : (wholesale ? String(wholesale) : prev.sellPrice),
      originalPrice: suggestedOriginal ? String(suggestedOriginal) : prev.originalPrice,
    }));

    toast.success(`Stock details synchronized with +${markupPct}% markup!`);
  };

  // Sync details from detailed fetch if price wasn't available in list
  useEffect(() => {
    if (!createOpen || !form.stock || !selectedStockDetailQuery.data) return;
    const detail = selectedStockDetailQuery.data;
    const cost = Number(
      detail.costPerUnit ??
      detail.costPerSeat ??
      detail.costPerRoom ??
      detail.cost ??
      detail.price ??
      0
    );
    if (cost > 0 && (!form.sellPrice || Number(form.sellPrice) === 0)) {
      const markupPct = getActiveMarkupPercent(form.itemType);
      setForm((prev) => ({
        ...prev,
        sellPrice: prev.sellPrice || String(Math.round(cost * (1 + markupPct / 100))),
        originalPrice: prev.originalPrice || String(Math.round(cost * (1 + (markupPct + 10) / 100))),
        destination: prev.destination || detail.destination || "",
      }));
    }
  }, [selectedStockDetailQuery.data, createOpen, form.stock, markupSettings]);

  // Resolve 360 view offer details (combining list data with live getSingle payload)
  const viewOffer = useMemo(() => {
    if (!viewTargetId) return null;
    const base = offers.find((o) => (o._id ?? o.id) === viewTargetId);
    const detail = viewDetailQuery.data;
    if (!detail) return base ? { ...base, id: base._id ?? base.id } : null;
    return { ...(base || {}), ...detail, id: detail._id ?? detail.id ?? viewTargetId };
  }, [viewTargetId, viewDetailQuery.data, offers]);

  const viewFlightStock = typeof viewOffer?.flightRef?.stock === "object" ? viewOffer.flightRef.stock : null;
  const viewHotelStock = typeof viewOffer?.hotelRef?.stock === "object" ? viewOffer.hotelRef.stock : null;
  const viewStockId =
    viewFlightStock?._id ??
    viewFlightStock?.id ??
    viewHotelStock?._id ??
    viewHotelStock?.id ??
    (typeof viewOffer?.flightRef?.stock === "string" ? viewOffer.flightRef.stock : null) ??
    (typeof viewOffer?.hotelRef?.stock === "string" ? viewOffer.hotelRef.stock : null) ??
    viewOffer?.stock ??
    null;

  const viewStockDetailQuery = useQuery({
    queryKey: ["stocks", viewOffer?.itemType, "single", viewStockId],
    queryFn: () =>
      viewOffer?.itemType === "flight"
        ? stocksApi.getFlightDetails(viewStockId)
        : stocksApi.getHotelDetails(viewStockId),
    enabled: Boolean(viewTargetId && viewStockId && !viewFlightStock && !viewHotelStock),
  });

  const activeViewStock = useMemo(() => {
    return viewFlightStock || viewHotelStock || viewStockDetailQuery.data || null;
  }, [viewFlightStock, viewHotelStock, viewStockDetailQuery.data]);

  // Edit modal stock picker list and selection
  const editStocks = useMemo(
    () => (editTarget ? (stockPickerQuery.data?.stocks ?? []) : []),
    [editTarget, stockPickerQuery.data],
  );

  const selectedEditStock = useMemo(
    () => editStocks.find((stock) => (stock._id ?? stock.id) === editForm.stock),
    [editStocks, editForm.stock],
  );

  const activeEditStock = useMemo(() => {
    if (!editTarget) return null;
    const populatedFromTarget =
      typeof editTarget.flightRef?.stock === "object"
        ? editTarget.flightRef.stock
        : typeof editTarget.hotelRef?.stock === "object"
          ? editTarget.hotelRef.stock
          : null;
    const populatedFromDetail =
      editDetailQuery.data && typeof editDetailQuery.data.flightRef?.stock === "object"
        ? editDetailQuery.data.flightRef.stock
        : editDetailQuery.data && typeof editDetailQuery.data.hotelRef?.stock === "object"
          ? editDetailQuery.data.hotelRef.stock
          : null;
    return selectedEditStock || populatedFromDetail || populatedFromTarget || null;
  }, [editTarget, selectedEditStock, editDetailQuery.data]);

  const editStockWholesaleCost = useMemo(() => {
    const units = Math.max(1, Number(editForm.unitsPerBooking || 1));
    if (activeEditStock) {
      const cost =
        activeEditStock.costPerUnit ??
        activeEditStock.costPerSeat ??
        activeEditStock.costPerRoom ??
        activeEditStock.cost ??
        activeEditStock.pricePerNight ??
        activeEditStock.price ??
        0;
      if (Number(cost) > 0) return Number(cost) * units;
    }
    if (editDetailQuery.data?.costPrice) {
      return Number(editDetailQuery.data.costPrice);
    }
    return 0;
  }, [activeEditStock, editDetailQuery.data, editForm.unitsPerBooking]);

  const editLiveMarginCalc = useMemo(() => {
    const sell = Number(editForm.sellPrice || 0);
    const cost = editStockWholesaleCost;
    if (!cost || !sell) return null;
    const grossProfit = sell - cost;
    const marginPct = sell > 0 ? Math.round((grossProfit / sell) * 100) : 0;
    const isLoss = grossProfit < 0;
    return { grossProfit, marginPct, isLoss };
  }, [editForm.sellPrice, editStockWholesaleCost]);

  const handleEditStockSelect = (stockId) => {
    if (!stockId) {
      updateEditField("stock", "");
      return;
    }
    const stock = editStocks.find((s) => (s._id ?? s.id) === stockId);
    updateEditField("stock", stockId);
    if (stock) {
      const wholesale = Number(
        stock.costPerUnit ??
        stock.costPerSeat ??
        stock.costPerRoom ??
        stock.cost ??
        stock.pricePerNight ??
        stock.price ??
        0
      );
      if (wholesale > 0) {
        toast.info(`Stock selected · Wholesale cost: ${money(wholesale)}`);
      }
    }
  };

  const discountPreview = useMemo(() => {
    const sell = Number(form.sellPrice || 0);
    const original = Number(form.originalPrice || 0);
    if (original > 0 && sell > 0 && sell <= original) {
      return Math.round(((original - sell) / original) * 100);
    }
    return null;
  }, [form.sellPrice, form.originalPrice]);

  const updateField = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const switchItemType = (itemType) => {
    setForm((previous) => ({
      ...emptyOfferForm,
      itemType,
      title: previous.title,
      destination: previous.destination,
      description: previous.description,
      images: previous.images || [],
    }));
  };

  const handleCreate = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.destination.trim()) {
      toast.error("Title and destination are required");
      return;
    }
    if (!form.stock) {
      toast.error("Please select a wholesale stock batch to link");
      return;
    }
    const sellPrice = Number(form.sellPrice || 0);
    if (sellPrice <= 0) {
      toast.error("Enter a valid selling price");
      return;
    }

    const base = {
      title: form.title.trim(),
      description: form.description.trim(),
      destination: form.destination.trim(),
      itemType: form.itemType,
      sellPrice,
      originalPrice: Number(form.originalPrice || 0) || undefined,
      discountPercentage:
        form.discountPercentage !== ""
          ? Number(form.discountPercentage)
          : discountPreview ?? undefined,
      unitsPerBooking: Number(form.unitsPerBooking || 1),
      images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],
      inclusions: form.inclusions
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      startDate: toIso(form.startDate),
      endDate: toIso(form.endDate),
    };

    const refKey = form.itemType === "flight" ? "flightRef" : "hotelRef";
    createMutation.mutate({
      ...base,
      [refKey]: { stock: form.stock, unitsPerBooking: Number(form.unitsPerBooking || 1) },
      ...(form.termsAndConditions.trim()
        ? { termsAndConditions: form.termsAndConditions.trim() }
        : {}),
    });
  };

  const handleBook = (event) => {
    event.preventDefault();
    if (!bookForm.customerId.trim()) {
      toast.error("Customer ID is required");
      return;
    }
    bookMutation.mutate({
      offerId: bookTarget._id ?? bookTarget.id,
      customerId: bookForm.customerId.trim(),
      quantity: Number(bookForm.quantity || 1),
      payment: {
        method: bookForm.method,
        referenceNumber: bookForm.referenceNumber.trim() || undefined,
        notes: bookForm.notes.trim() || undefined,
      },
    });
  };

  const handleCancelBooking = (event) => {
    event.preventDefault();
    cancelMutation.mutate({
      id: cancelTarget._id ?? cancelTarget.id,
      reason: cancelReason.trim(),
    });
  };

  const renderOffersTab = () => (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
        <div className="sm:w-44">
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Type</label>
          <select
            value={itemType}
            onChange={(event) => {
              setItemType(event.target.value);
              setPage(1);
            }}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option value="">All types</option>
            <option value="flight">Flight</option>
            <option value="hotel">Hotel</option>
          </select>
        </div>

        <div className="sm:w-44">
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Status</label>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex-1">
          <Input
            label="Destination"
            placeholder="e.g. Dubai..."
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
        </div>
      </div>

      {offersQuery.isLoading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">
          Loading offers...
        </div>
      ) : offersQuery.isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-10 text-center text-sm font-semibold text-red-600">
          Failed to load offers. Please try again.
        </div>
      ) : (
        <InventoryTable
          rows={offers.map((offer) => ({ ...offer, id: offer._id ?? offer.id }))}
          empty="No retail offers yet. Create one from a wholesale stock batch."
          columns={[
            {
              key: "offer",
              label: "Offer",
              render: (row) => {
                const coverImage = Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : null;
                const imageCount = Array.isArray(row.images) ? row.images.length : 0;
                return (
                  <div
                    onClick={() => setViewTargetId(row.id)}
                    className="flex cursor-pointer items-center gap-3 transition group hover:opacity-85"
                    title="Click to view full retail offer dossier"
                  >
                    {coverImage ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs group-hover:ring-2 group-hover:ring-emerald-500/30">
                        <img
                          src={coverImage}
                          alt={row.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                          loading="lazy"
                        />
                        {imageCount > 1 && (
                          <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/70 px-1 text-[8px] font-bold text-white">
                            +{imageCount - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 group-hover:border-emerald-300 group-hover:bg-emerald-50/50 group-hover:text-emerald-700">
                        {row.itemType === "flight" ? <Ticket size={16} /> : <Hotel size={16} />}
                      </div>
                    )}
                    <div>
                      <b className="text-slate-900 transition group-hover:text-emerald-700">{row.title}</b>
                      <p className="text-xs text-slate-400">
                        {row.destination} · {row.itemType === "flight" ? "Flight" : "Hotel"}
                      </p>
                    </div>
                  </div>
                );
              },
            },
            {
              key: "pricing",
              label: "Retail Price",
              render: (row) => (
                <div>
                  <span className="font-bold text-slate-800">{money(row.sellPrice)}</span>
                  {Number(row.originalPrice) > Number(row.sellPrice) && (
                    <span className="ml-2 text-xs text-slate-400 line-through">
                      {money(row.originalPrice)}
                    </span>
                  )}
                  {Number(row.discountPercentage) > 0 && (
                    <p className="text-xs font-semibold text-emerald-700">
                      {row.discountPercentage}% off
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: "margin",
              label: "Wholesale & Profit",
              render: (row) => {
                const sell = Number(row.sellPrice || 0);
                let cost = Number(row.costPrice || 0);
                if (!cost && row.flightRef?.stock && typeof row.flightRef.stock === "object") {
                  cost = Number(row.flightRef.stock.costPerUnit || row.flightRef.stock.costPerSeat || 0);
                }
                if (!cost && row.hotelRef?.stock && typeof row.hotelRef.stock === "object") {
                  cost = Number(row.hotelRef.stock.pricePerNight || row.hotelRef.stock.costPerRoom || 0);
                }
                let profit = Number(row.grossProfit || 0);
                if (!profit && cost > 0 && sell > 0) {
                  profit = sell - cost;
                }
                const marginPct =
                  Number(row.profitMarginPercentage) ||
                  (cost > 0 && sell > 0 ? Math.round((profit / sell) * 100) : 0);
                return (
                  <div>
                    <span className={`font-semibold ${profit < 0 ? "text-red-600" : "text-emerald-700"}`}>
                      {profit >= 0 ? "+" : ""}{money(profit)} ({marginPct}%)
                    </span>
                    <p className="text-xs text-slate-400">
                      cost: {money(cost)}
                    </p>
                  </div>
                );
              },
            },
            {
              key: "availability",
              label: "Available",
              render: (row) => {
                const units = row.availableBookings ?? row.availableUnits ?? 0;
                return (
                  <span className={Number(units) === 0 ? "font-bold text-red-600" : "font-bold text-emerald-700"}>
                    {units}
                  </span>
                );
              },
            },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <div>
                  <button
                    type="button"
                    title={`Click to ${row.isActive ? "pause" : "activate"} offer`}
                    onClick={() => toggleStatusMutation.mutate(row.id)}
                    disabled={toggleStatusMutation.isPending}
                    className="transition hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <StatusBadge status={row.isActive ? "Active" : "Inactive"} />
                  </button>
                  {!row.isActive && (row.inactivationReason || row.isStockExpired) && (
                    <p className="mt-0.5 text-[10px] text-red-500">
                      {row.inactivationReason || "Stock deadline passed"}
                    </p>
                  )}
                </div>
              ),
            },
          ]}
          renderActions={(row) => (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setViewTargetId(row.id)}
                title="View full retail offer dossier"
              >
                <Eye size={16} />
                View
              </Button>
              <Button variant="secondary" onClick={() => openEditor(row)} title="Edit offer">
                <RotateCw size={16} />
                Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => setBookTarget(row)}
                disabled={Number(row.availableBookings ?? row.availableUnits ?? 0) === 0}
                title="Book for customer"
              >
                <Wallet size={16} />
                Book
              </Button>
              {row.canDelete !== false ? (
                <button
                  type="button"
                  onClick={() => setOfferToDelete(row)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 cursor-pointer"
                  title="Delete unbooked offer"
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      row.cannotDeleteReason
                        ? `Cannot delete offer: ${row.cannotDeleteReason}. You can deactivate it instead.`
                        : "This offer has customer bookings or is bundled in a package and cannot be deleted. You can deactivate it instead."
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-75"
                  title={row.cannotDeleteReason || "Cannot delete offer with bookings or linked packages"}
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        />
      )}

      <StockPagination
        pagination={offersQuery.data?.pagination}
        onPageChange={setPage}
        disabled={offersQuery.isFetching}
      />
    </>
  );

  const renderBookingsTab = () => (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="sm:w-56">
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Status</label>
          <select
            value={bookingStatus}
            onChange={(event) => {
              setBookingStatus(event.target.value);
              setBookingsPage(1);
            }}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {bookingsQuery.isLoading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">
          Loading bookings...
        </div>
      ) : (
        <InventoryTable
          rows={bookings.map((booking) => ({ ...booking, id: booking._id ?? booking.id }))}
          empty="No offer bookings for this status."
          columns={[
            {
              key: "booking",
              label: "Booking",
              render: (row) => (
                <span className="font-mono text-xs font-bold">
                  {(row.bookingReference ?? row.id ?? "").slice(-12)}
                </span>
              ),
            },
            {
              key: "offer",
              label: "Offer",
              render: (row) => row.offer?.title ?? row.offerTitle ?? "—",
            },
            {
              key: "customer",
              label: "Customer",
              render: (row) => {
                const customer = row.customer;
                const name =
                  typeof customer === "object"
                    ? `${customer?.firstName ?? ""} ${customer?.lastName ?? ""}`.trim()
                    : customer;
                return <span>{name || "—"}</span>;
              },
            },
            { key: "quantity", label: "Qty" },
            {
              key: "totalAmount",
              label: "Amount",
              render: (row) => <span className="font-semibold">{money(row.totalAmount)}</span>,
            },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <StatusBadge
                  status={
                    row.status === "pending"
                      ? "Pending"
                      : row.status === "confirmed"
                        ? "Confirmed"
                        : "Cancelled"
                  }
                />
              ),
            },
          ]}
          renderActions={(row) =>
            row.status === "confirmed" || row.status === "pending" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setCancelTarget(row);
                  setCancelReason("");
                }}
              >
                Cancel
              </Button>
            ) : null
          }
        />
      )}

      <StockPagination
        pagination={bookingsQuery.data?.pagination}
        onPageChange={setBookingsPage}
        disabled={bookingsQuery.isFetching}
      />
    </>
  );

  return (
    <div className="space-y-5 animate-slide-in">
      <PageHeader
        title="Retail Offers"
        subtitle="Standalone flight and hotel offers built on wholesale stock, with live margin analytics."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                tab === "offers" ? offersQuery.refetch() : bookingsQuery.refetch()
              }
              loading={tab === "offers" ? offersQuery.isFetching : bookingsQuery.isFetching}
            >
              <RotateCw size={16} />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Create Offer
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-1.5">
        {TABS.map((item) => (
          <button key={item.key} type="button" onClick={() => setTab(item.key)} className={tabButton(tab === item.key)}>
            {item.label}
          </button>
        ))}
      </div>

      {tab === "offers" ? renderOffersTab() : renderBookingsTab()}

      {/* Create Offer Modal */}
      <CreateOfferModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        form={form}
        updateField={updateField}
        switchItemType={switchItemType}
        handleStockSelect={handleStockSelect}
        syncStockDetailsToForm={syncStockDetailsToForm}
        handleCreate={handleCreate}
        createPending={createMutation.isPending}
        stockPickerLoading={stockPickerQuery.isLoading}
        stocks={stocks}
        activeStock={activeStock}
        stockWholesaleCost={stockWholesaleCost}
        liveMarginCalc={liveMarginCalc}
        discountPreview={discountPreview}
        getActiveMarkupPercent={getActiveMarkupPercent}
        flightStockLabel={flightStockLabel}
        hotelStockLabel={hotelStockLabel}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
        money={money}
        selectedStockDetailFetching={selectedStockDetailQuery.isFetching}
      />

      {/* Book for Customer Modal */}
      <BookForCustomerModal
        open={Boolean(bookTarget)}
        onClose={() => setBookTarget(null)}
        bookTarget={bookTarget}
        bookForm={bookForm}
        setBookForm={setBookForm}
        onSubmit={handleBook}
        isPending={bookMutation.isPending}
        money={money}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onSubmit={handleCancelBooking}
        isPending={cancelMutation.isPending}
      />

      {/* Offer 360 Details Dossier Modal — GET /api/v1/crm/offers/:id */}
      <OfferDossierModal
        isOpen={Boolean(viewTargetId)}
        onClose={() => setViewTargetId(null)}
        viewOffer={viewOffer}
        isLoading={viewDetailQuery.isLoading}
        onToggleStatus={(id) => toggleStatusMutation.mutate(id)}
        isTogglingStatus={toggleStatusMutation.isPending}
        onEdit={(target) => {
          setViewTargetId(null);
          openEditor(target);
        }}
      />

      {/* Edit Offer Modal — GET /api/v1/crm/offers/:id to load, PATCH to submit */}
      <EditOfferModal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        editTarget={editTarget}
        editForm={editForm}
        updateEditField={updateEditField}
        submitEdit={submitEdit}
        updatePending={updateMutation.isPending}
        editDetailQuery={editDetailQuery}
        stockPickerQuery={stockPickerQuery}
        editStocks={editStocks}
        handleEditStockSelect={handleEditStockSelect}
        activeEditStock={activeEditStock}
        editStockWholesaleCost={editStockWholesaleCost}
        editLiveMarginCalc={editLiveMarginCalc}
        getActiveMarkupPercent={getActiveMarkupPercent}
        flightStockLabel={flightStockLabel}
        hotelStockLabel={hotelStockLabel}
        money={money}
      />

      {/* Delete Retail Offer Modal */}
      <DeleteOfferModal
        open={Boolean(offerToDelete)}
        offer={offerToDelete}
        onClose={() => setOfferToDelete(null)}
        onDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ["offers"] });
        }}
      />
    </div>
  );
}
