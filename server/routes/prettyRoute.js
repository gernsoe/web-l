import express from 'express';
const router = express.Router();
import {prettyPrint} from '../controllers/posts.js';
router.post('/', prettyPrint);
export default router;