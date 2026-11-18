import React from "react";
import { XCircle, X, Loader2 } from "lucide-react";

export default function CancelBookingModal({
  isOpen,
  onClose,
  item,
  type = "flight",
  reason = "Change of travel plans",
  setReason,
  onConfirm,
  isCancelling = false,
}) {
  if (!isOpen || !item) return null;

  const resolvedType =
    type === "master"
      ? String(item.details?.itemType || item.bookingType || "booking").toLowerCase()
      : String(type || "flight").toLowerCase();
  const typeLabel =
    resolvedType === "flight"
      ? "Flight"
      : resolvedType === "hotel"
      ? "Hotel"
      : resolvedType === "package"
      ? "Package"
      : resolvedType === "offer"
      ? "Offer"
      : "Master";
  const bookingTitle =
    item.details?.title ||
    item.details?.hotelName ||
    item.details?.airline ||
    item.details?.destination ||
    item.airline ||
    item.airlineName ||
    item.hotelName ||
    `${resolvedType} reservation`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Cancel {typeLabel} Booking
              </h3>
              <p className="text-xs text-slate-400">
                Booking #{item._id || item.id || item.bookingId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onConfirm} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel your{" "}
            <strong className="text-slate-900">{bookingTitle}</strong>
            ? Supplier cancellation policies and charges will apply as per fare terms.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Cancellation
            </label>
            <select
              value={reason}
              onChange={(e) => setReason?.(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            >
              <option value="Change of travel plans">Change of travel plans</option>
              <option value="Emergency or personal reason">Emergency or personal reason</option>
              <option value="Found a cheaper fare/hotel">Found a cheaper fare/hotel</option>
              <option value="Flight schedule conflict">Flight schedule conflict</option>
              <option value="Other">Other reason</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              disabled={isCancelling}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isCancelling && <Loader2 size={14} className="animate-spin" />}
              <span>{isCancelling ? "Cancelling..." : "Confirm Cancellation"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
