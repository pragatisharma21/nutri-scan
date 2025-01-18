import express from "express";
import {
  createDish,
  updateDish,
  deleteDish,
  getDishById,
  getDishesByUserId,
  getDishByName,
  getAllDishes,
} from "../Controllers/dish.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
const router = express.Router();

router.post("/", authMiddleware, createDish);
router.get("/getDishByUserId/:id", authMiddleware, getDishesByUserId);
router.get("/getDishByName", getDishByName);

router.put("/updateDishById/:id", updateDish);
router.delete("/deleteDishById/:id",  deleteDish);
router.get("/getDishById/:id", getDishById);
router.get("/getAllDishes", getAllDishes);

export default router;
