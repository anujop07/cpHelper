import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    // Debug Log
    console.log('Auth Check:', { 
      path: req.path,
      hasToken: !!token, 
      authHeader: req.headers.authorization 
    });

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({
      success: false,
      message: "Not authorized, token invalid"
    });
  }
};
