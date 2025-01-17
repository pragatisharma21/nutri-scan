
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import User from "../Models/user.model.js";

 export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const isAvailable = await User.findOne({ email });
    if (isAvailable) {
      return res.status(400).json({ message: "user is already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "user created successfully", newUser });
  } catch (error) {
    next(error)
  }
};
  

export const login = async(req, res)=>{
    try {
        const { email, password} = req.body
        const isAvailable = await User.findOne({email})
        if(!isAvailable){
            return res.status(404).json({message: "user is not found"})

        }
        const isValidPassword = await bcrypt.compare(password, isAvailable.password)
        if(!isValidPassword){
            res.status(400).json({message: "incorrect credentials"})
        }

        const token = jwt.sign({
            id: isAvailable._id,
            username: isAvailable.name,
            email: isAvailable.email
        }, process.env.JWT_SECRET, {expiresIn: "1h"});

        res.status(200).json({token})

    } catch (error) {
        next(error)
    }
}
