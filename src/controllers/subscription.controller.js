import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    // Check if channelId is a valid ObjectId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Find the channel by ID
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Check if subscription exists
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    if (existingSubscription) {
        // If already subscribed, unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res.status(200).json(new ApiResponse(200, "Successfully unsubscribed from the channel"));
    } else {
        // If not subscribed, subscribe
        await Subscription.create({ subscriber: subscriberId, channel: channelId });
        return res.status(201).json(new ApiResponse(201, "Successfully subscribed to the channel"));
    }
});

// Controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Check if channelId is valid
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Fetch all subscribers of the channel
    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "name email");
    return res.status(200).json(new ApiResponse(200, subscribers, "Successfully fetched all subscribers"));
});

// Controller to return channel list to which the user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;

    // Check if subscriberId is valid
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    // Fetch all channels the user is subscribed to
    const channelList = await Subscription.find({ subscriber: subscriberId }).populate("channel", "name email");
    return res.status(200).json(new ApiResponse(200, channelList, "Successfully fetched subscribed channels"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
