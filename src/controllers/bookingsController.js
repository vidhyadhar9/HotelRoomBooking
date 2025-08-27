const mongoose = require("mongoose");
const Booking = require("../models/bookings");
const Hotel = require("../models/hotels");
const Room = require("../models/rooms");

const bookRoom = async (req, res) => {
  const session = await mongoose.startSession(); // Start session
  session.startTransaction();

  try {
    const { hotelName, city, roomNumber, startDate, endDate, userName } = req.body;

    // Step 1: Validate hotel exists
    const hotel = await Hotel.findOne({ name: hotelName, city }).session(session);
    if (!hotel) {
      throw new Error("Hotel not found in the given city.");
    }

    // Step 2: Validate room exists
    const room = await Room.findOne({ hotel: hotel._id, roomNumber }).session(session);
    if (!room) {
      throw new Error("Room not found in this hotel.");
    }

    if (!room.isAvailable) {
      throw new Error("Room is under maintenance.");
    }

    // Step 3: Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      throw new Error("Invalid date range: startDate must be before or equal to endDate");
    }

    // Step 4: Check for overlapping bookings inside the transaction
    const overlappingBooking = await Booking.findOne({
      room: room._id,
      startDate: { $lte: end },
      endDate: { $gte: start }
    }).session(session);

    if (overlappingBooking) {
      throw new Error("Room already booked for the selected dates.");
    }

    // Step 5: Create booking
    const newBooking = await Booking.create(
      [{
        room: room._id,
        hotel: hotel._id,
        startDate: start,
        endDate: end,
        userName
      }],
      { session } // Associate with session
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "Room booked successfully", booking: newBooking[0] });

  } catch (err) {
    // Abort transaction if anything fails
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: err.message });
  }
};

module.exports = {
  bookRoom
};
