"use strict";

/** Express app for Ranner. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const tripsRoutes = require("./routes/trips");
const flightsRoutes = require("./routes/flights");
const airlinesRoutes = require("./routes/airlines");

const morgan = require("morgan");

const app = express();

app.use(cors({
  origin: [process.env.CORS_ORIGIN, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use('/trips', tripsRoutes);
app.use("/flights", flightsRoutes);
app.use("/airlines", airlinesRoutes);


//** Recieves and responds to health checks  */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
