import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "./config.js";

const CreateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: "4h",
  });
};

const VerifyToken = async (token) => {
  const decodedToken = await jwt.verify(token, JWT_SECRET_KEY);
  return decodedToken;
};

export { CreateToken, VerifyToken };
