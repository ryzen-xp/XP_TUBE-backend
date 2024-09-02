import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/Cloudianry.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/Apiresponse.js"; // Corrected typo

import jwt from "jsonwebtoken";

// Function to generate access and refresh tokens
const generateAccessRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId); // Changed to findById
    const accessToken = user.generateAccessToken(); // Assuming this is an instance method
    const refreshToken = user.refreshAccessToken(); // Assuming this is an instance method
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
  }
};

// Register user function
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "Username or email already in use!");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file required");
  }

  const avatarImage = await uploadonCloudinary(avatarLocalPath);
  const coverImage = await uploadonCloudinary(coverImagePath);

  if (!avatarImage) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    avatarImage: avatarImage.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully!")
  );
});

// Login user function
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Email or username is required to login!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new ApiError(404, "User not found in database. Please register first.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password); // Assuming this is an instance method
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password.");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshTokens( user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    );
});

// Export the functions
export { registerUser, loginUser };
