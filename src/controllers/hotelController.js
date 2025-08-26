const Hotel = require("../models/hotels");
const redis = require("redis");

// 🔹 Connect to Redis
const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379", // adjust if Redis runs elsewhere
});

// redisClient.connect()
//   .then(() => console.log("✅ Connected to Redis"))
//   .catch((err) => console.error("❌ Redis connection error:", err));

// const CACHE_TTL = 60; // seconds (1 min)

// Create a new hotel
const createHotel = async (req, res) => {
  try {
    const { name, city, address, rating } = req.body;
    const hotel = new Hotel({ name, city, address, rating });
    await hotel.save();

    // Invalidate cache (since new data added)
    // await redisClient.flushAll();

    return res.status(201).json(hotel);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Search hotels with Redis cache
const searchHotels = async (req, res) => {
  try {
    const { city, name, sortByRating } = req.query;

    // Build query object
    let query = {};
if (city) query.city = new RegExp(city, "i");
if (name) query.name = new RegExp(name, "i");

// Sorting
let sort = {};
if (sortByRating) {
  sort.rating = sortByRating.toLowerCase() === "desc" ? -1 : 1;
} else {
  sort.rating = -1; // default: highest first
}

// Redis cache key
// const cacheKey = `hotels:${JSON.stringify(query)}:sort:${JSON.stringify(sort)}:page:${page}:limit:${limit}`;

// Check Redis cache (if enabled)
// const cachedData = await redisClient.get(cacheKey);
// if (cachedData) {
//   console.log("⚡ Serving from Redis cache");
//   return res.json(JSON.parse(cachedData));
// }

const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;

const hotels = await Hotel.find(query)  // using query directly
  .sort(sort)
  .skip((page - 1) * limit)
  .limit(limit);

const response = {
  success: true,
  count: hotels.length,
  hotels,
};

// Store in Redis (if enabled)
// await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(response));

console.log("✅ Served from MongoDB & cached");
return res.json(response);

  } catch (err) {
    console.error("Error searching hotels:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createHotel,
  searchHotels,
};
