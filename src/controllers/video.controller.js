import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/Cloudianry.js";

// Get all videos with pagination, sorting, and query
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "asc", userId } = req.query;

  // const user = await User.findById(userId);
  // if (!user) {
  //   throw new ApiError(404, "User not found");
  // }

  const videos = await Video.find({
    title: new RegExp(query, "i"),
    owner: user._id,
  })
    .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res.status(200).json(new ApiResponse(200, videos, "All videos fetched successfully"));
});

// Publish a new video and store its URL in the database
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const filePath = req.files?.videofile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnailfile?.[0]?.path;

  if (!title) {
    throw new ApiError(400, "Title is required to upload a video");
  }
  if (!filePath || !thumbnailPath) {
    throw new ApiError(400, "Both video and thumbnail files are required");
  }

  // Upload files to Cloudinary
  const cloudVideo = await uploadonCloudinary(filePath);
  const cloudThumbnail = await uploadonCloudinary(thumbnailPath);

  if (!cloudVideo || !cloudThumbnail) {
    throw new ApiError(500, "Failed to upload files to Cloudinary");
  }

  // Create video entry in the database
  const newVideo = await Video.create({
    title,
    videoFile: cloudVideo.url,
    thumbnail: cloudThumbnail.url,
    description,
    duration: 17, // Placeholder for actual duration
    isPublished: true,
    owner: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, newVideo, "Successfully uploaded video and saved to the database"));
});

// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

// Update video details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnailPath } = req.body;

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (thumbnailPath) updateFields.thumbnail = thumbnailPath;

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateFields, { new: true });

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found or update failed");
  }

  return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// Delete video by ID
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const deleted = await Video.deleteOne({ _id: videoId });

  if (deleted.deletedCount === 0) {
    throw new ApiError(404, "Video not found or failed to delete");
  }

  return res.status(200).json(new ApiResponse(200, "Video deleted successfully"));
});

// Toggle video publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const toggled = await Video.updateOne(
    { _id: videoId },
    [{
      $set: { isPublished: { $not: "$isPublished" } }
    }]
  );

  if (toggled.nModified === 0) {
    throw new ApiError(400, "Failed to toggle publish status");
  }

  return res.status(200).json(new ApiResponse(200, "Publish status toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
};
