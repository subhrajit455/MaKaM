export const formatDate = (date) => {
  if (typeof date === "string") {
    const isoDate = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (isoDate) return isoDate;
  }

  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

export const getBaseDate = (departDateStr) => {
  const todayStr = formatDate(new Date());
  if (!departDateStr) return todayStr;
  const depart = formatDate(departDateStr);
  return depart && depart < todayStr ? depart : todayStr;
};

export const buildFallbackDates = (baseDate, count = 120) => {
  const start = new Date(`${baseDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return [];
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date: formatDate(date), fare: null };
  });
};

export const addDays = (date, days) => {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  return formatDate(value);
};

export const getTripLength = (departureDate, returnDate) => {
  if (!departureDate || !returnDate) return 0;
  const departure = new Date(`${departureDate}T00:00:00`);
  const returning = new Date(`${returnDate}T00:00:00`);
  return Math.max(0, Math.round((returning - departure) / 86400000));
};

export const getFlightNetFare = (f) => {
  if (!f) return 0;
  if (f.netFare !== undefined && f.netFare !== null && !isNaN(Number(f.netFare))) {
    return Number(f.netFare);
  }
  const fare0 = f.fares?.[0]?.totalAmount;
  if (fare0 !== undefined && fare0 !== null && !isNaN(Number(fare0))) {
    return Number(fare0);
  }
  const total = f.totalAmount;
  if (total !== undefined && total !== null && !isNaN(Number(total))) {
    return Number(total);
  }
  return 0;
};

export const getFlightUnitFare = (f) => {
  if (!f) return 0;
  const net = getFlightNetFare(f);
  if (!net) return 0;
  return Math.round(net);
};
