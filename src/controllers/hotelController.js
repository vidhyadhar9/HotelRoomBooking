const Hotel = require("../models/hotels");
const redis = require("redis");

// Connect to Redis
const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379", // adjust if Redis runs elsewhere
});

redisClient.connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch((err) => console.error("❌ Redis connection error:", err));

const CACHE_TTL = 600; // seconds (10 min)

// Create a new hotel
const createHotel = async (req, res) => {
  try {
    const { name, city, address, rating } = req.body;
    const hotel = new Hotel({ name, city, address, rating });
    await hotel.save();

    // Invalidate cache (since new data added)
    // await redisClient.flushAll();

    return res.status(201).send({message :"hotel inserted successfully with details", hotel });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const searchHotels = async (req, res) => {
  try {
    const { name, city, sortByRating, page = 1, limit = 20 } = req.query;

    // 1️⃣ Build query dynamically for flexible search
    const query = {};
    if (city) query.city = city;   // only filter by city if provided
    if (name) query.name = name;   // only filter by name if provided

    console.log("Search Parameters:", req.query);
    console.log("Search Query:", query);

    // 2️ Sorting
    const sort = {};
    if (sortByRating) {
      sort.rating = sortByRating.toLowerCase() === "desc" ? -1 : 1;
    } else {
      sort.rating = -1; // default: highest rating first
    }

    // 3️⃣ Redis cache key
    const cacheKey = `hotels:${JSON.stringify(query)}:sort:${JSON.stringify(sort)}:page:${page}:limit:${limit}`;

    // 4️⃣ Check Redis cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ Served from Redis cache");
      return res.json(JSON.parse(cachedData));
    }

    // 5️⃣ Benchmarking start
    const startTime = Date.now();

    // 6️⃣ Query MongoDB
    const hotels = await Hotel.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      // .explain("executionStats"); it will help us to know whether the indexing is implementing or not

    // 7️⃣ Store in Redis cache (async)
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(hotels));

    // 8️⃣ Benchmarking end
    const endTime = Date.now();

    // 9️⃣ Response with execution time
    const response = {
      success: true,
      count: hotels.length,
      data: hotels,
      timeTaken: `${endTime - startTime} ms`,
    };

    console.log("✅ Served from MongoDB or Redis cache with strict search");
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
