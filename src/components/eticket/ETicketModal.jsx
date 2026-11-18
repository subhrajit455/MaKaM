import { useState, useEffect } from "react";
import {
  Plane,
  X,
  Printer,
  Download,
  Copy,
  Check,
  Luggage,
  AlertCircle,
  Edit3,
  Eye,
  RotateCcw,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import eticketService from "../../services/eticketService";
import BarcodeSvg from "../common/BarcodeSvg";

export default function ETicketModal({
  isOpen = false,
  onClose,
  ticket = null,
  loading = false,
  error = null,
}) {
  const [localTicket, setLocalTicket] = useState(ticket);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedPnr, setCopiedPnr] = useState(false);

  useEffect(() => {
    setLocalTicket(ticket);
    setIsEditing(false);
  }, [ticket]);

  if (!isOpen) return null;

  const activeTicket = localTicket || ticket || {};
  const pnr = activeTicket.pnr || activeTicket.customerPnr || "TESTPNR";
  const bookingId = activeTicket.bookingId || activeTicket.bookingReference || "2620458";
  const issuedOn = activeTicket.issuedAtFormatted || activeTicket.issuedAt || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  
  const segments = Array.isArray(activeTicket.segments) && activeTicket.segments.length > 0 ? activeTicket.segments : [];
  const firstSeg = segments[0] || {};
  const lastSeg = segments[segments.length - 1] || firstSeg;

  const originCode = firstSeg.origin?.code || "CCU";
  const originCity = firstSeg.origin?.city || originCode;
  const destCode = lastSeg.destination?.code || "PAT";
  const destCity = lastSeg.destination?.city || destCode;

  const passengers = Array.isArray(activeTicket.passengers) && activeTicket.passengers.length > 0 ? activeTicket.passengers : [];
  const paxCount = passengers.length || 1;
  const tripType = segments.length > 1 && segments[0].origin?.code === segments[segments.length - 1].destination?.code
    ? "Round trip"
    : "One way";

  const customer = activeTicket.customer || {};
  const leadPax = passengers.find((p) => p.isLeadPassenger) || passengers[0] || {};
  const contactName = customer.name || leadPax.fullName || "Lead Passenger";
  const contactPhone = customer.phone || "+91 9609092893";
  const contactEmail = customer.email || "maquamholiday786@gmail.com";

  const fare = activeTicket.fareBreakdown || {
    baseFare: Math.round((activeTicket.totalPrice || activeTicket.totalAmount || 7971) * 0.60),
    taxesAndFees: Math.round((activeTicket.totalPrice || activeTicket.totalAmount || 7971) * 0.40),
    totalAmount: activeTicket.totalPrice || activeTicket.totalAmount || 7971,
    currency: "INR",
  };
  const currencySymbol = fare.currency === "INR" || !fare.currency ? "₹" : fare.currency;

  const defaultAdvisories = [
    "Carry a valid government photo ID for every traveller (passport for international travel), including children and infants.",
    "Check-in closes 60 min before departure on domestic and 75 min on international flights — reach the airport 2 hours early.",
    "Web check-in opens 48 hours before departure on the airline website or app.",
    "Baggage allowance is per traveller as shown; extra baggage is charged by the airline at the airport.",
    "Changes or cancellation within 4 hours of departure must be made directly with the airline.",
    "Times are local airport times and can change — check flight status with the airline before you leave.",
  ];
  const advisoriesList = Array.isArray(activeTicket.advisories) && activeTicket.advisories.length > 0
    ? activeTicket.advisories
    : defaultAdvisories;

  const handleCopyPnr = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedPnr(true);
    toast.success(`PNR ${text} copied to clipboard!`);
    setTimeout(() => setCopiedPnr(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!activeTicket) return;
    eticketService.downloadETicketDocument(activeTicket, `ETicket-${pnr}.html`);
    toast.success("Official E-Ticket document downloaded successfully!");
  };

  const handlePassengerChange = (index, field, value) => {
    setLocalTicket((prev) => {
      const copy = { ...prev };
      const paxCopy = Array.isArray(copy.passengers) ? [...copy.passengers] : [];
      if (paxCopy[index]) {
        paxCopy[index] = { ...paxCopy[index], [field]: value };
      }
      return { ...copy, passengers: paxCopy };
    });
  };

  const handleCustomerChange = (field, value) => {
    setLocalTicket((prev) => ({
      ...prev,
      customer: {
        ...(prev.customer || {}),
        [field]: value,
      },
    }));
  };

  const handleFareChange = (field, value) => {
    setLocalTicket((prev) => {
      const currentFare = prev.fareBreakdown || {};
      const numVal = parseFloat(value) || 0;
      const updatedFare = { ...currentFare, [field]: numVal };
      if (field === "baseFare" || field === "taxesAndFees") {
        updatedFare.totalAmount = (field === "baseFare" ? numVal : (updatedFare.baseFare || 0)) +
          (field === "taxesAndFees" ? numVal : (updatedFare.taxesAndFees || 0));
      }
      return { ...prev, fareBreakdown: updatedFare };
    });
  };

  const handleResetEdit = () => {
    setLocalTicket(ticket);
    setIsEditing(false);
    toast.info("Reset e-ticket details to original carrier response.");
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    toast.success("E-Ticket details updated successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-4 sm:my-6 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:p-0 print:border-0 print:shadow-none print:w-full print:max-w-none print:my-0">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/90 print:hidden">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#0b1a2c] text-white shadow-xs">
              <Plane size={16} />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                Official Flight E-Ticket &amp; Receipt
              </h3>
              <p className="text-[11px] text-slate-500">
                Maqam Carrier Verified • Confirmed Electronic Ticket
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Edit Details Toggle */}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                isEditing
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="Edit ticket numbers and contact details"
            >
              {isEditing ? <Eye size={13} className="text-amber-700" /> : <Edit3 size={13} className="text-teal-600" />}
              <span className="hidden sm:inline">{isEditing ? "Preview Ticket" : "Edit Details"}</span>
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                title="Save edited details"
              >
                <Save size={13} />
                <span className="hidden sm:inline">Save</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer size={13} className="text-teal-600" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0b1a2c] text-white hover:bg-slate-800 transition shadow-xs cursor-pointer"
              title="Download official E-Ticket HTML document"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-7 max-h-[82vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
              <p className="text-sm font-bold text-slate-700">Retrieving official airline e-ticket...</p>
              <p className="text-xs text-slate-400">Verifying PNR and ticket status with reservation system</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-2">
              <AlertCircle size={28} className="mx-auto text-red-600" />
              <h4 className="text-sm font-bold text-red-800">E-Ticket Notice</h4>
              <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
            </div>
          ) : (
            <div className="space-y-5 print:space-y-4">

              {/* Editing Banner Notification */}
              {isEditing && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 print:hidden">
                  <div className="flex items-center gap-2">
                    <Edit3 size={15} className="text-amber-700 shrink-0" />
                    <span>
                      <strong>Edit Mode Active:</strong> You can edit passenger ticket numbers, contact details, and fares. Edits will reflect immediately in the print/download outputs.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetEdit}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>
              )}

              {/* 1. Header Banner (Dark Navy with Brand & Barcode Badge, strictly NO QR) */}
              <div className="rounded-2xl bg-[#0b1a2c] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="bg-white rounded-lg px-2.5 py-1.5 text-[10px] font-black text-[#0b1a2c] tracking-wider text-center leading-tight shrink-0 shadow-2xs">
                    <span className="text-red-600 block text-[8px]">BACK</span>OFFICE
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                      MAQAM HOLIDAYS
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={13} className="text-teal-400" />
                        maquamholiday786@gmail.com
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={13} className="text-teal-400" />
                        +91 9609092893
                      </span>
                    </div>
                  </div>
                </div>

                {/* White Barcode PNR Badge (Authentic Maqam Design) */}
                <div className="bg-white text-slate-900 rounded-xl px-4 py-2.5 text-center min-w-[160px] shadow-sm self-start sm:self-auto">
                  <div className="text-[9px] font-black tracking-widest text-[#0284c7] uppercase mb-1">
                    E - TICKET · P N R
                  </div>
                  <BarcodeSvg value={pnr} height={34} unitWidth={1.15} color="#0f172a" />
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className="font-mono text-xs sm:text-sm font-black tracking-widest text-slate-900 uppercase">
                      {pnr}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPnr(pnr)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 transition cursor-pointer print:hidden"
                      title="Copy PNR"
                    >
                      {copiedPnr ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Info Metric Strip (5 Columns) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 text-left shadow-2xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    BOOKING ID
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
                    {bookingId}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    ISSUED ON
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">
                    {issuedOn}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    TRIP
                  </span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">
                    {tripType} · {paxCount} {paxCount === 1 ? "traveller" : "travellers"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    STATUS
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-emerald-600 mt-0.5">
                    <CheckCircle2 size={14} />
                    CONFIRMED
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    FARE TYPE
                  </span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">
                    Refundable
                  </span>
                </div>
              </div>

              {/* 3. Route Title Header */}
              <div className="text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {originCity} → {destCity}
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {firstSeg.departureTimeFormatted || issuedOn} · Non-stop onward
                </p>
              </div>

              {/* 4. Flight Segment Card(s) */}
              <div className="space-y-4">
                {segments.map((seg, sIdx) => {
                  const isReturn = sIdx > 0 && seg.origin?.code === destCode;
                  const segTitle = isReturn
                    ? `RETURN · ${seg.origin?.code || ""} → ${seg.destination?.code || ""}`
                    : `ONWARD · ${seg.origin?.code || ""} → ${seg.destination?.code || ""}`;
                  const airlineName = seg.airline?.name || "IndiGo";
                  const flightNo = seg.airline?.flightNumber || "6E 6917";
                  const cabinClass = seg.airline?.cabinClass || "Economy · Class R";
                  const depTime = seg.departureTimeFormatted
                    ? seg.departureTimeFormatted.split(",")[1]?.trim() || "14:15"
                    : "14:15";
                  const depDate = seg.departureTimeFormatted
                    ? seg.departureTimeFormatted.split(",")[0]?.trim() || "Sat, 14 Nov"
                    : "Sat, 14 Nov";
                  const arrTime = seg.arrivalTimeFormatted
                    ? seg.arrivalTimeFormatted.split(",")[1]?.trim() || "15:20"
                    : "15:20";
                  const arrDate = seg.arrivalTimeFormatted
                    ? seg.arrivalTimeFormatted.split(",")[0]?.trim() || "Sat, 14 Nov"
                    : "Sat, 14 Nov";
                  const checkIn = seg.baggage?.checkIn || "15 Kg";
                  const cabin = seg.baggage?.cabin || "7 Kg";

                  return (
                    <div
                      key={sIdx}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
                    >
                      {/* Segment Header */}
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{segTitle}</span>
                        </div>
                        <span className="font-mono text-xs font-black text-[#0284c7] tracking-wider">
                          PNR {pnr}
                        </span>
                      </div>

                      {/* Segment Body Grid */}
                      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-[200px_1fr_150px] gap-4 sm:gap-6 items-center">
                        {/* Airline Info */}
                        <div>
                          <span className="text-base font-black text-slate-900 block leading-tight">
                            {airlineName}
                          </span>
                          <span className="inline-block text-xs font-extrabold text-[#0284c7] bg-blue-50 px-2 py-0.5 rounded-md mt-1 border border-blue-100">
                            {flightNo}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-1">
                            {cabinClass}
                          </span>
                        </div>

                        {/* Times & Route Visualization */}
                        <div className="flex items-center justify-between gap-3 sm:gap-6">
                          <div className="text-left">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-tight">
                              {depTime}
                            </span>
                            <span className="text-xs font-extrabold text-slate-900 block mt-1">
                              {seg.origin?.code} · {seg.origin?.city}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-[160px]" title={seg.origin?.airportName}>
                              {seg.origin?.airportName || "International Airport"}
                            </span>
                            <span className="text-[11px] font-bold text-teal-800 block mt-0.5">
                              {depDate}
                            </span>
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center max-w-[130px]">
                            <span className="text-[11px] font-bold text-slate-600">
                              {seg.duration || "1h 5m"}
                            </span>
                            <div className="w-full flex items-center my-1.5">
                              <div className="h-px bg-slate-300 flex-1" />
                              <Plane size={14} className="mx-1.5 text-teal-700 rotate-90 sm:rotate-0" />
                              <div className="h-px bg-slate-300 flex-1" />
                            </div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                              Non-stop
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-tight">
                              {arrTime}
                            </span>
                            <span className="text-xs font-extrabold text-slate-900 block mt-1">
                              {seg.destination?.code} · {seg.destination?.city}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-[160px]" title={seg.destination?.airportName}>
                              {seg.destination?.airportName || "International Airport"}
                            </span>
                            <span className="text-[11px] font-bold text-teal-800 block mt-0.5">
                              {arrDate}
                            </span>
                          </div>
                        </div>

                        {/* Baggage Allowance */}
                        <div className="border-t md:border-t-0 md:border-l border-dashed border-slate-200 pt-3 md:pt-0 md:pl-5 flex flex-col gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50/80 px-2.5 py-1 rounded-lg border border-teal-200/60">
                            <Luggage size={14} className="text-teal-600 shrink-0" />
                            Check-in {checkIn}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50/80 px-2.5 py-1 rounded-lg border border-teal-200/60">
                            <Luggage size={14} className="text-teal-600 shrink-0" />
                            Cabin {cabin}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 5. Travellers Manifest Table */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>TRAVELLERS</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {paxCount} {paxCount === 1 ? "adult" : "adults"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50">
                        <th className="py-2.5 px-4 w-12">#</th>
                        <th className="py-2.5 px-4">TRAVELLER</th>
                        <th className="py-2.5 px-4 w-32">TYPE</th>
                        <th className="py-2.5 px-4 w-48">E-TICKET NO.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {passengers.map((pax, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-black text-slate-900">
                            {isEditing ? (
                              <input
                                type="text"
                                value={pax.fullName || ""}
                                onChange={(e) => handlePassengerChange(idx, "fullName", e.target.value)}
                                className="w-full text-xs font-bold px-2 py-1 border border-slate-300 rounded"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{pax.fullName}</span>
                                {pax.isLeadPassenger && (
                                  <span className="bg-purple-100 text-purple-700 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                    LEAD
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {isEditing ? (
                              <select
                                value={pax.passengerType || "Adult"}
                                onChange={(e) => handlePassengerChange(idx, "passengerType", e.target.value)}
                                className="text-xs px-2 py-1 border border-slate-300 rounded"
                              >
                                <option value="Adult">Adult</option>
                                <option value="Child">Child</option>
                                <option value="Infant">Infant</option>
                              </select>
                            ) : (
                              pax.passengerType || "Adult"
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-teal-800">
                            {isEditing ? (
                              <input
                                type="text"
                                value={pax.ticketNumber || ""}
                                placeholder="065-2489102481"
                                onChange={(e) => handlePassengerChange(idx, "ticketNumber", e.target.value)}
                                className="w-full text-xs font-mono font-bold px-2 py-1 border border-slate-300 rounded"
                              />
                            ) : (
                              pax.ticketNumber || "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. Two-Column Lower Grid (Fare Summary + Support on Left, Important Info on Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Column: Fare & Contact */}
                <div className="space-y-4">
                  
                  {/* Fare Summary */}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>FARE SUMMARY · FARE</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">INR</span>
                    </div>

                    <div className="p-4 space-y-2.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Base fare</span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={fare.baseFare || 0}
                            onChange={(e) => handleFareChange("baseFare", e.target.value)}
                            className="w-24 text-right px-1.5 py-0.5 border border-slate-300 rounded font-bold"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">
                            {currencySymbol}{Number(fare.baseFare || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between text-slate-600">
                        <span>Taxes &amp; fees</span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={fare.taxesAndFees || 0}
                            onChange={(e) => handleFareChange("taxesAndFees", e.target.value)}
                            className="w-24 text-right px-1.5 py-0.5 border border-slate-300 rounded font-bold"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">
                            {currencySymbol}{Number(fare.taxesAndFees || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-slate-200">
                        <span className="text-sm font-black text-slate-900">Total paid</span>
                        <span className="text-xl font-black text-emerald-600">
                          {currencySymbol}{Number(fare.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Support */}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>CONTACT &amp; SUPPORT</span>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          LEAD CONTACT
                        </span>
                        {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            <input
                              type="text"
                              value={contactName}
                              onChange={(e) => handleCustomerChange("name", e.target.value)}
                              placeholder="Full Name"
                              className="text-xs px-2 py-1 border border-slate-300 rounded"
                            />
                            <input
                              type="text"
                              value={contactPhone}
                              onChange={(e) => handleCustomerChange("phone", e.target.value)}
                              placeholder="Phone"
                              className="text-xs px-2 py-1 border border-slate-300 rounded"
                            />
                            <input
                              type="email"
                              value={contactEmail}
                              onChange={(e) => handleCustomerChange("email", e.target.value)}
                              placeholder="Email"
                              className="text-xs px-2 py-1 border border-slate-300 rounded sm:col-span-2"
                            />
                          </div>
                        ) : (
                          <p className="font-bold text-slate-900 mt-0.5 leading-snug">
                            {contactName} · {contactPhone} ·<br />
                            <span className="text-slate-600">{contactEmail}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          NEED HELP?
                        </span>
                        <p className="font-bold text-slate-900 mt-0.5">
                          maquamholiday786@gmail.com · +91 9609092893
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Important Information (6 Official Guidelines) */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>IMPORTANT INFORMATION</span>
                  </div>

                  <div className="p-4">
                    <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                      {advisoriesList.map((adv, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 7. Footer Notice */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-200 text-xs text-slate-500 font-medium">
                <span>This is a computer-generated e-ticket and does not need a signature.</span>
                <span className="font-bold text-slate-700 font-mono">Booking {bookingId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar (Hidden in Print) */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Shield size={14} className="text-teal-600" />
            <span>Official Maqam Carrier E-Ticket System</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
