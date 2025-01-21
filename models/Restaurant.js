const mongoose = require("mongoose");

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

// Define the virtual field for average rating
restaurantSchema.virtual("averageRating").get(function () {
  if (this.grades && this.grades.length > 0) {
    const totalScore = this.grades.reduce((sum, grade) => sum + grade.score, 0);
    return totalScore / this.grades.length;
  }
  return 0; // Default if no grades exist
});

// Ensure virtuals are included in the output when converting to JSON
restaurantSchema.set("toJSON", { virtuals: true });
restaurantSchema.set("toObject", { virtuals: true });

// Create and export the model
const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
