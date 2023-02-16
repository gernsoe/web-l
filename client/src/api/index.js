import axios from 'axios';

const allUrl = 'http://localhost:5000/all';

const debugUrl = 'http://localhost:5000/debug';

const stepUrl = 'http://localhost:5000/step';

const prettyUrl = 'http://localhost:5000/pretty';

export const executeAll = (post) => axios.post(allUrl, post);

export const debugMode = (post) => axios.post(debugUrl, post);

export const executeStep = (post) => axios.post(stepUrl, post);

export const prettyPrint = (post) => axios.post(prettyUrl, post);