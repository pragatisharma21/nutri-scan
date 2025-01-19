import Dishes from "../Models/dish.schema.js";
import {
  uploadToIMagekit,
  deleteFromImageKitByUrl,
} from "../Utils/imagekitOperations.js";
import qr from "qrcode";
import color from "colors";
import mongoose from "mongoose";

const PLACEHOLDER_IMAGE =
  "https://ik.imagekit.io/tr0zrdazo/catering-item-placeholder-704x520.png?updatedAt=1737145812636";

const uploadQRCodeToImageKit = async (newDish) => {
  try {
    const dataString = JSON.stringify(newDish);

    const qrCodeBuffer = await qr.toBuffer(dataString);

    const uploadedFile = await uploadToIMagekit({
      buffer: qrCodeBuffer,
      originalname: `qr-${newDish._id}.png`,
    });

    return uploadedFile;
  } catch (error) {
    console.error(`Error uploading QR Code:`, error);
    return null;
  }
};

export const createDish = async (req, res, next) => {
  const { dishName, ingredients, description } = req.body;
  console.log(dishName, ingredients)
  try {
    let fileUrl = PLACEHOLDER_IMAGE;

    if (req.file) {
      fileUrl = await uploadToIMagekit(req.file);
    }

    const newDish = new Dishes({
      creatorId: req.user.id,
      dishName: dishName,
      dishImage: fileUrl,
      ingredients,
      description
    });

    newDish.qrCode = await uploadQRCodeToImageKit(newDish);

    await newDish.save();

    res.status(201).json({ message: "Dish created Successfully!", newDish });
  } catch (error) {
    next(error);
  }
};

export const updateDish = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { dishName, ingredients } = req.body;

    const existingDish = await Dishes.findById(id);
    if (!existingDish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    let updatedImageUrl = existingDish.dishImage;
    if (req.file) {
      const newImageUrl = await uploadToIMagekit(req.file);

      if (
        existingDish.dishImage &&
        existingDish.dishImage !== PLACEHOLDER_IMAGE
      ) {
        await deleteFromImageKitByUrl(existingDish.dishImage);
      }

      updatedImageUrl = newImageUrl;
    }

    const updateData = {
      dishName: dishName || existingDish.dishName,
      ingredients: ingredients || existingDish.ingredients,
      dishImage: updatedImageUrl,
    };

    const updatedDish = await Dishes.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });


    if (dishName || ingredients) {
      const newQRCode = await uploadQRCodeToImageKit(updatedDish);
      updatedDish.qrCode = newQRCode;
      await updatedDish.save();
    }

    res.status(200).json({
      message: "Dish updated successfully",
      dish: updatedDish,
    });
  } catch (error) {
    console.error("Error updating dish:", error.message);
    next(error);
  }
};


export const getDishById = async (req, res, next) => {
  const { id } = req.params;
  console.log(`id: ${id} typeof: ${typeof id}`);
  try {
    const dish = await Dishes.findById(id);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }
    res.status(200).json({ dish });
  } catch (error) {
    next(error);
  }
};

export const deleteDish = async (req, res, next) => {
  const { id } = req.params;
  try {
    const dish = await Dishes.findByIdAndDelete(id);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }
    res.status(200).json({ message: "Dish deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getDishesByUserId = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const allDishes = await Dishes.aggregate([
      {
        $match: {
          creatorId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          ingredients: 0,
        },
      },
    ]);

    if (!allDishes) {
      return res.status(404).json({ message: "No dishes posted by user" });
    }

    res.status(200).json(allDishes);
  } catch (error) {
    next(error);
  }
};

export const getDishByName = async (req, res, next) => {
  try {
    const { dishName } = req.body;

    const dishesData = await Dishes.find({
      dishName: { $regex: dishName, $options: "i" },
    });

    res.status(200).json(dishesData);
  } catch (err) {
    next(err);
  }
};

export const getAllDishes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const dishes = await Dishes.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Dishes.countDocuments();

    res.json({
      dishes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};
