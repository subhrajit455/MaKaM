import React from "react";
import {
  Check,
  User,
  Trash2,
  ChevronDown,
  FileText,
  Sparkles,
} from "lucide-react";
import { getSlotDisplayName } from "./slotUtils";
import {
  POPULAR_NATIONALITIES,
  POPULAR_AIRLINES,
  MEAL_PREFERENCES,
  WHEELCHAIR_OPTIONS,
} from "./travellerConstants";

export default function PassengerCard({
  slot,
  passengerSlots = [],
  hasSubmitted,
  validationErrors = {},
  isPassportRequired = false,
  isPassportIssueDateRequired = false,
  togglePassenger,
  handleRemoveSlot,
  updatePassenger,
}) {
  const slotErr = hasSubmitted && validationErrors.slots?.[slot.id];

  return (
    <div className="transition-colors">
      {/* Passenger Card Header */}
      <div
        onClick={() => togglePassenger?.(slot.id)}
        className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${
          slot.isExpanded ? "bg-teal-50/40" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              slot.isCompleted
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {slot.isCompleted ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {getSlotDisplayName(slot, passengerSlots)}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-gray-100 text-gray-600">
                {slot.type}
              </span>
            </div>

            {slot.isCompleted ? (
              <p className="text-xs text-teal-700 font-medium mt-0.5 flex items-center gap-1">
                ✓ Traveller Details Added
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">
                Requires Name, Gender & Date of Birth
                {isPassportRequired ? " & Passport" : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {passengerSlots.length > 1 && (
            <button
              type="button"
              onClick={(e) => handleRemoveSlot?.(slot.id, e)}
              className="px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold active:scale-95 shadow-2xs"
              title="Delete this traveller"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              slot.isExpanded ? "rotate-180 text-teal-600" : ""
            }`}
          />
        </div>
      </div>

      {/* Passenger Card Body */}
      {slot.isExpanded && (
        <div className="p-5 border-t border-gray-100 bg-white space-y-5">
          {/* Section 1: Basic Identity Information */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Personal Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={slot.title}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "title", e.target.value)
                  }
                >
                  {slot.type === "ADULT" && (
                    <>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                    </>
                  )}
                  {(slot.type === "CHILD" || slot.type === "INFANT") && (
                    <>
                      <option value="Mstr">Master (Mstr)</option>
                      <option value="Miss">Miss</option>
                    </>
                  )}
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  First & Middle Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    slotErr?.firstName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="As on passport / ID"
                  value={slot.firstName}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "firstName", e.target.value)
                  }
                />
                {slotErr?.firstName && (
                  <p className="text-xs text-red-500 mt-1">
                    {slotErr.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    slotErr?.lastName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Surname"
                  value={slot.lastName}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "lastName", e.target.value)
                  }
                />
                {slotErr?.lastName && (
                  <p className="text-xs text-red-500 mt-1">
                    {slotErr.lastName}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    slotErr?.gender
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={slot.gender}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "gender", e.target.value)
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {slotErr?.gender && (
                  <p className="text-xs text-red-500 mt-1">
                    {slotErr.gender}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    slotErr?.dob ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  value={slot.dob}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "dob", e.target.value)
                  }
                />
                {slotErr?.dob && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {slotErr.dob}
                  </p>
                )}
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Flat 402"
                  value={slot.addressLine1 || ""}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "addressLine1", e.target.value)
                  }
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Mumbai"
                  value={slot.city || ""}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "city", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Section 2: Passport & Travel Documents */}
          <div className="pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>
                Passport & Travel Documents{" "}
                {isPassportRequired ? (
                  <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold normal-case">
                    Required for International Flight
                  </span>
                ) : (
                  "(Optional / Domestic)"
                )}
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Passport Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Passport Number {isPassportRequired && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-lg p-2.5 text-sm uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:normal-case ${
                    slotErr?.passport ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="e.g. J1234567"
                  value={slot.passport || ""}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "passport", e.target.value.toUpperCase())
                  }
                />
                {slotErr?.passport && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {slotErr.passport}
                  </p>
                )}
              </div>

              {/* Issuing Country / Nationality */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nationality / Issuing Country
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={slot.nationality || "India"}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "nationality", e.target.value)
                  }
                >
                  {POPULAR_NATIONALITIES.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Passport Issue Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Passport Issue Date {isPassportIssueDateRequired && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    slotErr?.passportIssueDate ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  value={slot.passportIssueDate || ""}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "passportIssueDate", e.target.value)
                  }
                />
                {slotErr?.passportIssueDate && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {slotErr.passportIssueDate}
                  </p>
                )}
              </div>

              {/* Passport Expiry Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Passport Expiry Date {isPassportRequired && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    slotErr?.passportExpiry ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  value={slot.passportExpiry || ""}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "passportExpiry", e.target.value)
                  }
                />
                {slotErr?.passportExpiry && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {slotErr.passportExpiry}
                  </p>
                )}
              </div>
            </div>

            {slot.isFromSavedTraveller || slot.savedTravellerId ? (
              <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved in your profile</span>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 mt-3 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(slot.saveToProfile)}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "saveToProfile", e.target.checked)
                  }
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span>
                  Save traveller details to my profile{" "}
                  {passengerSlots.length === 1 && (
                    <span className="text-teal-700 font-semibold">(Auto-saved for single traveler)</span>
                  )}
                </span>
              </label>
            )}
          </div>

          {/* Section 3: Loyalty & Special Preferences */}
          <div className="pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Loyalty & Flight Preferences (Optional)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Frequent Flyer Airline */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Loyalty Airline
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={slot.airline || ""}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "airline", e.target.value)
                  }
                >
                  <option value="">Select Airline</option>
                  {POPULAR_AIRLINES.map((air) => (
                    <option key={air} value={air}>
                      {air}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequent Flyer Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Frequent Flyer No.
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. FF89210"
                  value={slot.ffNumber || ""}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "ffNumber", e.target.value)
                  }
                />
              </div>

              {/* Meal Preference */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Meal Preference
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={slot.mealPreference || ""}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "mealPreference", e.target.value)
                  }
                >
                  {MEAL_PREFERENCES.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wheelchair Assistance */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Special Assistance
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={slot.wheelchair || ""}
                  onChange={(e) =>
                    updatePassenger?.(slot.id, "wheelchair", e.target.value)
                  }
                >
                  {WHEELCHAIR_OPTIONS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
