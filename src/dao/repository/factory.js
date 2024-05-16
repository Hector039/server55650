import getEnvironment from "../../config/process.config.js";
import mongoLoader from "../../loaders/mongoose.js";
import models from "../models/index.js";

const env = getEnvironment();

export let usersRepository, productsRepository, cartsRepository, ticketsRepository;

switch (env.PERSISTENCE) {
    case "DATABASE":
        const monogLoader = await mongoLoader(env.DB_URL);
        console.log(monogLoader);

        const { default: usersDB } = await import("../repository/db/users.repository.js");
        usersRepository = new usersDB(models.user);

        const { default: productsDB } = await import("../repository/db/products.repository.js");
        productsRepository = new productsDB(models.product);
        
        const { default: cartsDB } = await import("../repository/db/carts.repository.js");
        cartsRepository = new cartsDB(models.cart);

        const { default: ticketsDB } = await import("../repository/db/tickets.repository.js");
        ticketsRepository = new ticketsDB(models.ticket, models.user, models.product, models.cart);

        break;

    case "FILESYSTEM":
        const { default: usersFS } = await import("../repository/fs/users.repository.js");
        usersRepository = new usersFS();

        const { default: productsFS } = await import("../repository/fs/products.repository.js");
        productsRepository = new productsFS();

        const { default: cartsFS } = await import("../repository/fs/carts.repository.js");
        cartsRepository = new cartsFS();

        const { default: ticketsFS } = await import("../repository/fs/tickets.repository.js");
        ticketsRepository = new ticketsFS();

        break;

    default: throw new Error("La persistencia ingresada no existe");
    
}
