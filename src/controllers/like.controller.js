import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "./../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!isValidObjectId(videoId)) {
            res.status(400).json({ message: "invalid video id." });
        }
        const like = await Like.findOne({
            video: videoId,
            likedBy: req.user._id,
        });
        if (like) {
            await Like.findByIdAndDelete(like._id);
            return res.status(200).json({ message: "video disliked." });
        } else {
            const newLike = new Like({
                video: videoId,
                likedBy: req.user._id,
            });
            await like.save();
            return res.status(200).json({ message: "video liked.", newLike });
        }
    } catch (error) {
        return res
            .status(500)
            .json({ message: "error while toggle you video like." });
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        if (!isValidObjectId(commentId)) {
            res.status(400).json({ message: "invalid comment id." });
        }
        const like = await Like.findOne({
            comment: commentId,
            likedBy: req.user._id,
        });
        if (like) {
            await Like.findByIdAndDelete(like._id);
            return res.status(200).json({ message: "comment disliked." });
        } else {
            const newLike = new Like({
                comment: commentId,
                likedBy: req.user._id,
            });
            await like.save();
            return res.status(200).json({ message: "comment liked.", newLike });
        }
    } catch (error) {
        return res
            .status(500)
            .json({ message: "error while toggle you comment like." });
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;
        if (!isValidObjectId(tweetId)) {
            res.status(400).json({ message: "invalid tweet id." });
        }
        const like = await Like.findOne({
            tweet: tweetId,
            likedBy: req.user._id,
        });
        if (like) {
            await Like.findByIdAndDelete(like._id);
            return res.status(200).json({ message: "tweet disliked." });
        } else {
            const newLike = new Like({
                tweet: tweetId,
                likedBy: req.user._id,
            });
            await like.save();
            return res.status(200).json({ message: "tweet liked.", newLike });
        }
    } catch (error) {
        return res
            .status(500)
            .json({ message: "error while toggle you tweet like." });
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const likedVideos = await Like.find({ likedBy: req.user._id });

        return res.status(200).json({ message: "liked videos.", likedVideos });
    } catch (error) {
        console.log("error while fetching liked videos.", error);
        return res
            .status(500)
            .json({ message: "error while fetching liked videos.", error });
    }
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
