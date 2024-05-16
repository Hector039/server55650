import { productGenerator } from "../tools/utils.js";

export default class FakerProductsController {

    fakerProducts = async (req, res, next) => {
        try {
            let mockProducts = []
            const quantityProducts = 100
            let n = 0
            while (n < quantityProducts) {
                n++
                let fakerProduct = productGenerator()
                mockProducts.push(fakerProduct)
            }
            res.status(200).send({
                quantity: mockProducts.length,
                data: mockProducts
            });
        } catch (error) {
            next(error)
        }
    }
}