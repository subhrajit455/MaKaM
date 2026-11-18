export const COUNTRY_META = {
  India: { code: "IN", name: "INDIA", dial: "+91" },
  "Saudi Arabia": { code: "SA", name: "SAUDI ARABIA", dial: "+966" },
  "United Arab Emirates": { code: "AE", name: "UNITED ARAB EMIRATES", dial: "+971" },
  Qatar: { code: "QA", name: "QATAR", dial: "+974" },
  Oman: { code: "OM", name: "OMAN", dial: "+968" },
  Kuwait: { code: "KW", name: "KUWAIT", dial: "+965" },
  Bahrain: { code: "BH", name: "BAHRAIN", dial: "+973" },
  "United Kingdom": { code: "GB", name: "UNITED KINGDOM", dial: "+44" },
  "United States": { code: "US", name: "UNITED STATES", dial: "+1" },
  Canada: { code: "CA", name: "CANADA", dial: "+1" },
  Pakistan: { code: "PK", name: "PAKISTAN", dial: "+92" },
  Bangladesh: { code: "BD", name: "BANGLADESH", dial: "+880" },
  Malaysia: { code: "MY", name: "MALAYSIA", dial: "+60" },
  Indonesia: { code: "ID", name: "INDONESIA", dial: "+62" },
  Other: { code: "IN", name: "INDIA", dial: "+91" },
};

export const formatPassengerType = (rawType) => {
  const upper = String(rawType || "ADULT").trim().toUpperCase();
  if (upper === "CHILD" || upper === "CNN" || upper === "CHD") return "Child";
  if (upper === "INFANT" || upper === "INF") return "Infant";
  return "Adult";
};

export const resolveCountryMeta = (nationality, dialCode) => {
  if (nationality && COUNTRY_META[nationality]) {
    return COUNTRY_META[nationality];
  }
  const byCaseInsensitive = Object.entries(COUNTRY_META).find(
    ([key, val]) =>
      key.toLowerCase() === String(nationality || "").trim().toLowerCase() ||
      val.code.toLowerCase() === String(nationality || "").trim().toLowerCase()
  );
  if (byCaseInsensitive) return byCaseInsensitive[1];

  const byDial = Object.values(COUNTRY_META).find((v) => v.dial === dialCode);
  return byDial || COUNTRY_META.India;
};

export const POPULAR_NATIONALITIES = [
  "India",
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Oman",
  "Kuwait",
  "Bahrain",
  "United Kingdom",
  "United States",
  "Canada",
  "Pakistan",
  "Bangladesh",
  "Malaysia",
  "Indonesia",
  "Other",
];

export const POPULAR_AIRLINES = [
  "Saudia (SV)",
  "Air India (AI)",
  "IndiGo (6E)",
  "Emirates (EK)",
  "Qatar Airways (QR)",
  "Etihad Airways (EY)",
  "Gulf Air (GF)",
  "Oman Air (WY)",
  "Flyadeal (F3)",
  "Flynas (XY)",
  "SpiceJet (SG)",
  "Vistara (UK)",
  "Air Arabia (G9)",
  "Other Airline",
];

export const MEAL_PREFERENCES = [
  { code: "", label: "Standard / No Preference" },
  { code: "MOML", label: "Muslim Meal (Halal - MOML)" },
  { code: "HNML", label: "Hindu Non-Vegetarian (HNML)" },
  { code: "VJML", label: "Vegetarian Jain Meal (VJML)" },
  { code: "AVML", label: "Asian Vegetarian Meal (AVML)" },
  { code: "DBML", label: "Diabetic Meal (DBML)" },
  { code: "GFML", label: "Gluten-Free Meal (GFML)" },
  { code: "CHML", label: "Child Meal (CHML)" },
  { code: "BBML", label: "Baby / Infant Meal (BBML)" },
];

export const WHEELCHAIR_OPTIONS = [
  { code: "", label: "No Assistance Required" },
  { code: "WCHR", label: "Wheelchair - Ramp (WCHR)" },
  { code: "WCHS", label: "Wheelchair - Steps (WCHS)" },
  { code: "WCHC", label: "Wheelchair - Cabin Seat (WCHC)" },
];

export const loadSavedDraft = () => {
  try {
    return (
      JSON.parse(sessionStorage.getItem("flight_booking_form_draft")) ||
      JSON.parse(localStorage.getItem("flight_booking_form_draft")) ||
      null
    );
  } catch {
    return null;
  }
};

export const hasFormContent = (slots, contact, gst) => {
  const hasPax = slots?.some(
    (s) => s.firstName?.trim() || s.lastName?.trim() || s.dob || s.passport?.trim(),
  );
  const hasContact = Boolean(contact?.mobile?.trim() || contact?.email?.trim());
  const hasGst = Boolean(gst?.hasGst && gst?.gstNumber?.trim());
  return Boolean(hasPax || hasContact || hasGst);
};
