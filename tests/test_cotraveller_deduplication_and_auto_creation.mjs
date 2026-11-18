import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizePassport,
  normalizePan,
  normalizePhone,
  normalizeEmail,
  normalizeDate,
  normalizeName,
  isSameTraveller,
  findMatchingTraveller,
} from "../src/utils/travellerDeduplication.js";

test("1. Normalization functions work accurately", () => {
  // Passport
  assert.equal(normalizePassport(" z 123-4567 "), "Z1234567");
  assert.equal(normalizePassport(null), "");

  // PAN
  assert.equal(normalizePan(" exvpr 5555 m "), "EXVPR5555M");
  assert.equal(normalizePan(""), "");

  // Phone
  assert.equal(normalizePhone("+91 98765-43210"), "9876543210");
  assert.equal(normalizePhone("09876543210"), "9876543210");
  assert.equal(normalizePhone("9876543210"), "9876543210");

  // Email
  assert.equal(normalizeEmail("  Ali.Khan@Example.COM "), "ali.khan@example.com");

  // Date
  assert.equal(normalizeDate("1992-06-15T00:00:00.000Z"), "1992-06-15");
  assert.equal(normalizeDate("1992-06-15"), "1992-06-15");
  assert.equal(normalizeDate(new Date("1992-06-15T12:30:00Z")), "1992-06-15");

  // Name
  assert.equal(normalizeName("  Mohammed   Iqbal  "), "mohammed iqbal");
});

test("2. Co-traveller matching by Passport number", () => {
  const candidate = {
    firstName: "Ahmed",
    lastName: "Khan",
    passportNo: "A9876543",
  };

  const existingSamePassport = {
    _id: "64f0b5c2d2b6e3b4c5d6e7f1",
    firstName: "Ahmed",
    lastName: "Khan",
    passportNo: "a 9876-543",
  };

  const existingDifferentPassport = {
    _id: "64f0b5c2d2b6e3b4c5d6e7f2",
    firstName: "Ahmed",
    lastName: "Khan",
    passportNo: "B1234567",
  };

  assert.equal(isSameTraveller(candidate, existingSamePassport), true, "Matching passport numbers must identify the same traveller");
  assert.equal(isSameTraveller(candidate, existingDifferentPassport), false, "Different passport numbers must NOT match even if names match");
});

test("3. Co-traveller matching by PAN card number", () => {
  const candidate = {
    firstName: "Zaid",
    lastName: "Shaikh",
    pan: "ABCDE1234F",
  };

  const existing = {
    _id: "64f0b5c2d2b6e3b4c5d6e7f3",
    firstName: "Zaid",
    lastName: "Shaikh",
    pan: "abcde1234f",
  };

  assert.equal(isSameTraveller(candidate, existing), true, "Matching PAN card numbers must identify the same traveller");
});

test("4. Co-traveller matching by Full Name + Date of Birth", () => {
  const candidate = {
    firstName: "Fatima",
    lastName: "Noor",
    dob: "1995-04-12",
  };

  const existingMatch = {
    _id: "64f0b5c2d2b6e3b4c5d6e7f4",
    firstName: "fatima",
    lastName: "noor",
    dateOfBirth: "1995-04-12T00:00:00.000Z",
  };

  const existingDifferentDob = {
    _id: "64f0b5c2d2b6e3b4c5d6e7f5",
    firstName: "Fatima",
    lastName: "Noor",
    dateOfBirth: "1988-10-20T00:00:00.000Z",
  };

  assert.equal(isSameTraveller(candidate, existingMatch), true, "Name + matching DOB must match");
  assert.equal(isSameTraveller(candidate, existingDifferentDob), false, "Name + differing DOB must NOT match");
});

test("5. Co-traveller matching by Full Name + Phone or Email", () => {
  const candidate1 = {
    firstName: "Tariq",
    lastName: "Jameel",
    phone: "+91 9123456789",
  };

  const existing1 = {
    _id: "64f0b5c2d2b6e3b4c5d6e7f6",
    firstName: "Tariq",
    lastName: "Jameel",
    phone: "9123456789",
  };

  assert.equal(isSameTraveller(candidate1, existing1), true, "Name + matching phone must match");

  const candidate2 = {
    firstName: "Ayesha",
    lastName: "Siddiqui",
    email: "Ayesha.S@example.com",
  };

  const existing2 = {
    _id: "64f0b5c2d2b6e3b4c5d6e7f7",
    firstName: "ayesha",
    lastName: "siddiqui",
    email: "ayesha.s@example.com",
  };

  assert.equal(isSameTraveller(candidate2, existing2), true, "Name + matching email must match");
});

