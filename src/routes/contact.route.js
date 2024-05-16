import { Router } from "express";
import ContactController from "../controllers/contact.controller.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const contactController = new ContactController();

const router = Router();

router.post("/", handlePolicies(["PUBLIC"]), contactController.sendContactMail);

export default router;