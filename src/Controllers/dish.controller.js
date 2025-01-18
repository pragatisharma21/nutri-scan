import Dishes from "../Models/dish.schema.js";
import uploadToIMagekit from "../Utils/uploadImagekit.js";
import QRCode from "qrcode";
import QRCodegenerator from "qrcode-generator";
const PLACEHOLDER_IMAGE =
  "https://ik.imagekit.io/tr0zrdazo/catering-item-placeholder-704x520.png?updatedAt=1737145812636";

const uploadQRCodeToImageKit = async (newDish) => {
  try {
    const qrCode = QRCodegenerator(0, "M");
    qrCode.addData(newDish.toString());

    qrCode.make();

    const qrCodeDataUrl = qrCode.createDataURL(20);

    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const file = {
      buffer: buffer,
      originalname: `QR-${newDish._id}.png`,
    };

    const uploadResponse = await uploadToIMagekit(file);
    return uploadResponse;
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
      creatorId: req.body.userId,
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
