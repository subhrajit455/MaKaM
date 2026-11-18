import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Check,
  X,
  Plus,
  Trash2,
  Info,
  ArrowRight,
  FileCheck2,
  FileText,
  ShieldCheck,
  UploadCloud,
  Camera,
  CreditCard,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import anime from "animejs";
import api from "../stores/api";
import { VisaAPI } from "../../configs/api";
import paymentService from "../../services/paymentService";
import { clickSquash, springEntrance } from "../../animations/presets";
import { CountryFlagIcon, validatePassportFrontImage } from "./visaUtils";

export default function VisaApplyModal({
  isOpen = false,
  selectedVisa = null,
  onClose,
  resumingGroupId = null,
  initialApplicants = null,
  onApplicationComplete,
}) {
  const [modalStep, setModalStep] = useState(1);
  const [applicants, setApplicants] = useState(() => {
    if (initialApplicants && initialApplicants.length > 0) {
      return initialApplicants;
    }
    return [
      {
        id: Date.now(),
        title: "Mr",
        fullName: "",
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
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPayingVisaId, setIsPayingVisaId] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);

  // Update applicants when initialApplicants changes
  useEffect(() => {
    if (initialApplicants && initialApplicants.length > 0) {
      setApplicants(initialApplicants);
    }
  }, [initialApplicants]);

  // Anime.js Modal Spring Entrance
  useEffect(() => {
    if (isOpen && selectedVisa) {
      springEntrance(".apply-modal-card", {
        duration: 380,
      });
    }
  }, [isOpen, selectedVisa]);

  // Anime.js Modal Step Transition
  useEffect(() => {
    if (isOpen && selectedVisa) {
      anime({
        targets: ".modal-step-container",
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 300,
        easing: "easeOutCubic",
      });
    }
  }, [modalStep, isOpen, selectedVisa]);

  // Auto-save visa form details in real-time as user changes anything
  useEffect(() => {
    if (!selectedVisa) return;
    const hasData = applicants.some(
      (a) =>
        a.fullName?.trim() ||
        a.passportNumber?.trim() ||
        a.photoPreview ||
        a.travelerPhotoPreview ||
        (a.title && a.title !== "Mr")
    );
    if (!hasData) return;

    setAutoSaveStatus("saving");
    const timer = setTimeout(() => {
      try {
        const draftKey = resumingGroupId
          ? `visa_draft_resume_${resumingGroupId}`
          : `visa_draft_${selectedVisa?.country || selectedVisa?.id || "default"}`;

        const serializable = {
          applicants: applicants.map((a) => ({
            id: a.id,
            appId: a.appId,
            title: a.title,
            fullName: a.fullName,
            passportNumber: a.passportNumber,
            dateOfBirth: a.dateOfBirth,
            gender: a.gender,
            nationality: a.nationality,
            photoPreview: a.photoPreview,
            travelerPhotoPreview: a.travelerPhotoPreview,
            passportValidationDetails: a.passportValidationDetails,
            passportValidated: a.passportValidated,
          })),
          modalStep,
          timestamp: Date.now(),
        };

        localStorage.setItem(draftKey, JSON.stringify(serializable));
        setAutoSaveStatus("saved");
      } catch (err) {
        console.warn("Failed to auto-save visa draft:", err);
        setAutoSaveStatus("saved");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [applicants, modalStep, selectedVisa, resumingGroupId]);

  if (!isOpen || !selectedVisa) return null;

  const handlePayVisaGroup = async (groupId) => {
    if (!groupId || isPayingVisaId) return;
    try {
      setIsPayingVisaId(groupId);
      toast.info("Connecting to PayPal secure checkout...");

      const returnUrl = `${window.location.origin}/payment/paypal/success?type=visa&bookingId=${groupId}`;
      const cancelUrl = `${window.location.origin}/payment/paypal/cancel?type=visa&bookingId=${groupId}`;

      const paymentOrderRes = await paymentService.createPayPalOrder({
        bookingId: groupId,
        bookingType: "visa",
        returnUrl,
        cancelUrl,
      });

      const redirectUrl =
        paymentOrderRes?.redirectUrl ||
        paymentOrderRes?.approvalUrl ||
        paymentOrderRes?.data?.redirectUrl ||
        paymentOrderRes?.data?.approvalUrl ||
        paymentOrderRes?.data?.links?.find((l) => l.rel === "approve")?.href;

      if (redirectUrl) {
        sessionStorage.setItem("lastVisaBookingId", String(groupId));
        sessionStorage.setItem("lastPaymentBookingType", "visa");
        toast.info("Redirecting to PayPal...");
        window.location.assign(redirectUrl);
      } else {
        throw new Error(
          paymentOrderRes?.message ||
            "PayPal checkout link could not be generated. Please try again."
        );
      }
    } catch (err) {
      console.error("Visa PayPal Payment Error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Payment initiation failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsPayingVisaId(null);
    }
  };

  const addApplicant = () => {
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    setApplicants((prev) => [
      ...prev,
      {
        id: newId,
        title: "Mr",
        fullName: "",
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
    ]);
  };

  const removeApplicant = (id) => {
    if (applicants.length <= 1) return;
    setApplicants((prev) => prev.filter((a) => a.id !== id));
  };

  const updateApplicant = (id, field, value) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
    if (validationErrors[id]?.[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        if (next[id]) {
          delete next[id][field];
          if (Object.keys(next[id]).length === 0) delete next[id];
        }
        return next;
      });
    }
  };

  const handlePhotoUpload = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, isAuthenticatingPassport: true } : a
      )
    );

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;
      const authResult = await validatePassportFrontImage(file, dataUrl);

      setApplicants((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          if (authResult.isValid) {
            return {
              ...a,
              passportPhoto: file,
              photoPreview: dataUrl,
              isAuthenticatingPassport: false,
              passportValidated: true,
              passportValidationDetails: authResult.details,
            };
          } else {
            return {
              ...a,
              passportPhoto: null,
              photoPreview: null,
              isAuthenticatingPassport: false,
              passportValidated: false,
              passportValidationDetails: null,
            };
          }
        })
      );

      if (authResult.isValid) {
        toast.success("Passport front bio page identified & validated!");
        if (validationErrors[id]?.passportImage) {
          setValidationErrors((prev) => {
            const next = { ...prev };
            if (next[id]) {
              delete next[id].passportImage;
              if (Object.keys(next[id]).length === 0) delete next[id];
            }
            return next;
          });
        }
      } else {
        toast.error(authResult.error);
        setValidationErrors((prev) => ({
          ...prev,
          [id]: {
            ...(prev[id] || {}),
            passportImage: authResult.error,
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (id) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              passportPhoto: null,
              photoPreview: null,
              passportValidated: false,
              passportValidationDetails: null,
            }
          : a
      )
    );
  };

  const handleTravelerPhotoUpload = (id, e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setApplicants((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, travelerPhoto: file, travelerPhotoPreview: reader.result }
              : a
          )
        );
      };
      reader.readAsDataURL(file);

      if (validationErrors[id]?.travelerPhoto) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          if (next[id]) {
            delete next[id].travelerPhoto;
            if (Object.keys(next[id]).length === 0) delete next[id];
          }
          return next;
        });
      }
    }
  };

  const removeTravelerPhoto = (id) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, travelerPhoto: null, travelerPhotoPreview: null }
          : a
      )
    );
  };

  const proceedToStep2 = (e) => {
    e.preventDefault();
    const errors = {};
    let hasError = false;

    applicants.forEach((app, idx) => {
      if (!app.fullName.trim()) {
        if (!errors[app.id]) errors[app.id] = {};
        errors[app.id].fullName = `Traveller ${idx + 1} requires a full name`;
        hasError = true;
      }
    });

    if (hasError) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setModalStep(2);
  };

  const submitApplication = async (event) => {
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    if (isSubmitting) return;

    if (!selectedVisa?.country || !selectedVisa?.type) {
      toast.error("Please select a valid visa before submitting.");
      return;
    }

    const errors = {};
    let hasError = false;

    applicants.forEach((app, idx) => {
      const hasImage =
        app.passportPhoto || app.passportImage || app.photoPreview;

      if (!hasImage) {
        if (!errors[app.id]) errors[app.id] = {};
        errors[app.id].passportImage =
          `Passport front / bio image is mandatory for Traveller ${idx + 1}`;
        hasError = true;
      } else if (app.isAuthenticatingPassport) {
        if (!errors[app.id]) errors[app.id] = {};
        errors[app.id].passportImage =
          `Authenticating passport front page for Traveller ${idx + 1}. Please wait a moment.`;
        hasError = true;
      }
    });

    if (hasError) {
      setValidationErrors(errors);
      const firstErr = Object.values(errors)[0];
      const firstMsg =
        firstErr?.passportImage ||
        "Please upload the required passport front/bio image for all travellers";
      toast.error(firstMsg);
      return;
    }

    try {
      setIsSubmitting(true);

      if (resumingGroupId) {
        for (let i = 0; i < applicants.length; i++) {
          const appInput = applicants[i];
          if (appInput.appId) {
            if (appInput.passportPhoto) {
              try {
                const fd = new FormData();
                fd.append("file", appInput.passportPhoto);
                await api.post(
                  VisaAPI.UserUploadDocumentApi(appInput.appId, "passportScan"),
                  fd,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );
              } catch (upErr) {
                console.warn("Passport scan update error:", upErr);
              }
            }
            if (appInput.travelerPhoto) {
              try {
                const fd = new FormData();
                fd.append("file", appInput.travelerPhoto);
                await api.post(
                  VisaAPI.UserUploadDocumentApi(appInput.appId, "photo"),
                  fd,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );
              } catch (upErr) {
                console.warn("Traveler photo update error:", upErr);
              }
            }
          } else {
            try {
              const nameParts = (appInput.fullName || "").trim().split(/\s+/);
              const firstName = nameParts[0] || "Traveler";
              const lastName =
                nameParts.slice(1).join(" ") || nameParts[0] || "Traveler";
              const addRes = await api.post(
                `/api/v1/visa/user/groups/${resumingGroupId}/applicants`,
                {
                  firstName,
                  lastName,
                  passportNumber: (
                    appInput.passportNumber || "VERIFY_FROM_PASSPORT"
                  ).toUpperCase(),
                  dateOfBirth: appInput.dateOfBirth || "1995-01-01",
                  nationality: appInput.nationality || "Indian",
                  gender: appInput.gender || "male",
                }
              );
              const newAppId =
                addRes.data?.data?.application?._id || addRes.data?.data?._id;
              if (newAppId && appInput.passportPhoto) {
                const fd = new FormData();
                fd.append("file", appInput.passportPhoto);
                await api.post(
                  VisaAPI.UserUploadDocumentApi(newAppId, "passportScan"),
                  fd,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );
              }
              if (newAppId && appInput.travelerPhoto) {
                const fd = new FormData();
                fd.append("file", appInput.travelerPhoto);
                await api.post(
                  VisaAPI.UserUploadDocumentApi(newAppId, "photo"),
                  fd,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );
              }
            } catch (addErr) {
              console.warn("Error adding applicant during resume:", addErr);
            }
          }
        }

        setSubmitted(true);
        onApplicationComplete?.();

        toast.success(
          "Traveler details confirmed! Connecting to PayPal checkout..."
        );
        await handlePayVisaGroup(resumingGroupId);
        return;
      }

      const unitFee =
        parseInt(String(selectedVisa.fee || "0").replace(/[^0-9]/g, ""), 10) || 5000;
      const totalAmount = unitFee * applicants.length;

      const payload = {
        destinationCountry: selectedVisa.country,
        visaType: selectedVisa.type,
        totalAmount,
        visa: {
          visaId: selectedVisa.id || selectedVisa._id,
          country: selectedVisa.country,
          code: selectedVisa.code,
          flag: selectedVisa.flag,
          type: selectedVisa.type,
          valid: selectedVisa.valid,
          fee: selectedVisa.fee,
          unitPrice: unitFee,
          visaDate: selectedVisa.visaDate || selectedVisa.delivery,
          category: selectedVisa.category,
          delivery: selectedVisa.delivery,
          image: selectedVisa.image,
        },
        applicants: applicants.map((app) => {
          const nameParts = (app.fullName || "").trim().split(/\s+/);
          const firstName = nameParts[0] || "Traveler";
          const lastName =
            nameParts.slice(1).join(" ") || nameParts[0] || "Traveler";
          return {
            title: app.title || "Mr",
            fullName: app.fullName?.trim() || "",
            firstName,
            lastName,
            passportNumber: (app.passportNumber || "VERIFY_FROM_PASSPORT")
              .trim()
              .toUpperCase(),
            dateOfBirth: app.dateOfBirth || "1995-01-01",
            nationality: app.nationality || "Indian",
            gender: app.gender || "male",
            photoPreview: app.photoPreview || "",
            travelerPhotoPreview: app.travelerPhotoPreview || "",
            passportPhotoName: app.passportPhoto?.name || "passport-image.jpg",
            travelerPhotoName: app.travelerPhoto?.name || "passport-size-photo.jpg",
            documents: {
              passportScan: app.photoPreview || "",
              passport: app.photoPreview || "",
              photo: app.travelerPhotoPreview || app.photoPreview || "",
              travelerPhoto: app.travelerPhotoPreview || "",
              passportSizePhoto: app.travelerPhotoPreview || "",
              additionalDocs: [],
            },
          };
        }),
        applicantCount: applicants.length,
        unitFee,
        currency: "INR",
      };

      const response = await api.post(VisaAPI.UserApplicationsApi, payload);

      if (
        response.data?.success ||
        response.status === 201 ||
        response.status === 200
      ) {
        const savedApplication = response.data?.data || response.data;
        setSubmissionData(savedApplication);

        const createdApps = savedApplication?.applications || [];
        if (Array.isArray(createdApps) && createdApps.length > 0) {
          for (let i = 0; i < applicants.length; i++) {
            const appDoc = createdApps[i];
            const appInput = applicants[i];
            if (appDoc?._id) {
              if (appInput.passportPhoto) {
                try {
                  const fd = new FormData();
                  fd.append("file", appInput.passportPhoto);
                  await api.post(
                    VisaAPI.UserUploadDocumentApi(appDoc._id, "passportScan"),
                    fd,
                    { headers: { "Content-Type": "multipart/form-data" } }
                  );
                } catch (uploadErr) {
                  console.warn("Passport scan upload error:", uploadErr);
                }
              }
              if (appInput.travelerPhoto) {
                try {
                  const fd = new FormData();
                  fd.append("file", appInput.travelerPhoto);
                  await api.post(
                    VisaAPI.UserUploadDocumentApi(appDoc._id, "photo"),
                    fd,
                    { headers: { "Content-Type": "multipart/form-data" } }
                  );
                } catch (uploadErr) {
                  console.warn("Traveler photo upload error:", uploadErr);
                }
              }
            }
          }
        }

        setSubmitted(true);
        onApplicationComplete?.();

        const groupId = savedApplication?.group?._id || savedApplication?._id;
        if (groupId) {
          toast.success("Visa application created! Connecting to PayPal checkout...");
          await handlePayVisaGroup(groupId);
        } else {
          toast.success("Visa application submitted successfully!");
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to submit visa application"
        );
      }
    } catch (error) {
      console.error("Error submitting visa application:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Submission failed. Please check network and try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="apply-modal-card relative w-full max-w-3xl lg:max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] font-poppins transition-all"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden p-1">
              <CountryFlagIcon
                flag={selectedVisa.flag}
                code={selectedVisa.code}
                name={selectedVisa.country}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">
                  {resumingGroupId ? "Resume Visa Application:" : "Apply for"}{" "}
                  {selectedVisa.country} {selectedVisa.type}
                </h3>
                {resumingGroupId ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium flex items-center gap-1.5">
                    <Clock size={12} /> Resumed Draft Application
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                    {selectedVisa.visaDate || selectedVisa.delivery || "3-5 Working Days"}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80 text-[10px] font-medium flex items-center gap-1 text-slate-300">
                  {autoSaveStatus === "saving" ? (
                    <>
                      <Loader2 size={10} className="animate-spin text-amber-400" />
                      <span className="text-slate-400">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={10} className="text-emerald-400" />
                      <span className="text-emerald-400">Draft auto-saved</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official e-Visa application for Indian passport holders •{" "}
                <span className="text-emerald-400 font-semibold">
                  {selectedVisa.fee}
                </span>{" "}
                all-inclusive per traveler
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              clickSquash(e.currentTarget);
              onClose?.();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Close visa application"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 bg-slate-50/50">
          {resumingGroupId && !submitted && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock size={14} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-amber-950">
                    Resuming Saved Visa Application
                  </p>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    Existing traveller records and uploaded documents have been loaded. Review details below to continue.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-900 bg-white border border-amber-200 px-2 py-0.5 rounded-md font-semibold shrink-0">
                Batch #{resumingGroupId.slice(-8)}
              </span>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-6 space-y-5 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <div>
                {(submissionData?.group?._id ||
                  submissionData?._id ||
                  submissionData?.applicationNumber) && (
                  <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full mb-2.5 font-mono">
                    Ref #{submissionData?.applicationNumber || submissionData?.group?._id || submissionData?._id}
                  </span>
                )}
                <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Application Submitted Successfully
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Your official{" "}
                  <strong>
                    {selectedVisa.country} {selectedVisa.type}
                  </strong>{" "}
                  application for{" "}
                  <strong>
                    {applicants.length} Traveller{applicants.length > 1 ? "s" : ""}
                  </strong>{" "}
                  has been received and logged under your user profile.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step Progress Indicator */}
              <div className="mb-5 bg-slate-100 p-1 rounded-xl">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      clickSquash(e.currentTarget);
                      setModalStep(1);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                      modalStep === 1
                        ? "bg-white shadow-2xs text-slate-900 font-semibold"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                        modalStep === 1
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      1
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate leading-tight">
                        Traveler Information
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Names & applicant count
                      </p>
                    </div>
                  </button>

                  <div
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition ${
                      modalStep === 2
                        ? "bg-white shadow-2xs text-slate-900 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                        modalStep === 2
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      2
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate leading-tight">
                        Passport & Documents
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Bio page upload
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {modalStep === 1 ? (
                /* STEP 1: Full Names Only */
                <form onSubmit={proceedToStep2} className="modal-step-container space-y-5">
                  <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/90 text-slate-700 text-xs flex items-start gap-2.5">
                    <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Please enter full names{" "}
                      <strong>exactly as printed</strong> on Indian
                      passports to ensure 100% swift visa approval without
                      embassy rejection.
                    </p>
                  </div>

                  {/* Applicants List */}
                  <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                    {applicants.map((app, idx) => (
                      <div
                        key={app.id}
                        className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 transition hover:border-slate-300"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                              {idx + 1}
                            </span>
                            <span>
                              Traveller {idx + 1}{" "}
                              {idx === 0 ? "(Lead Applicant)" : ""}
                            </span>
                          </span>

                          {applicants.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                clickSquash(e.currentTarget);
                                removeApplicant(app.id);
                              }}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          )}
                        </div>

                        {/* Inputs: Name Input Section Only */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-3">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Title
                            </label>
                            <select
                              value={app.title}
                              onChange={(e) =>
                                updateApplicant(app.id, "title", e.target.value)
                              }
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition cursor-pointer"
                            >
                              <option value="Mr">Mr.</option>
                              <option value="Ms">Ms.</option>
                              <option value="Mrs">Mrs.</option>
                              <option value="Dr">Dr.</option>
                            </select>
                          </div>

                          <div className="sm:col-span-9">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Full Name (as per Passport){" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={app.fullName}
                              onChange={(e) =>
                                updateApplicant(app.id, "fullName", e.target.value)
                              }
                              placeholder="e.g. Rahul Sharma"
                              className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 placeholder:text-slate-400 transition"
                            />
                          </div>
                        </div>

                        {validationErrors[app.id]?.fullName && (
                          <p className="text-xs text-rose-500 font-semibold mt-1">
                            {validationErrors[app.id].fullName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Another Traveller Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      clickSquash(e.currentTarget);
                      addApplicant();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                  >
                    <Plus size={15} /> Add Another Traveller
                  </button>

                  {/* Summary & Fee Calculation */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        Pricing Breakdown
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5">
                        {applicants.length} Traveller
                        {applicants.length > 1 ? "s" : ""} × {selectedVisa.fee}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Total Payable
                      </span>
                      <span className="text-lg sm:text-xl text-slate-900 font-bold">
                        ₹
                        {(
                          (parseInt(
                            String(selectedVisa.fee || "0").replace(/[^0-9]/g, ""),
                            10
                          ) || 5000) * applicants.length
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    onClick={(e) => clickSquash(e.currentTarget)}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Step 2 (Passport & Documents)</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              ) : (
                /* STEP 2: Passport Image (Mandatory) & Traveller Photo (Optional) Upload */
                <form onSubmit={submitApplication} className="modal-step-container space-y-5">
                  <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/90 text-slate-700 text-xs flex items-start gap-2.5">
                    <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Please upload a clear color photo or scan of the{" "}
                      <strong className="text-slate-900">Passport Bio Page (Front Page)</strong> (Mandatory).
                      Our automated authenticator verifies document resolution & legibility. The{" "}
                      <strong className="text-slate-900">Traveller Photo</strong> is completely optional and can be submitted now or later.
                    </p>
                  </div>

                  <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                    {applicants.map((app, idx) => {
                      const err = validationErrors[app.id]?.passportImage;
                      const hasPhoto =
                        app.photoPreview || app.passportPhoto;

                      return (
                        <div
                          key={app.id}
                          className={`p-4 sm:p-5 rounded-xl bg-white border shadow-2xs space-y-3.5 transition ${
                            err
                              ? "border-rose-300 bg-rose-50/20"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                                {idx + 1}
                              </span>
                              <span>
                                Traveller {idx + 1}: {app.title}.{" "}
                                {app.fullName || "Applicant"}
                              </span>
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              Step 2 of 2
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {/* 1. Passport Image (Bio Page) - MANDATORY WITH AUTHENTICATOR */}
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FileCheck2
                                    size={14}
                                    className="text-emerald-600 shrink-0"
                                  />
                                  <span className="text-xs font-semibold text-slate-800">
                                    Passport Front Bio Page
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                                    Required
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  JPG, PNG, PDF • Max 10MB
                                </span>
                              </div>

                              {app.isAuthenticatingPassport ? (
                                <div className="w-full min-h-[135px] border border-dashed border-emerald-400 bg-emerald-50/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                                  <Loader2 size={22} className="text-emerald-600 animate-spin" />
                                  <div>
                                    <p className="font-semibold text-xs text-emerald-950">
                                      Authenticating Passport Front Page...
                                    </p>
                                    <p className="text-[11px] text-emerald-700 mt-0.5">
                                      Validating resolution, contrast & document clarity
                                    </p>
                                  </div>
                                </div>
                              ) : hasPhoto ? (
                                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-white border border-emerald-300 shadow-2xs shrink-0 flex items-center justify-center relative">
                                      {app.passportPhoto?.type === "application/pdf" || app.passportPhoto?.name?.endsWith(".pdf") ? (
                                        <div className="text-center p-1">
                                          <FileText size={20} className="text-rose-500 mx-auto" />
                                          <span className="text-[9px] font-bold text-slate-600 block mt-0.5">PDF</span>
                                        </div>
                                      ) : (
                                        <img
                                          src={app.photoPreview}
                                          alt="Passport Preview"
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                        <Check size={9} strokeWidth={3} />
                                      </div>
                                    </div>
                                    <div className="min-w-0">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                                        <ShieldCheck
                                          size={11}
                                          className="text-emerald-700"
                                        />
                                        Bio Page Verified
                                      </span>
                                      <p className="text-xs font-semibold text-slate-900 truncate mt-1">
                                        {app.passportPhoto?.name ||
                                          "passport-image.jpg"}
                                      </p>
                                      <p className="text-[10px] text-slate-500 mt-0.5">
                                        {app.passportValidationDetails?.resolution || "High Resolution"} • {app.passportValidationDetails?.fileSize || "Verified Document"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <label className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition cursor-pointer">
                                      Change
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) =>
                                          handlePhotoUpload(app.id, e)
                                        }
                                        className="hidden"
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        clickSquash(e.currentTarget);
                                        removePhoto(app.id);
                                      }}
                                      className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                      title="Remove passport image"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label className="w-full min-h-[135px] border border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50/40 hover:bg-emerald-50/20 rounded-xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center group">
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center mb-2 transition-colors">
                                    <UploadCloud size={18} />
                                  </div>
                                  <p className="font-semibold text-xs text-slate-800">
                                    Upload Passport Bio Page
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Clear color photo or scan of front page
                                  </p>
                                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                                    <ShieldCheck size={11} /> Authenticator Verification
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) =>
                                      handlePhotoUpload(app.id, e)
                                    }
                                    className="hidden"
                                  />
                                </label>
                              )}

                              {validationErrors[app.id]?.passportImage && (
                                <p className="text-xs text-rose-500 font-semibold mt-1">
                                  {validationErrors[app.id].passportImage}
                                </p>
                              )}
                            </div>

                            {/* 2. Traveller Photo (Passport Size) - OPTIONAL */}
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Camera
                                    size={14}
                                    className="text-slate-500 shrink-0"
                                  />
                                  <span className="text-xs font-semibold text-slate-800">
                                    Traveller Photo
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium uppercase bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                    Optional
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  JPG, PNG • Max 5MB
                                </span>
                              </div>

                              {app.travelerPhotoPreview ? (
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-white border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
                                      <img
                                        src={app.travelerPhotoPreview}
                                        alt="Passport Size Photo Preview"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-slate-900 truncate">
                                        {app.travelerPhoto?.name ||
                                          "passport-size-photo.jpg"}
                                      </p>
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 mt-1">
                                        <CheckCircle2
                                          size={12}
                                          className="text-slate-500"
                                        />
                                        Photo Attached
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <label className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition cursor-pointer">
                                      Change
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleTravelerPhotoUpload(app.id, e)
                                        }
                                        className="hidden"
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        clickSquash(e.currentTarget);
                                        removeTravelerPhoto(app.id);
                                      }}
                                      className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                      title="Remove photo"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label className="w-full min-h-[135px] border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-100/50 rounded-xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center group">
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-2 group-hover:scale-105 transition-transform">
                                    <Camera size={18} />
                                  </div>
                                  <p className="font-semibold text-xs text-slate-700">
                                    Upload Traveller Photo
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Passport size or clear portrait
                                  </p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleTravelerPhotoUpload(app.id, e)
                                    }
                                    className="hidden"
                                  />
                                </label>
                              )}

                              {validationErrors[app.id]?.travelerPhoto && (
                                <p className="text-xs text-rose-500 font-semibold mt-1">
                                  {validationErrors[app.id].travelerPhoto}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fee Preview Bar */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-600 font-medium">
                      Total Payable ({applicants.length} Applicant
                      {applicants.length > 1 ? "s" : ""}):
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-slate-900">
                      ₹
                      {(
                        (parseInt(
                          String(selectedVisa.fee || "0").replace(/[^0-9]/g, ""),
                          10
                        ) || 5000) * applicants.length
                      ).toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        clickSquash(e.currentTarget);
                        setModalStep(1);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold text-xs sm:text-sm text-slate-700 transition cursor-pointer"
                    >
                      Back to Step 1
                    </button>

                    <button
                      type="submit"
                      onClick={(e) => clickSquash(e.currentTarget)}
                      disabled={isSubmitting || !!isPayingVisaId}
                      className="flex-[2] py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isSubmitting || isPayingVisaId ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Connecting to PayPal...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={15} />
                          <span>Proceed to Payment (PayPal)</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
