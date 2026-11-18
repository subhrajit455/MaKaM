import React, { useState } from "react";
import {
  Ticket,
  Hotel,
  MapPin,
  Check,
  Copy,
  Power,
  RotateCw,
  Building,
  Plane,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import Modal from "../../../components/common/Modal";

export default function OfferDossierModal({
  isOpen = false,
  onClose,
  viewOffer = null,
  isLoading = false,
  onToggleStatus,
  isTogglingStatus = false,
  onEdit,
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Modal open={isOpen} title="Retail Offer Dossier" onClose={onClose} size="xl">
      {isLoading && !viewOffer ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="mt-3 text-sm font-medium">Loading live offer details from server...</p>
        </div>
      ) : viewOffer ? (
        <div className="space-y-6">
          {/* Top Action & Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                  viewOffer.itemType === "flight"
                    ? "bg-sky-100 text-sky-800 border border-sky-200"
                    : "bg-purple-100 text-purple-800 border border-purple-200"
                }`}
              >
                {viewOffer.itemType === "flight" ? <Ticket size={13} /> : <Hotel size={13} />}
                <span className="capitalize">{viewOffer.itemType} Offer</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                <MapPin size={13} className="text-slate-400" />
                {viewOffer.destination}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                  viewOffer.isActive
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    viewOffer.isActive ? "bg-emerald-600 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {viewOffer.isActive ? "Active · Published" : "Paused · Hidden"}
              </span>

              <button
                type="button"
                onClick={() => handleCopyId(viewOffer.id)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                title="Click to copy Offer ID"
              >
                {copiedId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>ID: {viewOffer.id?.slice(-8)}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleStatus?.(viewOffer.id)}
                disabled={isTogglingStatus}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-2xs transition active:scale-95 ${
                  viewOffer.isActive
                    ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
                title="Toggle public visibility and booking capability (PATCH /api/v1/crm/offers/:id/toggle-status)"
              >
                <Power size={13} className={viewOffer.isActive ? "text-amber-600" : "text-emerald-600"} />
                <span>{viewOffer.isActive ? "Pause Offer" : "Activate Offer"}</span>
              </button>

              <button
                type="button"
                onClick={() => onEdit?.(viewOffer)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95"
                title="Modify pricing, descriptions, travel dates, or wholesale stock linkage"
              >
                <RotateCw size={13} />
                <span>Edit Offer</span>
              </button>
            </div>
          </div>

          {/* Media Gallery / Image Showcase */}
          {Array.isArray(viewOffer.images) && viewOffer.images.length > 0 ? (
            <div className="space-y-3">
              <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-xs">
                <img
                  src={viewOffer.images[activeImageIndex] || viewOffer.images[0]}
                  alt={viewOffer.title}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white pointer-events-none">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      {viewOffer.itemType === "flight" ? "Flight Special" : "Hotel Special"}
                    </p>
                    <h3 className="text-lg font-bold text-white drop-shadow-sm">{viewOffer.title}</h3>
                  </div>
                  <span className="rounded-lg bg-black/60 backdrop-blur-xs px-2 py-1 text-xs font-bold text-white">
                    {activeImageIndex + 1} / {viewOffer.images.length}
                  </span>
                </div>
              </div>

              {viewOffer.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {viewOffer.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        activeImageIndex === idx
                          ? "border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-0 right-0 rounded-tl-md bg-emerald-700 px-1 text-[8px] font-bold text-white">
                          Cover
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/60 p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200 text-slate-400">
                {viewOffer.itemType === "flight" ? <Plane size={24} /> : <Building size={24} />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {viewOffer.itemType === "flight" ? "Flight Special Offer" : "Hotel Special Offer"}
                </p>
                <h3 className="text-xl font-black text-slate-900">{viewOffer.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{viewOffer.destination}</p>
              </div>
            </div>
          )}

          {/* Headline & Description */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-2">
            <h4 className="text-sm font-extrabold text-slate-900">{viewOffer.headline || viewOffer.title}</h4>
            <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">
              {viewOffer.description || "No description provided."}
            </p>
          </div>

          {/* 6-Metric Financial & Stock Performance Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Retail Price</p>
              <p className="mt-1 text-lg font-black text-slate-900">
                ₹{Number(viewOffer.retailPrice || 0).toLocaleString()}
              </p>
              {viewOffer.originalPrice > viewOffer.retailPrice && (
                <p className="text-[11px] text-slate-400 line-through">
                  ₹{Number(viewOffer.originalPrice).toLocaleString()}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Wholesale Cost</p>
              <p className="mt-1 text-lg font-black text-slate-700">
                {viewOffer.stock?.costPrice ? `₹${Number(viewOffer.stock.costPrice).toLocaleString()}` : "N/A"}
              </p>
              <p className="text-[11px] text-slate-400">Unit base purchase</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Unit Margin</p>
              <p className="mt-1 text-lg font-black text-emerald-700">
                {viewOffer.stock?.costPrice && viewOffer.retailPrice > viewOffer.stock.costPrice
                  ? `₹${(viewOffer.retailPrice - viewOffer.stock.costPrice).toLocaleString()}`
                  : "—"}
              </p>
              <p className="text-[11px] font-semibold text-emerald-600">
                {viewOffer.stock?.costPrice && viewOffer.retailPrice > viewOffer.stock.costPrice
                  ? `+${Math.round(((viewOffer.retailPrice - viewOffer.stock.costPrice) / viewOffer.stock.costPrice) * 100)}% ROI`
                  : "Gross profit"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Allocated</p>
              <p className="mt-1 text-lg font-black text-slate-900">{viewOffer.stockCount || 0}</p>
              <p className="text-[11px] text-slate-400">Total units cap</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Confirmed Sales</p>
              <p className="mt-1 text-lg font-black text-emerald-600">{viewOffer.confirmedBookingsCount || 0}</p>
              <p className="text-[11px] text-slate-400">Customers booked</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Available Stock</p>
              <p className="mt-1 text-lg font-black text-amber-600">{viewOffer.availableStock || 0}</p>
              <p className="text-[11px] text-slate-400">Remaining to sell</p>
            </div>
          </div>

          {/* Wholesale Stock Linkage Card */}
          {viewOffer.stock ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Wholesale Stock Linkage</h4>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-mono font-bold text-slate-700">
                  Ref: {viewOffer.stockRef || viewOffer.stock.id?.slice(-8)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">Inventory Item Title</p>
                  <p className="font-bold text-slate-900">
                    {viewOffer.stock.hotelName || viewOffer.stock.airline || viewOffer.stock.title || viewOffer.title}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">Location / City</p>
                  <p className="font-bold text-slate-900">{viewOffer.stock.city || viewOffer.destination}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Included Amenities & Features */}
          {Array.isArray(viewOffer.includedAmenities) && viewOffer.includedAmenities.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {viewOffer.includedAmenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/60"
                  >
                    <Check size={12} className="text-emerald-600" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
