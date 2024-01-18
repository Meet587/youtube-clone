import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "./../models/user.model.js";
import Jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while genrating access and refresh token"
        );
    }
};

const registreUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user alredy exist - username, email
    // check for image, check for avtar
    // upload them to cloudaniry, avtar
    // create user object, create user entry in db
    // remove password and refresh token field from responce
    // check for user creration
    // return res

    const { userName, fullName, email, password } = req.body;
    // console.log("email", email);

    if (
        [userName, fullName, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "all filed is required");
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User wih email or username exist");
    }

    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath = "";

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.legnth > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0]?.path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });

    const createdUSer = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUSer) {
        throw new ApiError(
            500,
            "some thing went wrong while registring the user"
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUSer, "user registerd successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // req.body data
    // data validation
    // check data formate
    // check if data is present in DB or not
    // check password
    // generate asscess token from refresh token
    // send respone

    const { email, userName, password } = req.body;

    if (!(email || userName)) {
        throw new ApiError(400, "user name or email is required");
    }

    const user = await User.findOne({
        $and: [{ email }, { userName }],
    });

    if (!user) {
        throw new ApiError(404, "User dose not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );
    console.log(refreshToken);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const option = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "USer Logged in successfully"
            )
        );
});

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        { new: true }
    );

    const option = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, "User loged out."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshTOken =
        req.cookie.refreshToken || req.body.refreshToken;
    if (!incomingRefreshTOken) {
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = Jwt.verify(
            incomingRefreshTOken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshTOken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is Expired");
        }

        const options = { httpOnly: true, secure: true };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token");
        console.log(error);
    }
});

export { registreUser, loginUser, logOutUser, refreshAccessToken };
