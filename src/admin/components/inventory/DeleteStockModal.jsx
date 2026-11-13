import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Image as ImageIcon, Loader2, Package as PackageIcon, Tag, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { stocksApi } from "../../features/inventory/stocks/stocksApi";

export default function DeleteStockModal({ open, stock, type = "flight", onClose, onDeleted }) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [impact, setImpact] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open || !stock?.id) {
      setImpact(null);
      setPreviewError(null);
      setLoadingPreview(false);
      return;
    }

    let isMounted = true;
    setLoadingPreview(true);
    setPreviewError(null);

    const fetchImpact = async () => {
      try {
        const deleteFn = type === "flight" ? stocksApi.deleteFlight : stocksApi.deleteHotel;
        const res = await deleteFn(stock.id, { dryRun: true });
        if (isMounted) {
          // res might be unwrapBody({ success, data }) or data itself
          const data = res?.data ?? res;
          setImpact(data);
        }
      } catch (err) {
        if (isMounted) {
          setPreviewError(
            err?.response?.data?.message || err?.message || "Failed to analyze stock deletion impact"
          );
        }
      } finally {
        if (isMounted) {
          setLoadingPreview(false);
        }
      }
    };

    fetchImpact();

    return () => {
      isMounted = false;
    };
  }, [open, stock?.id, type]);

  const handleConfirmDelete = async () => {
    if (!stock?.id) return;
    setDeleting(true);
    try {
      const deleteFn = type === "flight" ? stocksApi.deleteFlight : stocksApi.deleteHotel;
      const res = await deleteFn(stock.id, { dryRun: false });
      toast.success(
        res?.message || `${type === "flight" ? "Flight" : "Hotel"} stock deleted successfully`
      );
      onDeleted?.();
      onClose?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete stock"
      );
    } finally {
      setDeleting(false);
    }
  };

  const isDeletable = impact?.deletable === true;
  const blockers = impact?.blockers || [];
  const willDelete = impact?.willDelete || {};
  const offersCount = willDelete.offers?.length || 0;
  const packagesCount = willDelete.packages?.length || 0;
  const imagesCount = willDelete.images?.length || 0;

  return (
    <Modal
      open={open}
      title={`Delete ${type === "flight" ? "Flight" : "Hotel"} Stock`}
      onClose={deleting ? undefined : onClose}
      size="md"
    >
      <div className="space-y-4 text-sm">
        {/* Target Stock Description Card */}
        {stock && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {type === "flight" ? "Flight Stock Batch" : "Hotel Room Allotment"}
            </p>
            <p className="mt-1 font-bold text-slate-900">
              {type === "flight"
                ? `${stock.airline || ""} ${stock.flightNumber || ""} · ${stock.origin || ""} → ${stock.destination || ""} (PNR: ${stock.pnr || "—"})`
                : `${stock.hotelName || ""} · ${stock.destination || ""} · ${stock.roomType || ""} (Ref: ${stock.reservationRef || "—"})`}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {stock.availableUnits ?? 0} available of {stock.totalUnits ?? 0} total units
            </p>
          </div>
        )}

        {/* Loading Impact Preview */}
        {loadingPreview && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Checking bookings & linked items...</p>
          </div>
        )}

        {/* Impact Preview Error */}
        {!loadingPreview && previewError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold">Unable to verify deletion</p>
                <p className="mt-0.5 text-xs text-red-600">{previewError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Impact Checked: Blocked */}
        {!loadingPreview && !previewError && impact && !isDeletable && (
          <div className="space-y-3">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Deletion Blocked</p>
                  <p className="mt-0.5 text-xs text-red-700">
                    This stock cannot be deleted because of the following reason{blockers.length > 1 ? "s" : ""}:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs font-medium text-red-800">
                    {blockers.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Impact Checked: Deletable */}
        {!loadingPreview && !previewError && impact && isDeletable && (
          <div className="space-y-4">
            {/* Cascade Warnings if offers or packages linked */}
            {offersCount > 0 || packagesCount > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-amber-950">
                      Cascading Deletion Notice
                    </p>
                    <p>
                      Deleting this stock will also permanently remove the following unbooked linked catalog items:
                    </p>

                    {offersCount > 0 && (
                      <div className="mt-1">
                        <span className="font-semibold text-amber-950 flex items-center gap-1">
                          <Tag size={12} /> {offersCount} Linked Offer{offersCount > 1 ? "s" : ""}:
                        </span>
                        <ul className="mt-0.5 list-disc pl-4 text-amber-800">
                          {willDelete.offers.map((o) => (
                            <li key={o._id || o.id}>{o.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {packagesCount > 0 && (
                      <div className="mt-1">
                        <span className="font-semibold text-amber-950 flex items-center gap-1">
                          <PackageIcon size={12} /> {packagesCount} Linked Package{packagesCount > 1 ? "s" : ""}:
                        </span>
                        <ul className="mt-0.5 list-disc pl-4 text-amber-800">
                          {willDelete.packages.map((p) => (
                            <li key={p._id || p.id}>{p.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {imagesCount > 0 && (
                      <div className="mt-1 text-amber-800 flex items-center gap-1">
                        <ImageIcon size={12} /> {imagesCount} associated catalog image{imagesCount > 1 ? "s" : ""} will be deleted from cloud storage.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>No linked offers or packages. This stock has never been booked.</span>
              </div>
            )}

            <p className="text-xs font-semibold text-slate-600">
              Are you sure you want to permanently delete this stock? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button variant="secondary" onClick={onClose} disabled={deleting}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
