const axios = require("axios");

const API_URL = "http://localhost:3000/bookings/rooms"; // your booking endpoint

// Booking payloads
const bookingRequests = [
  {
    userName: "Alice",
    hotelName: "Taj",
    city: "Mumbai",
    roomNumber: 2,
    startDate: "2025-06-30",
    endDate: "2025-06-30"
  },
  {
    userName: "Bob",
    hotelName: "Taj",
    city: "Mumbai",
    roomNumber: 2,
    startDate: "2025-06-30",
    endDate: "2025-06-30"
  }
];

async function testSimultaneousBookings() {
  try {
    // Send requests simultaneously
    const results = await Promise.allSettled(
      bookingRequests.map(data => axios.post(API_URL, data))
    );

    results.forEach((res, index) => {
      if (res.status === "fulfilled") {
        console.log(`Booking ${index + 1} succeeded ✅`, res.value.data);
      } else {
        console.log(
          `Booking ${index + 1} failed ❌`,
          res.reason.response?.data || res.reason.message
        );
      }
    });
  } catch (err) {
    console.error("Test error:", err.message);
  }
}

testSimultaneousBookings();
