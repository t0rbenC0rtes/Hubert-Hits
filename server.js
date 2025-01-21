// Import dependencies
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Restaurants = require("./models/Restaurant");
const cuisineCategories = require("./models/cuisineMapping");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => res.send("Server is running!"));

app.get("/restaurants", async (req, res) => {
  try {
    const {
      name,
      cuisine,
      borough,
      grade,
      category,
      page = 1,
      limit = 20,
      sortBy,
      order = "asc",
    } = req.query;

    let filter = {};

    // Filters
    if (name) filter.name = { $regex: name, $options: "i" }; // Case-insensitive name search
    if (cuisine) filter.cuisine = { $in: cuisine.split(",") }; // Cuisine filter
    if (borough) filter.borough = { $in: borough.split(",") }; // Borough filter
    if (grade) filter["grades.grade"] = { $in: grade.split(",") }; // Grade filter

    // Category Filter
    if (category) {
      const selectedCategories = category.split(",");
      const cuisinesInCategories = selectedCategories.flatMap(
        (cat) => cuisineCategories[cat] || []
      );
      if (cuisinesInCategories.length > 0) {
        filter.cuisine = { $in: cuisinesInCategories };
      } else {
        return res.status(400).json({ error: "Invalid categories selected" });
      }
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Sorting Logic
    const sortField =
      sortBy === "averageRating" ? "averageRating" : sortBy || "name";
    const sortOrder = order === "desc" ? -1 : 1;

    // MongoDB Aggregation Pipeline
    const aggregationPipeline = [
      { $match: filter }, // Apply filters
      { $addFields: { averageRating: { $avg: "$grades.score" } } }, // Calculate average rating
      { $sort: { [sortField]: sortOrder } }, // Apply sorting
      { $skip: skip }, // Apply pagination (skip)
      { $limit: Number(limit) }, // Apply pagination (limit)
    ];

    const restaurants = await Restaurants.aggregate(aggregationPipeline);

    // Count Total Matching Documents
    const total = await Restaurants.countDocuments(filter);

    // Response
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

app.get("/categories", async (req, res) => {
  try {
    // Get category names (keys of cuisineCategories)
    const categories = Object.keys(cuisineCategories);
    res.json({ count: categories.length, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Error fetching categories");
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
