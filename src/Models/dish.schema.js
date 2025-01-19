import mongoose from "mongoose";

const DishesSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dishName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: { type: String, lowercase: true },
    dishImage: { type: String },
    qrCode: { type: String, unique: true },
    ingredients: [
      {
        name: { type: String, lowercase: true },
        quantity: { type: Number, },
        unit: { type: String, },
        caloriesPerUnit: { type: Number, },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Dishes = mongoose.model("Dishes", DishesSchema);

export default Dishes;
