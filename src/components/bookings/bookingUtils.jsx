import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { WORLD_COUNTRIES } from "../../data/worldCountries";
import { visaCountriesList } from "../../data/visaCountriesData";

export const getCountryFlagInfo = (countryName = "") => {
  if (!countryName) return { code: "", flag: "🌐", name: "" };
  const raw = String(countryName).trim();
  const lower = raw.toLowerCase();

  const aliases = {
    uae: "AE",
    "united arab emirates": "AE",
    uk: "GB",
    "united kingdom": "GB",
    usa: "US",
    "united states": "US",
    "united states of america": "US",
    russia: "RU",
    korea: "KR",
    "south korea": "KR",
  };

  if (aliases[lower]) {
    const aliasCode = aliases[lower];
    const match = WORLD_COUNTRIES.find((c) => c.code === aliasCode);
    if (match) return match;
    return { code: aliasCode, flag: "🌐", name: countryName };
  }

  const visaMatch = (visaCountriesList || []).find(
    (c) =>
      c.country?.toLowerCase() === lower ||
      c.slug?.toLowerCase() === lower ||
      c.code?.toLowerCase() === lower
  );
  if (visaMatch) {
    return {
      code: visaMatch.code,
      flag: visaMatch.flag,
      name: visaMatch.country,
    };
  }

  const worldMatch = (WORLD_COUNTRIES || []).find(
    (c) =>
      c.name?.toLowerCase() === lower ||
      c.code?.toLowerCase() === lower
  );
  if (worldMatch) {
    return worldMatch;
  }

  return { code: "", flag: "🌐", name: countryName };
};

export const formatBookingCurrency = (amount, currency = "INR") => {
  const numeric = Number(amount ?? 0);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;
  const code = String(currency || "INR").trim().toUpperCase() || "INR";
  const hasFraction = Math.round(safeAmount * 100) % 100 !== 0;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${code} ${safeAmount.toLocaleString("en-IN", {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  }
};

export const formatBookingDate = (value, includeTime = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const options = includeTime
    ? {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    : {
        day: "numeric",
        month: "short",
        year: "numeric",
      };

  return new Intl.DateTimeFormat("en-IN", options).format(date);
};

export const getStatusBadge = (status = "") => {
  const s = String(status || "").toLowerCase();
  if (s === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
        <CheckCircle2 size={13} className="text-teal-600" />
        Completed
      </span>
    );
  }
  if (s === "approved" || s === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={13} className="text-emerald-600" />
        Confirmed
      </span>
    );
  }
  if (
    s === "processing" ||
    s === "in_process" ||
    s === "in process" ||
    s === "in_review"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock size={13} className="text-blue-600 animate-spin" />
        In Process
      </span>
    );
  }
  if (
    s === "provider_pending" ||
    s === "confirming_provider" ||
    s === "confirming" ||
    s === "payment_received"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={13} className="text-amber-600 animate-spin" />
        Supplier Pending
      </span>
    );
  }
  if (s === "pending" || s === "initiated" || s === "awaiting_payment") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={13} className="text-amber-600 animate-spin" />
        Pending Payment
      </span>
    );
  }
  if (
    s === "rejected" ||
    s === "cancelled" ||
    s === "failed" ||
    s === "provider_failed" ||
    s === "payment_failed"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle size={13} className="text-rose-600" />
        {s === "cancelled"
          ? "Cancelled"
          : s === "rejected"
          ? "Rejected"
          : "Failed"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
      <Clock size={13} className="text-blue-600" />
      Submitted
    </span>
  );
};
