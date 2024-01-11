import { Router } from "express";
import { registreUser } from "../controllers/users.controller.js";

const router = Router();

router.route("/register").post(registreUser);

export default router;
