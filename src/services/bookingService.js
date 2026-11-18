import api from "../components/stores/api.js";
import { BookingAPI } from "../configs/api.js";
import { getAuthHeaders } from "./auth/tokenService.js";

/**
 * Service for interacting with Master Customer Bookings API endpoints.
 * Provides unified queries across Flights, Hotels, and Packages.
 * All requests authenticate via Bearer token in the Axios interceptor.
 */
export const bookingService = {
  /**
   * List paginated unified master bookings for the authenticated customer.
   * GET /api/v1/bookings
   * @param {Object} [params] - { page, limit, status }
   * @returns {Promise<{ bookings: Array, meta: { total: number, page: number, limit: number, totalPages: number }, message: string }>}
   */
  async getBookingsPage(params = {}) {
    const cleanParams = {};
    if (params.page !== undefined && params.page !== null) {
      cleanParams.page = params.page;
    }
    if (params.limit !== undefined && params.limit !== null) {
      cleanParams.limit = params.limit;
    }
    if (params.status && String(params.status).toLowerCase() !== "all") {
      cleanParams.status = String(params.status).toLowerCase();
    }

    const response = await api.get(BookingAPI.CustomerBookingsApi, {
      params: cleanParams,
      headers: getAuthHeaders(),
    });
    const raw = response?.data || {};
    const bookings = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.bookings)
      ? raw.bookings
      : Array.isArray(raw?.data?.bookings)
      ? raw.data.bookings
      : [];

    const fallbackLimit = Number(cleanParams.limit) || 10;
    const fallbackTotal = bookings.length;
    const meta = raw?.meta
      ? {
          total: Number(raw.meta.total ?? fallbackTotal),
          page: Number(raw.meta.page ?? (cleanParams.page || 1)),
          limit: Number(raw.meta.limit ?? fallbackLimit),
          totalPages: Number(
            raw.meta.totalPages ?? (fallbackTotal > 0 ? Math.ceil(fallbackTotal / fallbackLimit) : 0)
          ),
        }
      : {
          total: fallbackTotal,
          page: Number(cleanParams.page) || 1,
          limit: fallbackLimit,
          totalPages: fallbackTotal > 0 ? Math.ceil(fallbackTotal / fallbackLimit) : 0,
        };

    return {
      bookings,
      meta,
      message: raw?.message || "Bookings retrieved",
    };
  },

  /**
   * List unified master bookings for the authenticated customer.
   * GET /api/v1/bookings
   * @param {Object} [params] - { page, limit, status }
   * @returns {Promise<Array>} List of master booking objects
   */
  async getMasterBookings(params = {}) {
    try {
      const requestParams = { limit: 100, ...params };
      const { bookings } = await this.getBookingsPage(requestParams);
      return bookings;
    } catch (err) {
      if (err?.response?.status === 404) return [];
      console.warn("Failed to fetch master bookings:", err?.message || err);
      return [];
    }
  },

  /**
   * Get full details of a specific master booking.
   * GET /api/v1/bookings/:bookingId
   * @param {string} bookingId
   * @returns {Promise<Object>} Master Booking document
   */
  async getMasterBookingById(bookingId) {
    if (!bookingId) throw new Error("bookingId is required");
    const response = await api.get(BookingAPI.CustomerBookingDetailApi(bookingId), {
      headers: getAuthHeaders(),
    });
    return response?.data?.data || response?.data;
  },

  /**
   * Unified cancel request for a master booking.
   * POST /api/v1/bookings/:bookingId/cancel
   * @param {string} bookingId
   * @param {Object} [payload] - Optional cancellation reason/remarks
   * @returns {Promise<Object>} Updated status 'cancelled'
   */
  async cancelMasterBooking(bookingId, payload = {}) {
    if (!bookingId) throw new Error("bookingId is required");
    const response = await api.post(BookingAPI.CustomerBookingCancelApi(bookingId), payload, {
      headers: getAuthHeaders(),
    });
    return response?.data?.data || response?.data;
  },
};

export default bookingService;
