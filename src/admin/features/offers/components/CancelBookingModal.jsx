import React from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";

const CancelBookingModal = ({
  open,
  onClose,
  cancelReason,
  setCancelReason,
  onSubmit,
  isPending,
}) => {
  return (
    <Modal open={open} title="Cancel Booking" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Cancelling releases the reserved stock units back to the available pool. This cannot be
          undone.
        </p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Reason</span>
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Customer requested cancellation per refund policy"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Keep Booking
          </Button>
          <Button type="submit" variant="danger" loading={isPending}>
            Cancel Booking
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CancelBookingModal;
