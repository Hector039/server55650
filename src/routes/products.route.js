import { Router } from "express";
import ProductsController from "../controllers/products.controller.js";
import { productsService, usersService } from "../services/index.js";
import getEnvironment from "../config/process.config.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";
import { uploads } from "../middlewares/multer.js";

const productsController = new ProductsController(productsService, usersService)
const env = getEnvironment();
const router = Router();

const persistenceProducts = env.PERSISTENCE === "DATABASE" ? productsController.getProductsPaginated : productsController.getProductsFs;

router.param("pid", productsController.param);
router.get("/", userPassJwt(), handlePolicies(["PUBLIC"]), persistenceProducts);
router.get("/:pid", handlePolicies(["PUBLIC"]), productsController.getProductById);
router.get("/searchproducts/:text", userPassJwt(), handlePolicies(["ADMIN", "PREMIUM"]), productsController.searchProducts);
router.post("/", userPassJwt(), handlePolicies(["ADMIN", "PREMIUM"]), uploads.array("prodPic", 3), productsController.saveProduct);
router.put("/:pid", userPassJwt(), handlePolicies(["ADMIN", "PREMIUM"]), productsController.updateProduct);
router.delete("/:pid", userPassJwt(), handlePolicies(["ADMIN", "PREMIUM"]), productsController.deleteProduct);

export default router;