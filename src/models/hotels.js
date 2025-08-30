const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: String,
  rating: Number
}, { timestamps: true });


hotelSchema.index({ city: 1, name: 1, rating: -1 }); // compound index for city+name+rating
hotelSchema.index({ city: 1 });                     // city-only searches
hotelSchema.index({ name: 1 });                     // name-only searches

const Hotel = mongoose.model("Hotel", hotelSchema);

module.exports = Hotel;
