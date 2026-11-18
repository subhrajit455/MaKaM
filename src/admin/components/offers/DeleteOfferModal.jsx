import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Tag,
  Hotel,
  Ticket,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { offersApi } from "../../features/offers/offersApi";

export default function DeleteOfferModal({ open, offer, onClose, onDeleted }) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [impact, setImpact] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open || !offer?.id) {
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
        const res = await offersApi.delete(offer.id, { dryRun: true });
        if (isMounted) {
          const data = res?.data ?? res;
          setImpact(data);
        }
      } catch (err) {
        if (isMounted) {
          setPreviewError(
            err?.response?.data?.message || err?.message || "Failed to analyze offer deletion impact"
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
  }, [open, offer?.id]);

  const handleConfirmDelete = async () => {
    if (!offer?.id) return;
    setDeleting(true);
    try {
      const res = await offersApi.delete(offer.id, { dryRun: false });
      toast.success(
        res?.message || "Retail offer deleted successfully"
      );
      onDeleted?.();
      onClose?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete offer"
      );
    } finally {
      setDeleting(false);
    }
  };

  const isDeletable = impact?.deletable === true;
  const blockers = impact?.blockers || [];
  const willDelete = impact?.willDelete || {};
  const imagesCount = willDelete.images?.length || 0;

  return (
    <Modal
      open={open}
      title="Delete Retail Offer"
      onClose={deleting ? undefined : onClose}
      size="md"
    >
      <div className="space-y-4 text-sm">
        {/* Target Offer Card */}
        {offer && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {offer.itemType === "flight" ? <Ticket size={13} /> : <Hotel size={13} />}
              <span>{offer.itemType === "flight" ? "Flight Retail Offer" : "Hotel Retail Offer"}</span>
            </div>
            <p className="mt-1 font-bold text-slate-900">{offer.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Destination: {offer.destination || "—"} · Price: ₹{Number(offer.sellPrice || 0).toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {/* Loading Impact Preview */}
        {loadingPreview && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Checking bookings & package dependencies...</p>
          </div>
        )}

        {/* Impact Preview Error */}
        {!loadingPreview && previewError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold">Unable to verify offer deletion</p>
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
                    This offer cannot be deleted because of the following reason{blockers.length > 1 ? "s" : ""}:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs font-medium text-red-800">
                    {blockers.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="font-semibold">Industry Standard Convention:</p>
              <p className="mt-0.5 text-slate-700">
                To protect customer receipts, tax invoices, and package integrity, offers with bookings or active packages cannot be deleted. Instead, toggle the offer status to <strong>Inactive</strong> to hide it from storefronts.
              </p>
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
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
              <div className="flex items-center gap-2 font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Safe to Delete (0 Bookings, Not Bundled)</span>
              </div>
              <p className="mt-1 text-xs text-emerald-800">
                This offer has never been booked and is not referenced by any packages. Deleting it will permanently remove it and clean up its promotional media.
              </p>
            </div>

            {/* Impact Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag size={13} className="text-slate-400" />
                  Retail Offer Document
                </span>
                <span className="font-semibold text-red-600">Permanently deleted</span>
              </div>

              {imagesCount > 0 && (
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ImageIcon size={13} className="text-slate-400" />
                    Promotional Photos (VaisBucket)
                  </span>
                  <span className="font-semibold text-slate-900">
                    {imagesCount} photo{imagesCount === 1 ? "" : "s"} purged
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-red-600 font-medium">
              Are you sure? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={onClose} disabled={deleting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} className="mr-1.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

