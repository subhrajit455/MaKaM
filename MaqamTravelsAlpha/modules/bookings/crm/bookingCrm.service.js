const mongoose = require('mongoose');
const Booking = require('../booking.model');
const { resolveBooking, getModelName } = require('../../payments/bookingResolver');
const Payment = require('../../payments/payment.model');
const User = require('../../auth/auth.model');
const PackageBooking = require('../../packages/models/packageBooking.model');
const Package = require('../../packages/models/package.model');
const OfferBooking = require('../../packages/offers/offerBooking.model');
const FlightBooking = require('../../flights/flight.model');
const HotelBooking = require('../../hotels/hotel.model');
const logger = require('../../../utils/logger');
const { AppError } = require('../../../middleware/errorHandler');

/**
 * Normalizes customer object from different user schemas
 */
const extractCustomer = (userDoc) => {
  if (!userDoc) {
    return {
      _id: null,
      name: 'Guest Customer',
      email: '',
      phone: '',
    };
  }

  const name =
    userDoc.name ||
    `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() ||
    'Customer';

  return {
    _id: userDoc._id,
    name,
    email: userDoc.email || '',
    phone: userDoc.phone || '',
  };
};

/**
 * Normalizes a MasterBooking document into standard CRM list response format
 */
const normalizeMasterBooking = (doc) => {
  const isDoc = typeof doc.toObject === 'function';
  const item = isDoc ? doc.toObject() : doc;
  const bookingType = item.bookingType || 'package';
  const origin =
    bookingType === 'package' || bookingType === 'offer'
      ? 'in_house'
      : 'third_party';

  const user = item.userId;
  const customer = extractCustomer(user);

  let assignedTo = null;
  if (item.assignedTo) {
    assignedTo = {
      _id: item.assignedTo._id,
      name:
        item.assignedTo.name ||
        `${item.assignedTo.firstName || ''} ${item.assignedTo.lastName || ''}`.trim() ||
        'Agent',
      email: item.assignedTo.email || '',
    };
  }

  return {
    _id: item._id,
    itemId: item.itemId,
    bookingReference: `BK-${bookingType.toUpperCase()}-${String(item._id).slice(-6).toUpperCase()}`,
    bookingType,
    origin,
    customer,
    destination: item.details?.destination || '',
    travelDates: {
      startDate: item.details?.departureDate || null,
      endDate: item.details?.returnDate || null,
    },
    paxCount: item.details?.passengers || 1,
    totalAmount: item.details?.totalPrice || 0,
    currency: item.details?.currency || 'INR',
    status: item.status || 'pending',
    paymentStatus: item.paymentId?.status || (item.status === 'confirmed' ? 'paid' : 'pending'),
    assignedTo,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

/**
 * Normalizes domain model records if queried directly
 */
const normalizeDomainBooking = (item, bookingType) => {
  const origin =
    bookingType === 'package' || bookingType === 'offer'
      ? 'in_house'
      : 'third_party';

  const user = item.userId || item.user || item.submittedBy;
  const customer = extractCustomer(user);

  let destination = '';
  let departureDate = null;
  let returnDate = null;
  let paxCount = 1;
  let totalAmount = 0;

  if (bookingType === 'package') {
    destination = item.packageId?.destination || item.packageSnapshot?.destination || '';
    departureDate = item.travelDates?.startDate || null;
    returnDate = item.travelDates?.endDate || null;
    paxCount = Array.isArray(item.travellers) ? item.travellers.length : (item.quantity || 1);
    totalAmount = item.totalAmount || 0;
  } else if (bookingType === 'offer') {
    destination = item.offerSnapshot?.destination || '';
    paxCount = Array.isArray(item.travellers) ? item.travellers.length : (item.quantity || 1);
    totalAmount = item.totalAmount || 0;
  } else if (bookingType === 'flight') {
    const itin = item.eTicketData || {};
    const segs = itin.Segments?.[0] || [];
    destination = item.destination || (segs[segs.length - 1]?.Destination?.AirportCode) || '';
    departureDate = segs[0]?.Origin?.DepTime || item.createdAt;
    paxCount = Array.isArray(item.passengers) ? item.passengers.length : 1;
    totalAmount = item.totalAmount || 0;
  } else if (bookingType === 'hotel') {
    destination = item.destination || item.hotelName || '';
    departureDate = item.checkIn || null;
    returnDate = item.checkOut || null;
    paxCount = Array.isArray(item.guests) ? item.guests.length : 1;
    totalAmount = item.totalPrice || 0;
  }

  let assignedTo = null;
  if (item.assignedTo) {
    assignedTo = {
      _id: item.assignedTo._id || item.assignedTo,
      name: item.assignedTo.name || 'Agent',
      email: item.assignedTo.email || '',
    };
  }

  return {
    _id: item._id,
    itemId: item._id,
    bookingReference: `BK-${bookingType.toUpperCase()}-${String(item._id).slice(-6).toUpperCase()}`,
    bookingType,
    origin,
    customer,
    destination,
    travelDates: {
      startDate: departureDate,
      endDate: returnDate,
    },
    paxCount,
    totalAmount,
    currency: item.currency || 'INR',
    status: item.status || 'pending',
    paymentStatus: item.status === 'confirmed' ? 'paid' : 'pending',
    assignedTo,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

/**
 * 1. Master List of all bookings across types
 */
const listBookings = async ({
  bookingType,
  status,
  paymentStatus,
  search,
  startDate,
  endDate,
  assignedTo,
  page = 1,
  limit = 20,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Build MasterBooking query
  const query = {};

  if (bookingType && bookingType !== 'all') {
    query.bookingType = bookingType.toLowerCase();
  }

  if (status && status !== 'all') {
    query.status = status.toLowerCase();
  }

  if (assignedTo && assignedTo !== 'all') {
    if (assignedTo === 'unassigned') {
      query.$or = [{ assignedTo: null }, { assignedTo: { $exists: false } }];
    } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = assignedTo;
    }
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    const ps = paymentStatus.toLowerCase();
    if (ps === 'paid') {
      const paidPayments = await Payment.find({ status: { $in: ['paid', 'captured'] } }).select('_id');
      const paidIds = paidPayments.map((p) => p._id);
      const paymentCond = { paymentId: { $in: paidIds } };
      const statusCond = { status: 'confirmed', paymentId: null };
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: [paymentCond, statusCond] }];
        delete query.$or;
      } else {
        query.$or = [paymentCond, statusCond];
      }
    } else if (ps === 'unpaid' || ps === 'pending') {
      const pendingPayments = await Payment.find({ status: { $in: ['pending', 'created', 'failed'] } }).select('_id');
      const pendingIds = pendingPayments.map((p) => p._id);
      const paymentCond = { paymentId: { $in: pendingIds } };
      const statusCond = { status: { $in: ['pending', 'failed'] }, paymentId: null };
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: [paymentCond, statusCond] }];
        delete query.$or;
      } else {
        query.$or = [paymentCond, statusCond];
      }
    } else if (ps === 'partial') {
      const partialPayments = await Payment.find({ status: { $in: ['partially_refunded', 'authorized'] } }).select('_id');
      const partialIds = partialPayments.map((p) => p._id);
      query.paymentId = { $in: partialIds };
    }
  }

  if (search) {
    const trimmed = search.trim();
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escaped, 'i');
    const matchedUsers = await User.find({
      $or: [
        { name: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ],
    }).select('_id');

    const userIds = matchedUsers.map((u) => u._id);
    const searchOrConditions = [
      { userId: { $in: userIds } },
      { 'details.destination': searchRegex },
      { 'details.hotelName': searchRegex },
      { 'details.airline': searchRegex },
      { 'details.flightNumber': searchRegex },
      { 'details.packageName': searchRegex },
    ];

    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      searchOrConditions.push({ _id: new mongoose.Types.ObjectId(trimmed) });
      searchOrConditions.push({ itemId: new mongoose.Types.ObjectId(trimmed) });
    }

    const hexMatch = trimmed.replace(/^BK-[A-Z]+-/i, '').trim();
    if (/^[0-9a-fA-F]{4,24}$/.test(hexMatch)) {
      searchOrConditions.push({
        $expr: {
          $regexMatch: {
            input: { $toString: '$_id' },
            regex: hexMatch,
            options: 'i',
          },
        },
      });
    }

    if (query.$or) {
      if (query.$and) {
        query.$and.push({ $or: searchOrConditions });
      } else {
        query.$and = [{ $or: query.$or }, { $or: searchOrConditions }];
        delete query.$or;
      }
    } else if (query.$and) {
      query.$and.push({ $or: searchOrConditions });
    } else {
      query.$or = searchOrConditions;
    }
  }

  const [masterDocs, total] = await Promise.all([
    Booking.find(query)
      .populate('userId', 'name firstName lastName email phone')
      .populate('assignedTo', 'name firstName lastName email')
      .populate('paymentId', 'status amount paymentMethod')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Booking.countDocuments(query),
  ]);

  // If MasterBooking has records, return normalized master records
  const masterDocCount = await Booking.estimatedDocumentCount();
  if (masterDocCount > 0 || total > 0 || bookingType === 'all') {
    const bookings = masterDocs.map(normalizeMasterBooking);
    return {
      bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  // Fallback: If querying a specific domain model directly (e.g. PackageBooking or FlightBooking)
  if (bookingType && bookingType !== 'all') {
    let domainDocs = [];
    let domainTotal = 0;
    const domainQuery = {};

    if (status) domainQuery.status = status.toLowerCase();
    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'unassigned') {
        domainQuery.$or = [{ assignedTo: null }, { assignedTo: { $exists: false } }];
      } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        domainQuery.assignedTo = assignedTo;
      }
    }
    if (startDate || endDate) {
      domainQuery.createdAt = {};
      if (startDate) domainQuery.createdAt.$gte = new Date(startDate);
      if (endDate) domainQuery.createdAt.$lte = new Date(endDate);
    }

    if (bookingType === 'package') {
      [domainDocs, domainTotal] = await Promise.all([
        PackageBooking.find(domainQuery)
          .populate('userId', 'name firstName lastName email phone')
          .populate('assignedTo', 'name firstName lastName email')
          .populate('packageId', 'title destination')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        PackageBooking.countDocuments(domainQuery),
      ]);
    } else if (bookingType === 'flight') {
      [domainDocs, domainTotal] = await Promise.all([
        FlightBooking.find(domainQuery)
          .populate('user', 'name firstName lastName email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        FlightBooking.countDocuments(domainQuery),
      ]);
    } else if (bookingType === 'hotel') {
      [domainDocs, domainTotal] = await Promise.all([
        HotelBooking.find(domainQuery)
          .populate('userId', 'name firstName lastName email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        HotelBooking.countDocuments(domainQuery),
      ]);
    } else if (bookingType === 'offer') {
      [domainDocs, domainTotal] = await Promise.all([
        OfferBooking.find(domainQuery)
          .populate('userId', 'name firstName lastName email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        OfferBooking.countDocuments(domainQuery),
      ]);
    }

    const bookings = domainDocs.map((doc) => normalizeDomainBooking(doc, bookingType));
    return {
      bookings,
      pagination: {
        total: domainTotal,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(domainTotal / limitNum) || 1,
      },
    };
  }

  return {
    bookings: [],
    pagination: {
      total: 0,
      page: pageNum,
      limit: limitNum,
      totalPages: 1,
    },
  };
};

/**
 * 2. Operations metrics & queue summary badge counters
 */
const getBookingsSummary = async () => {
  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    packageCount,
    offerCount,
    flightCount,
    hotelCount,
    revenueAgg,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: { $in: ['pending', 'initiated'] } }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Booking.countDocuments({ bookingType: 'package' }),
    Booking.countDocuments({ bookingType: 'offer' }),
    Booking.countDocuments({ bookingType: 'flight' }),
    Booking.countDocuments({ bookingType: 'hotel' }),
    Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$details.totalPrice' } } },
    ]),
  ]);

  const totalGrossRevenue = revenueAgg[0]?.totalRevenue || 0;

  return {
    totalBookings,
    pendingActions: {
      awaitingOperations: pendingBookings,
      cancellationsCount: cancelledBookings,
    },
    byType: {
      packages: packageCount,
      offers: offerCount,
      flights: flightCount,
      hotels: hotelCount,
    },
    byStatus: {
      confirmed: confirmedBookings,
      pending: pendingBookings,
      cancelled: cancelledBookings,
    },
    financialSummary: {
      totalGrossRevenue,
      currency: 'INR',
    },
  };
};

/**
 * 3. 360° Booking File Dossier
 */
const getBookingDossier = async (bookingType, bookingId) => {
  let normType = (bookingType || '').toLowerCase();

  // If normType is 'all' or empty, or if bookingId is a MasterBooking ID, detect real bookingType
  let masterBooking = null;
  if (mongoose.Types.ObjectId.isValid(bookingId)) {
    masterBooking = await Booking.findById(bookingId)
      .populate('userId', 'name firstName lastName email phone')
      .populate('assignedTo', 'name firstName lastName email phone')
      .populate('remarks.author', 'name firstName lastName email')
      .populate('paymentId');
    if (masterBooking && (normType === 'all' || !normType)) {
      normType = masterBooking.bookingType;
    }
  }

  if (!normType || normType === 'all') {
    normType = 'package';
  }

  // Resolve rich domain booking
  const domainBooking = await resolveBooking(bookingId, normType);
  if (!domainBooking) {
    throw new AppError(`Booking of type ${normType} not found`, 404);
  }

  // Find associated MasterBooking if not already fetched
  if (!masterBooking) {
    masterBooking = await Booking.findOne({
      $or: [{ itemId: domainBooking._id }, { _id: domainBooking._id }],
      bookingType: normType,
    })
      .populate('userId', 'name firstName lastName email phone')
      .populate('assignedTo', 'name firstName lastName email phone')
      .populate('remarks.author', 'name firstName lastName email')
      .populate('paymentId');
  }

  // Find payment if available
  let paymentDoc = masterBooking?.paymentId;
  if (!paymentDoc) {
    const modelName = getModelName(normType);
    paymentDoc = await Payment.findOne({
      bookingId: domainBooking._id,
      bookingModel: modelName,
    }).sort({ createdAt: -1 });
  }

  const rawUser =
    masterBooking?.userId ||
    domainBooking.user ||
    domainBooking.userId ||
    domainBooking.submittedBy;

  const customer = extractCustomer(rawUser);

  // Extract assignedTo & remarks
  const assignedTo =
    masterBooking?.assignedTo ||
    domainBooking.assignedTo ||
    null;

  const remarks = [
    ...(masterBooking?.remarks || []),
    ...(domainBooking.remarks || []),
  ];

  const origin =
    normType === 'package' || normType === 'offer'
      ? 'in_house'
      : 'third_party';

  const dossier = {
    _id: domainBooking._id,
    masterBookingId: masterBooking?._id || null,
    bookingReference: `BK-${normType.toUpperCase()}-${String(domainBooking._id).slice(-6).toUpperCase()}`,
    bookingType: normType,
    origin,
    status: domainBooking.status || masterBooking?.status || 'pending',
    customer,
    assignedTo: assignedTo
      ? {
          _id: assignedTo._id,
          name:
            assignedTo.name ||
            `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim() ||
            'Agent',
          email: assignedTo.email || '',
          phone: assignedTo.phone || '',
        }
      : null,
    remarks,
    financials: {
      totalAmount:
        domainBooking.totalAmount ||
        domainBooking.totalPrice ||
        masterBooking?.details?.totalPrice ||
        0,
      currency: domainBooking.currency || masterBooking?.details?.currency || 'INR',
      payment: paymentDoc
        ? {
            _id: paymentDoc._id,
            status: paymentDoc.status,
            amount: paymentDoc.amount,
            method: paymentDoc.paymentMethod,
            gatewayOrderId: paymentDoc.gatewayOrderId,
            gatewayPaymentId: paymentDoc.gatewayPaymentId,
            paidAt: paymentDoc.paidAt || paymentDoc.updatedAt,
          }
        : null,
    },
    cancellation: {
      isCancelled: (domainBooking.status || masterBooking?.status) === 'cancelled',
      cancelledAt: domainBooking.cancelledAt || masterBooking?.cancelledAt || null,
      cancellationReason:
        domainBooking.cancellationReason || masterBooking?.cancellationReason || null,
      refundAmount:
        domainBooking.refundAmount || masterBooking?.refundAmount || null,
    },
    rawBookingDetails: domainBooking,
    createdAt: domainBooking.createdAt || masterBooking?.createdAt,
    updatedAt: domainBooking.updatedAt || masterBooking?.updatedAt,
  };

  if (normType === 'hotel') {
    dossier.details = {
      hotelName: domainBooking.hotelName || masterBooking?.details?.destination,
      destination: domainBooking.destination,
      checkIn: domainBooking.checkIn || masterBooking?.details?.departureDate,
      checkOut: domainBooking.checkOut || masterBooking?.details?.returnDate,
      guests: domainBooking.guests || [],
      rooms: domainBooking.roomSnapshots || [],
    };
  } else if (normType === 'flight') {
    const itin = domainBooking.eTicketData || {};
    const segs = itin.Segments?.[0] || [];
    dossier.details = {
      route: masterBooking?.details?.destination || (segs.length > 0 ? `${segs[0]?.Origin?.AirportCode}-${segs[segs.length - 1]?.Destination?.AirportCode}` : 'Flight'),
      departureTime: segs[0]?.Origin?.DepTime || domainBooking.createdAt,
      pnr: domainBooking.pnr,
      ticketStatus: domainBooking.ticketStatus,
      passengers: domainBooking.passengers || [],
    };
  } else if (normType === 'package') {
    dossier.details = {
      packageName: domainBooking.packageSnapshot?.title || 'Package',
      destination: domainBooking.packageSnapshot?.destination || '',
      startDate: domainBooking.travelDates?.startDate || domainBooking.packageSnapshot?.validity?.startDate,
      endDate: domainBooking.travelDates?.endDate || domainBooking.packageSnapshot?.validity?.endDate,
      travellers: domainBooking.travellers || [],
    };
  } else if (normType === 'offer') {
    dossier.details = {
      offerTitle: domainBooking.offerSnapshot?.title || 'Offer',
      destination: domainBooking.offerSnapshot?.destination || '',
      startDate: domainBooking.offerSnapshot?.startDate,
      endDate: domainBooking.offerSnapshot?.endDate,
      travellers: domainBooking.travellers || [],
    };
  }

  return dossier;
};

