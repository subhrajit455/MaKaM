import formatCurrency from "../../../utils/formatCurrency";
import ScheduleSummaryCard from "../ScheduleSummaryCard";

// Step 3 of the package builder: bundle discount. Sell price is computed
// from the selected offers' retail prices minus the discount (spec 3.1);
// the server recomputes and returns the authoritative figures on create.
export default function PricingDetails({ form, setField, unbundledTotal, schedule }) {
  const discount = Math.min(Math.max(Number(form.bundleDiscountPercentage || 0), 0), 100);
  const sellPrice = Math.round(unbundledTotal * (1 - discount / 100));
  // Guide is priced on top of the bundle (spec B: final = sell + guidePrice).
  const guidePrice = form.guideActive ? Number(form.guidePrice || 0) : 0;
  const total = sellPrice + guidePrice;

  // Wholesale cost sum and profit margin
  const totalCost = form.offers.reduce((sum, o) => {
    if (o.isOptional && o.isDefaultSelected === false) return sum;
    return sum + Number(o.costPrice || 0) * Number(o.unitsPerBooking || 1);
  }, 0);
  const grossProfit = totalCost > 0 ? (total - totalCost) : Math.max(0, unbundledTotal - sellPrice);
  const marginPct = total > 0 && totalCost > 0 ? Math.round(((total - totalCost) / total) * 100) : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Pricing & Margins</h2>
        <p className="mt-1 text-sm text-slate-500">
          The bundle price is computed from the retail prices of the selected offers minus your
          discount. Admin view displays full transparency into wholesale costs and profit margins.
        </p>
      </div>

      <ScheduleSummaryCard schedule={schedule} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Unbundled Retail Total" value={formatCurrency(unbundledTotal)} hint="Sum of offer retail prices" />
        {totalCost > 0 ? (
          <Metric label="Wholesale Cost" value={formatCurrency(totalCost)} hint="Baseline supplier cost" />
        ) : null}
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide font-semibold text-slate-500">Bundle discount (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            value={form.bundleDiscountPercentage}
            onChange={(event) => setField("bundleDiscountPercentage", Math.min(Math.max(Number(event.target.value || 0), 0), 100))}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          />
        </label>
        <Metric
          label="Final Package Price"
          value={formatCurrency(total)}
          hint={marginPct !== null ? `Profit: +${formatCurrency(grossProfit)} (${marginPct}%)` : (guidePrice > 0 ? "Bundle + guide" : "Customer retail price")}
          highlight
        />
      </div>

      {/* Ziyarat guide bundle — sent with POST /api/v1/crm/packages (spec A) */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <label className="flex items-start justify-between gap-3">
          <span>
            <span className="block text-sm font-bold text-slate-800">Include Ziyarat Guide</span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Customers booking this package can add a private guide at the price below.
            </span>
          </span>
          <input
            type="checkbox"
            checked={Boolean(form.guideActive)}
            onChange={(event) => setField("guideActive", event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-emerald-700"
          />
        </label>

        {form.guideActive && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Guide location <span className="font-normal text-slate-400">(city where the guide serves)</span>
              </span>
              <input
                type="text"
                value={form.guideLocation ?? ""}
                placeholder="Makkah"
                onChange={(event) => setField("guideLocation", event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Guide price (₹ per booking)</span>
              <input
                type="number"
                min="0"
                value={form.guidePrice ?? ""}
                placeholder="1500"
                onChange={(event) => setField("guidePrice", event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
          </div>
        )}
      </div>

      {form.offers.length > 0 && (
        <div className="rounded-2xl border border-slate-200">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-800">Price breakdown</div>
          <div className="divide-y divide-slate-100">
            {form.offers.map((offer) => {
              const units = Number(offer.unitsPerBooking || 1);
              return (
                <div key={offer.offerId || offer.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${offer.itemType === "flight" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}>
                      {offer.itemType}
                    </span>
                    {offer.title}
                    {units > 1 && <span className="text-xs text-slate-400">× {units}</span>}
                  </span>
                  <span className="font-bold text-slate-800">{formatCurrency(Number(offer.sellPrice || 0) * units)}</span>
                </div>
              );
            })}
            {discount > 0 && (
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-700">Bundle discount ({discount}%)</span>
                <span className="font-bold text-emerald-700">−{formatCurrency(unbundledTotal - sellPrice)}</span>
              </div>
            )}
            {guidePrice > 0 && (
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-700">Ziyarat guide</span>
                <span className="font-bold text-slate-800">+{formatCurrency(guidePrice)}</span>
              </div>
            )}
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 text-sm">
              <span className="font-bold text-slate-900">Total price</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, hint, highlight }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-emerald-50" : "bg-slate-50"}`}>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-extrabold ${highlight ? "text-emerald-900" : "text-slate-900"}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
