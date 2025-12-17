import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// =======================
// Middleware
// =======================

// Enable CORS (Netlify + Local)
app.use(cors());

// Parse JSON requests
app.use(express.json());

// =======================
// Health Check
// =======================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is live 🚀",
  });
});

// =======================
// Routes
// =======================

// User authentication & user management
app.use("/api", userRoutes);

// Registration routes
app.use("/api/registrations", registrationRoutes);

// =======================
// Error Handling
// =======================

// Central error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =======================
// Start Server
// =======================

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
