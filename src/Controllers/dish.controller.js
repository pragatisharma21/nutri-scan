import Dishes from "../Models/dish.schema.js";
import uploadToIMagekit from "../Utils/uploadImagekit.js";
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
  const { dishName, ingredients } = req.body;
  try {
    let fileUrl = PLACEHOLDER_IMAGE;

    if (req.file) {
      fileUrl = await uploadToIMagekit(req.file);
    }

    const newDish = new Dishes({
      creatorId: req.user.id,
      dishName,
      dishImage: fileUrl,
      ingredients,
    });

    newDish.qrCode = await uploadQRCodeToImageKit(newDish);

    await newDish.save();

    res.status(201).json({ message: "Dish created Successfully!", newDish });
  } catch (error) {
    next(error);
  }
};

//api to perform update of dish
export const updateDish = async (req, res, next) => {
  const { id } = req.params;
  const { dishName, ingredients } = req.body;
  // console.log(req.body);
  // console.log(req.params);
  try {
    // Find the existing dish
    const existingDish = await Dishes.findById(id);
    if (!existingDish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    //Check if user has permission to update
    // if (existingDish.creatorId.toString() !== req.body.userId) {
    //   return res
    //     .status(403)
    //     .json({ message: "Not authorized to update this dish" });
    // }

    // Handle image upload if new image is provided
    let updatedImageUrl = existingDish.dishImage;
    if (req.file) {
      updatedImageUrl = await uploadToIMagekit(req.file);
    }

    // Prepare update data
    const updateData = {
      dishName: dishName || existingDish.dishName,
      ingredients: ingredients || existingDish.ingredients,
    };

    // Update the dish
    const updatedDish = await Dishes.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // Generate and upload new QR code if dish data changed
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
    // Handle unique constraint violation
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A dish with this name already exists",
      });
    }
    next(error);
  }
};

//api to get a dish by id
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
//api to detele a dish by id
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
        }
      },
      {
        $project: {
          ingredients: 0, 
        },
      }
    ]);

    if (!allDishes) {
      return res.status(404).json({ message: "No dishes posted by user" });
    }

    res.status(200).json(allDishes);
  } catch (error) {
    next(error);
  }
};

export const getDishByName = async(req, res, next)=>{
  try {
    const {dishName} = req.body;

    const dishesData = await Dishes.find({
      dishName: {$regex: dishName, $options: "i"}
    });

    res.status(200).json(dishesData)
  } catch (err) {
    next(err)
  }
}
