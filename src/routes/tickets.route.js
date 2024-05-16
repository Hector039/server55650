import { Router } from "express";
import TicketsController from "../controllers/tickets.controller.js";
import { ticketsService, cartsService } from "../services/index.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const ticketsController = new TicketsController(ticketsService, cartsService)
const router = Router();

router.get("/createpreference/:cid", userPassJwt(), handlePolicies(["USER", "PREMIUM"]), ticketsController.createPreference);
router.get("/success", userPassJwt(), handlePolicies(["PUBLIC"]), ticketsController.orderSuccess);
router.get("/:userEmail", userPassJwt(), handlePolicies(["USER", "PREMIUM"]), ticketsController.getUserTickets);

export default router;