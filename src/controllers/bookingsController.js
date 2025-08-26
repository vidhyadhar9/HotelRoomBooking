const Hotel = require("../models/hotels");
const Room = require("../models/rooms");
const Booking = require("../models/bookings");

// Book a Room
const bookRoom = async (req, res) => {
  try {
    const { userName, hotelName, city, roomNumber, startDate, endDate } = req.body;

    // 1. Validate hotel
    const hotel = await Hotel.findOne({ name: hotelName, city });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found in the given city." });
    }

    // 2. Validate room

    const room = await Room.findOne({ hotel: hotel._id, roomNumber });
    if (!room) {
      return res.status(404).json({ message: "Room not found in this hotel." });
    }

    if (!room.isAvailable) {
      return res.status(400).json({ message: "Room is under Maintenance please book other rooms." });
    }

    // 3. Prevent double booking (check overlapping dates)
const overlapBooking = await Booking.findOne({
  room: room._id,
  $or: [
    { startDate: { $lt: new Date(endDate), $gte: new Date(startDate) } }, // overlap inside
    { endDate: { $gt: new Date(startDate), $lte: new Date(endDate) } },   // overlap inside
    { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } } // fully covered
  ]
});

    if (overlapBooking) {
      return res.status(400).json({ message: "Room already booked for the selected date range." });
    }

    // 4. Create booking
    const booking = new Booking({
      userName,
      room: room._id,
      hotel: hotel._id,
      startDate,
      endDate,
    });

    await booking.save();

    res.status(201).json({
      message: "Room booked successfully",
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  bookRoom
};
