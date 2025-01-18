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

router.put("/:id", updateDish);
router.delete("/:id", deleteDish);
router.get("/:id", getDishById);
router.get("/", getAllDishes);

export default router;
