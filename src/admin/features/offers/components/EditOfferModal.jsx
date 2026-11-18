import React from "react";
import { Ticket, Hotel } from "lucide-react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import CrmImageUploadSection from "../../../components/common/CrmImageUploadSection";

const EditOfferModal = ({
  open,
  onClose,
  editTarget,
  editForm,
  updateEditField,
  submitEdit,
  updatePending,
  editDetailQuery = {},
  stockPickerQuery = {},
  editStocks = [],
  handleEditStockSelect,
  activeEditStock,
  editStockWholesaleCost = 0,
  editLiveMarginCalc,
  getActiveMarkupPercent = () => 15,
  flightStockLabel,
  hotelStockLabel,
  money = (v) => `₹${v}`,
}) => {
  return (
    <Modal open={open} title="Edit Retail Offer" onClose={onClose} size="xl">
      <form onSubmit={submitEdit} className="space-y-4">
        {editDetailQuery.isFetching && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Loading latest offer details…</p>
        )}
        {editDetailQuery.data && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Live stock: <b>{editDetailQuery.data.availableBookings ?? editDetailQuery.data.availableUnits ?? 0}</b> bookings
            {" "}· cost {money(editDetailQuery.data.costPrice)} · margin {editDetailQuery.data.profitMarginPercentage ?? 0}%
          </p>
        )}

        {/* Wholesale Stock Linkage & Batch Selector */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Wholesale Stock Linkage ({editForm.itemType === "flight" ? "TicketStock" : "HotelStock"})
              </span>
              <p className="text-xs text-slate-400">
                Optionally modify the wholesale stock batch linked to this offer
              </p>
            </div>
            {stockPickerQuery.isFetching && (
              <span className="text-xs font-semibold text-emerald-700 animate-pulse">Loading stock batches...</span>
            )}
          </div>

          <div className="mt-3">
            <select
              value={editForm.stock}
              onChange={(event) => handleEditStockSelect(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">— Keep currently linked stock batch —</option>
              {editStocks.map((stock) => {
                const id = stock._id ?? stock.id;
                return (
                  <option key={id} value={id}>
                    {editForm.itemType === "flight" ? flightStockLabel(stock) : hotelStockLabel(stock)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Active Stock Breakdown & Margin in Edit Modal */}
          {(activeEditStock || editStockWholesaleCost > 0) && (
            <div className="mt-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-2xs">
                    {editForm.itemType === "flight" ? <Ticket size={14} /> : <Hotel size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {activeEditStock
                        ? editForm.itemType === "flight"
                          ? `${activeEditStock.airline || ""} ${activeEditStock.flightNumber || ""} · ${activeEditStock.origin || ""} → ${activeEditStock.destination || ""}`
                          : `${activeEditStock.hotelName || "Hotel"} · ${activeEditStock.roomType || ""}`
                        : "Linked wholesale stock allotment"}
                    </p>
                  </div>
                </div>

                {activeEditStock && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {activeEditStock.availableUnits ?? 0} available
                  </span>
                )}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200/80 bg-white p-2.5">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Wholesale Cost</span>
                  <div className="mt-0.5 text-base font-extrabold text-slate-800">
                    {editStockWholesaleCost > 0 ? money(editStockWholesaleCost) : "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200/80 bg-white p-2.5">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Selling Price</span>
                  <div className="mt-0.5 text-base font-extrabold text-slate-800">
                    {editForm.sellPrice ? money(editForm.sellPrice) : "Not set"}
                  </div>
                </div>

                <div
                  className={`rounded-lg border p-2.5 ${
                    !editLiveMarginCalc
                      ? "border-slate-200/80 bg-white"
                      : editLiveMarginCalc.isLoss
                        ? "border-red-200 bg-red-50/70"
                        : "border-emerald-200 bg-emerald-50/70"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Margin</span>
                  <div className="mt-0.5 text-base font-extrabold">
                    {editLiveMarginCalc ? (
                      <span className={editLiveMarginCalc.isLoss ? "text-red-700" : "text-emerald-700"}>
                        {editLiveMarginCalc.grossProfit >= 0 ? "+" : ""}
                        {money(editLiveMarginCalc.grossProfit)} ({editLiveMarginCalc.marginPct}%)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Enter price</span>
                    )}
                  </div>
                </div>
              </div>

              {editStockWholesaleCost > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-500">Quick Markup:</span>
                  <button
                    type="button"
                    onClick={() => updateEditField("sellPrice", String(editStockWholesaleCost))}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    At Cost ({money(editStockWholesaleCost)})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateEditField(
                        "sellPrice",
                        String(Math.round(editStockWholesaleCost * (1 + getActiveMarkupPercent(editForm.itemType) / 100)))
                      )
                    }
                    className="rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-900 hover:bg-emerald-200 cursor-pointer"
                    title={`Apply active platform markup (+${getActiveMarkupPercent(editForm.itemType)}%)`}
                  >
                    System (+{getActiveMarkupPercent(editForm.itemType)}%) ({money(Math.round(editStockWholesaleCost * (1 + getActiveMarkupPercent(editForm.itemType) / 100)))})
                  </button>
                  <button
                    type="button"
                    onClick={() => updateEditField("sellPrice", String(Math.round(editStockWholesaleCost * 1.15)))}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  >
                    +15% ({money(Math.round(editStockWholesaleCost * 1.15))})
                  </button>
                  <button
                    type="button"
                    onClick={() => updateEditField("sellPrice", String(Math.round(editStockWholesaleCost * 1.25)))}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  >
                    +25% ({money(Math.round(editStockWholesaleCost * 1.25))})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Title"
            required
            value={editForm.title}
            onChange={(event) => updateEditField("title", event.target.value)}
          />
          <Input
            label="Destination"
            required
            value={editForm.destination}
            onChange={(event) => updateEditField("destination", event.target.value)}
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={editForm.description}
              onChange={(event) => updateEditField("description", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <Input
            label="Selling Price (₹)"
            type="number"
            min={1}
            required
            value={editForm.sellPrice}
            onChange={(event) => updateEditField("sellPrice", event.target.value)}
          />
          <Input
            label="Original Price (₹)"
            type="number"
            min={0}
            value={editForm.originalPrice}
            onChange={(event) => updateEditField("originalPrice", event.target.value)}
          />
          <Input
            label="Discount %"
            type="number"
            min={0}
            max={100}
            value={editForm.discountPercentage}
            onChange={(event) => updateEditField("discountPercentage", event.target.value)}
          />
          <Input
            label="Units per Booking"
            type="number"
            min={1}
            value={editForm.unitsPerBooking}
            onChange={(event) => updateEditField("unitsPerBooking", event.target.value)}
          />
          <Input
            label="Start Date"
            type="datetime-local"
            value={editForm.startDate}
            onChange={(event) => updateEditField("startDate", event.target.value)}
          />
          <Input
            label="End Date"
            type="datetime-local"
            value={editForm.endDate}
            onChange={(event) => updateEditField("endDate", event.target.value)}
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Inclusions <span className="font-normal text-slate-400">(one per line)</span>
            </label>
            <textarea
              rows={3}
              value={editForm.inclusions}
              onChange={(event) => updateEditField("inclusions", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Terms &amp; Conditions <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={editForm.termsAndConditions}
              onChange={(event) => updateEditField("termsAndConditions", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {/* Media & Image Upload Section */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <CrmImageUploadSection
            images={editForm.images || []}
            onChange={(urls) => updateEditField("images", urls)}
            section="offers"
            itemId={editTarget?._id ?? editTarget?.id}
            maxImages={10}
            title="Offer Media & Gallery"
            subtitle="Add or reorder images for this retail offer. The first image serves as the primary cover."
            showCustomerNotice={true}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updatePending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditOfferModal;
