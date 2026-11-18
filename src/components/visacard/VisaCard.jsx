import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { tokenService } from "../../services/auth/tokenService.js";
import { Lock, LogIn, Home, X } from "lucide-react";
import CommonHeader from "../CommonHeader";
import api from "../stores/api";
import { VisaAPI } from "../../configs/api";
import { getDocumentUrl } from "../../utils/documentUrl";
import { toast } from "react-toastify";
import { getContinentForCountry, getCountryFlag } from "./visaUtils";
import VisaCatalogHero from "./VisaCatalogHero";
import VisaCountryGrid from "./VisaCountryGrid";
import VisaApplyModal from "./VisaApplyModal";

const Login = lazy(() => import("../Login"));
const Register = lazy(() => import("../../pages/Register"));

export default function VisaCard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useSelector(
    (state) =>
      state.auth.isAuthenticated || Boolean(tokenService.getAccessToken()),
  );
  const [authModalView, setAuthModalView] = useState("login"); // "login" | "register"
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auto-redirect to My Bookings visa section if tab=applications was requested
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "applications" || tab === "my-applications") {
      navigate("/bookings?type=visa", { replace: true });
    }
  }, [searchParams, navigate]);

  // Visas Catalog Data (Fetched purely from Database via VisaAPI)
  const [visas, setVisas] = useState([]);
  const [isLoadingVisas, setIsLoadingVisas] = useState(true);
  const [, setFetchError] = useState(null);

  // Selected Visa & Application Modal State
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [resumingGroupId, setResumingGroupId] = useState(null);
  const [initialApplicants, setInitialApplicants] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Visas");
  const [deliveryFilter] = useState("Any Time");
  const [typeFilter] = useState("All Visa Types");

  const fetchCatalogVisas = async () => {
    try {
      setIsLoadingVisas(true);
      setFetchError(null);
      const response = await api.get(VisaAPI.UserVisasCatalogApi);
      const resData = response.data?.data || response.data;
      const dbVisas =
        resData?.availableVisas || (Array.isArray(resData) ? resData : []);

      if (Array.isArray(dbVisas)) {
        const mapped = dbVisas.map((item, idx) => {
          const rawCountry = item.country || item.title || "Country";
          const countryName = rawCountry
            .toLowerCase()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          const countryCode = (
            item.countryCode ||
            item.code ||
            "UN"
          ).toUpperCase();

          const totalPrice =
            item.fees?.totalPrice ||
            item.fees?.basePrice ||
            item.priceNumber ||
            5000;

          const category =
            item.category || getContinentForCountry(countryName) || "Popular";

          const flag =
            item.countryFlag ||
            item.flagEmoji ||
            item.flag ||
            getCountryFlag(countryCode);

          const image =
            item.countryPicture ||
            item.countryImage ||
            item.bannerImage ||
            item.image ||
            "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=900&q=80";

          const processingTime = item.processingTime || "3-5 Working Days";
          const delivery =
            item.delivery ||
            (processingTime.toLowerCase().includes("hour") ||
            processingTime.toLowerCase().includes("1-3") ||
            processingTime.toLowerCase().includes("3-5")
              ? "express"
              : "standard");

          return {
            id: item._id || item.id || idx + 1,
            _id: item._id,
            country: countryName,
            code: countryCode,
            flag,
            type: item.visaType || item.type || "Tourist Visa",
            title:
              item.title ||
              `${countryName} ${item.visaType || "Tourist Visa"}`,
            valid: item.validity || "30 Days",
            stayDuration: item.stayDuration || "30 Days",
            fee: `₹${totalPrice.toLocaleString()}`,
            priceNumber: totalPrice,
            fees: item.fees,
            visaDate: processingTime,
            category,
            delivery,
            image,
            description: item.description,
            requiredDocuments: item.requiredDocuments || [],
            raw: item,
          };
        });

        setVisas(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch visa catalog from database:", err);
      setFetchError(
        err.response?.data?.message ||
          "Could not load visa catalog from database. Please ensure backend is running.",
      );
    } finally {
      setIsLoadingVisas(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCatalogVisas();
    } else {
      setShowAuthModal(true);
      toast.info("Log in is mandatory to access Visa services.");
    }
  }, [isAuthenticated]);

  const openApplication = (visa) => {
    if (!isAuthenticated) {
      toast.info("Please log in to apply for visa services.");
      setShowAuthModal(true);
      return;
    }
    setResumingGroupId(null);
    setSelectedVisa(visa);

    // Pre-fill Lead applicant if user logged in
    let defaultFullName = "";
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u?.name) defaultFullName = u.name;
    } catch {}

    let initialPax = [
      {
        id: Date.now(),
        title: "Mr",
        fullName: defaultFullName,
        passportPhoto: null,
        photoPreview: null,
        travelerPhoto: null,
        travelerPhotoPreview: null,
        passportNumber: "",
        dateOfBirth: "1995-01-01",
        gender: "male",
        nationality: "Indian",
        isAuthenticatingPassport: false,
        passportValidated: false,
        passportValidationDetails: null,
      },
    ];

    // Restore any previously auto-saved draft for this visa
    try {
      const draftKey = `visa_draft_${visa?.country || visa?.id || "default"}`;
      const savedRaw = localStorage.getItem(draftKey);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        const list = Array.isArray(parsed) ? parsed : parsed?.applicants;
        if (Array.isArray(list) && list.length > 0) {
          initialPax = list.map((a) => ({
            ...a,
            passportPhoto: null,
            photoPreview: a.photoPreview || null,
            travelerPhoto: null,
            travelerPhotoPreview: a.travelerPhotoPreview || null,
          }));
        }
      }
    } catch (e) {
      console.warn("Could not load auto-saved visa draft:", e);
    }

    setInitialApplicants(initialPax);
  };

  // Auto-open application if ?groupId=... or ?country=... or ?openVisa=... is provided in URL
  useEffect(() => {
    const groupIdParam = searchParams.get("groupId");
    const countryParam = searchParams.get("country");
    const visaIdParam = searchParams.get("visaId") || searchParams.get("openVisa");

    // When resuming a draft application from My Bookings
    if (groupIdParam) {
      if (resumingGroupId === groupIdParam) return;

      const loadGroupForResume = async () => {
        try {
          const res = await api.get(VisaAPI.UserSingleGroupApi(groupIdParam));
          const groupData = res.data?.data || res.data;
          const group = groupData?.group || groupData;
          const apps = groupData?.applications || group?.applications || [];

          const targetCountry = group?.destinationCountry || countryParam || "";
          const cLower = targetCountry.trim().toLowerCase();
          const matchedVisa =
            (visas || []).find(
              (v) =>
                v.country?.toLowerCase() === cLower ||
                v.title?.toLowerCase().includes(cLower) ||
                cLower.includes(v.country?.toLowerCase()),
            ) ||
            group?.visa || {
              id: groupIdParam,
              _id: groupIdParam,
              country: targetCountry || "Visa Service",
              title: `${targetCountry} Visa`,
              type: group?.visaType || "Tourist Visa",
              category: "Tourist",
              fee: `₹${Math.round(
                (group?.totalAmount || 5000) / Math.max(apps.length, 1),
              ).toLocaleString()}`,
              delivery: "3-5 Working Days",
              valid: "30 Days",
            };

          setSelectedVisa(matchedVisa);
          setResumingGroupId(groupIdParam);

          if (Array.isArray(apps) && apps.length > 0) {
            let mapped = apps.map((app, idx) => {
              const trav = app.travelerDetails || {};
              const docs = app.documents || {};
              const passportUrl = getDocumentUrl(
                docs.passportScan || docs.passport,
              );
              const photoUrl = getDocumentUrl(
                docs.photo || docs.travelerPhoto || docs.passportSizePhoto,
              );
              const fName = (trav.firstName || "").trim();
              const lName = (trav.lastName || "").trim();
              const fullName = [fName, lName].filter(Boolean).join(" ");
              let dob = "1995-01-01";
              if (trav.dateOfBirth) {
                try {
                  dob = new Date(trav.dateOfBirth).toISOString().split("T")[0];
                } catch {
                  dob = "1995-01-01";
                }
              }

              return {
                id: app._id || `traveller_${idx + 1}_${Date.now()}`,
                appId: app._id,
                title: trav.title || "Mr",
                fullName: fullName || fName || "",
                passportPhoto: null,
                photoPreview: passportUrl || null,
                travelerPhoto: null,
                travelerPhotoPreview: photoUrl || null,
                passportNumber: trav.passportNumber || "",
                dateOfBirth: dob,
                gender: (trav.gender || "male").toLowerCase(),
                nationality: trav.nationality || "Indian",
                isAuthenticatingPassport: false,
                passportValidated: Boolean(passportUrl),
                passportValidationDetails: passportUrl
                  ? {
                      resolution: "High Resolution (Attached)",
                      fileSize: "Verified Document",
                    }
                  : null,
              };
            });

            // Restore any recent auto-saved draft edits made by the user
            try {
              const resumeDraftKey = `visa_draft_resume_${groupIdParam}`;
              const savedDraftRaw = localStorage.getItem(resumeDraftKey);
              if (savedDraftRaw) {
                const parsed = JSON.parse(savedDraftRaw);
                const draftApps = Array.isArray(parsed) ? parsed : parsed?.applicants;
                if (Array.isArray(draftApps) && draftApps.length > 0) {
                  mapped = draftApps.map((da) => ({
                    ...da,
                    passportPhoto: null,
                    photoPreview: da.photoPreview || null,
                    travelerPhoto: null,
                    travelerPhotoPreview: da.travelerPhotoPreview || null,
                  }));
                }
              }
            } catch (err) {
              console.warn("Could not restore local resume draft edits:", err);
            }

            setInitialApplicants(mapped);
          }
        } catch (err) {
          console.error("Failed to load visa group for resume:", err);
          toast.error("Could not load draft visa group details.");
        }
      };

      loadGroupForResume();
      return;
    }

    if (!visas || visas.length === 0 || selectedVisa) return;

    if (visaIdParam) {
      const match = visas.find(
        (v) =>
          String(v.id) === String(visaIdParam) ||
          String(v._id) === String(visaIdParam),
      );
      if (match) {
        openApplication(match);
        return;
      }
    }

    if (countryParam) {
      const cLower = countryParam.trim().toLowerCase();
      const match = visas.find(
        (v) =>
          v.country?.toLowerCase() === cLower ||
          v.title?.toLowerCase().includes(cLower) ||
          cLower.includes(v.country?.toLowerCase()),
      );
      if (match) {
        openApplication(match);
      }
    }
  }, [searchParams, visas]);

  const filteredVisas = useMemo(() => {
    return visas.filter((item) => {
      const matchesSearch =
        item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "All Visas" ||
        activeCategory === "Popular" ||
        item.category === activeCategory;

      const matchesType =
        typeFilter === "All Visa Types" ||
        (typeFilter === "E-Visa" &&
          item.type.toLowerCase().includes("e-visa")) ||
        (typeFilter === "Tourist Visa" &&
          item.type.toLowerCase().includes("tourist"));

      const matchesDelivery =
        deliveryFilter === "Any Time" ||
        (deliveryFilter === "Express (3-5 Days)" &&
          item.delivery === "express") ||
        (deliveryFilter === "Standard (5-10 Days)" &&
          item.delivery === "standard");

      return matchesSearch && matchesCategory && matchesType && matchesDelivery;
    });
  }, [visas, searchQuery, activeCategory, typeFilter, deliveryFilter]);

  const closeApplyModal = () => {
    setSelectedVisa(null);
    setResumingGroupId(null);
    setInitialApplicants(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins">
      <CommonHeader title="Visa" value={false} />
      {!isAuthenticated ? (
        /* Mandatory Login Barrier View */
        <main className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 pb-16 pt-24 font-poppins">
          <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-400/30 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={32} />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Authentication Mandatory
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Log In Required
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  Access to the Visa page is restricted to registered members. Log in or create an account to view visa country catalogues, check processing times, and submit e-visa applications.
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
                  onClick={() => navigate("/")}
                  className="w-full py-3.5 px-6 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Home size={15} />
                  <span>Go to Home</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <>
          <VisaCatalogHero
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />

          <VisaCountryGrid
            isLoadingVisas={isLoadingVisas}
            filteredVisas={filteredVisas}
            visas={visas}
            onFetchVisas={fetchCatalogVisas}
            onResetFilters={() => {
              setSearchQuery("");
              setActiveCategory("All Visas");
            }}
            onOpenApplication={openApplication}
            navigate={navigate}
          />

          {/* Visa Application Modal */}
          {selectedVisa && (
            <VisaApplyModal
              isOpen={Boolean(selectedVisa)}
              selectedVisa={selectedVisa}
              onClose={closeApplyModal}
              resumingGroupId={resumingGroupId}
              initialApplicants={initialApplicants}
              onApplicationComplete={closeApplyModal}
            />
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
                        Log in or register to submit visa applications and track your batches.
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
                          fetchCatalogVisas();
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
                          fetchCatalogVisas();
                        }}
                        redirectPath=""
                      />
                    )}
                  </div>
                </Suspense>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
