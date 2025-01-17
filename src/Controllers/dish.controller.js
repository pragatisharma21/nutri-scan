import Dishes from "../Models/dish.schema.js";
import uploadToIMagekit from "../Utils/uploadImagekit.js";
import QRCode from "qrcode";
import QRCodegenerator from "qrcode-generator"

const PLACEHOLDER_IMAGE =
  "https://ik.imagekit.io/tr0zrdazo/catering-item-placeholder-704x520.png?updatedAt=1737145812636";

const uploadQRCodeToImageKit = async (newDish) => {
  try {

    const qrCode = QRCodegenerator(0, "M");
    qrCode.addData(newDish.toString());

    qrCode.make();

    const qrCodeDataUrl = qrCode.createDataURL(20);

    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

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
