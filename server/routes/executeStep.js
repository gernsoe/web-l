import express from 'express';
const router = express.Router();
import {executeStep} from '../controllers/posts.js';
router.post('/', executeStep);
export default router;