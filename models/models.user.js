import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["DEVELOPER", "SR_DEVELOPER", "ADMIN"],
    default: "DEVELOPER",
  },
  password: {
    type: String,
    required: true,
  },
});
const User = mongoose.model("Users", userSchema);
export { User };
