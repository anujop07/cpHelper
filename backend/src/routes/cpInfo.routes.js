import express from 'express';
import {getCpInfoFromUser} from "../controllers/cpInfo.controller.js";
import { protect } from '../middleware/auth.middleware.js';
const router =express.Router();

// router.get('/me', protect, getCpInfoFromUser);
// console.log("In cpInfo routes");
router.get('/me',protect,getCpInfoFromUser);
// async function testfunction(req,res)
// {
//     res.json({ message: 'CP Info route working' });
// }

export default router;