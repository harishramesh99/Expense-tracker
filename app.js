const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Set Handlebars as the view engine
app.set("view engine", "hbs");

// Middleware to serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Test Route
app.get("/", (req, res) => {
    res.send("Expense Tracker is running...");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
