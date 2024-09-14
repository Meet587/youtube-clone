import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getSubscribedChannels = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;
        if (!isValidObjectId(channelId)) {
            throw new ApiError(400, "invalid chanel id.");
        }
        const subscribedChannels = await Subscription.find({
            subscriber: channelId,
        });

        if (!subscribedChannels) {
            throw new ApiError(404, "No subscribed channels found.");
        }

        return res.json(
            new ApiResponse(
                200,
                subscribedChannels,
                "subscribed channels fetched."
            )
        );
    } catch (error) {
        console.log("error while fetching your subscribed channels.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "error while fetching your subscribed channels."
        );
    }
});

const toggleSubscription = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;
        if (!isValidObjectId(channelId)) {
            throw new ApiError(400, "invalid chanel id.");
        }
        const subscription = await Subscription.findOne({
            subscriber: req.user._id,
            channel: channelId,
        });

        if (!subscription) {
            throw new ApiError(404, "channel not found.");
        }
        if (subscription) {
            await Subscription.findByIdAndDelete(subscription._id);
            return res.json(
                new ApiResponse(200, subscription, "Unsubscribed successfully")
            );
        } else {
            const newSubscription = new Subscription({
                subscriber: subscriberId,
                channel: channelId,
            });
            await newSubscription.save();
            return res.json(
                new ApiResponse(200, subscription, "Subscribed successfully")
            );
        }
    } catch (error) {
        console.log("Error toggling subscription.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Error toggling subscription."
        );
    }
});
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        const { subscriberId } = req.params; // The channel owner ID

        const subscribers = await Subscription.find({ channel: subscriberId })
            .populate("subscriber", "name") 
            .exec();

        if (!subscribers) {
            return res.status(404).json({ message: "No subscribers found" });
        }

        res.status(200).json(subscribers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subscribers", error });
    }
});

export { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers };
