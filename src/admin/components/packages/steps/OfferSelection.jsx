import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Check, Clock, Plus, Search, Ticket, Hotel } from "lucide-react";
import Button from "../../common/Button";
import formatCurrency from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";
import { offersApi } from "../../../features/offers/offersApi";

// Step 2 of the package builder: pick the retail offers to bundle.
// Spec 3.1 — a package must link at least 2 offers.
export default function OfferSelection({ form, setField }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const offersQuery = useQuery({
    queryKey: ["offers", "picker", { search, typeFilter }],
    queryFn: () =>
      offersApi.list({
        page: 1,
        limit: 100,
        isActive: "true",
        itemType: typeFilter,
        destination: search.trim(),
      }),
    placeholderData: (previous) => previous,
  });

  const offers = offersQuery.data?.offers ?? [];

  const selectedIds = useMemo(() => new Set(form.offers.map((o) => String(o.offerId))), [form.offers]);

  const getOfferDeadline = (o) => {
    const s = o.itemType === "flight" ? o.flightRef?.stock : o.hotelRef?.stock;
    return o.nameAdditionDeadline || s?.nameAdditionDeadline || null;
  };

  const getOfferDatesSummary = (o) => {
    const s = o.itemType === "flight" ? o.flightRef?.stock : o.hotelRef?.stock;
    const start = s?.departureDate || s?.checkIn || o.startDate;
    const end = s?.arrivalDate || s?.checkOut || o.endDate;
    if (start && end && String(start).slice(0, 10) !== String(end).slice(0, 10)) {
      return `${formatDate(start, { day: "numeric", month: "short" })} – ${formatDate(end, { day: "numeric", month: "short", year: "numeric" })}`;
    }
    if (start) {
      return formatDate(start, { day: "numeric", month: "short", year: "numeric" });
    }
    return null;
  };

  const toggle = (offer) => {
    const offerId = String(offer._id ?? offer.id);
    if (selectedIds.has(offerId)) {
      setField("offers", form.offers.filter((o) => String(o.offerId) !== offerId));
    } else {
      const deadline = getOfferDeadline(offer);
      setField("offers", [
        ...form.offers,
        {
          id: offerId,
          offerId,
          title: offer.title,
          itemType: offer.itemType,
          sellPrice: Number(offer.sellPrice || 0),
          costPrice: Number(offer.costPrice || 0),
          grossProfit: Number(offer.grossProfit || 0),
          destination: offer.destination,
          unitsPerBooking: 1,
          isOptional: false,
          isDefaultSelected: true,
          allowSwap: true,
          notes: "",
          startDate: offer.startDate,
          endDate: offer.endDate,
          nameAdditionDeadline: deadline,
          flightDetails: offer.flightRef?.stock || null,
          hotelDetails: offer.hotelRef?.stock || null,
          availableBookings: offer.availableBookings,
        },
      ]);
    }
  };

  const unbundledTotal = form.offers.reduce((sum, o) => {
    if (o.isOptional && o.isDefaultSelected === false) return sum;
    return sum + Number(o.sellPrice || 0) * Number(o.unitsPerBooking || 1);
  }, 0);

  const totalCost = form.offers.reduce((sum, o) => {
    if (o.isOptional && o.isDefaultSelected === false) return sum;
    return sum + Number(o.costPrice || 0) * Number(o.unitsPerBooking || 1);
  }, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Bundle Offers</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select at least 2 retail offers (flights, hotels, experiences). Package pricing is
          computed from their retail prices.
        </p>
      </div>

      {/* Selected summary */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${form.offers.length >= 2 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {form.offers.length} selected {form.offers.length < 2 && "· minimum 2 required"}
        </span>
        <span className="text-sm text-slate-500">
          Unbundled total <b className="text-slate-800">{formatCurrency(unbundledTotal)}</b>
        </span>
        {totalCost > 0 && (
          <span className="text-sm text-slate-500">
            Wholesale cost <b className="text-slate-800">{formatCurrency(totalCost)}</b>
          </span>
        )}
      </div>

      {/* Selected chips */}
      {form.offers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {form.offers.map((offer) => (
            <span key={offer.offerId} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 py-1.5 pl-3 pr-1.5 text-xs font-semibold text-emerald-800">
              {offer.itemType === "flight" ? <Ticket size={13} /> : <Hotel size={13} />}
              {offer.title}
              <button type="button" onClick={() => toggle({ ...offer, _id: offer.offerId })} className="rounded-full p-0.5 transition hover:bg-emerald-200" aria-label={`Remove ${offer.title}`}>
                <Plus size={12} className="rotate-45" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Per-offer offerRefs options: { unitsPerBooking, isOptional, allowSwap } */}
      {form.offers.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            Bundle options
          </div>
          <div className="divide-y divide-slate-100">
            {form.offers.map((offer) => (
              <div key={offer.offerId} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    {offer.itemType === "flight" ? <Ticket size={14} className="shrink-0 text-sky-600" /> : <Hotel size={14} className="shrink-0 text-amber-600" />}
                    <span className="truncate">{offer.title}</span>
                  </span>
                  {(getOfferDatesSummary(offer) || getOfferDeadline(offer)) && (
                    <span className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                      {getOfferDatesSummary(offer) && <span>{getOfferDatesSummary(offer)}</span>}
                      {getOfferDeadline(offer) && (
                        <span className="text-amber-700 font-medium">
                          Bookable until {formatDate(getOfferDeadline(offer), { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  Units / booking
                  <input
                    type="number"
                    min="1"
                    value={offer.unitsPerBooking ?? 1}
                    onChange={(event) =>
                      setField(
                        "offers",
                        form.offers.map((o) =>
                          o.offerId === offer.offerId
                            ? { ...o, unitsPerBooking: Math.max(1, Number(event.target.value || 1)) }
                            : o,
                        ),
                      )
                    }
                    className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-sm"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={offer.isOptional ?? false}
                    onChange={(event) =>
                      setField(
                        "offers",
                        form.offers.map((o) =>
                          o.offerId === offer.offerId ? { ...o, isOptional: event.target.checked } : o,
                        ),
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                  />
                  Optional
                </label>
                {offer.isOptional && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={offer.isDefaultSelected !== false}
                      onChange={(event) =>
                        setField(
                          "offers",
                          form.offers.map((o) =>
                            o.offerId === offer.offerId
                              ? { ...o, isDefaultSelected: event.target.checked }
                              : o,
                          ),
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                    />
                    Default selected
                  </label>
                )}
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={offer.allowSwap ?? false}
                    onChange={(event) =>
                      setField(
                        "offers",
                        form.offers.map((o) =>
                          o.offerId === offer.offerId ? { ...o, allowSwap: event.target.checked } : o,
                        ),
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                  />
                  Allow swap
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search offers by destination..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
        >
          <option value="">All types</option>
          <option value="flight">Flights</option>
          <option value="hotel">Hotels</option>
        </select>
      </div>

      {/* Offer list */}
      {offersQuery.isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          No active offers found. Create retail offers first.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {offers.map((offer) => {
            const offerId = String(offer._id ?? offer.id);
            const selected = selectedIds.has(offerId);
            const datesSummary = getOfferDatesSummary(offer);
            const deadline = getOfferDeadline(offer);
            return (
              <button
                key={offerId}
                type="button"
                onClick={() => toggle(offer)}
                className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex gap-3 min-w-0 flex-1">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${offer.itemType === "flight" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"}`}>
                    {offer.itemType === "flight" ? <Ticket size={17} /> : <Hotel size={17} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-800">{offer.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {offer.itemType === "flight" ? "Flight" : "Hotel"} · {offer.destination || "—"}
                    </p>
                    {datesSummary && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        <Calendar size={11} className="shrink-0 text-slate-400" />
                        <span>{datesSummary}</span>
                      </p>
                    )}
                    {deadline && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-amber-700">
                        <Clock size={11} className="shrink-0 text-amber-500" />
                        <span>Bookable until {formatDate(deadline, { day: "numeric", month: "short", year: "numeric" })}</span>
                      </p>
                    )}
                    <p className="mt-1.5 text-sm font-bold text-slate-900">{formatCurrency(offer.sellPrice)}</p>
                  </div>
                </div>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 text-transparent"}`}>
                  <Check size={13} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {offersQuery.isFetching && <p className="text-center text-xs text-slate-400">Updating...</p>}
    </div>
  );
}
