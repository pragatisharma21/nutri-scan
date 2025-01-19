import express from "express";
import connectDB from "./src/Config/db.config.js";
import dotenv from "dotenv";
import qrcode from "qrcode-generator";
import CORS from "cors";
import requestLogger from "./src/Middlewares/logger.middleware.js";
import errorHandler from "./src/Middlewares/errorhandler.middleware.js";
import colors from "colors";

import userRoutes from "./src/Routes/user.routes.js";
import dishRoutes from "./src/Routes/dish.routes.js";

dotenv.config();

const clientUrl = process.env.CLIENT_URL || "https://nutri-scan-site.vercel.app"

const app = express();

app.use(requestLogger);

const PORT = process.env.PORT || 8088;

connectDB();

app.use(express.json());

app.use(
  CORS({
    origin: [clientUrl, "http://localhost:5173"],
    methods: "GET,PUT,PATCH,POST,DELETE"
  })
);

app.get("/", (req, res) => {
  res.send(`<h1>Server is running</h1>`);
});

app.use("/api/user", userRoutes);
app.use("/api/dish", dishRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${`http://localhost:${PORT}`.blue}`);
});
