import React from "react";
import { Mail, Phone } from "lucide-react";

const DEFAULT_COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA (+1)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+44", label: "UK (+44)" },
];

/**
 * Universal "Booking Details Will Be Sent To" contact section component.
 * Standardized across all user-side booking flows.
 * Note: Ticket and update notifications are enabled automatically, so no optional checkbox is needed.
 */
const BookingContactDetails = ({
  countryCode = "+91",
  onCountryCodeChange,
  mobile = "",
  onMobileChange,
  email = "",
  onEmailChange,
  errors = {},
  hasSubmitted = false,
  countryCodes = DEFAULT_COUNTRY_CODES,
  title = "Booking Details Will Be Sent To",
  subtitle = "Your ticket & booking information will be sent to these contact details.",
  className = "",
  required = true,
  disabled = false,
}) => {
  const mobileError = (hasSubmitted || errors.mobile) ? errors.mobile : null;
  const emailError = (hasSubmitted || errors.email) ? errors.email : null;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm ${className}`}
    >
      <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Mail className="w-5 h-5 text-blue-600" />
        {title}
      </h3>
      <p className="text-xs text-gray-500 mb-4">{subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Country Code Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Country Code
          </label>
          <select
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={countryCode || "+91"}
            onChange={(e) =>
              onCountryCodeChange && onCountryCodeChange(e.target.value)
            }
          >
            {countryCodes.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Number Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Mobile Number {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="tel"
              disabled={disabled}
              className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                mobileError ? "border-red-500 bg-red-50" : "border-gray-300"
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => onMobileChange && onMobileChange(e.target.value)}
            />
          </div>
          {mobileError && (
            <p className="text-xs text-red-500 mt-1">{mobileError}</p>
          )}
        </div>

        {/* Email Address Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Email Address {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="email"
              disabled={disabled}
              className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                emailError ? "border-red-500 bg-red-50" : "border-gray-300"
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="Email Address"
              value={email}
              onChange={(e) => onEmailChange && onEmailChange(e.target.value)}
            />
          </div>
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingContactDetails;