test("6. findMatchingTraveller finds correct traveller or returns null", () => {
  const savedList = [
    { id: "101", firstName: "Bilal", lastName: "Ahmed", passportNo: "P111111" },
    { id: "102", firstName: "Hamza", lastName: "Tariq", dob: "1993-08-14" },
    { id: "103", firstName: "Sara", lastName: "Ali", phone: "9876500000" },
  ];

  const candidateMatch = {
    firstName: "Hamza",
    lastName: "Tariq",
    dob: "1993-08-14",
  };

  const candidateNew = {
    firstName: "Zainab",
    lastName: "Farooq",
    dob: "2000-01-01",
  };

  const matched = findMatchingTraveller(candidateMatch, savedList);
  assert.ok(matched, "Should find Hamza Tariq");
  assert.equal(matched.id, "102");

  const notFound = findMatchingTraveller(candidateNew, savedList);
  assert.equal(notFound, null, "Should return null for Zainab Farooq");
});

test("7. Booking flow simulation: Deduplicates existing co-travellers and auto-creates new ones", async () => {
  // Existing co-traveller list for user
  const savedTravellers = [
    { _id: "64f0b5c2d2b6e3b4c5d6e701", id: "64f0b5c2d2b6e3b4c5d6e701", firstName: "Rashid", lastName: "Minhas", passportNo: "M123456" },
  ];

  // Mock server create function
  let createdCallCount = 0;
  const mockCreateTraveller = async (data) => {
    createdCallCount++;
    return {
      _id: `auto_created_${createdCallCount}`,
      ...data,
    };
  };

  // Simulating booking with 2 passengers:
  // 1. Rashid Minhas (already in co-travellers list) -> should reuse ID and NOT create duplicate
  // 2. Usman Ghani (new person, not in list) -> should auto-create as new co-traveller
  const bookingSlots = [
    {
      firstName: "Rashid",
      lastName: "Minhas",
      passport: "M123456",
      dob: "1991-03-10",
      savedTravellerId: null,
    },
    {
      firstName: "Usman",
      lastName: "Ghani",
      passport: "U998877",
      dob: "1994-11-22",
      savedTravellerId: null,
    },
  ];

  const processedSlots = [];
  const currentSaved = [...savedTravellers];

  for (const slot of bookingSlots) {
    const matched = findMatchingTraveller(slot, currentSaved);
    if (matched) {
      // Re-use existing co-traveller ID
      processedSlots.push({
        ...slot,
        savedTravellerId: matched._id || matched.id,
        isFromSavedTraveller: true,
        saveToProfile: false,
      });
    } else {
      // New person: auto-create in user's co-traveller list
      const created = await mockCreateTraveller({
        firstName: slot.firstName,
        lastName: slot.lastName,
        passportNo: slot.passport,
        dateOfBirth: slot.dob,
      });
      currentSaved.push(created);
      processedSlots.push({
        ...slot,
        savedTravellerId: created._id,
        isFromSavedTraveller: true,
        saveToProfile: false,
      });
    }
  }

  // Verification
  assert.equal(createdCallCount, 1, "Only the new person (Usman) should trigger creation API");
  assert.equal(processedSlots[0].savedTravellerId, "64f0b5c2d2b6e3b4c5d6e701", "Existing co-traveller Rashid must reuse his existing ID");
  assert.equal(processedSlots[0].saveToProfile, false, "Existing co-traveller must not re-save or duplicate");
  assert.equal(processedSlots[1].savedTravellerId, "auto_created_1", "New co-traveller Usman must be assigned the newly created ID");
  assert.equal(currentSaved.length, 2, "Saved travellers list now includes the new co-traveller");
});

test("8. CoTravellersManager deduplication guard: Blocks duplicate creation and prevents collisions", () => {
  const existingList = [
    { _id: "1", firstName: "Imran", lastName: "Khan", phone: "9876512345", passportNo: "K112233" },
    { _id: "2", firstName: "Wasim", lastName: "Akram", phone: "9876567890", passportNo: "A445566" },
  ];

  // Try adding duplicate of Imran Khan
  const duplicateCandidate = {
    firstName: "Imran",
    lastName: "Khan",
    phone: "9876512345",
  };
  const isDuplicate = Boolean(findMatchingTraveller(duplicateCandidate, existingList));
  assert.equal(isDuplicate, true, "Should detect duplicate when adding Imran Khan");

  // Try updating Wasim Akram's own record (same ID)
  const editingId = "2";
  const otherTravellers = existingList.filter((t) => t._id !== editingId);
  const selfUpdateCandidate = {
    firstName: "Wasim",
    lastName: "Akram",
    phone: "9876567890",
  };
  const collision = Boolean(findMatchingTraveller(selfUpdateCandidate, otherTravellers));
  assert.equal(collision, false, "Updating own record should NOT trigger a duplicate error with self");

  // Try updating Wasim Akram with Imran Khan's passport (collision with another profile)
  const collidingUpdate = {
    firstName: "Wasim",
    lastName: "Akram",
    passportNo: "K112233",
  };
  const collidesWithOther = Boolean(findMatchingTraveller(collidingUpdate, otherTravellers));
  assert.equal(collidesWithOther, true, "Colliding with another co-traveller's passport must be blocked");
});
