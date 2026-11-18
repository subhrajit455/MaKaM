import { useEffect, useState, useTransition } from "react";
import { Link } from "react-router-dom";
import {
  UsersRound,
  CalendarDays,
  WalletCards,
  Boxes,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  PlaneTakeoff,
  Hotel,
  ChevronDown,
  ChevronUp,
  Activity,
  Package,
  Layers,
  AlertCircle,
  Tag,
} from "lucide-react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { crmApi } from "../../crm/crmApi";

const statusToneMap = {
  new: { tone: "amber", bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  contacted: { tone: "blue", bg: "bg-blue-500", text: "text-blue-700 dark:text-blue-300", badge: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  qualified: { tone: "purple", bg: "bg-purple-500", text: "text-purple-700 dark:text-purple-300", badge: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  proposal: { tone: "indigo", bg: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-300", badge: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
  proposal_sent: { tone: "indigo", bg: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-300", badge: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
  negotiation: { tone: "sky", bg: "bg-sky-500", text: "text-sky-700 dark:text-sky-300", badge: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800" },
  negotiating: { tone: "sky", bg: "bg-sky-500", text: "text-sky-700 dark:text-sky-300", badge: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800" },
  won: { tone: "emerald", bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  converted: { tone: "emerald", bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  convertedBooking: { tone: "emerald", bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  lost: { tone: "rose", bg: "bg-rose-500", text: "text-rose-700 dark:text-rose-300", badge: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
  nurture: { tone: "slate", bg: "bg-slate-400", text: "text-slate-600 dark:text-slate-400", badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
};

const categoryIconMap = {
  packages: Package,
  offers: Tag,
  flights: PlaneTakeoff,
  hotels: Hotel,
};

const categoryColorMap = {
  packages: "bg-blue-600",
  offers: "bg-purple-600",
  flights: "bg-teal-600",
  hotels: "bg-emerald-600",
};

const formatLabel = (key = "") =>
  String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

function formatINR(amount) {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return "₹0";
  if (Math.abs(num) >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (Math.abs(num) >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function CrmOverview() {
  const [pipeline, setPipeline] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [finance, setFinance] = useState(null);
  const [stocks, setStocks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [lastSynced, setLastSynced] = useState(() => new Date());
  const [, startTransition] = useTransition();

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setErrorNotice("");

      const [pipeRes, bookRes, finRes, stockRes] = await Promise.allSettled([
        crmApi.pipelineOverview(),
        crmApi.bookingsSummary(),
        crmApi.financeOverview(),
        crmApi.stocksOverview(),
      ]);

      startTransition(() => {
        if (pipeRes.status === "fulfilled" && pipeRes.value) {
          setPipeline(pipeRes.value);
        }
        if (bookRes.status === "fulfilled" && bookRes.value) {
          setBookings(bookRes.value);
        }
        if (finRes.status === "fulfilled" && finRes.value) {
          setFinance(finRes.value);
        }
        if (stockRes.status === "fulfilled" && stockRes.value) {
          setStocks(stockRes.value);
        }
        setLastSynced(new Date());
      });
    } catch (err) {
      setErrorNotice(err?.message || "Failed to refresh CRM overview dimensions.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchInitial() {
      try {
        const [pipeRes, bookRes, finRes, stockRes] = await Promise.allSettled([
          crmApi.pipelineOverview(),
          crmApi.bookingsSummary(),
          crmApi.financeOverview(),
          crmApi.stocksOverview(),
        ]);

        if (cancelled) return;

        startTransition(() => {
          if (pipeRes.status === "fulfilled" && pipeRes.value) {
            setPipeline(pipeRes.value);
          }
          if (bookRes.status === "fulfilled" && bookRes.value) {
            setBookings(bookRes.value);
          }
          if (finRes.status === "fulfilled" && finRes.value) {
            setFinance(finRes.value);
          }
          if (stockRes.status === "fulfilled" && stockRes.value) {
            setStocks(stockRes.value);
          }
          setLastSynced(new Date());
        });
      } catch (err) {
        if (!cancelled) {
          setErrorNotice(err?.message || "Failed to load CRM overview data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <LoadingSpinner text="Loading CRM operations overview & live intelligence…" />
      </div>
    );
  }

  // Key performance indicators
  const totalLeads = Number(pipeline?.totalLeads ?? 0);
  const newLeads = Number(pipeline?.byStatus?.new ?? 0);
  const wonLeads = Number(pipeline?.byStatus?.won ?? 0);
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0.0";

  const totalBookings = Number(bookings?.totalBookings ?? 0);
  const pendingBookings = Number(
    bookings?.pendingActions?.awaitingOperations ?? bookings?.byStatus?.pending ?? 0
  );
  const confirmedBookings = Number(bookings?.byStatus?.confirmed ?? 0);

  const grossRevenue = Number(
    finance?.grossRevenue ?? bookings?.financialSummary?.totalGrossRevenue ?? 0
  );
  const pendingPayment = Number(finance?.pendingPayment ?? 0);

  const availableFlightSeats = Number(stocks?.flights?.availableSeats ?? 0);
  const totalFlightSeats = Number(stocks?.flights?.totalSeats ?? 0);
  const availableHotelRooms = Number(stocks?.hotels?.availableRooms ?? 0);
  const totalHotelRooms = Number(stocks?.hotels?.totalRooms ?? 0);
  const totalAvailableStock = availableFlightSeats + availableHotelRooms;

  const formattedTime = lastSynced.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section
      className="dashboard-card overflow-hidden p-4 sm:p-6 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900/90"
      aria-labelledby="crm-overview-heading"
    >
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Activity size={16} />
            </span>
            <h2 id="crm-overview-heading" className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              CRM Overview & Operations Pulse
            </h2>
            <span className="hidden sm:inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              Live
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time pipeline flow, bookings status, wholesale capacity and financial telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:inline">
            Synced {formattedTime}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-emerald-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Refresh CRM intelligence data"
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin text-emerald-600" : "text-slate-500 dark:text-slate-400"}
            />
            <span>{refreshing ? "Refreshing…" : "Sync Live Data"}</span>
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand CRM overview" : "Collapse CRM overview"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {errorNotice && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {collapsed ? (
        <div className="py-4 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>CRM Operations Pulse is collapsed. Expand above to inspect live pipeline, capacity, and telemetry.</span>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="font-bold text-emerald-700 hover:underline dark:text-emerald-400 ml-2"
          >
            Expand
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {/* 4 Core Executive KPI Cards */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {/* Sales Leads */}
            <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-emerald-600">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Sales Leads
                  </span>
                  <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <UsersRound size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {totalLeads}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    <strong className="text-emerald-700 dark:text-emerald-400">{newLeads} new</strong> · {wonLeads} won
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{conversionRate}% win</span>
                </div>
              </div>
              <Link
                to="/admin/leads"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <span>Open Leads Desk</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Bookings Queue */}
            <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:border-blue-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-blue-600">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Bookings Queue
                  </span>
                  <span className="rounded-xl bg-blue-50 p-2 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                    <CalendarDays size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {totalBookings}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    <strong className="text-blue-700 dark:text-blue-400">{confirmedBookings} confirmed</strong>
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{pendingBookings} awaiting ops</span>
                </div>
              </div>
              <Link
                to="/admin/bookings"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span>Operate Bookings</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Total Revenue */}
            <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:border-purple-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-purple-600">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Total Revenue
                  </span>
                  <span className="rounded-xl bg-purple-50 p-2 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                    <WalletCards size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {formatINR(grossRevenue)}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Pending: <strong className="text-slate-700 dark:text-slate-200">{formatINR(pendingPayment)}</strong>
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active INR</span>
                </div>
              </div>
              <Link
                to="/admin/finance"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-700 transition hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
              >
                <span>Finance Ledger</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Inventory Stock */}
            <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:border-amber-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-amber-600">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Stock on Hand
                  </span>
                  <span className="rounded-xl bg-amber-50 p-2 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                    <Boxes size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {totalAvailableStock}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>{availableFlightSeats} seats free</span>
                  <span>{availableHotelRooms} rooms free</span>
                </div>
              </div>
              <Link
                to="/admin/inventory/hotels/stock"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-700 transition hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
              >
                <span>Review Allotments</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Sales Pipeline & Funnel Breakdown */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales Pipeline Stages</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {totalLeads} total leads
                </span>
              </div>
              <Link
                to="/admin/pipeline"
                className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                View Pipeline Board →
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
              {Object.entries(pipeline?.byStatus ?? {}).map(([stageKey, count]) => {
                const num = Number(count || 0);
                const percentage = totalLeads > 0 ? ((num / totalLeads) * 100).toFixed(0) : 0;
                const config = statusToneMap[stageKey] || statusToneMap.nurture;

                return (
                  <div
                    key={stageKey}
                    className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-slate-200 hover:shadow-2xs dark:border-slate-700/60 dark:bg-slate-900/40 dark:hover:border-slate-600"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                          {formatLabel(stageKey)}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${config.badge}`}
                        >
                          {num}
                        </span>
                      </div>
                      <div className="mt-2 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        {num}
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${config.bg}`}
                          style={{ width: `${Math.min(100, Math.max(percentage, 2))}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        {percentage}% of pipeline
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two Column Grid: Operations Breakdown + Wholesale Capacity */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Bookings Distribution */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/80">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bookings by Category</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {totalBookings} Total
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {Object.entries(bookings?.byType ?? { packages: 0, offers: 0, flights: 0, hotels: 0 }).map(
                    ([typeKey, count]) => {
                      const countNum = Number(count || 0);
                      const percent = totalBookings > 0 ? ((countNum / totalBookings) * 100).toFixed(0) : 0;
                      const Icon = categoryIconMap[typeKey] || Package;
                      const barColor = categoryColorMap[typeKey] || "bg-blue-600";

                      return (
                        <div key={typeKey} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                              <Icon size={13} className="text-slate-400 dark:text-slate-500" />
                              {formatLabel(typeKey)}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {countNum}{" "}
                              <span className="text-[11px] font-normal text-slate-400">({percent}%)</span>
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                              style={{ width: `${Math.min(100, Math.max(percent, countNum > 0 ? 3 : 0))}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
                <Link
                  to="/admin/bookings"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 dark:text-blue-400"
                >
                  Manage All Bookings <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Wholesale Inventory Capacity */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/80">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Boxes size={16} className="text-emerald-700 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Wholesale Stock Status</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Contracts
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {/* Flights Batch */}
                  <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:border-slate-200 dark:border-slate-700/60 dark:bg-slate-900/40">
                    <div>
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 text-xs font-bold">
                          <PlaneTakeoff size={15} className="text-blue-600 dark:text-blue-400" />
                          Flights Inventory
                        </span>
                        <span className="rounded-md bg-blue-100/70 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          {stocks?.flights?.totalBatches ?? 0} batches
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                        {availableFlightSeats}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Seats Available / {totalFlightSeats} Total
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        Held: {stocks?.flights?.heldSeats ?? 0}
                      </span>
                      <Link
                        to="/admin/inventory/flights"
                        className="font-bold text-blue-700 hover:underline dark:text-blue-400"
                      >
                        Flights →
                      </Link>
                    </div>
                  </div>

                  {/* Hotel Allotments */}
                  <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:border-slate-200 dark:border-slate-700/60 dark:bg-slate-900/40">
                    <div>
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 text-xs font-bold">
                          <Hotel size={15} className="text-emerald-600 dark:text-emerald-400" />
                          Hotels Inventory
                        </span>
                        <span className="rounded-md bg-emerald-100/70 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {stocks?.hotels?.totalAllotments ?? 0} blocks
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                        {availableHotelRooms}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Rooms Available / {totalHotelRooms} Total
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        Held: {stocks?.hotels?.heldRooms ?? 0}
                      </span>
                      <Link
                        to="/admin/inventory/hotels"
                        className="font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        Hotels →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
                <Link
                  to="/admin/inventory/hotels/stock"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                >
                  Manage Wholesale Stock <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
