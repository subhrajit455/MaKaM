import React from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react";

const statusConfig = {
  confirmed: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  active: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  pending: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  "payment pending": {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  processing: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Info,
  },
  rejected: {
    bg: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  cancelled: {
    bg: "bg-red-50 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  inactive: {
    bg: "bg-slate-100 text-slate-600 border-slate-200",
    icon: AlertCircle,
  },
};

export default function StatusBadge({
  status = "pending",
  text = null,
  size = "md",
  showIcon = false,
  className = "",
}) {
  const normKey = String(status || "").toLowerCase().trim();
  const config = statusConfig[normKey] || statusConfig.pending;
  const Icon = config.icon;
  const displayText = text || (status ? String(status).charAt(0).toUpperCase() + String(status).slice(1) : "");

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[11px]",
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  };

  if (!showIcon) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-semibold ${config.bg} ${sizeClasses[size] || sizeClasses.sm} ${className}`}
      >
        {displayText}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses[size] || sizeClasses.md} font-medium ${className}`}
    >
      <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
      <span>{displayText}</span>
    </div>
  );
}
