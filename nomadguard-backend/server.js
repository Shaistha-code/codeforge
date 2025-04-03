const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("NomadGuard Backend is Running...");
});

// Fetch Restaurants & Hotels using OpenStreetMap
app.post("/api/recommendations", async (req, res) => {
  const { destination, allergies } = req.body;

  if (!destination) {
    return res.status(400).json({ error: "Destination is required" });
  }

  try {
    // Convert destination to lat/lon using Nominatim API
    const locationRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: destination, format: "json", limit: 1 }
    });

    if (!locationRes.data.length) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { lat, lon } = locationRes.data[0];

    // Query OpenStreetMap for restaurants & hotels
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="restaurant"](around:5000, ${lat}, ${lon});
        node["tourism"="hotel"](around:5000, ${lat}, ${lon});
      );
      out;
    `;

    const placesRes = await axios.get("https://overpass-api.de/api/interpreter", {
      params: { data: overpassQuery },
    });

    const restaurants = [];
    const hotels = [];

    placesRes.data.elements.forEach((place) => {
      const name = place.tags.name || "Unnamed Place";
      const type = place.tags.amenity || place.tags.tourism;

      if (type === "restaurant") {
        restaurants.push(name);
      } else if (type === "hotel") {
        hotels.push(name);
      }
    });

    let warning = "";
    if (allergies.toLowerCase().includes("peanut")) {
      warning = `Warning: High peanut allergy risk in ${destination}`;
    }

    res.json({
      destination,
      allergies,
      warning,
      restaurants: restaurants.length ? restaurants : ["No restaurants found"],
      hotels: hotels.length ? hotels : ["No hotels found"]
    });
    console.log("Fetched places:", placesRes.data.elements);


  } catch (error) {
    console.error("❌ Error fetching data from OpenStreetMap:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
