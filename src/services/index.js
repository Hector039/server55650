import CartsService from "./carts.service.js";
import ProductsService from "./products.service.js";
import UsersService from "./users.service.js";
import TicketsService from "./tickets.service.js";

import { productsRepository, usersRepository, cartsRepository, ticketsRepository, } from "../dao/repository/factory.js";

const cartsService = new CartsService(cartsRepository);
const productsService = new ProductsService(productsRepository);
const usersService = new UsersService(usersRepository);
const ticketsService = new TicketsService(ticketsRepository);

export { cartsService, productsService, usersService, ticketsService };