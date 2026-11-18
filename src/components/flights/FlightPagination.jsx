import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FlightPagination({
  totalFlights = 0,
  startFlightIndex = 0,
  endFlightIndex = 0,
  safeCurrentPage = 1,
  totalPages = 1,
  pageNumbers = [],
  onPageChange,
}) {
  if (totalFlights === 0) return null;

  return (
    <div className="mt-8 pt-4 pb-6 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Summary Text */}
      <div className="text-xs sm:text-sm text-gray-600 font-medium text-center sm:text-left">
        Showing <span className="font-bold text-gray-900">{startFlightIndex}–{endFlightIndex}</span> of{" "}
        <span className="font-bold text-gray-900">{totalFlights}</span> Flights
        {totalPages > 1 && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
            Page {safeCurrentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Serial Numbered Pagination Controls */}
      {totalPages > 1 && (
        <nav
          className="inline-flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-white border border-gray-200 shadow-2xs"
          aria-label="Flights pagination"
        >
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-700"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Serial Numbered Buttons */}
          {pageNumbers.map((p, pIdx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${pIdx}`}
                  className="px-2 py-1 text-xs sm:text-sm text-gray-400 font-bold select-none"
                >
                  …
                </span>
              );
            }
            const isCurrent = p === safeCurrentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? "page" : undefined}
                className={`min-w-8 sm:min-w-9 h-8 sm:h-9 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-700"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
