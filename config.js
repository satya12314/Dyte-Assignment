import "dotenv/config";

export const MONGODB_URI = process.env.MONGODB_URI;
export const PORT = process.env.PORT | 3000;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
