// Load environment variables from .env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();

const Restaurants = require("./models/Restaurant");

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
const connectionString = process.env.MONGO_URI;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic route to test the server
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/restaurants", async (req, res) => {
  try {
    const { name, cuisine, borough, grade, page = 1, limit = 20 } = req.query;

    let filter = {}; // Start with an empty filter

    // Case-insensitive search for restaurant name
    if (name) {
      filter.name = { $regex: name, $options: "i" }; // Match name with regex (case-insensitive)
    }

    // Filter by cuisine
    if (cuisine) {
      const cuisinesArray = cuisine.split(",");
      filter.cuisine = { $in: cuisinesArray };
    }

    // Filter by borough
    if (borough) {
      const boroughsArray = borough.split(",");
      filter.borough = { $in: boroughsArray };
    }

    // Filter by grade
    if (grade) {
      const gradesArray = grade.split(",");
      filter["grades.grade"] = { $in: gradesArray }; // Nested field in MongoDB
    }

    // Pagination logic
    const skip = (Number(page) - 1) * Number(limit); // Skip calculation

    // Query with filters and pagination
    const restaurants = await Restaurants.find(filter)
      .limit(Number(limit)) // Limit results per page
      .skip(skip) // Skip documents for the current page
      .exec();

    // Get total count for pagination metadata
    const total = await Restaurants.countDocuments(filter);

    // Response with restaurants and pagination info
    res.json({
      restaurants,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalRestaurants: total,
    });
  } catch (err) {
    console.error("Error in /restaurants route:", err);
    res.status(500).send("Error fetching restaurants");
  }
});
