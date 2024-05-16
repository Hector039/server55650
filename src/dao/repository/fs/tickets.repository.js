import fs from "fs";
import UserService from "./users.repository.js";
import ProductService from "./products.repository.js";
import CartService from "./carts.repository.js";
import moment from "moment";

const productService = new ProductService();
const userService = new UserService();
const cartService = new CartService();

class Ticket {
    constructor(id, payment_id, purchase_datetime, transaction_amount, payer, status, payment_type) {
        this._id = id;
        this.payment_id = payment_id
        this.purchase_datetime = purchase_datetime;
        this.transaction_amount = transaction_amount;
        this.payer = payer;
        this.status = status;
        this.payment_type = payment_type;
    }
}

export default class TicketsService {
    #path;
    #ultimoId = 0;

    constructor() {
        this.#path = "src/dao/repository/fs/data/archivoTickets.json";
        this.#setUltimoId();
    }

    async preferenceItems(cart) {
        try {
            let avaliableProducts = []
            let products = await productService.getAllProducts();
            cart.products.forEach(cartProd => {
                products.forEach(prod => {
                    if (cartProd.product._id === prod._id) {
                        if (prod.stock >= cartProd.quantity) avaliableProducts.push(cartProd)
                    }
                })
            })
            if (avaliableProducts.length > 0) {
                const preferenceItems = avaliableProducts.map(prod => {
                return {
                    title: prod.product.title,
                    quantity: Number(prod.quantity),
                    unit_price: Number(prod.product.price),
                    currency_id: "ARS"
                }
            })
            return preferenceItems
            }
            return null
        } catch (error) {
            throw(error)
        }
    }

    async purchaseTicket(email, status, paymentId, paymentType) {
        try {
            let unavaliableProducts = []
            let avaliableProducts = []
            const userByEmail = await userService.getUser(email)
            const cart = await cartService.getCartById(userByEmail.cart)
            let products = await productService.getAllProducts();

            cart.products.forEach(cartProd => {
                products.forEach(prod => {
                    if (cartProd.product._id === prod._id) {
                        if (prod.stock >= cartProd.quantity) {
                            prod.stock = prod.stock - cartProd.quantity
                            avaliableProducts.push(cartProd)
                        } else if (prod.stock <= cartProd.quantity) {
                            unavaliableProducts.push(cartProd.product)
                        }
                    }
                })
            })

            await productService.guardarProductos(products);
            const newTicket = {
                payment_id: paymentId,
                purchase_datetime: (moment().format("DD MM YYYY h:mm:ss a").replaceAll(" ", "_")),
                transaction_amount: avaliableProducts.length === 0 ? 0 : (avaliableProducts.reduce((acc, prodPrice) => acc += (prodPrice.product.price * prodPrice.quantity), 0)).toFixed(2),
                payer: email,
                status: status,
                payment_type: paymentType
            }

            avaliableProducts.length === 0 ? "Sin Stock" : await this.saveTicket(newTicket)
            
            const carts = await cartService.getCarts();
            const cartIndex = carts.findIndex(cart => cart._id === parseInt(userByEmail.cart));

            let newValues = []
            function filterprod(prod) {
                unavaliableProducts.forEach(item => {
                    if (item._id === prod.product._id) {
                        prod["product"] = item._id
                        newValues.push(prod)
                    }
                })
            }
            cart.products.filter(filterprod)
            carts[cartIndex]["products"] = newValues
            await cartService.saveCarts(carts)
            return
        } catch (error) {
            throw error;
        }
    }

    async getTickets() {
        try {
            if (fs.existsSync(this.#path)) {
                const tickets = JSON.parse(await fs.promises.readFile(this.#path, "utf-8"));
                return tickets;
            }
            return [];
        } catch (error) {
            throw error;
        }
    }

    async saveTickets(tickets) {
        try {
            await fs.promises.writeFile(this.#path, JSON.stringify(tickets));
        } catch (error) {
            throw error;
        }
    }

    async saveTicket({ payment_id, purchase_datetime, transaction_amount, payer, status, payment_type }) {
        try {
            const newTicket = new Ticket(
                ++this.#ultimoId,
                payment_id,
                purchase_datetime,
                transaction_amount,
                payer,
                status,
                payment_type
            );
            const tickets = await this.getTickets();
            tickets.push(newTicket);
            await this.saveTickets(tickets);
            return newTicket;
        } catch (error) {
            throw error;
        }
    }

    async getUserTickets(userEmail) {
        try {
            const tickets = await this.getTickets();
            const userTickets = tickets.filter(ticket => ticket.payer === userEmail);
            return userTickets;
        } catch (error) {
            throw error;
        }
    };

    async #setUltimoId() {
        try {
            const tickets = await this.getTickets();

            if (tickets.length < 1) {
                this.#ultimoId = 0;
                return;
            }

            this.#ultimoId = tickets[tickets.length - 1]._id;

        } catch (error) {
            throw error;
        }
    }

}