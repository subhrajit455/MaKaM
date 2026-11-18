import React from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";

const BookForCustomerModal = ({
  open,
  onClose,
  bookTarget,
  bookForm,
  setBookForm,
  onSubmit,
  isPending,
  money = (val) => `₹${val}`,
}) => {
  return (
    <Modal open={open} title="Book for Customer" onClose={onClose}>
      {bookTarget && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <b>{bookTarget.title}</b>
            <p className="mt-0.5 text-xs text-slate-500">
              {money(bookTarget.sellPrice)} per booking ·{" "}
              {bookTarget.availableBookings ?? bookTarget.availableUnits ?? 0} available
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Customer ID"
              required
              placeholder="66d4a8e2e944f7b6b199e111"
              value={bookForm.customerId}
              onChange={(event) =>
                setBookForm((previous) => ({ ...previous, customerId: event.target.value }))
              }
            />
            <Input
              label="Quantity"
              type="number"
              min={1}
              required
              value={bookForm.quantity}
              onChange={(event) =>
                setBookForm((previous) => ({ ...previous, quantity: event.target.value }))
              }
            />
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Payment Method</label>
              <select
                value={bookForm.method}
                onChange={(event) =>
                  setBookForm((previous) => ({ ...previous, method: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <Input
              label="Payment Reference"
              placeholder="NEFT-HDFC-991282"
              value={bookForm.referenceNumber}
              onChange={(event) =>
                setBookForm((previous) => ({ ...previous, referenceNumber: event.target.value }))
              }
            />
          </div>

          <p className="text-xs text-slate-400">
            Direct bookings confirm immediately and mark the linked stock units as used.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Confirm Booking
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default BookForCustomerModal;
