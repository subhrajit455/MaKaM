import { Plane, Building2 } from "lucide-react";

export const travellingWay = ["One Way", "Round Trip"];

export const AIRPORTS_URL =
  "https://raw.githubusercontent.com/mwgg/Airports/master/airports.json";

export const formatLocalDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const fallbackAirports = [
  {
    id: 1,
    name: "Delhi",
    airport: "Indira Gandhi International Airport",
    iataCode: "DEL",
    countryCode: "IN",
  },
  {
    id: 2,
    name: "Mumbai",
    airport: "Chhatrapati Shivaji Maharaj International Airport",
    iataCode: "BOM",
    countryCode: "IN",
  },
  {
    id: 3,
    name: "Bengaluru",
    airport: "Kempegowda International Airport",
    iataCode: "BLR",
    countryCode: "IN",
  },
  {
    id: 4,
    name: "Hyderabad",
    airport: "Rajiv Gandhi International Airport",
    iataCode: "HYD",
    countryCode: "IN",
  },
  {
    id: 5,
    name: "Kolkata",
    airport: "Netaji Subhas Chandra Bose International Airport",
    iataCode: "CCU",
    countryCode: "IN",
  },
  {
    id: "JED",
    name: "Jeddah",
    airport: "King Abdulaziz International Airport",
    iataCode: "JED",
    countryCode: "SA",
  },
  {
    id: "MED",
    name: "Medina",
    airport: "Prince Mohammad Bin Abdulaziz International Airport",
    iataCode: "MED",
    countryCode: "SA",
  },
  {
    id: "IST",
    name: "Istanbul",
    airport: "Istanbul Airport",
    iataCode: "IST",
    countryCode: "TR",
  },
  {
    id: "CMN",
    name: "Casablanca",
    airport: "Mohammed V International Airport",
    iataCode: "CMN",
    countryCode: "MA",
  },
  {
    id: "TIR",
    name: "Tirana",
    airport: "Tirana International Airport",
    iataCode: "TIR",
    countryCode: "AL",
  },
];

export const KNOWN_AIRPORTS = {
  DEL: {
    id: 1,
    name: "Delhi",
    airport: "Indira Gandhi International Airport",
    iataCode: "DEL",
    countryCode: "IN",
  },
  JED: {
    id: "JED",
    name: "Jeddah",
    airport: "King Abdulaziz International Airport",
    iataCode: "JED",
    countryCode: "SA",
  },
  MED: {
    id: "MED",
    name: "Medina",
    airport: "Prince Mohammad Bin Abdulaziz International Airport",
    iataCode: "MED",
    countryCode: "SA",
  },
  IST: {
    id: "IST",
    name: "Istanbul",
    airport: "Istanbul Airport",
    iataCode: "IST",
    countryCode: "TR",
  },
  CMN: {
    id: "CMN",
    name: "Casablanca",
    airport: "Mohammed V International Airport",
    iataCode: "CMN",
    countryCode: "MA",
  },
  TIR: {
    id: "TIR",
    name: "Tirana",
    airport: "Tirana International Airport",
    iataCode: "TIR",
    countryCode: "AL",
  },
  BOM: {
    id: 2,
    name: "Mumbai",
    airport: "Chhatrapati Shivaji Maharaj International Airport",
    iataCode: "BOM",
    countryCode: "IN",
  },
  BLR: {
    id: 3,
    name: "Bengaluru",
    airport: "Kempegowda International Airport",
    iataCode: "BLR",
    countryCode: "IN",
  },
  HYD: {
    id: 4,
    name: "Hyderabad",
    airport: "Rajiv Gandhi International Airport",
    iataCode: "HYD",
    countryCode: "IN",
  },
  CCU: {
    id: 5,
    name: "Kolkata",
    airport: "Netaji Subhas Chandra Bose International Airport",
    iataCode: "CCU",
    countryCode: "IN",
  },
};

export const resolveAirport = (iataCode, airportList, fallbackObj) => {
  if (!iataCode) return fallbackObj || null;
  const code = iataCode.toUpperCase();
  if (fallbackObj && fallbackObj.iataCode?.toUpperCase() === code) {
    return fallbackObj;
  }
  const match = airportList?.find(
    (a) => a.iataCode?.toUpperCase() === code,
  );
  if (match) return match;
  if (KNOWN_AIRPORTS[code]) {
    return KNOWN_AIRPORTS[code];
  }
  return {
    id: code,
    name: code,
    airport: `${code} Airport`,
    iataCode: code,
    countryCode: "",
  };
};

export const _farePrice = [
  {
    date: "2026-11-08",
    price: 4299,
  },
  {
    date: "2026-11-09",
    price: 3899,
  },
  {
    date: "2026-11-10",
    price: 5199,
  },
];

export const _travellClass = [
  "All",
  "Economy",
  "Premium Economy",
  "Business",
  "Premium Business",
  "First Class",
];

export const _services = [
  {
    name: "FLIGHT",
    icon: Plane,
    active: true,
  },
  {
    name: "HOTEL",
    icon: Building2,
    active: false,
  },
];
