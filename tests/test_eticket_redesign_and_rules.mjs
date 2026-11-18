import test from "node:test";
import assert from "node:assert/strict";
import { generateBarcodeSvgString } from "../src/components/common/barcodeUtils.js";
import { generateETicketHTML, synthesizeETicket } from "../src/services/eticketService.js";

// Test 1: Vector Barcode SVG Generation
test("1. generateBarcodeSvgString produces valid SVG and contains no external URL requests", () => {
  const pnr = "TESTPNR";
  const svg = generateBarcodeSvgString(pnr, { height: 32, unitWidth: 1.15 });

  assert.ok(svg.startsWith("<svg"), "Must start with <svg tag");
  assert.ok(svg.includes("</svg>"), "Must close with </svg>");
  assert.ok(svg.includes("<rect"), "Must contain rect elements for barcode bars");
  assert.equal(svg.includes("api.qrserver.com"), false, "Must not use external qrserver API");
  assert.equal(svg.includes("quickchart.io"), false, "Must not use external quickchart API");
  assert.equal(svg.includes("qr"), false, "Must not contain QR code keywords");
});

// Test 2: Authentic E-Ticket HTML Generation with Sample Booking 2620458
test("2. generateETicketHTML strictly follows original ticket design rules from Booking 2620458 PDF", () => {
  const sampleTicket = {
    serviceType: "LIVE_FLIGHT",
    bookingId: "2620458",
    bookingReference: "FLT-2620458",
    pnr: "TESTPNR",
    carrierType: "LCC",
    ticketStatus: "CONFIRMED",
    issuedAt: "2026-11-13T10:00:00.000Z",
    issuedAtFormatted: "13 Nov 2026",
    customer: {
      name: "Rohit Ghorai",
      email: "dasarathghorai2019@gmail.com",
      phone: "+918436095570",
    },
    segments: [
      {
        segmentIndex: 1,
        airline: {
          name: "IndiGo",
          code: "6E",
          flightNumber: "6E 6917",
          cabinClass: "Economy · Class R",
        },
        origin: {
          code: "CCU",
          city: "Kolkata",
          airportName: "Netaji Subhas Chandra Bose Intl",
        },
        destination: {
          code: "PAT",
          city: "Patna",
          airportName: "Jai Prakash Narayan Arpt",
        },
        departureTimeFormatted: "Sat, 14 Nov, 14:15",
        arrivalTimeFormatted: "Sat, 14 Nov, 15:20",
        duration: "1h 5m",
        baggage: {
          checkIn: "15 Kilograms",
          cabin: "7 Kg",
        },
      },
    ],
    passengers: [
      {
        passengerIndex: 1,
        fullName: "Mr Rohit Ghorai",
        passengerType: "Adult",
        isLeadPassenger: true,
        ticketNumber: "065-2489102481",
        ticketStatus: "OK",
      },
      {
        passengerIndex: 2,
        fullName: "Mr arg SHAW",
        passengerType: "Adult",
        isLeadPassenger: false,
        ticketNumber: "065-2489102482",
        ticketStatus: "OK",
      },
    ],
    fareBreakdown: {
      baseFare: 4800,
      taxesAndFees: 3171,
      totalAmount: 7971,
      currency: "INR",
    },
  };

  const html = generateETicketHTML(sampleTicket);

  // Rule 1: Header Bar with MAQAM HOLIDAYS branding & PNR Barcode Badge
  assert.ok(html.includes("MAQAM HOLIDAYS"), "Rule 1: Must contain MAQAM HOLIDAYS");
  assert.ok(html.includes("maquamholiday786@gmail.com"), "Rule 1: Must contain support email");
  assert.ok(html.includes("+91 9609092893"), "Rule 1: Must contain support phone");
  assert.ok(html.includes("E - TICKET · P N R"), "Rule 1: Must have E - TICKET · P N R badge");
  assert.ok(html.includes("<svg"), "Rule 1: Must render SVG barcode in header badge");

  // Rule 2: Complete Removal of QR Codes
  assert.equal(html.includes("qrCodePayload"), false, "Rule 2: Zero occurrences of qrCodePayload");
  assert.equal(html.includes("api.qrserver.com"), false, "Rule 2: Zero occurrences of api.qrserver.com");
  assert.equal(html.includes("quickchart.io/qr"), false, "Rule 2: Zero occurrences of quickchart.io/qr");
  assert.equal(html.includes("Scan at Security"), false, "Rule 2: QR 'Scan at Security' text removed");

  // Rule 3: 5-Column Metric Strip
  assert.ok(html.includes("BOOKING ID"), "Rule 3: Metric strip contains BOOKING ID");
  assert.ok(html.includes("2620458"), "Rule 3: Metric strip contains Booking ID 2620458");
  assert.ok(html.includes("ISSUED ON"), "Rule 3: Metric strip contains ISSUED ON");
  assert.ok(html.includes("TRIP"), "Rule 3: Metric strip contains TRIP");
  assert.ok(html.includes("STATUS"), "Rule 3: Metric strip contains STATUS");
  assert.ok(html.includes("CONFIRMED"), "Rule 3: Metric strip contains CONFIRMED status");
  assert.ok(html.includes("FARE TYPE"), "Rule 3: Metric strip contains FARE TYPE");
  assert.ok(html.includes("Refundable"), "Rule 3: Metric strip contains Refundable");

  // Rule 4: Route Header Title
  assert.ok(html.includes("Kolkata → Patna"), "Rule 4: Must contain Kolkata → Patna");

  // Rule 5: Segment Card
  assert.ok(html.includes("ONWARD · CCU → PAT"), "Rule 5: Must contain ONWARD indicator");
  assert.ok(html.includes("IndiGo"), "Rule 5: Airline name IndiGo present");
  assert.ok(html.includes("6E 6917"), "Rule 5: Flight number present");
  assert.ok(html.includes("Netaji Subhas Chandra Bose Intl"), "Rule 5: Origin airport name present");
  assert.ok(html.includes("Jai Prakash Narayan Arpt"), "Rule 5: Destination airport name present");
  assert.ok(html.includes("Check-in 15 Kilograms"), "Rule 5: Baggage check-in allowance present");
  assert.ok(html.includes("Cabin 7 Kg"), "Rule 5: Baggage cabin allowance present");

  // Rule 6: Travellers Manifest Table
  assert.ok(html.includes("TRAVELLERS"), "Rule 6: Travellers section present");
  assert.ok(html.includes("Mr Rohit Ghorai"), "Rule 6: Lead passenger name present");
  assert.ok(html.includes("LEAD"), "Rule 6: Lead passenger badge present");
  assert.ok(html.includes("Mr arg SHAW"), "Rule 6: Second passenger name present");
  assert.ok(html.includes("065-2489102481"), "Rule 6: Ticket number present");

  // Rule 7: Two-Column Lower Grid (Fare Summary + Contact on left, Guidelines on right)
  assert.ok(html.includes("FARE SUMMARY · FARE"), "Rule 7: Fare summary present");
  assert.ok(html.includes("4,800.00"), "Rule 7: Base fare present");
  assert.ok(html.includes("3,171.00"), "Rule 7: Taxes & fees present");
  assert.ok(html.includes("7,971.00"), "Rule 7: Total paid present in green font");
  assert.ok(html.includes("CONTACT &amp; SUPPORT") || html.includes("CONTACT"), "Rule 7: Contact & Support present");
  assert.ok(html.includes("LEAD CONTACT"), "Rule 7: Lead Contact title present");
  assert.ok(html.includes("Rohit Ghorai"), "Rule 7: Lead contact name present");
  assert.ok(html.includes("dasarathghorai2019@gmail.com"), "Rule 7: Lead contact email present");
  assert.ok(html.includes("+918436095570"), "Rule 7: Lead contact phone present");
  assert.ok(html.includes("IMPORTANT INFORMATION"), "Rule 7: Important information present");
  assert.ok(html.includes("Carry a valid government photo ID"), "Rule 7: Photo ID guideline present");
  assert.ok(html.includes("Check-in closes 60 min before departure"), "Rule 7: Check-in closing guideline present");

  // Rule 8: Computer-Generated Notice Footer
  assert.ok(html.includes("This is a computer-generated e-ticket and does not need a signature."), "Rule 8: Computer-generated disclaimer present");
  assert.ok(html.includes("Booking 2620458"), "Rule 8: Booking ID in footer present");
});

