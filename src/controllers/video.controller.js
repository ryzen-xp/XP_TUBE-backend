import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/Cloudianry.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination
  const  user = await User.findById(userId);
  if(!user){
    throw new ApiError(404 , "User Not found");
  }
  const videos =  await Video.find(
    {
      title : new  RegExp(query , "i"),
      owner : user._id
    }
   
  
).sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
.skip((page - 1) * limit)
.limit(limit);


});

// publice new  videos on  cloudinary  and  thumbnail  on server  and storeing  url in database  in video schema

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;


  if (!title) {
    throw new ApiError(400, "Title is required to upload a video");
  }

  const filePath = req.files?.videofile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnailfile?.[0]?.path;

  if (!filePath && !thumbnailPath) {
    throw new ApiError(400, "File or thumbnail path not found to upload on Cloudinary");
  }

  // Upload video and thumbnail to Cloudinary
  const cloudVideo = await uploadonCloudinary(filePath);
  const cloudThumbnail = await uploadonCloudinary(thumbnailPath);

  if (!cloudVideo && !cloudThumbnail) {
    throw new ApiError(500, "Failed to upload files to Cloudinary");
  }

  // Create a new video entry in the database
  const newVideo = await Video.create({
    title,
    videoFile: cloudVideo.url,
    thumbnail: cloudThumbnail.url,
    description,
    duration: 17, 
    isPublished: true,
    owner: req.user._id, 
  });


  return res.status(200).json(new ApiResponse(200, newVideo, "Successfully uploaded video and saved in database"));

});


const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}