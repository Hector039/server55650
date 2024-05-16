import fs from "fs";
import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";
import { generateProductErrorInfo } from "../tools/customErrors/info.js";
import mailer from "../tools/mailer.js";

export default class ProductsController {
    constructor(prodservice, userservice) {
        this.productsService = prodservice;
        this.usersService = userservice;
    }

    param = async (req, res, next, pid) => {//param
        try {
            const productById = await this.productsService.getProductById(pid);
            if (productById === null) {
                req.product = null;
                CustomError.createError({
                    message: `Producto ID: ${pid} no encontrado.`,
                    cause: generateProductErrorInfo(null),
                    code: TErrors.NOT_FOUND,
                });
            }
            req.product = productById;
            next();
        } catch (error) {
            next(error);
        }
    }

    searchProducts = async (req, res, next) => {
        const { text } = req.params;
        try {
            let products = await this.productsService.searchProducts(text);
            res.status(200).send(products);
        } catch (error) {
            next(error)
        }
    }

    getProductsFs = async (req, res, next) => {
        const { limit, sort, category, page } = req.query;
        try {

            const options = {
                limit: limit === undefined ? 3 : parseInt(limit),
                sort: sort === undefined ? "todos" : sort,
                category: category === undefined ? "todos" : category
            }

            let allProducts = await this.productsService.getAllProducts();

            if (options.category !== "todos") {
                let prodFilterCategory = allProducts.filter(product => product.category === options.category);
                allProducts = prodFilterCategory;
            }
            if (options.sort !== "todos") {
                allProducts.sort(function (a, b) {
                    if (options.sort === "asc") {
                        return (a.price - b.price);
                    } else if (options.sort === "desc") {
                        return (b.price - a.price);
                    }
                });
            }
            let payload = allProducts.filter((data, index) => index < options.limit);
            const user = req.user
            res.status(200).send({ user, payload });
        } catch (error) {
            next(error)
        }
    }

    getProductsPaginated = async (req, res, next) => {//get
        const { limit, sort, page, category } = req.query;
        try {
            let options = {
                limit: parseInt(limit),
                page: page === undefined ? 1 : parseInt(page),
            };
            if (sort !== "todos") {
                options["sort"] = { price: sort };
            };
            const find = category === "todos" ? {} : { category: category };
            const report = await this.productsService.paginateProduct(find, options);
            res.status(200).send({
                payload: report.docs,
                totalPages: report.totalPages,
                prevPage: report.prevPage,
                nextPage: report.nextPage,
                page: report.page,
                hasPrevPage: report.hasPrevPage,
                hasNextPage: report.hasNextPage,
                pagingCounter: report.pagingCounter,
                user: req.user
            });
        } catch (error) {
            next(error)
        }
    }

    getProductById = async (req, res, next) => {//get
        try {
            const productById = req.product;
            res.status(200).send(productById);
        } catch (error) {
            next(error)
        }
    }

    saveProduct = async (req, res, next) => {//post
        const { title, description, code, price, stock, category, thumbnail, owner } = req.body;
        const prodPic = req.files;
        try {
            if (!title || !description || !code || !price || !stock || !category) {
                CustomError.createError({
                    message: `Datos no recibidos o inválidos.`,
                    cause: generateProductErrorInfo({ title, description, code, price, stock, category, thumbnail }),
                    code: TErrors.INVALID_TYPES,
                });
            }
            const prodCodeExist = await this.productsService.getProductByCode(code);
            if (prodCodeExist) {
                CustomError.createError({
                    message: `El código ${code} del producto ingresado ya existe.`,
                    cause: generateProductErrorInfo(null),
                    code: TErrors.CONFLICT,
                });
            }
            const thumbnails = thumbnail === "" ? [] : [thumbnail];
            const newProduct = await this.productsService.saveProduct({
                title,
                description,
                code,
                price,
                stock,
                category,
                thumbnails,
                owner
            });
            if (prodPic !== undefined && prodPic.length !== 0) {
                const updatedProduct = await this.productsService.getProductByCode(newProduct.code);
                const filesPaths = [];
                prodPic.forEach(pic => {
                    fs.renameSync(`${pic.destination}/${pic.filename}`, `${pic.destination}/${updatedProduct._id}-${pic.filename}`)
                    filesPaths.push(`http://localhost:8080/${updatedProduct._id}-${pic.filename}`)
                });
                await this.productsService.updateProductThumbnail(updatedProduct._id, filesPaths);
            }
            res.status(200).send(newProduct);
        } catch (error) {
            next(error)
        }
    }

    updateProduct = async (req, res, next) => {//put
        const { title, description, code, price, stock, category, thumbnails, status, owner } = req.body;
        try {
            if (!title || !description || !code || !price || !stock || !category || !status) {
                CustomError.createError({
                    message: `Datos no recibidos o inválidos.`,
                    cause: generateProductErrorInfo({ title, description, code, price, stock, category, thumbnails, status }),
                    code: TErrors.INVALID_TYPES
                });
            }
            const user = await this.usersService.getUserById(owner)
            if (user.role === "premium" && req.product.owner.toString() !== user._id.toString()) {
                CustomError.createError({
                    message: `Solo el administrador puede modificar este producto.`,
                    cause: generateProductErrorInfo(user.role),
                    code: TErrors.INVALID_TYPES
                });
            }
            const prodCodeexist = await this.productsService.getProductByCode(code);
            if (prodCodeexist) {
                CustomError.createError({
                    message: `El código ${code} del producto ingresado ya existe.`,
                    cause: generateProductErrorInfo({ title, description, code, price, stock, category, thumbnails, status }),
                    code: TErrors.CONFLICT
                });
            }

            const productId = req.product._id;
            const newProduct = { title, description, code, price, stock, category, thumbnails, status, owner };
            const response = await this.productsService.updateProduct(productId, newProduct);
            res.status(200).send(response);
        } catch (error) {
            next(error)
        }
    }

    deleteProduct = async (req, res, next) => {
        const owner = req.user.id
        try {
            const user = await this.usersService.getUserById(owner)
            if (user.role === "premium" && req.product.owner.toString() !== user._id.toString()) {
                CustomError.createError({
                    message: `Solo el administrador o el creador puede eliminar este producto.`,
                    cause: generateProductErrorInfo(user.role),
                    code: TErrors.INVALID_TYPES
                });
            }
            const productId = req.product._id;
            await this.productsService.deleteProduct(productId);
            if (user.role === "admin" && req.product.owner.toString() !== user._id.toString()) {
                const userOwner = await this.usersService.getUserById(req.product.owner);
                if (!userOwner) {
                    CustomError.createError({
                        message: `El creador de este producto no existe actualmente en la base de datos. No se envió el mail de notificación.`,
                        cause: generateProductErrorInfo(userOwner),
                        code: TErrors.NOT_FOUND
                    });
                }
                await mailer({ mail: userOwner.email, name: userOwner.firstName }, `Te informamos que tu producto de código ${req.product.code} fue eliminado por un administrador.`)
            }
            res.status(200).send();
        } catch (error) {
            next(error)
        }
    }

}