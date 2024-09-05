"use strict";

/** Routes for flights. */

const express = require("express");
const router = express.Router({ mergeParams: true });
const amadeus = require("../amadeus"); // Access the Amadeus SDK
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const { validateFlightNew, 
        validateFlightUpdate, 
        validateFlightSearch 
      } = require('../middleware/validateTrip');



// Flight Inspiration Search
router.get("/flight/destinations", validateFlightSearch, async function (req, res, next) {
  try {
    const response = await amadeus.shopping.flightDestinations.get({
      origin: req.query.origin
    });
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching flight destinations", error);
    return res.status(500).json({ error: error.message });
  }
});

// Flight Date Search
router.get("/flight/dates", validateFlightSearch, async function (req, res, next) {
  try {
    const response = await amadeus.shopping.flightDates.get({
      origin: req.query.origin,
      destination: req.query.destination
    });
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching flight dates", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET Flight Offers Search
router.get("/flight/offers", validateFlightSearch, async function (req, res, next) {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: req.query.origin,
      destinationLocationCode: req.query.destination,
      departureDate: req.query.departureDate,
      adults: req.query.adults
    });
    if (response.data) {
      return res.json(response.data);
    } else {
      throw new BadRequestError("No flights found");
    }
  } catch (error) {
    console.error("Error fetching flight offers", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST Flight Offers Search
router.post("/flight/offers", validateFlightSearch, async function (req, res, next) {
  try {
    const response = await amadeus.shopping.flightOffersSearch.post(JSON.stringify(req.body));
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching flight offers", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET Flight Offers Price
router.get("/flight/offers/price", async function (req, res, next) {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: req.query.origin,
      destinationLocationCode: req.query.destination,
      departureDate: req.query.departureDate,
      adults: req.query.adults
    });
    const pricingResponse = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        'data': {
          'type': 'flight-offers-pricing',
          'flightOffers': [response.data[0]]
        }
      })
    );
    return res.json(pricingResponse.data);
  } catch (error) {
    console.error("Error fetching flight offers price", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST Flight Offers Price with additional parameters
router.post("/flight/offers/price", async function (req, res, next) {
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post(JSON.stringify(req.body), { include: 'bags' });
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching flight offers price", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST Flight Create Orders
router.post("/flight/orders", async function (req, res, next) {
  try {
    const response = await amadeus.booking.flightOrders.post(JSON.stringify(req.body));
    return res.json(response.data);
  } catch (error) {
    console.error("Error creating flight orders", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET Retrieve flight order with ID 'XXX'
router.get("/flight/orders/:id", async function (req, res, next) {
  try {
    const response = await amadeus.booking.flightOrder(req.params.id).get();
    return res.json(response.data);
  } catch (error) {
    console.error("Error retrieving flight order", error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE Cancel flight order with ID 'XXX'
router.delete("/flight/orders/:id", async function (req, res, next) {
  try {
    const response = await amadeus.booking.flightOrder(req.params.id).delete();
    return res.json(response.data);
  } catch (error) {
    console.error("Error canceling flight order", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET Flight SeatMap Display
router.get("/flight/seatmaps", async function (req, res, next) {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: req.query.origin,
      destinationLocationCode: req.query.destination,
      departureDate: req.query.departureDate,
      adults: req.query.adults
    });
    const seatmapResponse = await amadeus.shopping.seatmaps.post(
      JSON.stringify({
        'data': [response.data[0]]
      })
    );
    return res.json(seatmapResponse.data);
  } catch (error) {
    console.error("Error fetching flight seatmaps", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET Retrieve the seat map for flight order with ID 'XXX'
router.get("/flight/orders/:id/seatmap", async function (req, res, next) {
  try {
    const response = await amadeus.shopping.seatmaps.get({
      'flight-orderId': req.params.id
    });
    return res.json(response.data);
  } catch (error) {
    console.error("Error retrieving flight seatmap", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST Flight Availabilities Search
router.post("/flight/availabilities", async function (req, res, next) {
  try {
    const response = await amadeus.shopping.availability.flightAvailabilities.post(JSON.stringify(req.body));
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching flight availabilities", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST Branded Fares Upsell
router.post("/flight/offers/upselling", async function (req, res, next) {
  try {
    const response = await amadeus.shopping.flightOffers.upselling.post(JSON.stringify(req.body));
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching branded fares", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET Flight Choice Prediction
router.get("/flight/offers/prediction", async function (req, res, next) {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: req.query.origin,
      destinationLocationCode: req.query.destination,
      departureDate: req.query.departureDate,
      adults: req.query.adults
    });
    const predictionResponse = await amadeus.shopping.flightOffers.prediction.post(
      JSON.stringify(response)
    );
    return res.json(predictionResponse.data);
  } catch (error) {
    console.error("Error fetching flight choice prediction", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET Flight Checkin Links
router.get("/airline/checkinLinks", async function (req, res, next) {
  try {
    const response = await amadeus.referenceData.urls.checkinLinks.get({
      airlineCode: req.query.airlineCode
    });
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching check-in links", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET On-Demand Flight Status
router.get("/flight/status", async function (req, res, next) {
  try {
    const response = await amadeus.schedule.flights.get({
      carrierCode: req.query.carrierCode,
      flightNumber: req.query.flightNumber,
      scheduledDepartureDate: req.query.scheduledDepartureDate
    });
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching flight status", error);
    return res.status(500).json({ error: error.message });
  }
});


module.exports = router;