/**
 * 4. Operational Status & Manual Override
 */
const updateBookingStatus = async (
  bookingType,
  bookingId,
  { status, pnr, ticketNumber, internalRemark },
  adminUser
) => {
  let normType = (bookingType || '').toLowerCase();
  if ((!normType || normType === 'all') && mongoose.Types.ObjectId.isValid(bookingId)) {
    const master = await Booking.findById(bookingId);
    if (master) normType = master.bookingType;
  }
  if (!normType || normType === 'all') {
    normType = 'package';
  }

  const domainBooking = await resolveBooking(bookingId, normType);
  if (!domainBooking) {
    throw new AppError(`Booking not found`, 404);
  }

  // Update domain booking status
  domainBooking.status = status;
  if (pnr && 'pnr' in domainBooking) domainBooking.pnr = pnr;
  if (ticketNumber && 'ticketNumber' in domainBooking) domainBooking.ticketNumber = ticketNumber;

  if (internalRemark && Array.isArray(domainBooking.remarks)) {
    domainBooking.remarks.push({
      text: internalRemark,
      author: adminUser?._id || null,
      createdAt: new Date(),
    });
  }
  await domainBooking.save();

  // Find or create MasterBooking to keep in sync
  let masterBooking = await Booking.findOne({
    $or: [{ itemId: domainBooking._id }, { _id: domainBooking._id }],
  });

  if (masterBooking) {
    masterBooking.status = status;
    if (internalRemark) {
      masterBooking.remarks.push({
        text: internalRemark,
        author: adminUser?._id || null,
        createdAt: new Date(),
      });
    }
    await masterBooking.save();
  }

  logger.info(
    `[CRM Bookings] Status updated for ${normType} booking ${domainBooking._id} to ${status} by ${adminUser?._id}`
  );

  return getBookingDossier(normType, domainBooking._id);
};

