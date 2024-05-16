import __dirname from "../tools/utils.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import { Router } from "express";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const router = Router();

const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "E-commerce",
            version: "1.0.0",
            description: "Documentación apis e-commerce con swagger.",
            contact: {
                name: "Hector Mandril",
                email: "elector22@gmail.com"
            },
            servers: ["https://server55650-production.up.railway.app/"]
        }
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}

const specs = swaggerJsdoc(swaggerOptions);

router.use("/", handlePolicies(["PUBLIC"]), swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

export default router;



