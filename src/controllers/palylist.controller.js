import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "./../models/playlist.model.js";
import { Video } from "./../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    try {
        const { name, description, video } = req.body;
        if (!name) {
            throw new ApiError(404, "provide name of playlist");
        }
        if (!description) {
            throw new ApiError(404, "provide description of playlist");
        }
        if (video.length < 1) {
            throw new ApiError(
                404,
                "provide at least one video to make playlist."
            );
        }

        const playlist = new Playlist({
            name,
            description,
            video,
            owner: req.user._id,
        });

        await playlist.save();

        return res.json(new ApiResponse(200, playlist, "playlist created."));
    } catch (error) {
        console.log("error while making playlist", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "error while making playlist",
            error
        );
    }
});

const getPlaylistById = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;
        if (!playlistId) {
            throw new ApiError(404, "playlistId not provided.");
        }

        const playlist = await Playlist.findById(playlistId);
        console.log("playlist", playlist);
        if (!playlist) {
            throw new ApiError(404, "playlist not found.");
        }

        return res.json(new ApiResponse(200, playlist, "playlist found."));
    } catch (error) {
        console.log("error while getting playlist.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "error while getting playlist.",
            error
        );
    }
});
const updatePlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;
        const data = req.body;

        if (!playlistId) {
            throw new ApiError(404, "playlistId not provided.");
        }

        const playlist = await Playlist.findByIdAndUpdate(playlistId, data, {
            new: true,
        });
        if (!playlist) {
            throw new ApiError(404, "playlist not found.");
        }

        return res.json(new ApiResponse(200, playlist, "playlist updated."));
    } catch (error) {
        console.log("error while updating playlist.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "error while updating playlist.",
            error
        );
    }
});
const deletePlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;

        if (!playlistId) {
            throw new ApiError(404, "playlistId not provided.");
        }

        const playlist = await Playlist.findByIdAndDelete(playlistId);
        if (!playlist) {
            throw new ApiError(404, "playlist not found.");
        }

        return res.json(new ApiResponse(200, playlist, "playlist deleted."));
    } catch (error) {
        console.log("error while deleting playlist.", error);
        return new ApiError(
            error.statusCode || 500,
            error.message || "error while deleting playlist."
        );
    }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            throw new ApiError(404, "provide user id.");
        }

        const playlist = await Playlist.find({ owner: userId });
        if (!playlist) {
            throw new ApiError(400, "playlist not found for provided user.");
        }

        return res.json(new ApiResponse(200, playlist, "playlist fetched."));
    } catch (error) {
        console.log("error while fetching playlist for user.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "error while fetching playlist for user.",
            error
        );
    }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;

        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "video not found.");
        }

        const isVideoPresent = await Playlist.findOne({
            _id: playlistId,
            video: videoId, // Check if videoId is in the videos array
        });

        if (isVideoPresent) {
            return res.json(
                new ApiResponse(
                    200,
                    isVideoPresent,
                    "video already present in playlist."
                )
            );
        }

        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $push: { video: videoId } },
            { new: true }
        );
        if (!playlist) {
            throw new ApiError(404, "playlist not found.");
        }

        return res.json(
            new ApiResponse(200, playlist, "video added to playlist.")
        );
    } catch (error) {
        console.log("error while adding video to playlist.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "error while adding video to playlist.",
            error
        );
    }
});
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;

        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "video not found.");
        }

        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $pull: { video: videoId } },
            { new: true }
        );
        if (!playlist) {
            throw new ApiError(404, "playlist not found.");
        }

        return res.json(
            new ApiResponse(200, playlist, "video removed from playlist.")
        );
    } catch (error) {
        console.log("error while removing video from playlist.", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "error while removing video from playlist.",
            error
        );
    }
});

export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
};
