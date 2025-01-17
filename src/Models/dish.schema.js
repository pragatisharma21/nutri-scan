import mongoose from "mongoose";

const DishesSchema = new mongoose.Schema({
    dishName: {
        type: String, required: true, unique: true
    } ,
    description: {type: String},
    image: {type: String},
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