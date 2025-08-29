const { MongoClient } = require("mongodb");

const generateHotels = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/HotelBooking";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("hotels");

    const totalRecords = 1000000; // 1M
    const bulk = [];

    for (let i = 0; i < totalRecords; i++) {
      bulk.push({
        name: `Hotel_${i}`,
        city: `City_${i % 1000}`,
        address: `Address_${i}`,
        rating: Math.floor(Math.random() * 5) + 1,
      });

      if (bulk.length === 10000) {
        await collection.insertMany(bulk);
        console.log(`Inserted ${i + 1} hotels`);
        bulk.length = 0;
      }
    }

    if (bulk.length > 0) {
      await collection.insertMany(bulk);
      console.log(`Inserted final ${bulk.length} hotels`);
    }

    console.log("✅ Successfully inserted 1M hotels");
  } catch (err) {
    console.error("❌ Error inserting hotels:", err);
  } finally {
    await client.close();
  }
};

generateHotels();
