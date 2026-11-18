import api from "../components/stores/api.js";
import { TravellerAPI } from "../configs/api.js";
import { getAuthHeaders } from "./auth/tokenService.js";
import {
  isSameTraveller,
  findMatchingTraveller,
  normalizePassport,
  normalizePan,
  normalizePhone,
  normalizeEmail,
  normalizeDate,
  normalizeName,
} from "../utils/travellerDeduplication.js";

/**
 * Service for interacting with User Traveller Profile API endpoints.
 * All requests authenticate via Bearer token in the Axios interceptor.
 */
export const travellerService = {
  // Deduplication & Matching helpers
  isSameTraveller,
  findMatchingTraveller,
  normalizePassport,
  normalizePan,
  normalizePhone,
  normalizeEmail,
  normalizeDate,
  normalizeName,

  /**
   * Ensures a traveller exists in the user's saved list without creating duplicates.
   * If a matching profile is found, returns existing profile info ({ traveller, isNew: false, id }).
   * If not found, creates the new traveller profile and returns ({ traveller, isNew: true, id }).
   *
   * @param {Object} travellerData - Traveller data to save/match
   * @param {Array<Object>} [existingList] - Optional existing travellers list. If not provided, fetches live.
   * @returns {Promise<{ traveller: Object, isNew: boolean, id: string }>}
   */
  async ensureTraveller(travellerData, existingList = null) {
    let list = existingList;
    if (!Array.isArray(list)) {
      list = await this.getAllTravellers();
    }

    const matched = findMatchingTraveller(travellerData, list);
    if (matched) {
      const matchedId = matched._id || matched.id;
      return {
        traveller: matched,
        isNew: false,
        id: matchedId ? String(matchedId) : null,
      };
    }

    const created = await this.createTraveller(travellerData);
    const createdId = created?._id || created?.id;
    return {
      traveller: created,
      isNew: true,
      id: createdId ? String(createdId) : null,
    };
  },
  /**
   * Get all travellers for the authenticated user.
   * Note: The backend returns 404 ("No travellers found for this user") when the list is empty.
   * We intercept this and return an empty array [] so the UI doesn't crash with 404.
   * @returns {Promise<Array>} Array of traveller objects
   */
  async getAllTravellers() {
    try {
      const response = await api.get(TravellerAPI.GetAll, {
        headers: getAuthHeaders(),
      });
      const data = response?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.data?.data)) return data.data.data;
      return [];
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 401) {
        return [];
      }
      return [];
    }
  },

  /**
   * Get a single traveller by ID.
   * @param {string} travellerId
   * @returns {Promise<Object>} Traveller profile object
   */
  async getTravellerById(travellerId) {
    try {
      const response = await api.get(TravellerAPI.GetById(travellerId), {
        headers: getAuthHeaders(),
      });
      return response?.data?.data || response?.data || null;
    } catch (err) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  /**
   * Create a new traveller profile.
   * POST /api/v1/account/traveller/create
   * @param {Object} travellerData
   * @returns {Promise<Object>} Created traveller profile
   */
  async createTraveller(travellerData) {
    try {
      const response = await api.post(TravellerAPI.Create, travellerData, {
        headers: getAuthHeaders(),
      });
      return response?.data?.data || response?.data;
    } catch (err) {
      if (err?.response?.status === 404 && TravellerAPI.CreateAlt) {
        const fallback = await api.post(TravellerAPI.CreateAlt, travellerData, {
          headers: getAuthHeaders(),
        });
        return fallback?.data?.data || fallback?.data;
      }
      throw err;
    }
  },

  /**
   * Update an existing traveller profile.
   * PUT /api/v1/account/traveller/{travellerId}
   * @param {string} travellerId - MongoDB ID of traveller
   * @param {Object} travellerData - Fields to update
   * @returns {Promise<Object>} Updated traveller profile
   */
  async updateTraveller(travellerId, travellerData) {
    const cleanId = String(travellerId).trim();
    const response = await api.put(
      TravellerAPI.Update(cleanId),
      travellerData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response?.data?.data || response?.data;
  },

  /**
   * Delete a traveller profile.
   * DELETE /api/v1/account/traveller/{travellerId}
   * @param {string} travellerId - MongoDB ID of traveller
   * @returns {Promise<Object>}
   */
  async deleteTraveller(travellerId) {
    const cleanId = String(travellerId).trim();
    const response = await api.delete(TravellerAPI.Delete(cleanId), {
      headers: getAuthHeaders(),
    });
    return response?.data?.data || response?.data;
  },

  /**
   * Set traveller as default / primary traveller.
   * PATCH or PUT /api/v1/account/traveller/{travellerId}/default
   * @param {string} travellerId
   * @returns {Promise<Object>}
   */
  async setDefaultTraveller(travellerId) {
    const cleanId = String(travellerId).trim();
    try {
      const response = await api.patch(
        `/api/v1/account/traveller/${cleanId}/default`,
        {},
        { headers: getAuthHeaders() }
      );
      return response?.data?.data || response?.data;
    } catch {
      const fallback = await api.put(
        `/api/v1/account/traveller/${cleanId}/default`,
        {},
        { headers: getAuthHeaders() }
      );
      return fallback?.data?.data || fallback?.data;
    }
  },
};

export default travellerService;

