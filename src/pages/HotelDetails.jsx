import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchHotelDetails } from "../components/reducer/HotelSearchSlice";
import axios from "axios";
import { HotelDetailsAPI, OfferAPI, getApiBaseUrl } from "../configs/api";
import CommonHeader from "../components/CommonHeader";
import HotelRoomAvailability from "../components/HotelRoomAvailability";
import Room from "../components/Room";
import HotelRoomsListing from "../components/HotelRoomsListing";
import ScrollToTop from "../components/ScrollToTop";
import { toast } from "react-toastify";

import curatedLuxuryHotels from "../data/curatedLuxuryHotels";
import HotelLightboxModal from "../components/hoteldetails/HotelLightboxModal";
import HotelBreadcrumbBar from "../components/hoteldetails/HotelBreadcrumbBar";
import HotelGalleryHero from "../components/hoteldetails/HotelGalleryHero";
import HotelHeaderInfo from "../components/hoteldetails/HotelHeaderInfo";
import HotelAccordions from "../components/hoteldetails/HotelAccordions";
import HotelStickyPricingCard from "../components/hoteldetails/HotelStickyPricingCard";
import { getBedIcon, getAmenityIcon } from "../components/hoteldetails/hotelDetailUtils";

const HotelDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const { state } = location;

  const hotelId = id;
  const searchId = state?.searchId || localStorage.getItem("searchId");
  const { hotelDetailsData } = useSelector(
    (state) => state?.hotelSearch || {},
  );
  const hotelListState = useSelector(
    (state) => state?.hotelSearch?.hotelData?.data?.hotels || [],
  );

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openhotelRoomAvailability, setOpenHotelRoomAvailability] =
    useState(false);
  const [rateComponentData, setRateComponentData] = useState(null);

  const [reservationData, setReservationData] = useState({
    hotelIds: [id],
    occupancies: [{ adults: 2 }],
    guestNationality: "IN",
    currency: "INR",
    checkin: "",
    checkout: "",
    roomMapping: true,
    maxRatesPerHotel: 5,
  });

  // Set default dates (today and 3 days later)
  useEffect(() => {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    setReservationData((prev) => ({
      ...prev,
      hotelIds: [id],
      checkin: today.toISOString().split("T")[0],
      checkout: threeDaysLater.toISOString().split("T")[0],
    }));
  }, [id]);

  // Fetch from API if searchId exists (never call SRDV for retail offers)
  useEffect(() => {
    const isOffer = Boolean(
      state?.isOffer ||
      state?.offerId ||
      state?.offer?._id ||
      (typeof hotelId === "string" &&
        /^[0-9a-fA-F]{24}$/.test(hotelId.trim()) &&
        !hotelId.toLowerCase().startsWith("hsid") &&
        !hotelId.includes("-"))
    );
    if (isOffer) return;
    if (!hotelId || !searchId) return;

    const getHotelDetails = async () => {
      try {
        await dispatch(fetchHotelDetails({ hotelId, searchId })).unwrap();
      } catch (err) {
        console.error("Error fetching hotel details:", err);
      }
    };

    getHotelDetails();
  }, [dispatch, hotelId, searchId, state]);

  // Fetch live offer details from GET /api/v1/offers/{id} if available
  const [liveOfferData, setLiveOfferData] = useState(null);
  useEffect(() => {
    const isMongoId = (val) =>
      typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val.trim());
    const isSrdv =
      typeof hotelId === "string" &&
      (hotelId.toLowerCase().startsWith("hsid") || hotelId.includes("-"));
    if (isSrdv) return;
    const targetId =
      state?.offerId ||
      state?.offer?._id ||
      (isMongoId(hotelId) ? hotelId : null);
    if (!targetId || !isMongoId(targetId)) return;

    let mounted = true;
    const fetchOffer = async () => {
      try {
        const url = OfferAPI?.OfferDetailApi
          ? OfferAPI.OfferDetailApi(targetId)
          : `${getApiBaseUrl()}/api/v1/offers/${targetId}`;
        const res = await axios.get(url, { timeout: 6000 });
        if (!mounted) return;
        const o =
          res?.data?.offer || (res?.data?.success ? res?.data?.data : null);
        if (o) setLiveOfferData(o);
      } catch {
        // Not an offer or network failure
      }
    };
    fetchOffer();
    return () => {
      mounted = false;
    };
  }, [hotelId, state]);

  // Resolve hotel data dynamically from API, state, Redux store, or luxury catalog
  const hotel = useMemo(() => {
    // Helper to find in curated catalog
    const findCurated = (searchKey, nameKey) => {
      if (!searchKey && !nameKey) return null;
      return curatedLuxuryHotels.find((h) => {
        if (searchKey && (h.id === searchKey || h.aliases?.includes(searchKey)))
          return true;
        if (nameKey) {
          const cleanName = nameKey.toLowerCase().replace(/[^a-z0-9]/g, "");
          const cleanHName = h.name.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (cleanHName.includes(cleanName) || cleanName.includes(cleanHName))
            return true;
          return h.aliases?.some((a) => cleanName.includes(a));
        }
        return false;
      });
    };

    // 1. Check API details response
    const apiData = hotelDetailsData?.data;
    if (apiData && (apiData.name || apiData.hotelName || apiData.id)) {
      const cur = findCurated(apiData.id || id, apiData.name || apiData.hotelName);
      return {
        ...(cur || curatedLuxuryHotels[0]),
        ...apiData,
        name: apiData.name || apiData.hotelName,
        rating: apiData.rating || cur?.rating || 9.2,
        price: apiData.price || cur?.price || "₹12,499",
        main_photo:
          apiData.main_photo ||
          apiData.imageUrls?.[0] ||
          cur?.main_photo ||
          curatedLuxuryHotels[0].main_photo,
        hotelImages:
          apiData.hotelImages ||
          apiData.imageUrls?.map((url) => ({ url })) ||
          cur?.hotelImages ||
          curatedLuxuryHotels[0].hotelImages,
        hotelFacilities:
          apiData.hotelFacilities ||
          apiData.amenities ||
          cur?.hotelFacilities ||
          curatedLuxuryHotels[0].hotelFacilities,
        rooms: apiData.rooms || cur?.rooms || curatedLuxuryHotels[0].rooms,
      };
    }

    // 2. Check location state from card clicks or live offer API
    const stateItem =
      liveOfferData ||
      state?.hotel ||
      state?.item ||
      state?.selectedHotel ||
      state?.offer ||
      state?.selectedOffer;
    if (stateItem) {
      const stateId = stateItem.id || stateItem._id || stateItem.hotelId || id;
      const stateName =
        stateItem.title || stateItem.name || stateItem.hotelName;
      const cur = findCurated(stateId, stateName) || curatedLuxuryHotels[0];
      const hotelImg =
        (Array.isArray(stateItem.images) && stateItem.images[0]) ||
        stateItem.image ||
        stateItem.imageUrl ||
        stateItem.main_photo ||
        stateItem.thumbnail ||
        stateItem.imageUrls?.[0] ||
        cur.main_photo;

      return {
        ...cur,
        ...stateItem,
        id: stateId,
        name: stateName || cur.name,
        tagline: stateItem.subtitle || stateItem.duration || stateItem.stay || cur.tagline,
        address: stateItem.destination || stateItem.location || stateItem.address || cur.address,
        city: stateItem.city || (stateItem.destination ? stateItem.destination.split(" ")[0] : cur.city),
        price:
          stateItem.sellPrice
            ? `₹${Number(stateItem.sellPrice).toLocaleString("en-IN")}`
            : stateItem.price ||
              stateItem.startingPrice ||
              (stateItem.fromPrice?.perNightPrice
                ? `₹${stateItem.fromPrice.perNightPrice.toLocaleString("en-IN")}`
                : cur.price),
        main_photo: hotelImg,
        hotelImages: [
          { url: hotelImg, caption: `${stateName || cur.name} Exterior` },
          ...(cur.hotelImages || []).filter((i) => i.url !== hotelImg),
        ],
        rooms: cur.rooms,
      };
    }

    // 3. Check matching item in Redux hotelData list
    const foundInList = hotelListState.find(
      (h) => h.id === id || h._id === id || String(h.hotelId) === String(id),
    );
    if (foundInList) {
      const cur = findCurated(foundInList.id, foundInList.name) || curatedLuxuryHotels[0];
      const foundImg = foundInList.imageUrls?.[0] || cur.main_photo;
      return {
        ...cur,
        ...foundInList,
        name: foundInList.name || foundInList.hotelName,
        rating: foundInList.rating || cur.rating || 9.3,
        price: foundInList.fromPrice?.perNightPrice
          ? `₹${foundInList.fromPrice.perNightPrice.toLocaleString("en-IN")}`
          : cur.price,
        main_photo: foundImg,
        hotelImages: foundInList.imageUrls?.map((url) => ({ url })) || cur.hotelImages,
      };
    }

    // 4. Fallback to matched curated entry by ID
    const matchedCurated = findCurated(id) || curatedLuxuryHotels[0];
    return matchedCurated;
  }, [hotelDetailsData, state, hotelListState, id, liveOfferData]);

  // Format images list for the gallery Lightbox
  const allImages = useMemo(() => {
    const images = [];
    if (hotel?.main_photo) {
      images.push({ url: hotel.main_photo, isMain: true });
    }
    if (hotel?.hotelImages && Array.isArray(hotel.hotelImages)) {
      hotel.hotelImages.forEach((img) => {
        const url = typeof img === "string" ? img : img?.url || img?.src;
        if (url && !images.some((i) => i.url === url)) {
          images.push({ url, caption: img?.caption || hotel.name });
        }
      });
    }
    if (hotel?.imageUrls && Array.isArray(hotel.imageUrls)) {
      hotel.imageUrls.forEach((url) => {
        if (url && !images.some((i) => i.url === url)) {
          images.push({ url, caption: hotel.name });
        }
      });
    }

    // Guarantee minimum 5 high-res photos
    if (images.length < 5) {
      curatedLuxuryHotels[0].hotelImages.forEach((img) => {
        if (!images.some((i) => i.url === img.url)) {
          images.push(img);
        }
      });
    }

    return images;
  }, [hotel]);

  const openImageModal = (_imageUrl, index = 0) => {
    setCurrentSlideIndex(index);
    setIsImageModalOpen(true);
  };

  const ratingValue = Number(hotel?.rating || 9.4);
  const ratingLabel =
    ratingValue >= 9.5
      ? "Exceptional"
      : ratingValue >= 9.0
        ? "Superb"
        : ratingValue >= 8.0
          ? "Excellent"
          : "Very Good";

  const displayPrice = useMemo(() => {
    if (hotel?.sellPrice) {
      return `₹${Number(hotel.sellPrice).toLocaleString("en-IN")}`;
    }
    const raw = String(hotel?.price || "₹14,500").replace(/\/night/i, "").trim();
    return raw.startsWith("₹") ? raw : `₹${raw}`;
  }, [hotel?.price, hotel?.sellPrice]);

  const handleReservationInputChange = (field, value) => {
    setReservationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOccupancyChange = (field, value) => {
    setReservationData((prev) => ({
      ...prev,
      occupancies: [
        {
          ...prev.occupancies[0],
          [field]: Math.max(0, value),
        },
      ],
    }));
  };

  const handleSubmitReservation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(HotelDetailsAPI.HotelRoomAvailabilityApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      const result = await response.json();
      if (result.success) {
        setIsLoading(false);
        toast.success(result.message || "Reservation availability fetched");
        setIsReservationModalOpen(false);
        setOpenHotelRoomAvailability(true);
        setRateComponentData(result.data?.[0]);
      } else {
        setIsLoading(false);
        toast.error(result.message || "Failed to make reservation");
        setOpenHotelRoomAvailability(false);
      }
    } catch (error) {
      console.error("Reservation Error:", error);
      toast.error("Error checking availability. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmitPreorder = async (offerId) => {
    setIsLoading(true);
    try {
      const response = await fetch(HotelDetailsAPI.HotelRoomPreorderApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });

      const result = await response.json();
      if (result.success) {
        setIsLoading(false);
        toast.success(result.message || "Room preorder confirmed");
        setIsReservationModalOpen(false);
        setOpenHotelRoomAvailability(false);
        setRateComponentData(result.data?.[0]);
      } else {
        setIsLoading(false);
        toast.error(result.message || "Failed to process preorder");
        setOpenHotelRoomAvailability(true);
      }
    } catch (error) {
      console.error("Preorder Error:", error);
      toast.error("Error processing preorder. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins text-slate-900 selection:bg-teal-500 selection:text-white pb-20 lg:pb-0">
      <CommonHeader />

      {/* ── LUXURY LIGHTBOX MODAL ── */}
      <HotelLightboxModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        allImages={allImages}
        currentSlideIndex={currentSlideIndex}
        setCurrentSlideIndex={setCurrentSlideIndex}
        hotelName={hotel.name}
      />

      {/* ── BREADCRUMB NAVIGATION & ACTIONS ── */}
      <HotelBreadcrumbBar hotelName={hotel.name} />

      {/* ── RESPONSIVE HERO GALLERY ── */}
      <HotelGalleryHero
        hotel={hotel}
        allImages={allImages}
        openImageModal={openImageModal}
      />

      {/* ── MAIN CONTENT & PRICE SIDEBAR ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT 8 COLUMNS: Overview, Highlights, Details, Accordions, Rooms */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            <HotelHeaderInfo hotel={hotel} />
            <HotelAccordions hotel={hotel} />
          </div>

          {/* RIGHT 4 COLUMNS: Sticky Price & Booking Card (Desktop) */}
          <div className="lg:col-span-4">
            <HotelStickyPricingCard
              ratingValue={ratingValue}
              ratingLabel={ratingLabel}
              hotel={hotel}
              displayPrice={displayPrice}
              setIsReservationModalOpen={setIsReservationModalOpen}
            />
          </div>
        </div>
      </main>

      {/* ── ROOMS SELECTION SECTION ── */}
      <section className="bg-white border-t border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
              Available Options
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
              Select Your Room & Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              All rooms include complimentary high-speed Wi-Fi, air conditioning, and luxury bathroom amenities.
            </p>
          </div>

          <Room
            hotel={hotel}
            getBedIcon={getBedIcon}
            getAmenityIcon={getAmenityIcon}
            openImageModal={openImageModal}
          />
        </div>
      </section>

      {/* ── RESERVATION MODAL ── */}
      <HotelRoomAvailability
        isReservationModalOpen={isReservationModalOpen}
        setIsReservationModalOpen={setIsReservationModalOpen}
        hotelId={id}
        hotelName={hotel.name}
        reservationData={reservationData}
        setReservationData={setReservationData}
        handleSubmitReservation={handleSubmitReservation}
        handleReservationInputChange={handleReservationInputChange}
        handleOccupancyChange={handleOccupancyChange}
        isLoading={isLoading}
      />

      {openhotelRoomAvailability && (
        <HotelRoomsListing
          rateComponentData={rateComponentData}
          reservationData={reservationData}
          onClose={() => setOpenHotelRoomAvailability(false)}
          handleSubmitPreorder={handleSubmitPreorder}
          isLoading={isLoading}
        />
      )}

      {/* ── MOBILE STICKY BOTTOM RESERVATION BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2.5 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Starting rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900 leading-none">
              {displayPrice}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">/ night</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsReservationModalOpen(true)}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-teal-600/30 transition cursor-pointer"
        >
          Reserve Room
        </button>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default HotelDetails;
