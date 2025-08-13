import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  console.log("User authentication middleware triggered");

  const token = req.headers.token;

  console.log("Token received:", token ? "Token present" : "No token");

  if (!token) {
    console.log("No token found in headers or cookies");
    return res.status(401).json({
      success: false,
      message: "No authentication token provided. Please log in again.",
    });
  }

  try {
    console.log("Verifying token with JWT_SECRET");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded.id);

    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      console.log("User not found for decoded ID:", decoded.id);
      return res.status(404).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    console.log("User authenticated successfully:", user.name);
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please log in again.",
    });
  }
};
export { userAuth };
