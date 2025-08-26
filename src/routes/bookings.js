const express = require("express");
const router = express.Router();
const bookingController  = require("../controllers/bookingsController");

// Book a room
router.post("/rooms", bookingController.bookRoom);

module.exports = router;
