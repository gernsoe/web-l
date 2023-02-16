import express from 'express';
const router = express.Router();
import {executeAll} from '../controllers/posts.js';
router.post('/', executeAll);
export default router;