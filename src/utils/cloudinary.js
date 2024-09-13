import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // file hae been uploaded successfully
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally save temp file as the upload opration failed
        throw error;
    }
};

const deleteFromCloudinary = async (public_id, type) => {
    try {
        const deletedAssets = await cloudinary.uploader.destroy(public_id, {
            resource_type: type,
        });

        return true;
    } catch (error) {
        console.log("error on deleting assets on cloudnery", error);
        throw error;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
