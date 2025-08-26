const mongoose = require("mongoose");
const Booking = require("../models/bookings");
const Hotel = require("../models/hotels");
const Room = require("../models/rooms");

const bookRoom = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userName, hotelName, city, roomNumber, startDate, endDate } = req.body;

    const hotel = await Hotel.findOne({ name: hotelName, city }).session(session);
    if (!hotel) throw new Error("Hotel not found in the given city.");

    const room = await Room.findOne({ hotel: hotel._id, roomNumber }).session(session);
    if (!room) throw new Error("Room not found in this hotel.");
    if (!room.isAvailable) throw new Error("Room is under Maintenance.");

    // ✅ Atomic booking creation with overlap check
    const booking = await Booking.findOneAndUpdate(
      {
        room: room._id,
        $nor: [
          // Case 1: startDate falls inside existing booking
          { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
          // Case 2: endDate falls inside existing booking
          { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          // Case 3: booking fully covers the requested range
          { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } },
        ],
      },
      {
        $setOnInsert: {
          userName,
          room: room._id,
          hotel: hotel._id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      },
      {
        new: true,
        upsert: true,
        session,
      }
    );

    if (!booking) {
      throw new Error("Room already booked for the selected date range.");
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "Room booked successfully", booking });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  bookRoom
};
