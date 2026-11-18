import { ArrowDownToLine, Smartphone } from "lucide-react";

const appUrl = "https://maqamtravels.com/app";

const AppDownloadBanner = () => {
  return (
    <section className="maqam-section bg-[#FAFAF8] dark:bg-[#070c18] px-4 py-8 md:px-6 md:py-10 transition-colors">
      <div data-animate="fade-up" className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 overflow-hidden rounded-[18px] border border-[#dfe5ea] dark:border-slate-800 bg-white dark:bg-[#111a2e] px-5 py-5 shadow-[0_3px_12px_rgba(15,23,42,0.04)] sm:px-8 md:flex-row md:justify-between md:px-10 md:py-7">
        <div className="flex w-full items-center gap-4 md:max-w-[62%]">
          <div className="hidden h-14 w-14 items-center justify-center rounded-xl border border-[#dfeaf2] dark:border-slate-700 bg-[#f4fbfd] dark:bg-slate-800 text-[#0f766e] dark:text-teal-400 shadow-sm sm:flex">
            <Smartphone size={28} strokeWidth={1.8} />
          </div>

          <div className="w-full">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-gray-950 dark:text-white">
              Download App Now!
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Use code <span className="font-bold">WELCOME</span> and get up to{" "}
              <span className="font-bold text-slate-900 dark:text-teal-400">₹5,000 OFF</span> on
              your first hotel booking.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:gap-6 md:w-auto md:flex-nowrap">
          <div className="flex flex-col gap-2.5">
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-md bg-[#0d0d0d] px-3 text-left text-white shadow-sm transition hover:bg-[#1a1a1a]"
            >
              <ArrowDownToLine size={18} />
              <span className="leading-none">
                <small className="block text-[8px] font-medium uppercase tracking-[0.14em] text-white/80">
                  Get it on
                </small>
                <strong className="text-sm font-bold">Google Play</strong>
              </span>
            </a>
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-md bg-[#0d0d0d] px-3 text-left text-white shadow-sm transition hover:bg-[#1a1a1a]"
            >
              <span className="text-xl leading-none"></span>
              <span className="leading-none">
                <small className="block text-[8px] font-medium uppercase tracking-[0.08em] text-white/80">
                  Download on the
                </small>
                <strong className="text-sm font-bold">App Store</strong>
              </span>
            </a>
          </div>

          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open app download QR code"
            className="flex h-28 w-28 items-center justify-center rounded-xl border border-[#111827] bg-white p-2 shadow-inner shadow-slate-200 sm:h-32 sm:w-32"
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(appUrl)}`}
              alt="Scan to download the Maqam app"
              className="h-full w-full object-contain"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadBanner;
