const mongoose = require('mongoose');

// Define the schema
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Restaurant name
  borough: String, // Borough (e.g., Brooklyn, Manhattan)
  cuisine: String, // Cuisine type (e.g., American, Italian)
  address: {
    building: String,
    street: String,
    zipcode: String,
    coord: [Number], // [Longitude, Latitude]
  },
  grades: [
    {
      date: { type: Date },
      grade: String, // e.g., A, B
      score: Number,
    },
  ],
  restaurant_id: String, // Unique restaurant ID
});

// Create the model
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
