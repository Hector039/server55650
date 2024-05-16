import { Router } from "express";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import LoggerTestController from "../controllers/loggerTest.controller.js";

const loggerTestController = new LoggerTestController()
const router = Router();

router.get("/", handlePolicies(["PUBLIC"]), loggerTestController.logTest);

export default router;