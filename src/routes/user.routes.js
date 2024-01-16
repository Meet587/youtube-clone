import { Router } from "express";
import {
    logOutUser,
    loginUser,
    registreUser,
} from "../controllers/users.controller.js";
import { upload } from "./../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registreUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJwt, logOutUser);

export default router;
