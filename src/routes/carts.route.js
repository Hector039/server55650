import { Router } from "express";
import CartsController from "../controllers/carts.controller.js";
import { cartsService, productsService } from "../services/index.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const cartsController = new CartsController(cartsService, productsService);
const router = Router();

router.get("/:cid", userPassJwt(), handlePolicies(["USER", "PREMIUM"]), cartsController.getCart);
router.delete("/product/:pid", userPassJwt(), handlePolicies(["USER", "PREMIUM"]), cartsController.deleteProductToCart);
router.delete("/:cid", userPassJwt(), handlePolicies(["USER", "PREMIUM"]), cartsController.deleteAllProducts);
router.put("/:cid/product/:pid", userPassJwt(), handlePolicies(["USER", "PREMIUM"]), cartsController.updateCart);
router.post("/addproduct/:pid", userPassJwt(), handlePolicies(["USER", "PREMIUM"]), cartsController.addProductAndQuantity);

export default router;