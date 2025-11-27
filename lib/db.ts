import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log("MongoDB connected:", db.connection.host);
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};