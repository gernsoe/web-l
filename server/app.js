import express from 'express';
const app = express();
import cors from 'cors';
app.use(express.json());
app.use(cors());
import allRoute from './routes/executeAll.js'
import debugRoute from './routes/debugMode.js'
import stepRoute from './routes/executeStep.js'
import prettyRoute from './routes/prettyRoute.js'
app.use('/all', allRoute);
app.use('/debug', debugRoute);
app.use('/step', stepRoute);
app.use('/pretty', prettyRoute);
app.listen(5000)