/**
 * 5. Assign Handling Agent
 */
const assignBookingAgent = async (bookingType, bookingId, targetAgentId, adminUser) => {
  let normType = (bookingType || '').toLowerCase();
  if ((!normType || normType === 'all') && mongoose.Types.ObjectId.isValid(bookingId)) {
    const master = await Booking.findById(bookingId);
    if (master) normType = master.bookingType;
  }
  if (!normType || normType === 'all') {
    normType = 'package';
  }

  const domainBooking = await resolveBooking(bookingId, normType);
  if (!domainBooking) {
    throw new AppError(`Booking not found`, 404);
  }

  const agent = await User.findById(targetAgentId).select('name firstName lastName email');
  if (!agent) {
    throw new AppError('Agent not found', 404);
  }

  const agentName =
    agent.name || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Agent';

  // If domain model supports assignedTo (e.g. PackageBooking)
  if ('assignedTo' in domainBooking) {
    domainBooking.assignedTo = targetAgentId;
    if (Array.isArray(domainBooking.remarks)) {
      domainBooking.remarks.push({
        text: `Assigned to agent ${agentName}`,
        author: adminUser?._id || null,
        createdAt: new Date(),
      });
    }
    await domainBooking.save();
  }

  // Update MasterBooking
  let masterBooking = await Booking.findOne({
    $or: [{ itemId: domainBooking._id }, { _id: domainBooking._id }],
  });

  if (masterBooking) {
    masterBooking.assignedTo = targetAgentId;
    masterBooking.remarks.push({
      text: `Assigned to agent ${agentName}`,
      author: adminUser?._id || null,
      createdAt: new Date(),
    });
    await masterBooking.save();
  }

  logger.info(
    `[CRM Bookings] Assigned ${normType} booking ${domainBooking._id} to agent ${targetAgentId}`
  );

  return getBookingDossier(normType, domainBooking._id);
};

