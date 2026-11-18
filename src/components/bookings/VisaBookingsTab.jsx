import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  CreditCard,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Users,
  Camera,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../stores/api";
import { VisaAPI } from "../../configs/api";
import paymentService from "../../services/paymentService";
import { getDocumentUrl } from "../../utils/documentUrl";
import { getCountryFlagInfo, getStatusBadge } from "./bookingUtils";

export default function VisaBookingsTab({
  visaGroups = [],
  isLoadingVisas = false,
}) {
  const navigate = useNavigate();
  const [visaFilter, setVisaFilter] = useState("all");
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [groupDetailsMap, setGroupDetailsMap] = useState({});
  const [loadingDetailsId, setLoadingDetailsId] = useState(null);

  const confirmedVisaGroups = visaGroups.filter(
    (g) => g.paymentStatus === "paid"
  );
  const draftVisaGroups = visaGroups.filter(
    (g) => g.paymentStatus !== "paid"
  );
  const filteredVisaGroups = visaGroups.filter((g) => {
    if (visaFilter === "completed") return g.paymentStatus === "paid";
    if (visaFilter === "draft") return g.paymentStatus !== "paid";
    return true;
  });

  const handleResumeVisa = (group) => {
    navigate(
      `/visa-card?groupId=${group._id}&country=${encodeURIComponent(
        group.destinationCountry
      )}&visaType=${encodeURIComponent(group.visaType || "")}`
    );
  };

  const handlePayVisa = async (group) => {
    const groupId = group._id || group.id;
    if (!groupId) return;
    try {
      toast.info("Connecting to PayPal secure checkout...");
      const returnUrl = `${window.location.origin}/payment/paypal/success?type=visa&bookingId=${groupId}`;
      const cancelUrl = `${window.location.origin}/payment/paypal/cancel?type=visa&bookingId=${groupId}`;

      const orderRes = await paymentService.createPayPalOrder({
        bookingId: groupId,
        bookingType: "visa",
        amount: group.totalAmount || 0,
        returnUrl,
        cancelUrl,
      });

      const redirectUrl =
        orderRes?.redirectUrl ||
        orderRes?.approvalUrl ||
        orderRes?.data?.redirectUrl ||
        orderRes?.data?.approvalUrl ||
        orderRes?.data?.links?.find((l) => l.rel === "approve")?.href;

      if (redirectUrl) {
        sessionStorage.setItem("lastVisaBookingId", String(groupId));
        sessionStorage.setItem("lastPaymentBookingType", "visa");
        window.location.assign(redirectUrl);
      } else {
        throw new Error(
          orderRes?.message ||
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
    }
  };

  const toggleExpandGroup = async (groupId) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
      return;
    }
    setExpandedGroupId(groupId);

    if (!groupDetailsMap[groupId]) {
      try {
        setLoadingDetailsId(groupId);
        const response = await api.get(VisaAPI.UserSingleGroupApi(groupId));
        const resData = response.data?.data || response.data;
        if (resData) {
          setGroupDetailsMap((prev) => ({
            ...prev,
            [groupId]: resData,
          }));
        }
      } catch (err) {
        console.error("Failed to load visa group details:", err);
      } finally {
        setLoadingDetailsId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Metrics Cards (Matching MakeMyTrip & Goibibo) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Applications
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {visaGroups.length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Confirmed & Paid
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-900">
              {confirmedVisaGroups.length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-indigo-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              Drafts / Action Required
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {draftVisaGroups.length}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Filter Tabs: All | Confirmed & Paid | Drafts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setVisaFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            visaFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>All Applications</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              visaFilter === "all"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {visaGroups.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setVisaFilter("completed")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            visaFilter === "completed"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CheckCircle2
            size={13}
            className={
              visaFilter === "completed" ? "text-white" : "text-emerald-600"
            }
          />
          <span>Confirmed & Paid</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              visaFilter === "completed"
                ? "bg-white/20 text-white"
                : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {confirmedVisaGroups.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setVisaFilter("draft")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            visaFilter === "draft"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock
            size={13}
            className={
              visaFilter === "draft" ? "text-white" : "text-indigo-600"
            }
          />
          <span>Drafts / Action Required</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              visaFilter === "draft"
                ? "bg-white/20 text-white"
                : "bg-indigo-50 text-indigo-700"
            }`}
          >
            {draftVisaGroups.length}
          </span>
        </button>
      </div>

      {isLoadingVisas ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Clock size={28} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Loading your visa applications...
          </p>
        </div>
      ) : visaGroups.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              No Visa Applications Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              You haven't submitted any visa applications yet. Explore our global visa catalogue for Saudi Arabia, Indonesia, UAE, and more.
            </p>
          </div>
          <Link
            to="/visa-card"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md transition"
          >
            <Plus size={16} />
            <span>Apply for a Visa Now</span>
          </Link>
        </div>
      ) : filteredVisaGroups.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            {visaFilter === "draft" ? <Clock size={26} /> : <CheckCircle2 size={26} />}
          </div>
          <h4 className="text-base font-extrabold text-slate-900">
            {visaFilter === "draft"
              ? "No Draft Applications"
              : "No Confirmed Applications"}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {visaFilter === "draft"
              ? "All your visa applications have completed payments and are confirmed."
              : "You do not have any completed or paid visa applications yet."}
          </p>
          <button
            type="button"
            onClick={() => setVisaFilter("all")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            View All Applications
          </button>
        </div>
      ) : (
        filteredVisaGroups.map((group) => {
          const isExpanded = expandedGroupId === group._id;
          const details = groupDetailsMap[group._id];
          const isLoadingDetails = loadingDetailsId === group._id;
          const isDraft = group.paymentStatus !== "paid";
          const createdDate = group.createdAt
            ? new Date(group.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recent";
          const flagInfo = getCountryFlagInfo(group.destinationCountry);

          return (
            <div
              key={group._id}
              className="rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-all overflow-hidden"
            >
              {/* Group Batch Card Summary Header */}
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Country Flag */}
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center overflow-hidden shrink-0 p-1">
                    {flagInfo.code ? (
                      <img
                        src={`https://flagcdn.com/w80/${flagInfo.code.toLowerCase()}.png`}
                        alt={`${group.destinationCountry} flag`}
                        className="w-full h-full object-cover rounded-xl shadow-2xs"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "block";
                          }
                        }}
                      />
                    ) : null}
                    <span
                      className={`${flagInfo.code ? "hidden" : "block"} text-2xl select-none leading-none`}
                    >
                      {flagInfo.flag || "🌐"}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {group.destinationCountry}
                      </h3>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/70">
                        {group.visaType}
                      </span>
                      {isDraft ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
                          <Clock size={12} className="text-amber-500" />
                          Action Required
                        </span>
                      ) : (
                        getStatusBadge(group.groupStatus)
                      )}
                    </div>

                    <p className="text-xs text-slate-400">
                      Batch #{group._id?.slice(-8).toUpperCase()} • Submitted on {createdDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-5 sm:gap-7 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Travelers
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {group.totalApplicants} Traveler
                      {group.totalApplicants > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Amount
                    </p>
                    <p className="text-base font-black text-slate-900">
                      ₹{(group.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Single Professional Resume Button and 1-Click PayPal Pay for Drafts */}
                    {isDraft && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayVisa(group);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                          title="1-Click Pay with PayPal"
                        >
                          <CreditCard size={13} />
                          <span>Pay with PayPal</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResumeVisa(group);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                          title="Resume Visa Application"
                        >
                          <span>Resume Application</span>
                          <ArrowRight size={13} />
                        </button>
                      </>
                    )}

                    {/* View Applicants Details Button */}
                    <button
                      type="button"
                      onClick={() => toggleExpandGroup(group._id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Details" : "View Applicants"}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Applicant Details (Pure Tracking & Document Upload) */}
              {isExpanded && (
                <div className="bg-slate-50/70 border-t border-slate-200/80 p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={14} className="text-indigo-600" />
                      <span>
                        Applicant Records ({details?.applications?.length || group.totalApplicants || 1})
                      </span>
                    </h4>
                  </div>

                  {isLoadingDetails ? (
                    <div className="p-6 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                      <Clock size={16} className="animate-spin text-teal-600" />
                      <span>Fetching applicant details...</span>
                    </div>
                  ) : details?.applications && details.applications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {details.applications.map((app, idx) => {
                        const trav = app.travelerDetails || {};
                        const docs = app.documents || {};
                        const dob = trav.dateOfBirth
                          ? new Date(trav.dateOfBirth).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A";
                        const passportNo =
                          !trav.passportNumber ||
                          trav.passportNumber === "VERIFY_FROM_IMAGE"
                            ? "To be verified from scan"
                            : trav.passportNumber;

                        return (
                          <div
                            key={app._id || idx}
                            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition space-y-3 text-xs shadow-2xs"
                          >
                            {/* Header: Traveler Name & Current Status */}
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                                  {idx + 1}
                                </div>
                                <span className="font-bold text-sm text-slate-900 truncate">
                                  {trav.firstName} {trav.lastName}
                                </span>
                              </div>
                              <div className="shrink-0">
                                {getStatusBadge(app.status)}
                              </div>
                            </div>

                            {/* Details Row: Passport, DOB, Profile */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-400 font-medium">Passport:</span>
                                <span
                                  className={`font-semibold ${
                                    passportNo === "To be verified from scan"
                                      ? "text-slate-400 italic text-[11px]"
                                      : "font-mono text-slate-800"
                                  }`}
                                >
                                  {passportNo}
                                </span>
                              </div>

                              {dob !== "N/A" && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-slate-400 font-medium">DOB:</span>
                                  <span className="font-semibold text-slate-700">{dob}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-400 font-medium">Profile:</span>
                                <span className="font-medium text-slate-700 capitalize">
                                  {trav.gender || "Male"} • {trav.nationality || "Indian"}
                                </span>
                              </div>
                            </div>

                            {/* Read-Only Documents Status & View */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                              {/* Passport Scan */}
                              {getDocumentUrl(docs.passportScan) ? (
                                <a
                                  href={getDocumentUrl(docs.passportScan)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                                  title="View passport document scan"
                                >
                                  <FileText size={13} className="text-teal-600" />
                                  <span>Passport Bio Page</span>
                                  <ExternalLink size={11} className="text-slate-400 ml-0.5" />
                                </a>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 text-xs">
                                  <FileText size={13} />
                                  <span>Passport Scan: Pending</span>
                                </div>
                              )}

                              {/* Photo */}
                              {getDocumentUrl(docs.photo) ? (
                                <a
                                  href={getDocumentUrl(docs.photo)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                                  title="View traveler passport photograph"
                                >
                                  <Camera size={13} className="text-teal-600" />
                                  <span>Photo</span>
                                  <ExternalLink size={11} className="text-slate-400 ml-0.5" />
                                </a>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 text-xs">
                                  <Camera size={13} />
                                  <span>Photo: Pending</span>
                                </div>
                              )}

                              {/* Official Visa Link (if available) */}
                              {getDocumentUrl(app.issuedVisaUrl) && (
                                <a
                                  href={getDocumentUrl(app.issuedVisaUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition ml-auto"
                                  title="Download approved e-visa document"
                                >
                                  <CheckCircle2 size={13} className="text-emerald-600" />
                                  <span>Download Visa</span>
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      {group.totalApplicants} applicant(s) registered under this visa application batch.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
