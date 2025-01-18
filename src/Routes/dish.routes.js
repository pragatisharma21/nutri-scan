import express from "express";
import {
  createDish,
  updateDish,
  deleteDish,
  getDishById,
} from "../Controllers/dish.controller.js";
const router = express.Router();

router.post("/", createDish);
router.put("/:id", updateDish);
router.delete("/:id", deleteDish);
router.get("/:id", getDishById);
export default router;
