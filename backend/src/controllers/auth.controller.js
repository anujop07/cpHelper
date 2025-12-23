import { registerUser,loginUser } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
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
