import React, { useState } from "react";
import { Building2, ChevronDown } from "lucide-react";

export default function GstDetailsSection({
  gstDetails,
  setGstDetails,
  isGstExpanded: controlledIsExpanded,
  setIsGstExpanded: controlledSetIsExpanded,
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalExpanded;
  const toggleExpanded = () => {
    if (controlledSetIsExpanded) {
      controlledSetIsExpanded(!isExpanded);
    } else {
      setInternalExpanded(!isExpanded);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div
        onClick={toggleExpanded}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 select-none"
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-gray-500" />
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">
              GST Details (Optional)
            </h4>
            <p className="text-xs text-gray-500">
              Claim credit on your GST invoice
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </div>

      {isExpanded && (
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(gstDetails.hasGst)}
              onChange={(e) =>
                setGstDetails((prev) => ({
                  ...prev,
                  hasGst: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            I have a GST Number
          </label>

          {gstDetails.hasGst && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="22AAAAA0000A1Z5"
                  value={gstDetails.gstNumber || ""}
                  onChange={(e) =>
                    setGstDetails((prev) => ({
                      ...prev,
                      gstNumber: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Registered Company Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Company Name"
                  value={gstDetails.companyName || ""}
                  onChange={(e) =>
                    setGstDetails((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Registered Company Address
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Company Address"
                  value={gstDetails.companyAddress || ""}
                  onChange={(e) =>
                    setGstDetails((prev) => ({
                      ...prev,
                      companyAddress: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Company Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Company Email"
                  value={gstDetails.companyEmail || ""}
                  onChange={(e) =>
                    setGstDetails((prev) => ({
                      ...prev,
                      companyEmail: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
