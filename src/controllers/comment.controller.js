import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!isValidObjectId(videoId)) {
            return res.status(400).json({ message: "invalid video id." });
        }
        const comments = await Comment.find({
            video: videoId,
            owner: req.user._id,
        });
        return res.status(200).json({ message: "comments fetched.", comments });
    } catch (error) {
        console.log("error while fetching comments.", error);
        return res
            .status(500)
            .json({ message: "error while fetching comments." });
    }
});

const addComment = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { commentMessage } = req.body;
        if (!isValidObjectId(videoId)) {
            return res.status(400).json({ message: "invalid video id." });
        }
        const comment = new Comment({
            video: videoId,
            comment: commentMessage,
            owner: req.user._id,
        });
        await comment.save();

        return res.status(200).json({ message: "comment added.", comment });
    } catch (error) {
        console.log("error while adding comment.", error);
        return res.status(500).json({ message: "error while adding comment." });
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.prams;
        if (!isValidObjectId(commentId)) {
            return res.status(400).json({ message: "invalid comment id." });
        }

        const deletedComment = await Comment.findByIdAndDelete(commentId);

        return res
            .status(200)
            .json({ message: "comment deleted.", deletedComment });
    } catch (error) {
        console.log("error while deleting comment.", error);
        return res
            .status(500)
            .json({ message: "error while deleting comment." });
    }
});

const updateComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const { commentMessage } = req.body;
        if (!isValidObjectId(commentId)) {
            return res.status(400).json({ message: "invalid comment id." });
        }
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(400).json({ message: "comment not found." });
        }
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            {
                content: commentMessage,
            },
            { new: true }
        );

        return res
            .status(200)
            .json({ message: "comment updated Successfully.", updatedComment });
    } catch (error) {
        console.log("error while updating comment.", error);
        return res
            .status(500)
            .json({ message: "error while updating comment." });
    }
});

export { getVideoComments, addComment, deleteComment, updateComment };
