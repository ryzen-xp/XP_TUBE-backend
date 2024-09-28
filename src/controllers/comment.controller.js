import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find({ videoId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    if (!comments.length) {
        throw new ApiError(400, "No comments found for this video");
    }

    return res.status(200).json(new ApiResponse(200, comments, "Successfully retrieved all video comments"));
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { comment } = req.body;
    const { videoId } = req.params;
    const ownerId = req.user?._id;

    if (!comment) {
        throw new ApiError(400, "Invalid comment");
    }

    const newComment = await Comment.create({ content: comment, videoId, owner: ownerId });

    if (!newComment) {
        throw new ApiError(400, "Comment could not be saved");
    }

    return res.status(200).json(new ApiResponse(200, newComment, "Comment successfully added to video"));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;

    if (!comment) {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content: comment }, { new: true });

    if (!updatedComment) {
        throw new ApiError(400, "Failed to update comment");
    }

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment successfully updated"));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const result = await Comment.deleteOne({ _id: commentId });

    if (result.deletedCount === 0) {
        throw new ApiError(400, "Comment not found or could not be deleted");
    }

    return res.status(200).json(new ApiResponse(200, "Comment successfully deleted"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
