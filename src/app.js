const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const hotelsRouter = require('./routes/hotels');
const roomsRouter = require('./routes/rooms');
const bookingsRouter = require('./routes/bookings');

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/hotels", hotelsRouter);
app.use("/rooms", roomsRouter);
app.use("/bookings", bookingsRouter);

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/HotelBooking")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 3000, () => {
      console.log(" Server running");
    });
  })
  .catch(err => console.error("DB Error:", err));
