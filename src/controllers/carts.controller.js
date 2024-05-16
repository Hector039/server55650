import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";
import { generateProductErrorInfo, generateCartErrorInfo } from "../tools/customErrors/info.js";

export default class CartsController {
    constructor(cartsService, productsService) {
        this.cartsService = cartsService;
        this.productsService = productsService;
    }

    getCart = async (req, res, next) => {//get
        const { cid } = req.params;
        try {
            const cartById = await this.cartsService.getCartById(cid);
            if (cartById === null) {
                CustomError.createError({
                    cause: generateCartErrorInfo(),
                    message: `Carrito ID: ${cid} no encontrado.`,
                    code: TErrors.NOT_FOUND
                });
            };
            res.status(200).send(cartById);
        } catch (error) {
            next(error)
        }
    }

    deleteProductToCart = async (req, res, next) => {//delete
        const { pid } = req.params;
        try {
            const productId = await this.productsService.getProductById(pid);
            const cart = await this.cartsService.getCartById(req.user.cartId);
            if (cart === null) {
                CustomError.createError({
                    message: `Carrito ID: ${req.user.cartId} no encontrado.`,
                    cause: generateCartErrorInfo(),
                    code: TErrors.NOT_FOUND,
                });
            }

            if (productId === null) {
                CustomError.createError({
                    message: `Producto ID: ${pid} no encontrado.`,
                    cause: generateProductErrorInfo(productId),
                    code: TErrors.NOT_FOUND,
                });
            }

            const productExistsInCart = cart.products === undefined ? cart.find(prod => prod.product._id === parseInt(pid)) : cart.products.find(prod => prod.product._id == pid);

            if (productExistsInCart === undefined) {
                CustomError.createError({
                    message: `Producto ID:${pid} inexistente en el carrito.`,
                    cause: generateCartErrorInfo(),
                    code: TErrors.NOT_FOUND,
                });
            }

            await this.cartsService.deleteProductToCart(req.user.cartId, productExistsInCart);
            const cartUpdated = await this.cartsService.getCartById(req.user.cartId);
            res.status(200).send(cartUpdated);
        } catch (error) {
            next(error)
        }
    }

    deleteAllProducts = async (req, res, next) => {//delete
        const { cid } = req.params;
        try {
            const cart = await this.cartsService.getCartById(cid);
            if (cart === null) {
                CustomError.createError({
                    message: `Carrito ID: ${cid} no encontrado.`,
                    cause: generateCartErrorInfo(),
                    code: TErrors.NOT_FOUND,
                });
            }
            const cartUpdated = await this.cartsService.deleteAllProducts(cid);
            res.status(200).send(cartUpdated);
        } catch (error) {
            next(error)
        }
    }

    updateCart = async (req, res, next) => {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        try {
            if (!quantity) {
                CustomError.createError({
                    message: `No se recibió cantidad.`,
                    cause: generateCartErrorInfo(),
                    code: TErrors.INVALID_TYPES,
                });
            }

            const cart = await this.cartsService.getCartById(cid);

            if (cart === null) {
                CustomError.createError({
                    message: `Carrito ID: ${cid} no encontrado.`,
                    cause: generateCartErrorInfo(),
                    code: TErrors.NOT_FOUND,
                });
            }

            const productId = await this.productsService.getProductById(pid);

            if (productId === null) {
                CustomError.createError({
                    message: `Producto ID: ${pid} no encontrado.`,
                    cause: generateProductErrorInfo(null),
                    code: TErrors.NOT_FOUND,
                });
            }

            const productInCart = cart.products.find(prod => prod.product._id == pid);

            if (productInCart === undefined) {
                CustomError.createError({
                    message: `Producto ID: ${pid} inexistente en el carrito.`,
                    cause: generateCartErrorInfo(),
                    code: TErrors.NOT_FOUND,
                });
            }

            const modifiedCart = await this.cartsService.addProductAndQuantityToCart(cid, pid, quantity);
            res.status(200).send(modifiedCart);
        } catch (error) {
            next(error)
        }
    }

    addProductAndQuantity = async (req, res, next) => {
        const { pid } = req.params;
        const { quantity } = req.body;
        try {
            if (!quantity) {
                CustomError.createError({
                    message: `No se recibió cantidad.`,
                    cause: generateCartErrorInfo(),
                    code: TErrors.INVALID_TYPES,
                });
            }

            const userCart = req.user.cartId;
            const cart = await this.cartsService.getCartById(userCart);

            if (cart === null) {
                CustomError.createError({
                    message: `Carrito ID: ${cid} no encontrado.`,
                    cause: generateCartErrorInfo(),
                    code: TErrors.NOT_FOUND,
                });
            }

            const productId = await this.productsService.getProductById(pid);

            if (productId === null) {
                CustomError.createError({
                    message: `Producto ID: ${pid} no encontrado.`,
                    cause: generateProductErrorInfo(null),
                    code: TErrors.NOT_FOUND,
                });
            }
            if(req.user.role === "premium" && productId.owner.toString() === req.user.id.toString()){
                CustomError.createError({
                    message: `No puedes agregar al carrito un producto creado por tí.`,
                    cause: generateProductErrorInfo(null),
                    code: TErrors.CONFLICT,
                });
            }

            const updatedCart = await this.cartsService.addProductAndQuantityToCart(userCart, pid, quantity);
            res.status(200).send(updatedCart);
        } catch (error) {
            next(error)
        }
    }
}