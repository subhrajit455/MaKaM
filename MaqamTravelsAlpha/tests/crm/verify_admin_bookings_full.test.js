// tests/crm/verify_admin_bookings_full.test.js
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../../app');
const User = require('../../modules/auth/auth.model');
const Booking = require('../../modules/bookings/booking.model');
const PackageBooking = require('../../modules/packages/models/packageBooking.model');
const Package = require('../../modules/packages/models/package.model');
const Payment = require('../../modules/payments/payment.model');

describe('Full Verification of CRM Bookings Desk Endpoints, Pagination, Filters & Actions', () => {
  let server;
  let baseUrl;
  let adminToken;
  let adminUser;
  let agentUser;
  let customerUser;
  let testPackage;
  let testPackageBooking;
  let testMasterBooking;
  let testPayment;

  before(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { family: 4, serverSelectionTimeoutMS: 10000 });
    }

    // 1. Create admin user
    adminUser = await User.create({
      firstName: 'DeskAdmin',
      lastName: 'Tester',
      email: `desk_admin_${Date.now()}@test.com`,
      phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Password123!',
      role: 'admin',
    });

    // 2. Create agent user
    agentUser = await User.create({
      firstName: 'Operations',
      lastName: 'Agent',
      email: `desk_agent_${Date.now()}@test.com`,
      phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Password123!',
      role: 'sales_agent',
    });

    // 3. Create customer user
    customerUser = await User.create({
      firstName: 'Zahra',
      lastName: 'Al-Hassan',
      email: `zahra_${Date.now()}@test.com`,
      phone: `96${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Password123!',
      role: 'customer',
    });

    const { generateTokens } = require('../../middleware/auth');
    adminToken = generateTokens(adminUser._id.toString(), adminUser.role).accessToken;

    // 4. Create package
    testPackage = await Package.create({
      title: '10D Premium Ramadan Umrah',
      slug: `10d-ramadan-${Date.now()}`,
      destination: 'Makkah',
      basePrice: 150000,
      sellPrice: 175000,
      isActive: true,
      durationDays: 10,
      createdBy: adminUser._id,
      offerRefs: [
        { offer: new mongoose.Types.ObjectId(), unitsPerBooking: 1, isIncluded: true },
        { offer: new mongoose.Types.ObjectId(), unitsPerBooking: 1, isIncluded: true },
      ],
    });

    // 5. Create PackageBooking & MasterBooking
    testPackageBooking = await PackageBooking.create({
      userId: customerUser._id,
      packageId: testPackage._id,
      totalAmount: 175000,
      quantity: 1,
      status: 'confirmed',
      travelDates: {
        startDate: new Date('2026-12-01'),
        endDate: new Date('2026-12-10'),
      },
    });

    testPayment = await Payment.create({
      userId: customerUser._id,
      bookingId: testPackageBooking._id,
      bookingModel: 'PackageBooking',
      bookingType: 'package',
      amount: 175000,
      currency: 'INR',
      paymentMethod: 'bank_transfer',
      status: 'paid',
    });

    testMasterBooking = await Booking.create({
      userId: customerUser._id,
      bookingType: 'package',
      itemId: testPackageBooking._id,
      details: {
        destination: 'Makkah',
        departureDate: new Date('2026-12-01'),
        returnDate: new Date('2026-12-10'),
        totalPrice: 175000,
        currency: 'INR',
        passengers: 2,
      },
      status: 'confirmed',
      paymentId: testPayment._id,
      assignedTo: agentUser._id,
    });

    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (testMasterBooking) await Booking.findByIdAndDelete(testMasterBooking._id);
    if (testPayment) await Payment.findByIdAndDelete(testPayment._id);
    if (testPackageBooking) await PackageBooking.findByIdAndDelete(testPackageBooking._id);
    if (testPackage) await Package.findByIdAndDelete(testPackage._id);
    if (customerUser) await User.findByIdAndDelete(customerUser._id);
    if (agentUser) await User.findByIdAndDelete(agentUser._id);
    if (adminUser) await User.findByIdAndDelete(adminUser._id);

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('1. Pagination: GET /api/v1/crm/bookings returns meta pagination (page, limit, total, totalPages)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.meta.page, 1);
    assert.equal(json.meta.limit, 5);
    assert.ok(json.meta.total > 0);
    assert.ok(json.meta.totalPages >= 1);
    assert.equal(json.data.length, Math.min(5, json.meta.total));
  });

  it('2. Filter by bookingType: package, flight, hotel, offer', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?bookingType=package&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.length > 0);
    for (const b of json.data) {
      assert.equal(b.bookingType, 'package');
    }
  });

  it('3. Filter by status: confirmed', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?status=confirmed&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.length > 0);
    for (const b of json.data) {
      assert.equal(b.status, 'confirmed');
    }
  });

  it('4. Filter by paymentStatus: paid', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?paymentStatus=paid&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.length > 0);
    for (const b of json.data) {
      assert.equal(b.paymentStatus, 'paid');
    }
  });

  it('5. Filter by assignedTo: agent id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?assignedTo=${agentUser._id}&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.length > 0);
    assert.equal(String(json.data[0].assignedTo._id), String(agentUser._id));
  });

  it('6. Filter by assignedTo: unassigned', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?assignedTo=unassigned&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.meta.total > 0);
    for (const b of json.data) {
      assert.equal(b.assignedTo, null);
    }
  });

  it('7. Search by customer name and destination', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?search=Zahra&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.length > 0);
    assert.ok(json.data.some((b) => b.customer.name.includes('Zahra')));
  });

  it('8. Search by exact booking ObjectId or hex reference', async () => {
    const hex = String(testMasterBooking._id).slice(-6);
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?search=${hex}&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.length >= 1);
    assert.equal(String(json.data[0]._id), String(testMasterBooking._id));
  });

  it('9. Get 360 dossier using MasterBooking _id directly with type=all or type=package', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings/all/${testMasterBooking._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.bookingType, 'package');
    assert.equal(json.data.financials.totalAmount, 175000);
  });

  it('10. Assign agent using MasterBooking _id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings/package/${testMasterBooking._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ assignedTo: adminUser._id }),
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  it('11. Add timeline remark using MasterBooking _id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings/package/${testMasterBooking._id}/remarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ remark: 'VIP customer requested wheelchair assistance' }),
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  it('12. Search with regex special characters (e.g. "(") does not crash and returns 200', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?search=(`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
  });

  it('13. Search for nonexistent package returns total 0 and empty list', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings?bookingType=package&search=NONEXISTENT_XYZ_9999`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.meta.total, 0);
    assert.equal(json.data.length, 0);
  });

  it('14. Package module route PATCH /api/v1/crm/packages/bookings/:id/remark with MasterBooking _id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/packages/bookings/${testMasterBooking._id}/remark`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ remark: 'Package route remark test' }),
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  it('15. Master desk route PATCH /api/v1/crm/bookings/all/:id/assign with MasterBooking _id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings/all/${testMasterBooking._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ assignedTo: agentUser._id }),
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  it('16. Master desk route POST /api/v1/crm/bookings/all/:id/remarks with MasterBooking _id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/crm/bookings/all/${testMasterBooking._id}/remarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ remark: 'Added remark with bookingType=all' }),
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });
});
