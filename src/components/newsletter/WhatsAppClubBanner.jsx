import React, { useState } from "react";
import { MessageCircle, CheckCircle2, BellRing, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import { createLead } from "../../services/leadApi";
import { buildWhatsAppUrl } from "../../configs/contact";

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+1", label: "USA / Canada (+1)" },
];

export default function WhatsAppClubBanner() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState(() =>
    buildWhatsAppUrl("Assalamu Alaikum! I would like to connect on WhatsApp for Ramadan seat & Haram hotel rate drops.")
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const digits = phone.replace(/\D/g, "");
    const cleanedPhone = digits ? `${countryCode}${digits}` : "";
    const message = cleanedPhone
      ? `Assalamu Alaikum! I would like to receive Ramadan seat & Haram hotel rate drops on WhatsApp. My WhatsApp number is ${cleanedPhone}.`
      : "Assalamu Alaikum! I would like to connect on WhatsApp for Ramadan seat & Haram hotel rate drops.";
    const waUrl = buildWhatsAppUrl(message);

    // Open WhatsApp synchronously in the click/submit gesture to avoid popup blockers
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setLastWhatsAppUrl(waUrl);
    setJoined(true);
    setPhone("");

    if (!cleanedPhone) {
      toast.success("Opening WhatsApp chat with our travel desk!");
      return;
    }

    try {
      setSubmitting(true);
      await createLead({
        name: "WhatsApp Fare Alert Subscriber",
        phone: cleanedPhone,
        source: "whatsapp_vip_alerts",
        notes: "Subscribed via Homepage WhatsApp Fare Drop & Allotment Alerts banner.",
      });
      toast.success("Opening WhatsApp! You will also receive verified Umrah & flight alerts.");
    } catch (err) {
      console.warn("WhatsApp lead save warning:", err);
      toast.success("Opening WhatsApp chat with our travel desk!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="whatsapp-alerts-heading"
      className="maqam-section py-10 md:py-14 px-4 sm:px-6 lg:px-10 xl:px-12 bg-white dark:bg-[#0b1120] font-poppins transition-colors"
    >
      <div className="w-full max-w-[1760px] mx-auto">
        <div data-animate="scale-up" className="rounded-3xl bg-gradient-to-br from-[#045C45] via-[#065F46] to-[#00987A] p-6 sm:p-10 lg:p-12 text-white shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100 mb-3">
              <BellRing size={14} />
              <span>Seasonal Fare &amp; Allotment Alerts</span>
            </div>
            <h2
              id="whatsapp-alerts-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              Get Ramadan Seat &amp; Haram Hotel Rate Drops on WhatsApp
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-emerald-50/90 leading-relaxed">
              Receive verified early-bird Umrah package openings, direct Saudia/Emirates fare releases, and official Nusuk updates directly from our travel desk.
            </p>
          </div>

          <div className="w-full lg:w-[440px] xl:w-[480px]">
            {joined ? (
              <div className="rounded-2xl bg-white/15 border border-white/25 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-amber-300 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-white">WhatsApp Chat Ready</p>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      Send the pre-filled message in WhatsApp to connect with our travel desk.
                    </p>
                  </div>
                </div>
                <a
                  href={lastWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FBBF24] hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2 transition"
                >
                  <MessageCircle size={14} />
                  <span>Open WhatsApp Chat</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="maqam-field">
                  <label htmlFor="vip-whatsapp-phone" className="block text-xs font-semibold text-emerald-100 mb-1">
                    WhatsApp Mobile Number (Optional)
                  </label>
                  <span id="vip-whatsapp-hint" className="block text-[11px] text-emerald-100/80 mb-1.5">
                    Enter 7 to 12 digits or click WhatsApp directly to connect
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="flex flex-1 rounded-xl bg-white dark:bg-slate-900 border border-white/30 overflow-hidden shadow-xs">
                      <select
                        aria-label="Country dialing code"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold px-3 py-3 border-r border-slate-200 dark:border-slate-700 outline-none"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        id="vip-whatsapp-phone"
                        type="tel"
                        inputMode="numeric"
                        pattern="^[0-9]{7,12}$"
                        autoComplete="tel-national"
                        aria-describedby="vip-whatsapp-hint"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        className="flex-1 min-w-0 px-3.5 py-3 text-sm text-slate-900 dark:text-white bg-transparent outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-3 rounded-xl bg-[#FBBF24] hover:bg-amber-300 text-slate-950 font-bold text-sm transition active:scale-95 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                    >
                      <MessageCircle size={16} />
                      <span>{submitting ? "Connecting..." : "Send WhatsApp"}</span>
                    </button>
                  </div>
                  <span className="error-msg text-xs text-amber-200 font-medium mt-1.5">
                    Please enter a valid 7–12 digit mobile number.
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/75">
                  No spam. Only verified fare drops &amp; allotment updates. Opt out anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