// Test 3: Conformance with ETICKET_ROUTES_GUIDE Payloads (Live Flight, Offer Flight, Package Flight)
test("3. ETICKET_ROUTES_GUIDE payload structures map cleanly into generateETicketHTML without throwing", () => {
  // Live GDS Flight (Endpoint 1)
  const liveFlight = {
    serviceType: "LIVE_FLIGHT",
    bookingId: "6735a2b1f84b6c31e4000101",
    bookingReference: "FLT-841920",
    pnr: "6E5544",
    ticketStatus: "CONFIRMED",
    issuedAtFormatted: "14 Nov 2026, 02:00 PM",
    customer: {
      name: "Mohammed Khan",
      email: "mohammed.khan@example.com",
      phone: "+919876543210",
    },
    segments: [
      {
        airline: { name: "Saudia", code: "SV", flightNumber: "SV 758", cabinClass: "Economy" },
        origin: { code: "BOM", city: "Mumbai", airportName: "Chhatrapati Shivaji Maharaj Intl", terminal: "T2" },
        destination: { code: "JED", city: "Jeddah", airportName: "King Abdulaziz Intl", terminal: "T1" },
        departureTimeFormatted: "01 Dec 2026, 04:00 PM",
        arrivalTimeFormatted: "01 Dec 2026, 07:45 PM",
        duration: "5h 15m",
        baggage: { checkIn: "2 x 23 KG", cabin: "7 KG" },
      },
    ],
    passengers: [
      { fullName: "MR MOHAMMED KHAN", passengerType: "ADULT", isLeadPassenger: true, ticketNumber: "065-2489102481" },
    ],
  };

  const liveHtml = generateETicketHTML(liveFlight);
  assert.ok(liveHtml.includes("6E5544"), "Live PNR rendered");
  assert.ok(liveHtml.includes("Mumbai → Jeddah"), "Route rendered");
  assert.ok(liveHtml.includes("Saudia"), "Airline rendered");
  assert.equal(liveHtml.includes("api.qrserver.com"), false, "No QR server URL");

  // In-House Standalone Offer Flight (Endpoint 3)
  const offerFlight = {
    serviceType: "INHOUSE_OFFER_FLIGHT",
    bookingId: "6735bf00f84b6c31e4000202",
    pnr: "MQM-000202",
    airlineGroupPnr: "SV-GRP-9841",
    customer: { name: "Ahmed Farooq", email: "ahmed.farooq@example.com", phone: "+919811223344" },
    segments: [
      {
        airline: { name: "Saudia", code: "SV", flightNumber: "SV 800", cabinClass: "Economy" },
        origin: { code: "DEL", city: "Delhi", airportName: "Indira Gandhi Intl", terminal: "T3" },
        destination: { code: "MED", city: "Madinah", airportName: "Prince Mohammad Intl", terminal: "T1" },
        departureTimeFormatted: "10 Dec 2026, 09:30 AM",
        arrivalTimeFormatted: "10 Dec 2026, 02:00 PM",
        duration: "Direct Series Flight",
        baggage: { checkIn: "2 x 23 KG (Series Allowance)", cabin: "7 KG" },
      },
    ],
    passengers: [
      { fullName: "MR AHMED FAROOQ", passengerType: "ADULT", isLeadPassenger: true, ticketNumber: "SV-GRP-9841-01" },
    ],
  };

  const offerHtml = generateETicketHTML(offerFlight);
  assert.ok(offerHtml.includes("MQM-000202"), "Offer PNR rendered");
  assert.ok(offerHtml.includes("Delhi → Madinah"), "Offer route rendered");
  assert.ok(offerHtml.includes("MR AHMED FAROOQ"), "Passenger rendered");
  assert.equal(offerHtml.includes("api.qrserver.com"), false, "No QR server URL");
});

