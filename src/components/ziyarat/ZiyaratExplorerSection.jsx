import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Clock, ArrowRight, BookOpen } from "lucide-react";
import { fetchBlogs } from "../../services/cmsService";
import LiquidFillText from "../ui/LiquidFillText";
import makkahKaabaImg from "../../assets/hero-slider/slide1-makkah-kaaba-tawaf.jpg";
import madinahDomeImg from "../../assets/hero-slider/slide3-madinah-green-dome.jpg";
import qubaImg from "../../assets/hero-slider/slide5-quba-mosque-madinah.jpg";

const ZIYARAT_TABS = [
  { id: "makkah", label: "Makkah Sacred Sites" },
  { id: "madinah", label: "Madinah Sacred Sites" },
  { id: "heritage", label: "Islamic Heritage" },
];

const ZIYARAT_SITES = {
  makkah: [
    {
      name: "Masjid al-Haram & Mataf",
      subtitle: "Heart of the Pilgrimage",
      timing: "Open 24 Hours · Guided orientation daily",
      description:
        "Circumambulate the Holy Kaaba, pray behind Maqam Ibrahim, and complete Sa'i between Safa and Marwah with step-by-step scholar etiquette.",
      image: makkahKaabaImg,
    },
    {
      name: "Mount Arafat (Jabal ar-Rahmah)",
      subtitle: "Site of the Farewell Sermon",
      timing: "Morning Ziyarat · 22 km southeast of Makkah",
      description:
        "Visit the plain of Arafat and the Mount of Mercy where the Prophet Muhammad (peace be upon him) delivered his final sermon.",
      image:
        "https://images.unsplash.com/photo-1650446647974-451d05d2136d?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Jabal al-Nour & Saudi Highlands",
      subtitle: "Historic Sanctuary Route",
      timing: "Early Dawn recommended · Guided transport",
      description:
        "Explore the historic mountain surrounding Cave Hira along with Mina, Muzdalifah, and Jamarat orientation stops.",
      image:
        "https://images.unsplash.com/photo-1681419671941-aa9bc9df0bfb?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  madinah: [
    {
      name: "Al-Masjid an-Nabawi & Rawdah",
      subtitle: "The Prophet's Mosque",
      timing: "Nusuk appointment required for Rawdah",
      description:
        "Offer prayers beneath the iconic shading umbrellas and visit the Noble Rawdah with coordinated entry timing guidance.",
      image: madinahDomeImg,
    },
    {
      name: "Masjid Quba",
      subtitle: "First Mosque Built in Islam",
      timing: "3.5 km from Al-Masjid an-Nabawi",
      description:
        "Follow the Sunnah by performing ablution at your hotel and praying two raka'at at Masjid Quba with guided historical narration.",
      image: qubaImg,
    },
    {
      name: "Mount Uhud & Martyrs' Plain",
      subtitle: "Historic Madinah Ziyarat",
      timing: "Morning Ziyarat · Shaded coach transfer",
      description:
        "Reflect at Jabal ar-Rumat and the resting place of Sayyidna Hamza (RA) with licensed multilingual scholars.",
      image:
        "https://images.unsplash.com/photo-1650446647986-ed369e2dd507?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  heritage: [
    {
      name: "Sultanahmet & Blue Mosque, Istanbul",
      subtitle: "Ottoman Architectural Legacy",
      timing: "5–7 Night Heritage Tours",
      description:
        "Experience classical Islamic calligraphy, courtyard fountains, and serene prayer spaces across historic Istanbul.",
      image:
        "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Registan Square, Samarkand",
      subtitle: "Silk Road Scholarship",
      timing: "Spring & Autumn Departures",
      description:
        "Walk through turquoise-tiled madrasas and visit the complex of Imam al-Bukhari along the ancient Silk Road.",
      image:
        "https://images.unsplash.com/photo-1715824633954-b74927ad2cd8?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Sheikh Zayed Grand Mosque, Abu Dhabi",
      subtitle: "Marble & Courtyard Splendor",
      timing: "Stopover Tours Available",
      description:
        "Combine your Jeddah or Madinah itinerary with a peaceful UAE stopover featuring halal fine dining and family excursions.",
      image:
        "https://images.unsplash.com/photo-1512970648279-ff3398568f77?auto=format&fit=crop&w=1200&q=80",
    },
  ],
};

export default function ZiyaratExplorerSection() {
  const [activeTab, setActiveTab] = useState("makkah");
  const [cmsPosts, setCmsPosts] = useState([]);

  useEffect(() => {
    let active = true;
    fetchBlogs({ limit: 3 })
      .then(({ posts }) => {
        if (!active || !Array.isArray(posts)) return;
        setCmsPosts(posts);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const currentSites = ZIYARAT_SITES[activeTab] || ZIYARAT_SITES.makkah;

  const handleTabKeyDown = (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const idx = ZIYARAT_TABS.findIndex((t) => t.id === activeTab);
    let nextIdx = idx;
    if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = ZIYARAT_TABS.length - 1;
    else if (e.key === "ArrowRight") nextIdx = (idx + 1) % ZIYARAT_TABS.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + ZIYARAT_TABS.length) % ZIYARAT_TABS.length;
    const nextTab = ZIYARAT_TABS[nextIdx];
    setActiveTab(nextTab.id);
    const btn = document.getElementById(`ziyarat-tab-${nextTab.id}`);
    btn?.focus();
    btn?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  return (
    <section
      aria-labelledby="ziyarat-explorer-heading"
      className="maqam-section py-12 md:py-16 px-4 sm:px-6 lg:px-10 xl:px-12 bg-[#FAFAF8] dark:bg-[#070c18] font-poppins transition-colors"
    >
      <div className="w-full max-w-[1760px] mx-auto">
        <div data-animate="fade-up" className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#00987A] dark:text-emerald-400 mb-2">
              <Compass size={14} />
              <span>Spiritual Preparation &amp; Ziyarat Guide</span>
            </div>
            <h2
              id="ziyarat-explorer-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              Sacred Landmarks &amp;{" "}
              <LiquidFillText text="Guided Ziyarat Sites" />
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Prepare for your pilgrimage with historical context, practical visiting hours, and licensed multilingual guides.
            </p>
          </div>

          <div
            className="maqam-tablist flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-2xs scrollbar-hide max-w-full"
            role="tablist"
            aria-label="Ziyarat destination tabs"
            onKeyDown={handleTabKeyDown}
          >
            {ZIYARAT_TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`ziyarat-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-none px-3.5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selected
                      ? "text-[#045C45] dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div data-animate="stagger" data-stagger-target="article" className="flex overflow-x-auto snap-x snap-proximity overscroll-x-contain scrollbar-hide [-webkit-overflow-scrolling:touch] gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-3 md:gap-6">
          {currentSites.map((site) => (
            <article
              key={site.name}
              className="group flex-none w-[82vw] max-w-[330px] snap-start md:w-auto md:max-w-none rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900 overflow-hidden shadow-xs transition-all flex flex-col"
            >
              <div className="relative h-52 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={site.image}
                  alt={site.name}
                  loading="lazy"
                  width="540"
                  height="320"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
                    {site.subtitle}
                  </p>
                  <h3 className="text-lg font-bold text-white leading-snug">{site.name}</h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00987A] dark:text-emerald-400 mb-2">
                    <Clock size={13} className="shrink-0" />
                    <span>{site.timing}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {site.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                  <Link
                    to="/guides"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#045C45] dark:text-emerald-400 hover:text-[#00987A] transition-colors"
                  >
                    <span>Book a Licensed Ziyarat Guide</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Dynamic CMS Travel Articles Strip (rendered when backend CMS returns published blog posts) */}
        {cmsPosts.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00987A] dark:text-emerald-400 mb-4">
              <BookOpen size={14} />
              <span>Published Travel &amp; Pilgrim Guides</span>
            </div>
            <div className="flex overflow-x-auto snap-x snap-proximity overscroll-x-contain scrollbar-hide [-webkit-overflow-scrolling:touch] gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-3 md:gap-5">
              {cmsPosts.map((post) => (
                <article
                  key={post._id || post.slug}
                  className="flex-none w-[82vw] max-w-[330px] snap-start md:w-auto md:max-w-none rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#F6F4EF] dark:bg-slate-900 p-4 flex gap-4 items-center"
                >
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      width="96"
                      height="96"
                      className="h-20 w-20 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
