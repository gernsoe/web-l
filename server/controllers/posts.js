import { execute_all, execute_step, enterDebugMode } from "../services/vm.js";
import { p_source } from "../services/pp.js";
var debug = false;

export const executeAll = async (req, res) => {
    try {
        debug = false;
        var result = await execute_all(req.body.code);
        console.log("Resolved request and updated registers: ", result);
        console.log(debug);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error });
    }
}

export const debugMode = async (req, res) => {
    try {
        debug = !debug;
        var result = await enterDebugMode(req.body.code);
        console.log("Server entered debug mode...");
        console.log(debug);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error });
    }
}

export const executeStep = async (req, res) => {
    try {
        if (debug===true) {
            var result = await execute_step();
            console.log(debug);
            console.log("Executed a single step and updated registers: ", result);
            res.status(200).json(result);
        } else {
            res.status(200).json("");
        }
    } catch (error) {
        res.status(400).json({ success: false, error });
    }
}

export const prettyPrint = async (req, res) => {
    try {
        var result = await p_source(req.body.code);
        console.log("Pretty printing: ", result);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error });
    }
}