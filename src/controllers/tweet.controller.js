import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "./../models/tweet.models.js";

const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const tweet = await Tweet.find({ owner: userId });

        return res.json(new ApiResponse(200, tweet));
    } catch (error) {
        console.log("error in get all tweets", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "error while fetching your tweets.",
            error
        );
    }
});

const createTweet = asyncHandler(async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            throw new ApiError(404, "message not found.");
        }

        const tweet = new Tweet({
            content: message,
            owner: req.user._id,
        });
        await tweet.save();

        return res.json(
            new ApiResponse(200, tweet, "tweet created successfully.")
        );
    } catch (error) {
        console.log("error in making tweets.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "there was an error while making your tweet.",
            error
        );
    }
});

const updateTweet = asyncHandler(async (req, res) => {
    try {
        const { message } = req.body;
        const { tweetId } = req.params;
        if (!message) {
            throw new ApiError(404, "message not found.");
        }
        if (!tweetId) {
            throw new ApiError(404, "provide tweet id.");
        }

        const tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                content: message,
            },
            { new: true }
        );

        return res.json(
            new ApiResponse(200, tweet, "tweet updated successfully.")
        );
    } catch (error) {
        console.log("error in updating tweets.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "there was an error while updating your tweet.",
            error
        );
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;
        if (!tweetId) {
            throw new ApiError(404, "provide tweet id.");
        }

        const tweet = await Tweet.findByIdAndDelete(tweetId);

        return res.json(
            new ApiResponse(200, tweet, "tweet updated successfully.")
        );
    } catch (error) {
        console.log("error in updating tweets.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "there was an error while updating your tweet.",
            error
        );
    }
});

export { getUserTweets, createTweet, updateTweet, deleteTweet };
