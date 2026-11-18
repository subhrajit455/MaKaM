import React, { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight, ImageIcon, Maximize2 } from "lucide-react";

const HotelGalleryHero = ({
  hotel = {},
  allImages = [],
  openImageModal,
}) => {
  const [mobilePhotoIndex, setMobilePhotoIndex] = useState(0);

  const nextMobilePhoto = () => {
    setMobilePhotoIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevMobilePhoto = () => {
    setMobilePhotoIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  if (!allImages || allImages.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      {/* MOBILE CAROUSEL (< md) */}
      <div className="md:hidden relative rounded-2xl overflow-hidden shadow-md aspect-[4/3] bg-slate-900 group">
        <img
          src={allImages[mobilePhotoIndex]?.url || hotel.main_photo}
          alt={hotel.name}
          className="w-full h-full object-cover transition-all duration-300"
          onClick={() => openImageModal(allImages[mobilePhotoIndex]?.url, mobilePhotoIndex)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Top Left Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={11} className="text-teal-300" />
            {hotel.hotelType || "5-Star Luxury"}
          </span>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevMobilePhoto();
          }}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition cursor-pointer"
          aria-label="Previous photo"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextMobilePhoto();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition cursor-pointer"
          aria-label="Next photo"
        >
          <ChevronRight size={18} />
        </button>

        {/* Bottom Indicators & Full Gallery Button */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {allImages.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  mobilePhotoIndex === i ? "w-5 bg-teal-400" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => openImageModal(allImages[mobilePhotoIndex]?.url, mobilePhotoIndex)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-bold backdrop-blur-md hover:bg-black transition cursor-pointer"
          >
            <ImageIcon size={13} className="text-teal-300" />
            {mobilePhotoIndex + 1}/{allImages.length} Photos
          </button>
        </div>
      </div>

      {/* DESKTOP 5-IMAGE BENTO GRID (>= md) */}
      <div className="hidden md:grid grid-cols-12 gap-3 sm:gap-4 h-[440px] lg:h-[480px]">
        {/* Main Large Hero Image (Left 7 Cols) */}
        <div
          className="col-span-7 relative h-full rounded-3xl overflow-hidden shadow-md group cursor-pointer"
          onClick={() => openImageModal(allImages[0]?.url, 0)}
        >
          <img
            src={allImages[0]?.url}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md backdrop-blur-xs">
              <Sparkles size={12} />
              {hotel.hotelType || "5-Star Luxury Stay"}
            </span>
          </div>

          <button
            type="button"
            className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md transition cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              openImageModal(allImages[0]?.url, 0);
            }}
          >
            <Maximize2 size={13} />
            View Full Size
          </button>
        </div>

        {/* Secondary 4-Image Grid (Right 5 Cols) */}
        <div className="col-span-5 grid grid-cols-2 gap-3 sm:gap-4 h-full">
          {allImages.slice(1, 5).map((img, idx) => {
            const isLast = idx === 3 && allImages.length > 5;
            return (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden shadow-xs group cursor-pointer h-full"
                onClick={() => openImageModal(img.url, idx + 1)}
              >
                <img
                  src={img.url}
                  alt={`${hotel.name} view ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/30 transition-colors" />

                {isLast && (
                  <div
                    className="absolute inset-0 bg-black/65 hover:bg-black/75 transition backdrop-blur-xs flex flex-col items-center justify-center text-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageModal(img.url, idx + 1);
                    }}
                  >
                    <ImageIcon size={22} className="mb-1 text-teal-300" />
                    <span className="text-base font-black leading-tight">
                      +{allImages.length - 4} Photos
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-teal-200 mt-0.5">
                      Explore Gallery
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HotelGalleryHero;
