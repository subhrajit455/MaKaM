import React, { useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const HotelLightboxModal = ({
  isOpen,
  onClose,
  allImages = [],
  currentSlideIndex = 0,
  setCurrentSlideIndex,
  hotelName = "",
}) => {
  const thumbnailsRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setCurrentSlideIndex((prev) => (prev + 1) % allImages.length);
      }
      if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allImages.length, onClose, setCurrentSlideIndex]);

  if (!isOpen || !allImages || allImages.length === 0) return null;

  const currentImg = allImages[currentSlideIndex] || allImages[0];

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const scrollThumbnails = (direction) => {
    if (thumbnailsRef.current) {
      const scrollAmount = 140;
      thumbnailsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6">
        {/* Top Bar: Title & Close */}
        <div className="w-full max-w-7xl flex items-center justify-between z-20 pt-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              {currentSlideIndex + 1} / {allImages.length} Photos
            </span>
            <span className="text-white text-sm font-semibold truncate hidden sm:inline">
              {hotelName}
            </span>
          </div>

          <button
            type="button"
            className="cursor-pointer text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close photo viewer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Buttons & Main Image */}
        <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-auto px-4 sm:px-12">
          <button
            type="button"
            className="cursor-pointer absolute left-2 sm:left-4 text-white/90 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition backdrop-blur-md z-20 shadow-lg"
            onClick={prevSlide}
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="relative max-w-5xl max-h-[75vh] w-full flex flex-col items-center justify-center">
            <img
              src={currentImg?.url}
              alt={`Slide ${currentSlideIndex + 1}`}
              className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />
            {currentImg?.caption && (
              <p className="text-white/80 text-xs sm:text-sm mt-3 bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm">
                {currentImg.caption}
              </p>
            )}
          </div>

          <button
            type="button"
            className="cursor-pointer absolute right-2 sm:right-4 text-white/90 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition backdrop-blur-md z-20 shadow-lg"
            onClick={nextSlide}
            aria-label="Next photo"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Bottom Thumbnails Strip */}
        <div className="w-full max-w-4xl px-4 pb-2">
          <div className="relative flex items-center">
            <button
              type="button"
              className="cursor-pointer absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black text-white rounded-full p-2 backdrop-blur-sm shadow-md transition"
              onClick={() => scrollThumbnails("left")}
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              ref={thumbnailsRef}
              className="overflow-x-auto scrollbar-hide py-2 px-6 w-full"
            >
              <div className="flex justify-center gap-2.5">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      currentSlideIndex === idx
                        ? "border-teal-400 scale-105 shadow-md"
                        : "border-white/30 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="cursor-pointer absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black text-white rounded-full p-2 backdrop-blur-sm shadow-md transition"
              onClick={() => scrollThumbnails("right")}
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelLightboxModal;
