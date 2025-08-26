const mongoose = require("mongoose");
const Booking = require("../models/bookings");
const Hotel = require("../models/hotels");
const Room = require("../models/rooms");

const bookRoom = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userName, hotelName, city, roomNumber, startDate, endDate } = req.body;

    // Find hotel and room
    const hotel = await Hotel.findOne({ name: hotelName, city }).session(session);
    if (!hotel) throw new Error("Hotel not found in the given city.");

    const room = await Room.findOne({ hotel: hotel._id, roomNumber }).session(session);
    if (!room) throw new Error("Room not found in this hotel.");
    if (!room.isAvailable) throw new Error("Room is under maintenance.");

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start > end) {
      return res.status(400).json({ message: "Invalid date range: startDate must be before or equal to endDate" });
    }

    // Step 1: Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      room: room._id,
      startDate: { $lte: end },
      endDate: { $gte: start }
    }).session(session);

    if (overlappingBooking) {
      throw new Error("Room already booked for the selected date range.");
    }

    // Step 2: Create booking
    const newBooking = await Booking.create(
      [{
        userName,
        room: room._id,
        hotel: hotel._id,
        startDate: start,
        endDate: end
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "Room booked successfully", booking: newBooking[0] });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  bookRoom
};
