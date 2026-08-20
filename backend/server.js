require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: isMongoReady() ? "ok" : "starting",
    mongo: isMongoReady(),
  });
});

app.use("/api/auth", (req, res, next) => {
  if (!isMongoReady()) {
    res.set("Retry-After", "2");
    return res.status(503).json({
      message: "Server is starting up. Please retry in a moment.",
    });
  }
  next();
}, authRoutes);

async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("Connected to MongoDB");
}

function start() {
  if (!process.env.MONGO_URL) {
    console.error("Failed to start server: MONGO_URL is not set");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("Failed to start server: JWT_SECRET is not set");
    process.exit(1);
  }

  // Bind the port immediately so Render can mark the service live and the
  // frontend can wake a cold instance before MongoDB finishes connecting.
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  connectMongo().catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
}

start();
