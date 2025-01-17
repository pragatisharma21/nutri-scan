import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_URI, {});
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;