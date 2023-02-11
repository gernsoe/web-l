import express from 'express';
const app = express();
import cors from 'cors';
app.use(express.json());
app.use(cors());
import postRoutes from './routes/posts.js'
app.use('/posts', postRoutes)
app.listen(8000)