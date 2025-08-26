const Hotel = require("../models/hotels");

// Create a new hotel
createHotel = async (req, res) => {
  try {
    const { name, city, address, rating } = req.body;
    const hotel = new Hotel({ name, city, address, rating });
    await hotel.save();
    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all hotels
// exports.getHotels = async (req, res) => {
//   try {
//     const hotels = await Hotel.find();
//     res.json(hotels);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



searchHotels = async (req, res) => {
  try {
    const { city, name, sortByRating } = req.query;

    let query = {};

    // Add city filter if provided
    if (city) {
      query.city = new RegExp(city, "i"); // case-insensitive
    }

    // Add hotel name filter if provided
    if (name) {
      query.name = new RegExp(name, "i");
    }

    // Build sorting
    let sort = {};
    if (sortByRating) {
      // If user passes "asc" → ascending (low → high)
      // If user passes "desc" → descending (high → low)
      sort.rating = sortByRating.toLowerCase() === "desc" ? -1 : 1;
    } else {
      // Default: sort by rating descending
      sort.rating = -1;
    }

    const hotels = await Hotel.find(query).sort(sort);

    res.json({
      success: true,
      count: hotels.length,
      hotels
    });
  } catch (err) {
    console.error("Error searching hotels:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = {
  createHotel,
  searchHotels,
};