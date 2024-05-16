import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import getEnvironment from "../config/process.config.js";
import { faker } from '@faker-js/faker';

const env = getEnvironment();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPass = (password, userPassword) => bcrypt.compareSync(password, userPassword);
export const generateToken = (user) => {
    const token = jwt.sign(user, env.USERCOOKIESECRET, { expiresIn: "1h" });
    return token;
};

export const productGenerator = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.commerce.isbn(5),
        price: faker.commerce.price({ min: 100 }),
        stock: Math.floor(Math.random() * 100),
        category: faker.helpers.arrayElement(['muebles', 'iluminación', 'ropa de cama',
        'electrodomésticos', 'cocina', 'tecnologia', 'accesorios', 'decoración']),
        thumbnails: [faker.image.url()],
        status: true
    };
};
