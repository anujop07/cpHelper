import express from 'express';

import {updateHandles} from "../controllers/profile.controller.js";
import { protect } from '../middleware/auth.middleware.js';


const router =express.Router();
// console.log("In profile routes");
router.put('/handles', protect, updateHandles);
// Add a test route to verify the router is working
// router.get('/test', (req, res) => res.json({ message: 'Profile route working' }));

export default router;

