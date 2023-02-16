import express from 'express';
const router = express.Router();
import {debugMode} from '../controllers/posts.js';
router.post('/', debugMode);
export default router;