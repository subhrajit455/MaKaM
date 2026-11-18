const DEFAULT_WHATSAPP_NUMBER = "9883250683";
const DEFAULT_SUPPORT_EMAIL = "maqamholiday@gmail.com";

function sanitizeEnvValue(value) {
  return String(value ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

/**
 * Normalizes a phone number into digits suitable for wa.me links.
 * Prepends the default country code (91) when a 10-digit local number is provided.
 */
export function normalizeWhatsAppNumber(rawNumber, defaultCountryCode = "91") {
  const digits = sanitizeEnvValue(rawNumber).replace(/\D/g, "");
  if (!digits) {
    return `${defaultCountryCode}${DEFAULT_WHATSAPP_NUMBER}`;
  }
  return digits.length === 10 ? `${defaultCountryCode}${digits}` : digits;
}

/**
 * Returns the normalized WhatsApp number from VITE_WHATSAPP_NUMBER.
 */
export function getSupportWhatsAppNumber(env = import.meta.env || {}) {
  const raw = sanitizeEnvValue(env.VITE_WHATSAPP_NUMBER) || DEFAULT_WHATSAPP_NUMBER;
  return normalizeWhatsAppNumber(raw);
}

/**
 * Returns the support email address from VITE_SUPPORT_EMAIL.
 */
export function getSupportEmail(env = import.meta.env || {}) {
  return sanitizeEnvValue(env.VITE_SUPPORT_EMAIL) || DEFAULT_SUPPORT_EMAIL;
}

/**
 * Builds a wa.me URL targeting the configured support WhatsApp number.
 */
export function buildWhatsAppUrl(message = "", env = import.meta.env || {}) {
  const number = getSupportWhatsAppNumber(env);
  const text = String(message ?? "").trim();
  return text
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${number}`;
}

/**
 * Builds a mailto URL targeting the configured support email address.
 */
export function buildSupportMailtoUrl({ subject = "", body = "" } = {}, env = import.meta.env || {}) {
  const email = getSupportEmail(env);
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return params.length > 0 ? `mailto:${email}?${params.join("&")}` : `mailto:${email}`;
}
