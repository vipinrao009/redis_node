import express from "express";
import { getUser } from "../controller/user.js"; // Added .js extension

const router = express.Router();

router.get("/", getUser);

export default router;