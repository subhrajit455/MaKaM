import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { fetchFaqs } from "../../services/cmsService";
import LiquidFillText from "../ui/LiquidFillText";

const CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "visa", label: "Umrah Visas & Permits" },
  { id: "hotels", label: "Hotels & Proximity" },
  { id: "flights", label: "Flights & Rail" },
  { id: "booking", label: "Booking & Care" },
];

const CURATED_FAQS = [
  {
    _id: "faq-visa-1",
    category: "visa",
    title: "What documents are needed for an Umrah or Saudi Tourist eVisa?",
    answer:
      "You will need a passport valid for at least 6 months from your travel date, a clear passport-sized photograph with a white background, and confirmed return flight details. Our visa team processes digital submissions within 24 to 48 business hours.",
  },
  {
    _id: "faq-visa-2",
    category: "visa",
    title: "How do I obtain a Rawdah Sharif permit in Madinah?",
    answer:
      "Entry to the Noble Rawdah requires an appointment through the official Saudi Nusuk mobile app. Once your visa is issued, our coordinators provide step-by-step guidance to help you reserve your available slot before arrival.",
  },
  {
    _id: "faq-hotels-1",
    category: "hotels",
    title: "How close are your hotels to Masjid al-Haram and Al-Masjid an-Nabawi?",
    answer:
      "Every property listing specifies its exact walking distance or shuttle timing. Our 5-star courtyard tier (including Clock Tower properties and Madinah central courtyard hotels) sits within 50 to 150 meters of the mosque gates, while 3-star and 4-star stays include either short walks or dedicated 24/7 shuttle buses.",
  },
  {
    _id: "faq-hotels-2",
    category: "hotels",
    title: "Can families request adjoining or quadruple rooms in Makkah and Madinah?",
    answer:
      "Yes. Families traveling together can select triple, quadruple, or connecting suites during package customization or quotation requests, and we lock those room configurations directly with the hotelier.",
  },
  {
    _id: "faq-flights-1",
    category: "flights",
    title: "Is Zamzam water allowance included on international return flights?",
    answer:
      "Most full-service carriers operating out of Jeddah (JED) and Madinah (MED)—such as Saudia and Emirates—permit one sealed 5-liter Zamzam bottle per pilgrim in addition to standard checked baggage. Specific airline baggage rules are displayed transparently on every flight card before checkout.",
  },
  {
    _id: "faq-flights-2",
    category: "flights",
    title: "How does luggage work when traveling on the Haramain High-Speed Train?",
    answer:
      "The Haramain bullet train connects Makkah and Madinah in roughly 2 hours 15 minutes. Train cabins permit one standard suitcase and one hand carry per passenger; for large family groups with extra bags, we arrange dedicated luggage transport directly between hotel lobbies.",
  },
  {
    _id: "faq-booking-1",
    category: "booking",
    title: "Can wheelchair assistance be arranged for elderly parents?",
    answer:
      "Yes. You can add airport tarmac wheelchair assistance, hotel lobby wheelchairs, and dedicated Makkah/Madinah coordinators to your booking notes or traveler profile so your parents are escorted smoothly from arrival through check-in.",
  },
  {
    _id: "faq-booking-2",
    category: "booking",
    title: "What happens if my travel dates change or I need to cancel?",
    answer:
      "Every flight, hotel, and package displays its cancellation and date-change schedule prior to payment. Refunds and modifications follow the supplier's published fare rules, and our support team processes approved cancellations directly from your Profile Bookings hub.",
  },
];

export default function TravelFaqSection({ defaultCategory = "all" }) {
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [faqs, setFaqs] = useState(CURATED_FAQS);
  const [allExpanded, setAllExpanded] = useState(false);
  const accordionRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetchFaqs({ limit: 50 })
      .then(({ faqs: cmsFaqs }) => {
        if (!active || !Array.isArray(cmsFaqs) || cmsFaqs.length === 0) return;
        const normalized = cmsFaqs
          .filter((item) => item && (item.title || item.question) && item.answer)
          .map((item) => ({
            _id: item._id || item.slug || item.title,
            category: String(item.category || "booking").toLowerCase(),
            title: item.title || item.question,
            answer: item.answer,
          }));
        if (normalized.length > 0) {
          setFaqs(normalized);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const filteredFaqs = useMemo(() => {
    if (activeCategory === "all") return faqs;
    const matches = faqs.filter((f) => f.category === activeCategory);
    return matches.length > 0 ? matches : faqs;
  }, [faqs, activeCategory]);

  const handleTabKeyDown = (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const idx = CATEGORIES.findIndex((c) => c.id === activeCategory);
    let nextIdx = idx;
    if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = CATEGORIES.length - 1;
    else if (e.key === "ArrowRight") nextIdx = (idx + 1) % CATEGORIES.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + CATEGORIES.length) % CATEGORIES.length;
    const nextCat = CATEGORIES[nextIdx];
    setActiveCategory(nextCat.id);
    const btn = document.getElementById(`faq-tab-${nextCat.id}`);
    btn?.focus();
    btn?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const toggleAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const container = accordionRef.current;
    if (!container) return;
    container.querySelectorAll("details").forEach((el) => {
      el.open = nextState;
    });
  };

  const handleToggleItem = () => {
    const container = accordionRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll("details"));
    setAllExpanded(items.length > 0 && items.every((d) => d.open));
  };

  return (
    <section
      aria-labelledby="faq-heading"
      className="maqam-section py-12 md:py-16 px-4 sm:px-6 lg:px-10 xl:px-12 bg-[#FAFAF8] dark:bg-[#070c18] font-poppins transition-colors"
    >
      <div className="w-full max-w-[1160px] mx-auto">
        <div data-animate="fade-up" className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#00987A] dark:text-emerald-400 mb-2">
              <HelpCircle size={14} />
              <span>Pilgrim &amp; Traveler Knowledge Base</span>
            </div>
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              Frequently Asked{" "}
              <LiquidFillText text="Questions" />
            </h2>
          </div>

          <button
            type="button"
            onClick={toggleAll}
            aria-expanded={allExpanded}
            className="self-start md:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>

        {/* Accessible Scrollable Single-Row Tablist */}
        <div
          className="maqam-tablist flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 p-1.5 mb-6 shadow-2xs scrollbar-hide max-w-full"
          role="tablist"
          aria-label="FAQ categories"
          onKeyDown={handleTabKeyDown}
        >
          {CATEGORIES.map((cat) => {
            const selected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`faq-tab-${cat.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setAllExpanded(false);
                }}
                className={`flex-none px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selected
                    ? "text-[#045C45] dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Native Details Accordion */}
        <div ref={accordionRef} data-animate="stagger" data-stagger-target="details" className="maqam-accordion space-y-3">
          {filteredFaqs.map((faq, index) => (
            <details
              key={faq._id || index}
              open={index === 0}
              onToggle={handleToggleItem}
              className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs open:border-[#045C45]/40 dark:open:border-emerald-700/60 transition-colors"
            >
              <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none text-sm sm:text-base font-semibold text-slate-900 dark:text-white hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[#045C45] dark:text-emerald-400 transition-transform duration-200 -rotate-90 group-open:rotate-0"
                />
                <span>{faq.title}</span>
              </summary>
              <div className="px-5 pb-5 pl-12 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
