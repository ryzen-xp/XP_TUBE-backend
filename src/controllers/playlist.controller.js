import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlists.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, videoId } = req.body;
  const userId = req.user._id;
  
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const playlist = await Playlist.create({
    name,
    description,
    video: [videoId],
    owner: userId
  });

  return res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userPlaylists = await Playlist.find({ owner: userId });

  return res.status(200).json(new ApiResponse(200, userPlaylists, "Playlists retrieved successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res.status(200).json(new ApiResponse(200, playlist, "Playlist found"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist does not exist");
  }
  
  if (playlist.video.includes(videoId)) {
    return res.status(400).json({ message: "Video already in playlist" });
  }

  playlist.video.push(videoId);
  await playlist.save();

  return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist does not exist");
  }

  if (!playlist.video.includes(videoId)) {
    return res.status(400).json({ message: "Video not in playlist" });
  }

  playlist.video = playlist.video.filter(id => id.toString() !== videoId);
  await playlist.save();

  return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist does not exist");
  }

  await Playlist.deleteOne({ _id: playlistId });

  return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { name, description },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
};
