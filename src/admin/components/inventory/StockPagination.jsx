// Responsive pagination bar supporting both pagination object and flat props.
export default function StockPagination({
  pagination,
  onPageChange,
  disabled = false,
  currentPage,
  totalPages: propTotalPages,
  totalItems,
  pageSize,
}) {
  const page = Number(pagination?.page ?? currentPage ?? 1);
  const total = Number(pagination?.total ?? totalItems ?? 0);
  const totalPages = Number(
    pagination?.totalPages ??
      propTotalPages ??
      (pageSize ? Math.ceil(total / pageSize) : 1)
  ) || 1;

  if (total === 0) {
    return null;
  }

  // Calculate page buttons to show (window around current page)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    pages.push(1);
    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    if (page <= 3) {
      end = 4;
    }
    if (page >= totalPages - 2) {
      start = totalPages - 3;
    }

    if (start > 2) {
      pages.push('...');
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row">
      <p className="text-xs text-slate-500">
        Page <span className="font-bold text-slate-800">{page}</span> of{" "}
        <span className="font-bold text-slate-800">{totalPages}</span>
        {" · "}
        <span className="font-semibold text-slate-700">{total}</span> record{total === 1 ? "" : "s"}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((p, index) =>
              p === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-xs text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPageChange(p)}
                  className={`h-7 min-w-[28px] rounded-lg px-2 text-xs font-bold transition ${
                    p === page
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
