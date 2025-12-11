import express from "express";

const router = express.Router();

import {portfolioNewUser } from "../controllers/portfolio.controller.js";


router.get('/newUser/:websiteName',portfolioNewUser);

export default router;