// Test 4: synthesizeETicket Fallback Normalizer Conformance
test("4. synthesizeETicket normalizes raw booking context into conforming schema", () => {
  const rawBooking = {
    _id: "6735c100f84b6c31e4000303",
    status: "confirmed",
    paymentStatus: "paid",
    customerName: "Zubair Siddiqui",
    customerEmail: "zubair@example.com",
    customerPhone: "+919822334455",
    pnr: "MQM-000303",
    flight: {
      airlineName: "Flynas",
      airlineCode: "XY",
      flightNumber: "XY 312",
      origin: "HYD",
      destination: "JED",
    },
    travellers: [
      { name: "Mr Zubair Siddiqui", isLead: true },
    ],
    totalPrice: 45000,
  };

  const synthesized = synthesizeETicket(rawBooking, "INHOUSE_PACKAGE_FLIGHT");
  assert.equal(synthesized.serviceType, "INHOUSE_PACKAGE_FLIGHT");
  assert.equal(synthesized.pnr, "MQM-000303");
  assert.equal(synthesized.customer.name, "Zubair Siddiqui");
  assert.equal(synthesized.customer.email, "zubair@example.com");
  assert.equal(synthesized.segments[0].airline.name, "Flynas");
  assert.equal(synthesized.passengers[0].fullName, "Mr Zubair Siddiqui");
  assert.equal(synthesized.passengers[0].isLeadPassenger, true);
});
