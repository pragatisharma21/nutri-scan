import mongoose from "mongoose";

const DishesSchema = new mongoose.Schema({
    creatorId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    dishName: {
        type: String, required: true, unique: true
    } ,
    description: {type: String},
    dishImage: {type: String},
    qrCode: {type: String, unique: true},
    ingredients: [
        {
            name: {type: String, required: true},
            quantity: {type:Number, required: true},
            unit: {type: String, required: true},
            caloriesPerUnit: {type: Number, required: true}
        }
    ]
});

const Dishes = mongoose.model("Dishes", DishesSchema);

export default Dishes