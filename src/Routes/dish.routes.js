import express from "express";
import { createDish } from "../Controllers/dish.controller.js";

const router = express.Router();

router.post("/", createDish);

export default router