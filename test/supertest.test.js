import supertest from "supertest";
import { expect } from "chai";
import { Command } from "commander";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserServiceFs from "../src/dao/repository/fs/users.repository.js";
import CartServiceFs from "../src/dao/repository/fs/carts.repository.js";
import models from "../src/dao/models/index.js";
import UserService from "../src/dao/repository/db/users.repository.js";
import CartService from "../src/dao/repository/db/carts.repository.js";

const userServiceDb = new UserService(models.user);
const cartServiceDb = new CartService(models.cart);
const userServiceFs = new UserServiceFs();
const cartServiceFs = new CartServiceFs();

dotenv.config({ path: "src/config/.env.development" });

const application = new Command();
application
    .option("--persistence <persistence>", "Tipo de persistencia", "DATABASE")
application.parse();
const options = application.opts();

const requester = supertest("http://localhost:8080");

let temporalUser;
let testProduct;
let testProductTwo;
let testCookie;

describe("Testing de integración Ecommerce", () => {
    after(async function () {
        switch (options.persistence.toUpperCase()) {
            case "DATABASE":
                await mongoose.connect(process.env.DB_URL);
                console.log("Mongo connected");
                try {
                    await userServiceDb.deleteUser(temporalUser.id);
                    console.log("Usuario de prueba eliminado.");
                    await cartServiceDb.deleteCart(temporalUser.cartId);
                    console.log("Carrito de prueba eliminado.");
                } catch (error) {
                    console.log(error);
                }
                console.log("Test finalizado.");
                await mongoose.disconnect();
                break;
            case "FILESYSTEM":
                try {
                    await userServiceFs.deleteUser(temporalUser.id);
                    console.log("Usuario de prueba eliminado.");
                    await cartServiceFs.deleteCart(temporalUser.cartId);
                    console.log("Carrito de prueba eliminado.");
                } catch (error) {
                    console.log(error);
                }
                console.log("Test finalizado.");
                break;
            default: throw new Error("La persistencia ingresada no existe");
        }
    });
    describe("Testing sessions de usuarios", () => {
        it("Endpoint POST debe devolver un error por falta de datos de usuario al momento del registro", async () => {

            const testUser = {
                firstName: "hector",
                lastName: "mandrile",
                password: "1234"
            }
            const { statusCode, ok } = await requester.post("/api/sessions/signin").send(testUser);
            expect(statusCode).to.be.eql(401);
            expect(ok).to.be.false;
        })
        it("Endpoint POST debe registrar un usuario", async () => {
            const testUser = {
                firstName: "hector",
                lastName: "mandrile",
                email: "elector22@hotmail.com",
                password: "1234"
            }
            temporalUser = testUser.email;
            const result = await requester.post("/api/sessions/signin").send(testUser);
            expect(result.statusCode).to.be.eql(200);
            expect(result.ok).to.be.true;
        })
        it("Endpoint GET debe verificar un usuario en la base de datos y loguearse con una cookie", async () => {
            const result = await requester.get(`/api/sessions/userverification/${temporalUser}`).send();
            const cookieResult = result.headers["set-cookie"][0];
            expect(cookieResult).to.be.ok;
            let cookie = {
                name: cookieResult.split("=")[0],
                value: cookieResult.split("=")[1]
            }
            expect(cookie.name).to.be.eql("cookieToken")
            expect(cookie.value).to.be.ok;
        })
        it("Endpoint GET debe deslogear un usuario y eliminar cookieToken", async () => {
            const { statusCode } = await requester.get(`/api/sessions/logout`).send();
            const result = await requester.get(`/api/sessions/premium/${temporalUser}`).send();
            expect(statusCode).to.be.eql(200);
            const cookieResult = result.headers["set-cookie"][0];
            let cookie = { name: cookieResult.split("=")[0] }
            expect(cookie.name).to.not.be.eql("cookieToken");
        })
        it("Endpoint POST debe devolver error de usuario al ingresar un dato incorrecto", async () => {
            const testUser = { email: temporalUser, password: "passErróneo" }
            const { statusCode, ok } = await requester.post("/api/sessions/login").send(testUser);
            expect(statusCode).to.be.eql(401);
            expect(ok).to.be.false;
        })
        it("Endpoint POST debe loguear un usuario y setear una cookie", async () => {
            const testUser = { email: temporalUser, password: "1234" }
            const { statusCode, ok, _body } = await requester.post("/api/sessions/login").send(testUser);
            expect(statusCode).to.be.eql(200);
            expect(ok).to.be.true;
            expect(_body).to.have.property("id");
            expect(_body).to.have.property("cartId");
            expect(_body).to.have.property("email").to.be.a("string");
            await requester.get(`/api/sessions/logout`).send();
        })
        it("Endpoint GET debe setear una cookie temporal tempCookie y el endopint POST debe cambiar la contraseña correctamente", async () => {
            const result = await requester.get(`/api/sessions/passrestoration/${temporalUser}`).send();
            const cookieResult = result.headers["set-cookie"][0];
            expect(cookieResult).to.be.ok;
            let cookie = {
                name: cookieResult.split("=")[0],
                value: cookieResult.split("=")[1]
            }
            expect(cookie.name).to.be.eql("tempCookie")
            expect(cookie.value).to.be.eql("temporalCookie; Max-Age");
            const testUser = { email: temporalUser, password: "4321" }
            const setNewPass = await requester.post("/api/sessions/forgot").set("Cookie", [result.headers["set-cookie"][0]]).send(testUser);
            expect(setNewPass.statusCode).to.be.eql(200);
            expect(setNewPass.ok).to.be.true;
        })
        it("Endpoint POST debe logear al usuario con el nuevo password", async () => {
            const testUser = { email: temporalUser, password: "4321" }
            const { statusCode, ok, _body } = await requester.post("/api/sessions/login").send(testUser);
            expect(statusCode).to.be.eql(200);
            expect(ok).to.be.true;
            expect(_body).to.have.property("email").to.be.a("string");
            temporalUser = _body;
            await requester.get(`/api/sessions/logout`).send();
        })
        it("Endpoint GET debe cambiar la propiedad role a premium o user según corresponda después de simular entregar todos los documentos", async () => {
            const testUser = { email: temporalUser.email, password: "4321" }
            const result = await requester.post("/api/sessions/login").send(testUser);
            if (options.persistence.toUpperCase() === "DATABASE") {
                await mongoose.connect(process.env.DB_URL);
                try {
                    await userServiceDb.updateField(result._body.id, "documents", { "name": "idDoc", "reference": "src/data/documents" });
                    await userServiceDb.updateField(result._body.id, "documents", { "name": "adressDoc", "reference": "src/data/documents" });
                    await userServiceDb.updateField(result._body.id, "documents", { "name": "accountDoc", "reference": "src/data/documents" });
                } catch (error) {
                    console.log(error);
                }
                await mongoose.disconnect();
            }else {
                try {
                    await userServiceFs.updateField(result._body.id, "documents", { "name": "idDoc", "reference": "src/data/documents" });
                    await userServiceFs.updateField(result._body.id, "documents", { "name": "adressDoc", "reference": "src/data/documents" });
                    await userServiceFs.updateField(result._body.id, "documents", { "name": "accountDoc", "reference": "src/data/documents" });
                } catch (error) {
                    console.log(error);
                }
            }
            const { statusCode, ok, _body } = await requester.get(`/api/sessions/premium/${temporalUser.email}`).set("Cookie", [result.headers["set-cookie"][0]]).send();
            expect(statusCode).to.be.eql(200)
            expect(ok).to.be.true
            expect(_body).to.have.property("userNewRole")
            expect(_body.userNewRole).to.be.oneOf(["user", "premium"]);
            await requester.get(`/api/sessions/logout`).send();
            const loginAsAPremium = await requester.post("/api/sessions/login").send(testUser);
            testCookie = loginAsAPremium.headers["set-cookie"][0];
        })
    })
    describe("Testing de productos", () => {
        it("Endpoint GET debe devolver los productos según querys", async () => {
            const querys = { limit: 3, page: 1, sort: "todos", category: "todos" }
            const { statusCode, _body } = await requester.get(`/api/products/?limit=${querys.limit}&page=${querys.page}&sort=${querys.sort}&category=${querys.category}`).send();
            expect(statusCode).to.be.eql(200);
            expect(_body.payload).to.be.an("array");
            expect(_body).to.have.property("user");
        })
        it("Endpoint POST debe devolver error por falta de datos requeridos", async () => {
            const testProduct = { description: "Mesa de madera", price: 12000, stock: 5, category: "muebles" }
            const { statusCode, _body } = await requester.post(`/api/products`).set("Cookie", [testCookie]).send(testProduct);
            expect(statusCode).to.be.eql(400);
            expect(_body.code).to.be.eql(2)
        })
        it("Endpoint POST debe crear y guardar un producto", async () => {
            const testNewProduct = { title: "Mesa", description: "Mesa de madera", code: "mes001", price: 12000, stock: 5, category: "muebles", owner: temporalUser.id }
            const { statusCode, _body } = await requester.post(`/api/products`).set("Cookie", [testCookie]).send(testNewProduct);
            testProduct = _body;
            expect(statusCode).to.be.eql(200);
            expect(_body).to.have.property("_id");
            expect(_body).to.have.property("code");
        })
        it("Endpoint GET debe devolver el producto o los productos según el nombre enviado", async () => {
            const { statusCode, _body } = await requester.get(`/api/products/searchproducts/${testProduct.title}`).set("Cookie", [testCookie]).send();
            expect(statusCode).to.be.eql(200);
            expect(_body).to.be.an("array");
        })
        it("Endpoint GET debe devolver error por ID erróneo de producto", async () => {
            const { statusCode, ok, _body } = await requester.get(`/api/products/idInexistente`).send();
            expect(_body.code).to.be.oneOf([0, 4]);
            expect(statusCode).to.be.oneOf([404, 500])
            expect(ok).to.be.false;
        })
        it("Endpoint GET debe devolver el producto del ID enviado", async () => {
            const { statusCode, ok, _body } = await requester.get(`/api/products/${testProduct._id}`).send();
            expect(statusCode).to.be.eql(200)
            expect(ok).to.be.true;
            expect(_body).to.be.an("object").and.to.have.property("_id");
        })
        it("Endpoint PUT debe devolver error por enviar el mismo code", async () => {
            const productToUpdate = { title: "Mesa", description: "Mesa de madera para oficina", code: "mes001", price: 12000, stock: 10, category: "muebles", status: true, owner: temporalUser.id }
            const { statusCode, _body } = await requester.put(`/api/products/${testProduct._id}`).set("Cookie", [testCookie]).send(productToUpdate);
            expect(statusCode).to.be.eql(409);
            expect(_body.code).to.be.equal(5);
        })
        it("Endpoint PUT debe devolver el producto modificado por su ID", async () => {
            const productToUpdate = { title: "Mesa", description: "Mesa de madera para oficina", code: "mes002", price: 12000, stock: 10, category: "muebles", status: true, owner: temporalUser.id }
            await requester.put(`/api/products/${testProduct._id}`).set("Cookie", [testCookie]).send(productToUpdate);
            const { statusCode, _body } = await requester.get(`/api/products/${testProduct._id}`).send();
            expect(statusCode).to.be.eql(200)
            expect(_body).to.have.property("_id")
            expect(_body).to.have.property("code");
        })
        it("Endpoint DELETE debe eliminar el producto por su ID", async () => {
            await requester.delete(`/api/products/${testProduct._id}`).set("Cookie", [testCookie]).send();
            const { statusCode, _body } = await requester.get(`/api/products/${testProduct._id}`).send();
            expect(_body.cause).to.be.equal("Producto inexistente en la base de datos.");
            expect(statusCode).to.be.eql(404);
        })
    })
    describe("Testing de carts", () => {
        it("Endpoint GET debe obtener el carrito por su ID", async () => {
            const { statusCode, ok, _body } = await requester.get(`/api/carts/${temporalUser.cartId}`).set("Cookie", [testCookie]).send();
            expect(statusCode).to.be.eql(200);
            expect(ok).to.be.true;
            expect(_body).to.be.an("object").and.to.have.property("_id");
        })
        it("Endpoint POST debe agregar un producto al carrito por ID", async () => {
            await requester.get(`/api/sessions/logout`).send();
            const testAdmin = { email: "adminCoder@coder.com", password: "123" }
            const loginAsAdmin = await requester.post("/api/sessions/login").send(testAdmin);
            const testNewProduct = { title: "Mesa", description: "Mesa de madera", code: "mes001", price: 12000, stock: 5, category: "muebles", owner: loginAsAdmin._body.id }
            const result = await requester.post(`/api/products`).set("Cookie", [loginAsAdmin.headers["set-cookie"][0]]).send(testNewProduct);
            const testNewProducttwo = { title: "Silla", description: "Silla de madera", code: "sil111", price: 1200, stock: 5, category: "muebles", owner: loginAsAdmin._body.id }
            const resultTwo = await requester.post(`/api/products`).set("Cookie", [loginAsAdmin.headers["set-cookie"][0]]).send(testNewProducttwo);
            testProduct = result._body;
            testProductTwo = resultTwo._body;
            await requester.get(`/api/sessions/logout`).send();
            const testUser = { email: temporalUser.email, password: "4321" }
            const loginAsPremium = await requester.post("/api/sessions/login").send(testUser);
            testCookie = loginAsPremium.headers["set-cookie"][0]
            const { statusCode, _body } = await requester.post(`/api/carts/addproduct/${result._body._id}`).set("Cookie", [testCookie]).send({ quantity: 5 });
            await requester.post(`/api/carts/addproduct/${resultTwo._body._id}`).set("Cookie", [testCookie]).send({ quantity: 3 });
            expect(statusCode).to.be.eql(200)
            expect(_body).to.have.property("_id")
            expect(_body).to.have.property("products").and.to.be.an("array");
            expect(_body.products[0]).to.have.property("product");
        })
        it("Endpoint DELETE debe devolver error por inexistencia del producto en carrito", async () => {
            const { statusCode, _body } = await requester.delete(`/api/carts/product/idInexistente`).set("Cookie", [testCookie]).send();
            expect(_body.code).to.be.oneOf([0, 4]);
            expect(statusCode).to.be.oneOf([404, 500])
        })
        it("Endpoint DELETE debe eliminar el producto del carrito por su ID", async () => {
            const { statusCode, _body } = await requester.delete(`/api/carts/product/${testProduct._id}`).set("Cookie", [testCookie]).send();
            const productInCart = _body.products.find(prod => prod._id === testProduct._id);
            expect(statusCode).to.be.eql(200);
            expect(_body).to.be.an("object");
            expect(_body.products).to.be.an("array");
            expect(productInCart).to.be.eql(undefined);
        })
        it("Endpoint DELETE debe eliminar todos los productos del carrito por su ID", async () => {
            const { statusCode, _body } = await requester.delete(`/api/carts/${temporalUser.cartId}`).set("Cookie", [testCookie]).send();
            await requester.get(`/api/sessions/logout`).send();
            const testAdmin = { email: "adminCoder@coder.com", password: "123" }
            const loginAsAdmin = await requester.post("/api/sessions/login").send(testAdmin);
            await requester.delete(`/api/products/${testProduct._id}`).set("Cookie", [loginAsAdmin.headers["set-cookie"][0]]).send();
            await requester.delete(`/api/products/${testProductTwo._id}`).set("Cookie", [loginAsAdmin.headers["set-cookie"][0]]).send();
            await requester.get(`/api/sessions/logout`).send();
            expect(statusCode).to.be.eql(200);
            expect(_body).to.be.an("object");
            expect(_body.products).to.be.an("array");
            expect(_body.products.length).to.be.eql(0);
        })
    })
})

