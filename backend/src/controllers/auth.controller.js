import { registerUser,loginUser } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    console.log("Registering user with data:", req.body); 
    const user = await registerUser(req.body);
    console.log("User registered successfully:", user);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: data.token,
      user: data.user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
