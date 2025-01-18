import Dishes from "../Models/dish.schema.js";
import uploadToIMagekit from "../Utils/uploadImagekit.js";
import qr from "qrcode";

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

    console.log(uploadedFile)
    return uploadedFile

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
