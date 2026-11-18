import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import api from "../src/components/stores/api.js";
import { bookingService } from "../src/services/bookingService.js";

test("1. bookingService.getBookingsPage passes status, page, limit and parses meta", async () => {
  const origGet = api.get;
  const calls = [];
  try {
    api.get = async (url, config) => {
      calls.push({ url, params: config?.params });
      return {
        data: {
          success: true,
          message: "Bookings retrieved",
          data: [
            {
              _id: "6afc0d12dc164c132e92d215",
              bookingType: "flight",
              itemId: "6afc0d0edc164c132e92d20d",
              details: {
                destination: "CCU-JAI",
                departureDate: "2026-11-25T06:15:00.000Z",
                returnDate: "2026-11-28T19:40:00.000Z",
                totalPrice: 12957.08,
                currency: "INR",
                passengers: 1,
              },
              status: "confirmed",
            },
          ],
          meta: {
            total: 15,
            page: 2,
            limit: 10,
            totalPages: 2,
          },
        },
      };
    };

    const pageRes = await bookingService.getBookingsPage({
      status: "confirmed",
      page: 2,
      limit: 10,
    });

    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.endsWith("/api/v1/bookings"));
    assert.deepEqual(calls[0].params, { status: "confirmed", page: 2, limit: 10 });
    assert.equal(pageRes.bookings.length, 1);
    assert.equal(pageRes.bookings[0].bookingType, "flight");
    assert.deepEqual(pageRes.meta, { total: 15, page: 2, limit: 10, totalPages: 2 });

    // 'all' status should omit status param
    await bookingService.getBookingsPage({ status: "all", page: 1, limit: 10 });
    assert.deepEqual(calls[1].params, { page: 1, limit: 10 });
  } finally {
    api.get = origGet;
  }
});

test("2. bookingService.getBookingsPage handles empty response (total: 0, totalPages: 0)", async () => {
  const origGet = api.get;
  try {
    api.get = async () => ({
      data: {
        success: true,
        message: "Bookings retrieved",
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      },
    });

    const res = await bookingService.getBookingsPage({ page: 1, limit: 10 });
    assert.deepEqual(res.bookings, []);
    assert.deepEqual(res.meta, { total: 0, page: 1, limit: 10, totalPages: 0 });
  } finally {
    api.get = origGet;
  }
});

test("3. Bookings.jsx resolves /profile?tab=my-bookings to All Bookings ('all') tab and wires AllBookingsTab", () => {
  const bookingsSrc = fs.readFileSync(
    path.resolve(import.meta.dirname, "../src/components/Bookings.jsx"),
    "utf-8"
  );
  const allTabSrc = fs.readFileSync(
    path.resolve(import.meta.dirname, "../src/components/bookings/AllBookingsTab.jsx"),
    "utf-8"
  );

  assert.ok(
    bookingsSrc.includes("resolveBookingTab"),
    "Bookings.jsx must use resolveBookingTab helper"
  );
  assert.ok(
    bookingsSrc.includes('return "all"') && bookingsSrc.includes("AllBookingsTab"),
    "Bookings.jsx must default unknown/my-bookings tab param to 'all' and render AllBookingsTab"
  );
  assert.ok(
    bookingsSrc.includes('id="tab-all-bookings"'),
    "Bookings.jsx must render All Bookings tab button"
  );
  assert.ok(
    allTabSrc.includes("bookingService.getBookingsPage"),
    "AllBookingsTab.jsx must fetch paginated bookings via bookingService.getBookingsPage"
  );
  assert.ok(
    allTabSrc.includes("details.departureDate") &&
      allTabSrc.includes("details.totalPrice") &&
      allTabSrc.includes("details.hotelName") &&
      allTabSrc.includes("details.airline"),
    "AllBookingsTab.jsx must render MasterBooking.details fields"
  );
});
