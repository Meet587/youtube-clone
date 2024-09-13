import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const videos = await Video.find({ owner: userId });

        return res
            .status(200)
            .json(new ApiResponse(200, { videos }, "all videos"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "error while fetching video");
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description, isPublished } = req.body;

        const localVideoPath = req.files?.videoFile[0].path;
        const localThumbnailPath = req.files?.thumbnail[0].path;

        if (!localVideoPath || !localThumbnailPath) {
            throw new ApiResponse(
                400,
                "video or thumbnail local path missing."
            );
        }

        const videoUrl = await uploadOnCloudinary(localVideoPath);
        const thumbnailUrl = await uploadOnCloudinary(localThumbnailPath);

        if (!videoUrl.url) {
            throw new ApiResponse(500, "Error while uploading video.");
        }
        if (!thumbnailUrl.url) {
            throw new ApiResponse(500, "Error while uploading thumbnail.");
        }

        const newVideo = new Video({
            videoFile: videoUrl.url,
            video_public_id: videoUrl.public_id,
            thumbnail: thumbnailUrl.url,
            thumbnail_public_id: thumbnailUrl.public_id,
            title,
            description,
            duration: videoUrl?.duration ?? 1,
            isPublished,
            owner: req.user._id,
        });
        await newVideo.save();

        res.status(201).json({
            message: "Video uploaded successfully",
            video: newVideo,
        });
    } catch (error) {
        console.error("Error uploading video:", error);
        throw new ApiError(500, "error while uploading video", error);
    }
});
const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            throw new ApiError(400, "video id not provided.");
        }

        const video = await Video.findOne({ _id: videoId });

        if (!video) {
            throw new ApiError(401, "video not exist");
        }

        await deleteFromCloudinary(video.video_public_id, "video");
        await deleteFromCloudinary(video.thumbnail_public_id, "image");

        res.status(200).json(
            new ApiResponse(200, "video deleted successfully")
        );
    } catch (error) {
        console.log("error in deleting video", error);
        throw new ApiError(500, "error while deleting video.");
    }
});
const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            throw new ApiError(402, "video id not provided.");
        }

        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiResponse(
                403,
                "video not found with provided vide id."
            );
        }

        return res
            .status(200)
            .json(new ApiResponse(200, video, "video found."));
    } catch (error) {
        console.log("error in find video by id", error);
        throw new ApiError(500, "error while fetching video.");
    }
});
const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            throw new ApiError(402, "video id not provided.");
        }

        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiResponse(
                403,
                "video not found with provided vide id."
            );
        }

        const localThumbnailPath = req.file?.path;
        if (!localThumbnailPath) {
            throw new ApiError(400, "thumbnail file is missing");
        }

        await deleteFromCloudinary(video.thumbnail_public_id, "image");

        const savedThumbnail = await uploadOnCloudinary(localThumbnailPath);

        if (!savedThumbnail.url) {
            throw new ApiError(500, "Error while uploading thumbnail.");
        }

        const updateVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    thumbnail: savedThumbnail.url,
                    thumbnail_public_id: savedThumbnail.public_id,
                },
            },
            { new: true }
        );

        return res
            .status(203)
            .json(
                new ApiResponse(
                    200,
                    updateVideo,
                    "thumbnail update successfully."
                )
            );
    } catch (error) {
        console.log("error while updating thumbnail.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "error while updating video thumbnail.",
            error
        );
    }
});
const togglePublishStatus = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { isPublic } = req.body;

        if (!videoId) {
            throw new ApiError(402, "video id not provided.");
        }

        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished: isPublic,
                },
            },
            { new: true }
        );

        res.status(200).json(new ApiResponse(200, "public status modified."));
    } catch (error) {
        console.log("error while updating video publish status.", error);
        throw new ApiError(
            500,
            "error while updating video publish status.",
            error
        );
    }
});

export {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
};
