import express from 'express';
import connectDB from './src/Config/db.config.js';
import dotenv from 'dotenv';
import CORS from "cors";
import requestLogger from './src/Middlewares/logger.middleware.js';
import errorHandler from './src/Middlewares/errorhandler.middleware.js';
import colors from "colors"

import userRoutes from "./src/Routes/user.routes.js"
import dishRoutes from "./src/Routes/dish.routes.js"

dotenv.config();

const app = express();

app.use(requestLogger)

const PORT = process.env.PORT || 8088;

connectDB();

app.use(express.json());

app.use(
    CORS({
        origin: ["http://localhost:5173", process.env.CLIENT_URL],
        credentials: true,
    })
);

app.use("/api/user", userRoutes)
app.use("/api/dish", dishRoutes)

app.use(errorHandler)


app.listen(PORT, () => {
    console.log(`Server running on port ${`http://localhost:${PORT}`.blue}`);
});