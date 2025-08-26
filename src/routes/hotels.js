const Router = require('express').Router;
const hotelController = require("../controllers/hotelController");

const router = Router();




// Create a hotel
router.post("/create", hotelController.createHotel);

//search the hotels based on the query parameters
router.get("/search", hotelController.searchHotels);

// Get all hotels
// router.get("/", hotelController.getHotels);

module.exports = router;










