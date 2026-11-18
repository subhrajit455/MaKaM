import React from "react";
import { Ticket, Hotel, CheckCircle2, Sparkles } from "lucide-react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import CrmImageUploadSection from "../../../components/common/CrmImageUploadSection";

const CreateOfferModal = ({
  open,
  onClose,
  form,
  updateField,
  switchItemType,
  handleStockSelect,
  syncStockDetailsToForm,
  handleCreate,
  createPending,
  stockPickerLoading,
  stocks = [],
  activeStock,
  stockWholesaleCost = 0,
  liveMarginCalc,
  discountPreview,
  getActiveMarkupPercent = () => 15,
  flightStockLabel,
  hotelStockLabel,
  formatDate,
  formatDateTime,
  money = (v) => `₹${v}`,
  selectedStockDetailFetching = false,
}) => {
  return (
    <Modal open={open} title="Create Retail Offer" onClose={onClose}>
      <form onSubmit={handleCreate} className="space-y-4">
        {/* Item type */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "flight", label: "Flight Offer", icon: Ticket },
            { key: "hotel", label: "Hotel Offer", icon: Hotel },
          ].map((option) => {
            const Icon = option.icon;
            const active = form.itemType === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => switchItemType(option.key)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Stock link */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            {form.itemType === "flight" ? "Ticket Stock Batch" : "Hotel Room Allotment"}
          </label>
          <select
            value={form.stock}
            onChange={(event) => handleStockSelect(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-3 focus:ring-emerald-500/10"
            required
          >
            <option value="">
              {stockPickerLoading ? "Loading stock..." : "Select a stock batch"}
            </option>
            {stocks.map((stock) => {
              const id = stock._id ?? stock.id;
              return (
                <option key={id} value={id}>
                  {form.itemType === "flight"
                    ? flightStockLabel(stock)
                    : hotelStockLabel(stock)}
                </option>
              );
            })}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Wholesale pricing and stock attributes auto-fill upon selection.
          </p>
        </div>

        {/* Wholesale Stock & Live Cost Analysis Card */}
        {activeStock && (
          <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50/50 p-4.5 shadow-xs animate-slide-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                  {form.itemType === "flight" ? <Ticket size={18} /> : <Hotel size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      {form.itemType === "flight" ? "Linked Flight Stock" : "Linked Hotel Allotment"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 size={11} />
                      {activeStock.availableUnits ?? 0} {form.itemType === "flight" ? "seats available" : "rooms available"}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {form.itemType === "flight"
                      ? `${activeStock.airline || ""} ${activeStock.flightNumber || ""} · ${activeStock.origin || ""} → ${activeStock.destination || ""} · PNR ${activeStock.pnr || "—"}`
                      : `${activeStock.hotelName || "Hotel"} · ${activeStock.roomType || ""} · ${activeStock.destination || ""}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={syncStockDetailsToForm}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs transition hover:bg-emerald-50 active:scale-98"
                title="Overwrite Title, Destination, Dates, and Price from Stock"
              >
                <Sparkles size={13} className="text-emerald-600" />
                <span>Sync All to Form</span>
              </button>
            </div>

            {/* Wholesale Pricing & Margin Analytics Cards */}
            <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
              {/* Wholesale cost card */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Wholesale Cost ({form.itemType === "flight" ? "per seat" : "per room"})
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-slate-900">
                    {stockWholesaleCost > 0 ? money(stockWholesaleCost) : "—"}
                  </span>
                  {selectedStockDetailFetching && (
                    <span className="text-[10px] font-medium text-slate-400 animate-pulse">(updating...)</span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  From stock batch record
                </p>
              </div>

              {/* Live selling price card */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Retail Selling Price
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-slate-900">
                    {form.sellPrice ? money(form.sellPrice) : "Not set"}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Customer booking price
                </p>
              </div>

              {/* Profit margin card */}
              <div
                className={`rounded-xl border p-3.5 shadow-2xs transition-colors ${
                  !liveMarginCalc
                    ? "border-slate-200/80 bg-white"
                    : liveMarginCalc.isLoss
                      ? "border-red-200 bg-red-50/60"
                      : "border-emerald-200 bg-emerald-50/60"
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Profit Margin
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  {liveMarginCalc ? (
                    <>
                      <span
                        className={`text-xl font-extrabold ${
                          liveMarginCalc.isLoss ? "text-red-700" : "text-emerald-700"
                        }`}
                      >
                        {liveMarginCalc.grossProfit >= 0 ? "+" : ""}
                        {money(liveMarginCalc.grossProfit)}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          liveMarginCalc.isLoss ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        ({liveMarginCalc.marginPct}%)
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">Enter price to calculate</span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {liveMarginCalc?.isLoss
                    ? "⚠️ Below wholesale stock cost"
                    : liveMarginCalc
                      ? "Calculated profit per unit"
                      : "Profit margin preview"}
                </p>
              </div>
            </div>

            {/* Quick Markup Presets */}
            {stockWholesaleCost > 0 && (
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500">Quick Markup:</span>
                <button
                  type="button"
                  onClick={() => updateField("sellPrice", String(stockWholesaleCost))}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-100 cursor-pointer"
                  title="Sell at exact wholesale cost"
                >
                  At Cost ({money(stockWholesaleCost)})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      "sellPrice",
                      String(Math.round(stockWholesaleCost * (1 + getActiveMarkupPercent() / 100)))
                    )
                  }
                  className="rounded-lg border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-900 shadow-2xs transition hover:bg-emerald-200 cursor-pointer"
                  title={`Apply active platform markup (+${getActiveMarkupPercent()}%)`}
                >
                  System (+{getActiveMarkupPercent()}%) ({money(Math.round(stockWholesaleCost * (1 + getActiveMarkupPercent() / 100)))})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateField("sellPrice", String(Math.round(stockWholesaleCost * 1.15)))
                  }
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 cursor-pointer"
                  title="Add 15% profit margin"
                >
                  +15% ({money(Math.round(stockWholesaleCost * 1.15))})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateField("sellPrice", String(Math.round(stockWholesaleCost * 1.25)))
                  }
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 cursor-pointer"
                  title="Add 25% profit margin"
                >
                  +25% ({money(Math.round(stockWholesaleCost * 1.25))})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateField("sellPrice", String(Math.round(stockWholesaleCost * 1.35)))
                  }
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 cursor-pointer"
                  title="Add 35% profit margin"
                >
                  +35% ({money(Math.round(stockWholesaleCost * 1.35))})
                </button>
              </div>
            )}

            {/* Already Present Stock Metadata Details */}
            <div className="mt-3.5 grid gap-2 rounded-xl border border-slate-200/60 bg-white/90 p-3 text-xs sm:grid-cols-2">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Scheduled:</span>
                <span className="font-medium text-slate-800">
                  {form.itemType === "flight"
                    ? `${formatDateTime(activeStock.departureDate)} → ${formatDateTime(activeStock.arrivalDate)}`
                    : `In: ${formatDate(activeStock.checkIn)} · Out: ${formatDate(activeStock.checkOut)}`}
                </span>
              </div>
              {form.itemType === "flight" && activeStock.cabinClass && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Cabin Class:</span>
                  <span className="font-medium capitalize text-slate-800">
                    {activeStock.cabinClass}
                  </span>
                </div>
              )}
              {form.itemType === "flight" && activeStock.nameAdditionDeadline && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Name Deadline:</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(activeStock.nameAdditionDeadline)}
                  </span>
                </div>
              )}
              {form.itemType === "hotel" && activeStock.meals && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Meal Plan:</span>
                  <span className="font-medium text-slate-800">
                    {Array.isArray(activeStock.meals) ? activeStock.meals.join(", ") : activeStock.meals}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Title"
            required
            placeholder="Direct Flight to Dubai — IndiGo Special"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
          <Input
            label="Destination"
            required
            placeholder="Dubai"
            value={form.destination}
            onChange={(event) => updateField("destination", event.target.value)}
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Special non-stop flight from Delhi to Dubai with baggage allowance."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <Input
            label="Selling Price (₹)"
            type="number"
            min={1}
            required
            value={form.sellPrice}
            onChange={(event) => updateField("sellPrice", event.target.value)}
          />
          <Input
            label="Original Price (₹)"
            type="number"
            min={0}
            value={form.originalPrice}
            onChange={(event) => updateField("originalPrice", event.target.value)}
          />
          <Input
            label="Discount %"
            type="number"
            min={0}
            max={100}
            placeholder={discountPreview !== null ? `Auto: ${discountPreview}%` : "0"}
            value={form.discountPercentage}
            onChange={(event) => updateField("discountPercentage", event.target.value)}
          />
          <Input
            label="Units per Booking"
            type="number"
            min={1}
            value={form.unitsPerBooking}
            onChange={(event) => updateField("unitsPerBooking", event.target.value)}
          />
          <Input
            label="Start Date"
            type="datetime-local"
            value={form.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
          />
          <Input
            label="End Date"
            type="datetime-local"
            value={form.endDate}
            onChange={(event) => updateField("endDate", event.target.value)}
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Inclusions <span className="font-normal text-slate-400">(one per line)</span>
            </label>
            <textarea
              rows={3}
              value={form.inclusions}
              onChange={(event) => updateField("inclusions", event.target.value)}
              placeholder={"7kg Cabin Baggage\n30kg Check-in Baggage"}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Terms &amp; Conditions <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.termsAndConditions}
              onChange={(event) => updateField("termsAndConditions", event.target.value)}
              placeholder="Non-refundable. Date change allowed up to 48 hours prior."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {/* Media & Image Upload Section */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <CrmImageUploadSection
            images={form.images || []}
            onChange={(urls) => updateField("images", urls)}
            section="offers"
            maxImages={10}
            title="Offer Media & Gallery"
            subtitle="Upload promotional images for this offer. The first image serves as the primary cover."
            showCustomerNotice={true}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={createPending}>
            Create Offer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOfferModal;
