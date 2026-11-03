require('dotenv').config();
const http = require('http');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const app = require('../app');
const { generateTokens } = require('../middleware/auth');
const User = require('../modules/auth/auth.model');

async function verifyCustomerInvoiceFlow() {
  await mongoose.connect(process.env.MONGO_URI);
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // Find admin user for auth
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    const adminToken = adminUser ? generateTokens(adminUser).accessToken : null;
    assert.ok(adminToken, 'Admin token should be available');
    console.log('✔ Admin token generated successfully');

    const custId = '6ae8ffe805e68ae6ef5b8e1f';
    const masterBookingId = '6ae8ffe99391bcfc12298482';
    const packageBookingId = '6ae8ffe905e68ae6ef5b8e4e';

    // 1. Test Customer CRM Profile
    console.log('📌 [Test 1] GET /api/v1/crm/customers/' + custId);
    const custRes = await fetch(`${baseUrl}/api/v1/crm/customers/${custId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(custRes.status, 200, 'Customer endpoint should return 200');
    const custData = await custRes.json();
    const rb = custData?.data?.recentBookings;
    assert.ok(Array.isArray(rb) && rb.length > 0, 'Customer should have recentBookings');
    console.log(`  ✔ recentBookings returned ${rb.length} items. Booking 0: _id=${rb[0]._id}, itemId=${rb[0].itemId}, type=${rb[0].bookingType}`);

    // 2. Test Canonical Invoice HTML with Master Booking ID
    console.log('📌 [Test 2] GET /api/v1/invoices/package/' + masterBookingId + '/html?token=...');
    const invHtmlRes = await fetch(`${baseUrl}/api/v1/invoices/package/${masterBookingId}/html?token=${adminToken}`);
    assert.equal(invHtmlRes.status, 200, 'Invoice HTML with Master Booking ID should return 200');
    const htmlText = await invHtmlRes.text();
    assert.ok(htmlText.includes('Luxury 8-Day Umrah Spiritual Journey'), 'HTML should contain package title');
    console.log('  ✔ Canonical Invoice HTML with Master Booking ID rendered successfully.');

    // 3. Test Canonical Invoice Download with Master Booking ID
    console.log('📌 [Test 3] GET /api/v1/invoices/package/' + masterBookingId + '/download?token=...');
    const invDlRes = await fetch(`${baseUrl}/api/v1/invoices/package/${masterBookingId}/download?token=${adminToken}`);
    assert.equal(invDlRes.status, 200, 'Invoice Download with Master Booking ID should return 200');
    const dispHeader = invDlRes.headers.get('content-disposition');
    assert.ok(dispHeader && dispHeader.includes('attachment'), 'Content-Disposition attachment header should exist');
    console.log('  ✔ Canonical Invoice Download with Master Booking ID returned 200 with disposition: ' + dispHeader);

    // 4. Test Canonical Invoice Download with Package Booking ID
    console.log('📌 [Test 4] GET /api/v1/invoices/package/' + packageBookingId + '/download?token=...');
    const pkgDlRes = await fetch(`${baseUrl}/api/v1/invoices/package/${packageBookingId}/download?token=${adminToken}`);
    assert.equal(pkgDlRes.status, 200, 'Invoice Download with Package Booking ID should return 200');
    console.log('  ✔ Canonical Invoice Download with Package Booking ID returned 200.');

    // 5. Test CRM Invoices Route with Master Booking ID
    console.log('📌 [Test 5] GET /api/v1/crm/invoices/package/' + masterBookingId + '/download?token=...');
    const crmDlRes = await fetch(`${baseUrl}/api/v1/crm/invoices/package/${masterBookingId}/download?token=${adminToken}`);
    assert.equal(crmDlRes.status, 200, 'CRM Invoice Download with Master Booking ID should return 200');
    console.log('  ✔ CRM Invoice Download returned 200.');

    // 6. Test Unauthenticated Canonical Invoice HTML with Master Booking ID
    console.log('📌 [Test 6] GET /api/v1/invoices/package/' + masterBookingId + '/html (NO AUTH)');
    const unauthHtmlRes = await fetch(`${baseUrl}/api/v1/invoices/package/${masterBookingId}/html`);
    assert.equal(unauthHtmlRes.status, 200, 'Unauthenticated invoice HTML should return 200');
    console.log('  ✔ Unauthenticated Canonical Invoice HTML returned 200.');

    // 7. Test Unauthenticated Canonical Invoice Download with Master Booking ID
    console.log('📌 [Test 7] GET /api/v1/invoices/package/' + masterBookingId + '/download (NO AUTH)');
    const unauthDlRes = await fetch(`${baseUrl}/api/v1/invoices/package/${masterBookingId}/download`);
    assert.equal(unauthDlRes.status, 200, 'Unauthenticated invoice download should return 200');
    console.log('  ✔ Unauthenticated Canonical Invoice Download returned 200.');

    // 8. Test Unauthenticated Canonical Invoice Download with Package Booking ID
    console.log('📌 [Test 8] GET /api/v1/invoices/package/' + packageBookingId + '/download (NO AUTH)');
    const unauthPkgDlRes = await fetch(`${baseUrl}/api/v1/invoices/package/${packageBookingId}/download`);
    assert.equal(unauthPkgDlRes.status, 200, 'Unauthenticated package invoice download should return 200');
    console.log('  ✔ Unauthenticated Package Invoice Download returned 200.');

    // 9. Test Package User Convenience HTML Route (NO AUTH)
    console.log('📌 [Test 9] GET /api/v1/packages/bookings/' + packageBookingId + '/invoice/html (NO AUTH)');
    const pkgUserHtmlRes = await fetch(`${baseUrl}/api/v1/packages/bookings/${packageBookingId}/invoice/html`);
    assert.equal(pkgUserHtmlRes.status, 200, 'Package user invoice html endpoint should return 200');
    console.log('  ✔ Package User Convenience HTML returned 200.');

    // 10. Test Hotel Vertical Unauthenticated Download
    const hotelBooking = await mongoose.connection.collection('hotelbookings').findOne();
    const hotelId = hotelBooking ? hotelBooking._id.toString() : '6adb4e5df869a8d473aff3fd';
    console.log('📌 [Test 10] GET /api/v1/invoices/hotel/' + hotelId + '/download (NO AUTH)');
    const hotelDlRes = await fetch(`${baseUrl}/api/v1/invoices/hotel/${hotelId}/download`);
    assert.equal(hotelDlRes.status, 200, 'Hotel invoice download should return 200');
    console.log('  ✔ Unauthenticated Hotel Invoice Download returned 200.');

    // 11. Test Offer Convenience Route Unauthenticated Download
    const offerBooking = await mongoose.connection.collection('offerbookings').findOne();
    const offerId = offerBooking ? offerBooking._id.toString() : '6adc9250ef5bfd74114fc013';
    console.log('📌 [Test 11] GET /api/v1/offers/bookings/' + offerId + '/invoice/download (NO AUTH)');
    const offerConvenienceRes = await fetch(`${baseUrl}/api/v1/offers/bookings/${offerId}/invoice/download`);
    assert.equal(offerConvenienceRes.status, 200, 'Offer convenience invoice download should return 200 without 401');
    console.log('  ✔ Offer Convenience Invoice Download returned 200.');

    // 12. Test Offer Canonical Route Unauthenticated Download
    console.log('📌 [Test 12] GET /api/v1/invoices/offer/' + offerId + '/download (NO AUTH)');
    const offerCanonicalRes = await fetch(`${baseUrl}/api/v1/invoices/offer/${offerId}/download`);
    assert.equal(offerCanonicalRes.status, 200, 'Offer canonical invoice download should return 200');
    console.log('  ✔ Offer Canonical Invoice Download returned 200.');

    // 13. Test Invoice View with Mismatched Customer Token (must not 403)
    const otherCustomer = await User.findOne({ role: 'customer', _id: { $ne: custId } });
    if (otherCustomer) {
      const otherToken = generateTokens(otherCustomer).accessToken;
      console.log('📌 [Test 13] GET /api/v1/invoices/package/' + masterBookingId + '/html (with mismatched customer token)');
      const mismatchedRes = await fetch(`${baseUrl}/api/v1/invoices/package/${masterBookingId}/html`, {
        headers: { Authorization: `Bearer ${otherToken}` },
      });
      assert.equal(mismatchedRes.status, 200, 'Viewing invoice should not reject with 403 when customer token is mismatched');
      console.log('  ✔ Mismatched customer token permitted to view invoice without 403.');
    } else {
      console.log('📌 [Test 13] Skipped (no other customer found in DB)');
    }

    // 14. Test ?download=true Query Parameter on HTML route triggers Content-Disposition attachment
    console.log('📌 [Test 14] GET /api/v1/invoices/package/' + masterBookingId + '/html?download=true');
    const dlParamRes = await fetch(`${baseUrl}/api/v1/invoices/package/${masterBookingId}/html?download=true`);
    assert.equal(dlParamRes.status, 200, 'HTML with ?download=true should return 200');
    const dlHeader = dlParamRes.headers.get('content-disposition');
    assert.ok(dlHeader && dlHeader.includes('attachment'), '?download=true should attach Content-Disposition');
    console.log('  ✔ ?download=true correctly sets Content-Disposition: ' + dlHeader);

    console.log('\n🎉 ALL 14 CUSTOMER INVOICE ENDPOINT VERIFICATIONS PASSED!');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

verifyCustomerInvoiceFlow().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
