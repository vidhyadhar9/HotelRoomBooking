const Room = require("../models/rooms");
const Hotel = require("../models/hotels");

// Create a room and link it to a hotel
const createRoom = async (req, res) => {
  try {
    const { hotelName, city, roomNumber, roomType, price } = req.body;
    console.log(req.body);

    // Find hotel by name & city
    const hotel = await Hotel.findOne({ name: hotelName, city: city });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const room = new Room({
      hotel: hotel._id,
      roomNumber,
      roomType,
      price
    });
    //check whether the room already exists
    const existingRoom = await Room.findOne({ hotel: hotel._id, roomNumber });
    console.log(existingRoom);
    if (existingRoom) {
        return res.status(400).json({ message: "Room already exists" });
    } else {
        await room.save();
        return res.status(201).json({ message: "Room created", room });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all rooms for a hotel
getRoomsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const rooms = await Room.find({ hotel: hotelId });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createRoom,
  getRoomsByHotel
};
