import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Share2, Heart } from "lucide-react";
import { toast } from "react-toastify";

const HotelBreadcrumbBar = ({ hotelName = "" }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-slate-500 flex-wrap min-w-0">
          <span
            onClick={() => navigate("/")}
            className="hover:text-teal-700 font-semibold cursor-pointer transition shrink-0"
          >
            Home
          </span>
          <span className="text-slate-300">/</span>
          <span
            onClick={() => navigate("/hotel-page")}
            className="hover:text-teal-700 font-semibold cursor-pointer transition shrink-0"
          >
            Hotels
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium truncate">
            {hotelName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Hotel link copied to clipboard!");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Share2 size={13} className="text-teal-600" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSaved(!isSaved);
              toast.success(
                isSaved
                  ? "Removed from saved properties"
                  : "Saved to your pilgrimage wishlist!",
              );
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-2xs transition cursor-pointer ${
              isSaved
                ? "border-rose-300 bg-rose-50 text-rose-600"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Heart
              size={13}
              fill={isSaved ? "currentColor" : "none"}
              className={isSaved ? "text-rose-500" : "text-slate-400"}
            />
            <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelBreadcrumbBar;
