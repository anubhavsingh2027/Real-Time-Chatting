import express from "express";

const router = express.Router();

import {portfolioNewUser } from "../controllers/notRequiredThisProject.controller.js";


router.get('/newUser/:websiteName',portfolioNewUser);

export default router;