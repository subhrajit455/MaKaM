import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { tokenService } from "../services/auth/tokenService.js";
import {
  User,
  ArrowLeft,
  Lock,
  LogIn,
  Globe,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import Logo from "../assets/logo.png";
import api from "../components/stores/api";
import { VisaAPI } from "../configs/api";
import { getCountryVisaData } from "../data/visaCountriesData";
import VisaApplyModal from "../components/visacard/VisaApplyModal";
import CountryVisaHero from "./visa/CountryVisaHero";
import CountryVisaOverview from "./visa/CountryVisaOverview";
import CountryVisaPricingCard from "./visa/CountryVisaPricingCard";

const Login = lazy(() => import("../components/Login"));
const Register = lazy(() => import("./Register"));

export default function CountryVisaDetail() {
  const { countrySlug } = useParams();
  const navigate = useNavigate();

  // Authentication State
  const isAuthenticated = useSelector(
    (state) =>
      state.auth.isAuthenticated || Boolean(tokenService.getAccessToken()),
  );

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState("login");

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthModalView("login");
      setShowAuthModal(true);
      toast.info("Log in is mandatory to view visa details.");
    }
  }, [isAuthenticated]);

  // Database Country Data (Enriched from VisaAPI)
  const [dbCountryData, setDbCountryData] = useState(null);
  const [allCountryVisas, setAllCountryVisas] = useState([]);
  const [, setSelectedVisaId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDbVisas = async () => {
      try {
        const response = await api.get(VisaAPI.UserVisasCatalogApi);
        const resData = response.data?.data || response.data;
        const available =
          resData?.availableVisas || (Array.isArray(resData) ? resData : null);

        if (isMounted && available && available.length > 0) {
          const slug = (countrySlug || "").toLowerCase().trim();
          const matchedList = available.filter((v) => {
            const countryName = (v.country || "").toLowerCase().trim();
            const title = (v.title || "").toLowerCase().trim();
            const cCode = (v.countryCode || "").toLowerCase().trim();
            const id = String(v._id || v.id || "").toLowerCase();

            return (
              countryName.replace(/\s+/g, "-") === slug ||
              countryName === slug.replace(/-/g, " ") ||
              cCode === slug ||
              id === slug ||
              title.toLowerCase().replace(/\s+/g, "-") === slug ||
              countryName.includes(slug.replace(/-/g, " "))
            );
          });

          if (matchedList.length > 0) {
            setAllCountryVisas(matchedList);
            const activeMatch =
              matchedList.find(
                (v) => String(v._id) === slug || String(v.id) === slug,
              ) || matchedList[0];
            setDbCountryData(activeMatch);
            setSelectedVisaId(activeMatch._id || activeMatch.id);
          }
        }
      } catch (err) {
        console.warn("Could not fetch DB country visa data:", err);
      }
    };
    fetchDbVisas();
    return () => {
      isMounted = false;
    };
  }, [countrySlug]);

  const handleSelectVisa = (visa) => {
    if (!visa) return;
    setDbCountryData(visa);
    setSelectedVisaId(visa._id || visa.id);
  };

  // Active Country Data (Resolved dynamically & enriched with DB values)
  const country = useMemo(() => {
    const base = getCountryVisaData(countrySlug || "indonesia");
    if (!dbCountryData) return base;

    const totalPrice =
      dbCountryData.fees?.totalPrice ||
      dbCountryData.fees?.basePrice ||
      base.priceNumber;

    const currencySymbol =
      dbCountryData.fees?.currency === "USD"
        ? "$"
        : dbCountryData.fees?.currency === "EUR"
          ? "€"
          : dbCountryData.fees?.currency === "AED"
            ? "AED "
            : "₹";

    const flag =
      dbCountryData.countryFlag && dbCountryData.countryFlag.startsWith("http")
        ? dbCountryData.countryFlag
        : dbCountryData.flagEmoji ||
          (dbCountryData.countryCode
            ? `https://flagcdn.com/w80/${dbCountryData.countryCode.toLowerCase()}.png`
            : base.flag);

    const getDocDefaultDesc = (docType = "", label = "") => {
      const t = (docType + " " + label).toLowerCase();
      if (t.includes("photo") || t.includes("picture") || t.includes("selfie")) {
        return "Recent passport-size color photograph with white background, front-facing without glare.";
      }
      if (t.includes("passport") || t.includes("scan") || t.includes("bio")) {
        return "Clear color scan or photo of passport front/bio page with minimum 6 months validity.";
      }
      if (t.includes("ticket") || t.includes("flight")) {
        return "Confirmed onward or return flight itinerary.";
      }
      if (t.includes("hotel") || t.includes("stay") || t.includes("accommodation")) {
        return "Confirmed hotel reservation or accommodation proof.";
      }
      if (t.includes("bank") || t.includes("statement") || t.includes("financial")) {
        return "Bank account statement showing sufficient funds for travel.";
      }
      return "Official required document for verification and visa submission.";
    };

    const getDocIconType = (docType = "", label = "") => {
      const t = (docType + " " + label).toLowerCase();
      if (t.includes("photo") || t.includes("picture")) return "photo";
      if (t.includes("flight") || t.includes("ticket")) return "flight";
      if (t.includes("hotel") || t.includes("accommodation")) return "hotel";
      if (t.includes("bank") || t.includes("financial")) return "finance";
      return "passport";
    };

    const formatAllowedMimes = (mimes) => {
      if (!Array.isArray(mimes) || mimes.length === 0) return "JPG, PNG, PDF";
      return mimes
        .map((m) => {
          if (m.includes("jpeg") || m.includes("jpg")) return "JPG";
          if (m.includes("png")) return "PNG";
          if (m.includes("webp")) return "WEBP";
          if (m.includes("pdf")) return "PDF";
          return m.split("/")[1]?.toUpperCase() || m;
        })
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(", ");
    };

    const requiredDocs =
      Array.isArray(dbCountryData.requiredDocuments) &&
      dbCountryData.requiredDocuments.length > 0
        ? dbCountryData.requiredDocuments.map((doc, idx) => {
            if (typeof doc === "string") {
              return {
                id: `doc_${idx}`,
                docType: doc,
                title: doc,
                label: doc,
                desc: getDocDefaultDesc(doc, doc),
                required: true,
                isRequired: true,
                allowedMimes: ["image/jpeg", "image/png", "application/pdf"],
                formatsText: "JPG, PNG, PDF",
                maxSizeBytes: 5242880,
                maxSizeText: "5 MB",
                icon: getDocIconType(doc, doc),
              };
            }
            const docType =
              doc.docType ||
              (doc.label?.toLowerCase().includes("photo")
                ? "travellerPhoto"
                : "passportScan");
            const label =
              doc.label ||
              doc.title ||
              (doc.docType
                ? doc.docType.replace(/([A-Z])/g, " $1").trim()
                : `Document ${idx + 1}`);
            const isReq =
              doc.isRequired !== undefined
                ? doc.isRequired
                : doc.required !== undefined
                  ? doc.required
                  : true;
            const mimes =
              doc.allowedMimes || [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "application/pdf",
              ];
            const maxBytes = doc.maxSizeBytes || 5242880;
            const maxMB = Math.round(maxBytes / (1024 * 1024)) || 5;

            return {
              id: doc._id || `doc_${idx}`,
              docType,
              title: label,
              label,
              desc: doc.description?.trim() || getDocDefaultDesc(docType, label),
              required: isReq,
              isRequired: isReq,
              allowedMimes: mimes,
              formatsText: formatAllowedMimes(mimes),
              maxSizeBytes: maxBytes,
              maxSizeText: `${maxMB} MB`,
              icon: getDocIconType(docType, label),
            };
          })
        : base.documents;

    return {
      ...base,
      id: dbCountryData._id || base.id,
      _id: dbCountryData._id,
      country: dbCountryData.country
        ? dbCountryData.country
            .toLowerCase()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : base.country,
      code: dbCountryData.countryCode || base.code,
      flag,
      type: dbCountryData.visaType || base.type,
      title:
        dbCountryData.title ||
        `${dbCountryData.country || base.country} ${
          dbCountryData.visaType || base.type
        }`,
      validity: dbCountryData.validity || base.validity,
      stayDuration: dbCountryData.stayDuration || base.stayDuration,
      entryType: dbCountryData.entryType || base.entryType,
      headline:
        dbCountryData.title ||
        dbCountryData.description ||
        base.headline,
      description: dbCountryData.description || base.headline,
      price: `${currencySymbol}${totalPrice.toLocaleString()}`,
      priceNumber: totalPrice,
      currencySymbol,
      fees: dbCountryData.fees || null,
      inventory: dbCountryData.inventory || null,
      govtFee:
        dbCountryData.fees?.governmentFee !== undefined
          ? `${currencySymbol}${dbCountryData.fees.governmentFee.toLocaleString()}`
          : base.govtFee,
      serviceFee:
        dbCountryData.fees?.serviceFee !== undefined
          ? `${currencySymbol}${dbCountryData.fees.serviceFee.toLocaleString()}`
          : base.serviceFee,
      baseFee:
        dbCountryData.fees?.basePrice !== undefined
          ? `${currencySymbol}${dbCountryData.fees.basePrice.toLocaleString()}`
          : null,
      taxFee:
        dbCountryData.fees?.tax !== undefined
          ? `${currencySymbol}${dbCountryData.fees.tax.toLocaleString()}`
          : null,
      timeline: dbCountryData.processingTime || base.timeline,
      processingTime: dbCountryData.processingTime || base.processingTime,
      heroImage:
        dbCountryData.bannerImage ||
        dbCountryData.countryPicture ||
        base.heroImage,
      cardImage:
        dbCountryData.countryImage ||
        dbCountryData.countryPicture ||
        base.cardImage,
      documents: requiredDocs,
      rules:
        Array.isArray(dbCountryData.guidelines) &&
        dbCountryData.guidelines.length > 0
          ? dbCountryData.guidelines
          : base.rules,
      termsAndConditions:
        Array.isArray(dbCountryData.termsAndConditions) &&
        dbCountryData.termsAndConditions.length > 0
          ? dbCountryData.termsAndConditions
          : [],
      gallery: Array.isArray(dbCountryData.gallery) ? dbCountryData.gallery : [],
    };
  }, [countrySlug, dbCountryData]);

  // UI State & Section Refs for Scroll Spy
  const [activeTab, setActiveTab] = useState("info");
  const infoRef = useRef(null);
  const processRef = useRef(null);

  // Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const scrollToSection = (tabName, ref) => {
    setActiveTab(tabName);
    if (ref?.current) {
      const topOffset = 85;
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleOpenApplication = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to apply for visa services.");
      setAuthModalView("login");
      setShowAuthModal(true);
      return;
    }
    setIsApplyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-poppins antialiased text-slate-800">
      {/* Top Minimal Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={Logo}
                alt="Maqam Travels"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="hidden md:inline-block font-extrabold text-sm tracking-tight text-slate-900 border-l border-slate-300 pl-3">
                Visa Services
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/visa-card"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold transition border border-emerald-200/60 shadow-2xs group"
            >
              <Globe
                size={13}
                className="text-emerald-600 group-hover:rotate-12 transition-transform"
              />
              <span>Explore All Visas</span>
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                  <User size={13} />
                </div>
                <span className="hidden sm:inline">My Account</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthModalView("login");
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <User size={14} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {!isAuthenticated ? (
        <main className="max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-400/30 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={32} />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Authentication Mandatory
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Log In Required
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  Log in is mandatory to view official {country.country} visa requirements, processing fees, and submit e-visa applications.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView("login");
                    setShowAuthModal(true);
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-teal-900/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  <span>Log In / Sign Up Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/visa-card")}
                  className="w-full py-3.5 px-6 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={15} />
                  <span>Back to Visas</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <>
          <main className="max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-20">
            <CountryVisaHero
              country={country}
              infoRef={infoRef}
              processRef={processRef}
              activeTab={activeTab}
              scrollToSection={scrollToSection}
              onOpenApplication={handleOpenApplication}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
              <div className="lg:col-span-8 space-y-8">
                <CountryVisaOverview
                  country={country}
                  allCountryVisas={allCountryVisas}
                  onSelectVisa={handleSelectVisa}
                  onOpenApplication={handleOpenApplication}
                  infoRef={infoRef}
                  processRef={processRef}
                />
              </div>

              <CountryVisaPricingCard
                country={country}
                onOpenApplication={handleOpenApplication}
              />
            </div>
          </main>

          {/* Visa Application Modal */}
          {isApplyModalOpen && (
            <VisaApplyModal
              isOpen={isApplyModalOpen}
              selectedVisa={country}
              onClose={() => setIsApplyModalOpen(false)}
              onApplicationComplete={() => setIsApplyModalOpen(false)}
            />
          )}
        </>
      )}

      {/* Auth Modal (Login / Register) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl mx-auto my-auto">
            <div className="mb-3 flex items-center justify-between gap-2.5 bg-white/95 backdrop-blur-md border border-amber-300/80 rounded-2xl px-4 py-3 shadow-xl">
              <div className="flex items-center gap-2.5 text-xs font-extrabold text-amber-900">
                <span className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Lock size={14} />
                </span>
                <div>
                  <p className="font-bold text-xs text-slate-900">
                    Sign In to Visa Services
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Log in or register to submit visa applications.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Close login modal"
              >
                <X size={18} />
              </button>
            </div>

            <Suspense fallback={<div className="p-8 text-center text-white">Loading...</div>}>
              <div className="relative">
                {authModalView === "login" ? (
                  <Login
                    isLoading={false}
                    setShowLoginPopup={() => setShowAuthModal(false)}
                    setShowRegisterPopup={() => setAuthModalView("register")}
                    onSuccess={() => {
                      setShowAuthModal(false);
                    }}
                    redirectPath=""
                  />
                ) : (
                  <Register
                    setShowLoginPopup={() => setAuthModalView("login")}
                    setShowRegisterPopup={() => setShowAuthModal(false)}
                    onSuccess={() => {
                      setShowAuthModal(false);
                      toast.success(
                        "Welcome to Maqam! Access granted to Visa Services.",
                      );
                    }}
                    redirectPath=""
                  />
                )}
              </div>
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
