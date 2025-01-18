import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type: String, required: true,lowercase: true},
    email:{type: String, required: true, unique:true, lowercase: true},
    password:{type: String},  
})
 

const User = mongoose.model("User", userSchema)
export default User;