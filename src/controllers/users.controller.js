import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "./../models/user.model.js";

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
    console.log("email", email);

    if (
        [userName, fullName, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "all filed is required");
    }

    const existedUser = User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User wih email or username exist");
    }

    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

export { registreUser };
