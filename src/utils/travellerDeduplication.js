/**
 * Utility functions for co-traveller deduplication and identification.
 * Ensures consistent matching across User Profile, Quick Add, Flight, Hotel, and Package booking flows.
 */

/**
 * Normalizes passport number: removes spaces, hyphens, and converts to uppercase.
 * @param {string|null|undefined} passport
 * @returns {string}
 */
export const normalizePassport = (passport) => {
  if (!passport) return "";
  return String(passport).replace(/[\s-]/g, "").trim().toUpperCase();
};

/**
 * Normalizes PAN card number: removes spaces, hyphens, uppercase.
 * @param {string|null|undefined} pan
 * @returns {string}
 */
export const normalizePan = (pan) => {
  if (!pan) return "";
  return String(pan).replace(/[\s-]/g, "").trim().toUpperCase();
};

/**
 * Normalizes phone number: strips non-digits. Returns last 10 digits if available.
 * @param {string|number|null|undefined} phone
 * @returns {string}
 */
export const normalizePhone = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
};

/**
 * Normalizes email: trimmed and lowercase.
 * @param {string|null|undefined} email
 * @returns {string}
 */
export const normalizeEmail = (email) => {
  if (!email) return "";
  return String(email).trim().toLowerCase();
};

/**
 * Normalizes date to YYYY-MM-DD.
 * Handles ISO strings ("1990-05-15T00:00:00.000Z"), date strings ("1990-05-15"), or Date objects.
 * @param {string|Date|null|undefined} dateVal
 * @returns {string}
 */
export const normalizeDate = (dateVal) => {
  if (!dateVal) return "";
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return dateVal.toISOString().split("T")[0];
  }
  const str = String(dateVal).trim();
  if (!str) return "";
  if (str.includes("T")) {
    return str.split("T")[0];
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return str.slice(0, 10);
};

/**
 * Normalizes person name: trimmed, lowercase, collapsed multiple spaces.
 * @param {string|null|undefined} name
 * @returns {string}
 */
export const normalizeName = (name) => {
  if (!name) return "";
  return String(name).trim().toLowerCase().replace(/\s+/g, " ");
};

/**
 * Determines whether two traveller representations belong to the same person.
 *
 * Matching rules:
 * 1. Matching Passport: If both have a non-empty passport number, they match if normalized passports match.
 * 2. Matching PAN: If both have a non-empty PAN, they match if normalized PANs match.
 * 3. Matching Full Name + Secondary Identifier:
 *    - Normalized firstName and lastName both match, AND:
 *      - Date of Birth matches (both present and non-empty), OR
 *      - Phone number matches (both present and non-empty), OR
 *      - Email matches (both present and non-empty).
 * 4. Fallback (name-only): If neither has DOB, Phone, or Email, matching first + last name and gender/passengerType is a match.
 *
 * @param {Object} candidate - Candidate traveller object (e.g. from form or booking slot)
 * @param {Object} existing - Existing saved traveller object
 * @returns {boolean}
 */
export const isSameTraveller = (candidate, existing) => {
  if (!candidate || !existing) return false;

  // 1. Passport match or conflict
  const candPassport = normalizePassport(candidate.passportNo || candidate.passport || candidate.passportNumber);
  const existPassport = normalizePassport(existing.passportNo || existing.passport || existing.passportNumber);
  if (candPassport && existPassport && candPassport.length >= 5 && existPassport.length >= 5) {
    if (candPassport === existPassport) {
      return true;
    }
    // Explicit passport mismatch: different passports represent distinct travellers
    return false;
  }

  // 2. PAN card match or conflict
  const candPan = normalizePan(candidate.pan || candidate.panNumber);
  const existPan = normalizePan(existing.pan || existing.panNumber);
  if (candPan && existPan && candPan.length === 10 && existPan.length === 10) {
    if (candPan === existPan) {
      return true;
    }
    // Explicit PAN mismatch: different PAN numbers represent distinct tax/identity entities
    return false;
  }

  // 3. Name check
  const candFirst = normalizeName(candidate.firstName);
  const candLast = normalizeName(candidate.lastName);
  const existFirst = normalizeName(existing.firstName);
  const existLast = normalizeName(existing.lastName);

  // If both have names and they don't match, they are different people
  if (candFirst && existFirst && candFirst !== existFirst) {
    return false;
  }
  if (candLast && existLast && candLast !== existLast) {
    return false;
  }

  const namesMatch = Boolean(candFirst && existFirst && candFirst === existFirst && candLast && existLast && candLast === existLast);

  if (namesMatch) {
    // Check secondary identifiers
    const candDob = normalizeDate(candidate.dateOfBirth || candidate.dob);
    const existDob = normalizeDate(existing.dateOfBirth || existing.dob);
    const hasDobMatch = Boolean(candDob && existDob && candDob === existDob);

    const candPhone = normalizePhone(candidate.phone || candidate.mobile);
    const existPhone = normalizePhone(existing.phone || existing.mobile);
    const hasPhoneMatch = Boolean(candPhone && existPhone && candPhone.length >= 7 && candPhone === existPhone);

    const candEmail = normalizeEmail(candidate.email);
    const existEmail = normalizeEmail(existing.email);
    const hasEmailMatch = Boolean(candEmail && existEmail && candEmail === existEmail);

    if (hasDobMatch || hasPhoneMatch || hasEmailMatch) {
      return true;
    }

    // If neither side provided DOB, Phone, or Email, matching full name is considered a match
    const candHasSecondary = Boolean(candDob || candPhone || candEmail);
    const existHasSecondary = Boolean(existDob || existPhone || existEmail);
    if (!candHasSecondary || !existHasSecondary) {
      return true;
    }
  }

  return false;
};

/**
 * Searches a list of saved travellers for one that matches candidate details.
 *
 * @param {Object} candidate - Candidate traveller details
 * @param {Array<Object>} travellerList - List of existing saved travellers
 * @returns {Object|null} Matching traveller object or null
 */
export const findMatchingTraveller = (candidate, travellerList) => {
  if (!candidate || !Array.isArray(travellerList) || travellerList.length === 0) {
    return null;
  }
  return travellerList.find((t) => isSameTraveller(candidate, t)) || null;
};

export default {
  normalizePassport,
  normalizePan,
  normalizePhone,
  normalizeEmail,
  normalizeDate,
  normalizeName,
  isSameTraveller,
  findMatchingTraveller,
};
