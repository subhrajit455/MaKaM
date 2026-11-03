const mongoose = require('mongoose');
const { BOOKING_MODEL_MAP } = require('./payment.constants');
const { AppError } = require('../../middleware/errorHandler');

// Ensure all target booking models are loaded/registered
try {
  require('../auth/auth.model');
} catch (e) { }
try {
  require('../flights/flight.model');
} catch (e) { }
try {
  require('../hotels/hotel.model');
} catch (e) { }
try {
  require('../packages/models/packageBooking.model');
} catch (e) { }
try {
  require('../bookings/booking.model');
} catch (e) { }
try {
  require('../packages/offers/offerBooking.model');
} catch (e) { }
try {
  require('../visa/user/visaGroup.model');
} catch (e) { }
try {
  require('../account/traveller.model');
} catch (e) { }

const getModelName = (bookingType) => {
  const modelName = BOOKING_MODEL_MAP[bookingType];
  if (!modelName) {
    throw new AppError(`Unsupported booking type: ${bookingType}`, 400);
  }
  return modelName;
};

const resolveBooking = async (bookingId, bookingType = 'package') => {
  let resolvedType = (bookingType || '').toLowerCase();
  const isObjectId = mongoose.Types.ObjectId.isValid(bookingId) && String(new mongoose.Types.ObjectId(bookingId)) === String(bookingId);

  if ((!resolvedType || resolvedType === 'all') && isObjectId) {
    try {
      const MasterBooking = mongoose.model('Booking');
      const master = await MasterBooking.findById(bookingId);
      if (master && master.bookingType) {
        resolvedType = master.bookingType;
      }
    } catch (e) {}
  }
  if (!resolvedType || resolvedType === 'all') {
    resolvedType = 'package';
  }

  const modelName = getModelName(resolvedType);
  const Model = mongoose.model(modelName);

  let query;

  if (isObjectId) {
    query = Model.findById(bookingId);
  } else if (modelName === 'FlightBooking' && !isNaN(Number(bookingId))) {
    query = Model.findOne({ srdvBookingId: Number(bookingId) });
  } else if (modelName === 'HotelBooking') {
    query = Model.findOne({
      $or: [
        { providerBookingId: String(bookingId) },
        { bookingRefNo: String(bookingId) },
        { recheckId: String(bookingId) },
      ],
    });
  } else {
    query = Model.findById(bookingId);
  }

  // Handle different user reference fields across schemas
  if (modelName === 'FlightBooking') {
    query = query.populate('user', '_id email phone name').populate('passengers.travellerId');
  } else if (modelName === 'HotelBooking' || modelName === 'Booking') {
    query = query.populate('userId', '_id email phone name');
  } else if (modelName === 'PackageBooking' || modelName === 'OfferBooking') {
    query = query.populate('userId', '_id email phone name');
  } else if (modelName === 'VisaGroup') {
    query = query.populate('submittedBy', '_id email phone name');
  }

  let booking = await query;
  if (!booking && isObjectId) {
    try {
      const Booking = mongoose.model('Booking');
      const master = await Booking.findById(bookingId);
      if (master && master.itemId) {
        const resolvedType = master.bookingType || bookingType;
        const DomainModel = mongoose.model(getModelName(resolvedType));
        let fallbackQuery = DomainModel.findById(master.itemId);
        if (resolvedType === 'flight') {
          fallbackQuery = fallbackQuery.populate('user', '_id email phone name').populate('passengers.travellerId');
        } else if (resolvedType === 'hotel' || resolvedType === 'package' || resolvedType === 'offer') {
          fallbackQuery = fallbackQuery.populate('userId', '_id email phone name');
        } else if (resolvedType === 'visa') {
          fallbackQuery = fallbackQuery.populate('submittedBy', '_id email phone name');
        }
        booking = await fallbackQuery;
      }
    } catch (e) {}
  }

  if (!booking) {
    throw new AppError(`${modelName} booking not found`, 404);
  }

  // Normalize user reference property
  if (!booking.user && booking.userId) {
    booking.user = booking.userId;
  } else if (!booking.user && booking.submittedBy) {
    booking.user = booking.submittedBy;
  }

  return booking;
};

module.exports = {
  getModelName,
  resolveBooking,
};
