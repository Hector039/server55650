import { Router } from "express";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import FakerProductsController from "../controllers/fakerProducts.controller.js";

const fakerController = new FakerProductsController()

const router = Router();

router.get("/", handlePolicies(["PUBLIC"]), fakerController.fakerProducts);

export default router;