/**
 * 6. Add Operational Remark/Note
 */
const addBookingRemark = async (bookingType, bookingId, remarkText, adminUser) => {
  let normType = (bookingType || '').toLowerCase();
  if ((!normType || normType === 'all') && mongoose.Types.ObjectId.isValid(bookingId)) {
    const master = await Booking.findById(bookingId);
    if (master) normType = master.bookingType;
  }
  if (!normType || normType === 'all') {
    normType = 'package';
  }

  const domainBooking = await resolveBooking(bookingId, normType);
  if (!domainBooking) {
    throw new AppError(`Booking not found`, 404);
  }

  const remarkEntry = {
    text: remarkText.trim(),
    author: adminUser?._id || null,
    createdAt: new Date(),
  };

  // If domain supports remarks (like PackageBooking)
  if (Array.isArray(domainBooking.remarks)) {
    domainBooking.remarks.push(remarkEntry);
    await domainBooking.save();
  }

  // Ensure MasterBooking has the remark
  let masterBooking = await Booking.findOne({
    $or: [{ itemId: domainBooking._id }, { _id: domainBooking._id }],
  });

  if (masterBooking) {
    masterBooking.remarks.push(remarkEntry);
    await masterBooking.save();
  }

  logger.info(
    `[CRM Bookings] Operational remark added to ${normType} booking ${domainBooking._id}`
  );

  return getBookingDossier(normType, domainBooking._id);
};

module.exports = {
  listBookings,
  getBookingsSummary,
  getBookingDossier,
  updateBookingStatus,
  assignBookingAgent,
  addBookingRemark,
};
