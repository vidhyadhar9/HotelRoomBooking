const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Create a room
router.post("/create", roomController.createRoom);

// Get rooms by hotelId
// router.get("/:hotelId", roomController.getRoomsByHotel);

module.exports = router;
