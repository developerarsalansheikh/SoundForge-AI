const express = require("express");
const cors    = require("cors");
const connectDB   = require("./config/dbConfig");
const errorHandle = require("./middleware/errorHandle");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app  = express();

// DB connection
connectDB();

// CORS — allow the Vite dev server and same-origin production requests
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({ msg: "WELCOME TO SONG MAKER APP", status: "ok" });
});

// Routes
app.use("/api/auth",  require("./routes/authRoutes"));
app.use("/api/user",  require("./routes/userRoutes"));
app.use("/api/music", require("./routes/musicRoutes"));
app.use("/api/songs", require("./routes/songRoutes"));
app.use("/api/lyrics",require("./routes/lyricsRoutes"));
app.use("/api/test",  require("./routes/testRoutes"));

// Global error handler
app.use(errorHandle);

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING AT PORT: ${PORT}`);
});
