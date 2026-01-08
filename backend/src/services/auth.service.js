import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { generateToken } from "../utils/jwt.js";
export const registerUser = async (userData) => {
  // console.log("Registering insideee service  with data:", userData);
  const { username, email, password } = userData;
    
  if(!username || !email || !password) {
    throw new Error("All fields are required");
  }     

  const existingUser = await User.findOne({ $or: [ { email }, { username } ] });
  console.log("Existing user check:", existingUser);
    if (existingUser) {
      // console.log("User already exists with email or username:", email, username);
        throw new Error("User with given email or username already exists");
    }

  const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

  const savedUser = await newUser.save();
    return savedUser;
}



export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  };
};
