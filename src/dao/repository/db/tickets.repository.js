import moment from "moment";

export default class TicketsRepository {
    constructor(ticketModel, userModel, productModel, cartModel) {
        this.ticketsModel = ticketModel;
        this.usersModel = userModel;
        this.productsModel = productModel;
        this.cartsModel = cartModel;
    }

    async saveTicket(ticket) {
        try {
            let newTicket = new this.ticketsModel(ticket);
            let result = await newTicket.save();
            return result;
        } catch (error) {
            throw error;
        }
    };

    async preferenceItems(cart) {
        try {
            let avaliableProducts = []
            let products = await this.productsModel.find().lean();
            cart.products.forEach(cartProd => {
                products.forEach(prod => {
                    if ((cartProd.product._id).toString() === (prod._id).toString()) {
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
            throw (error)
        }
    }

    async purchaseTicket(email, status, paymentId, paymentType) {
        try {
            let unavaliableProducts = []
            let avaliableProducts = []
            let ids = []

            const user = await this.usersModel.findOne({ email: email })
            const cart = await this.cartsModel.findById(user.cart).populate("products.product").lean();
            cart.products.forEach(prod => ids.push(prod.product._id));
            const prodDataBase = await this.productsModel.find({ '_id': { $in: ids } });

            cart.products.forEach(productInCart => {
                prodDataBase.forEach(prodDB => {
                    if ((productInCart.product._id).toString() === (prodDB._id).toString()) {
                        if (prodDB.stock >= productInCart.quantity) {
                            prodDB.stock = prodDB.stock - productInCart.quantity
                            avaliableProducts.push(productInCart)
                        } else if (prodDB.stock <= productInCart.quantity) {
                            unavaliableProducts.push(productInCart)
                        }
                    }
                })
            })

            prodDataBase.forEach(async prod => await this.productsModel.updateOne({ _id: prod._id }, { stock: prod.stock }));

            if (avaliableProducts.length > 0) {
                await this.saveTicket({
                payment_id: paymentId,
                purchase_datetime: moment().format("DD MM YYYY h:mm:ss a").replaceAll(" ", "_"),
                transaction_amount: (avaliableProducts.reduce((acc, prodPrice) => acc += (prodPrice.product.price * prodPrice.quantity), 0)).toFixed(2),
                payer: email,
                status: status,
                payment_type: paymentType
            })
            }

            const unavaliableProdsMap = unavaliableProducts.map(prod => {
                return {
                    product: prod.product._id,
                    quantity: prod.quantity
                }
            })
            
            await this.cartsModel.replaceOne({ _id: user.cart }, { products: unavaliableProdsMap });
            return
        } catch (error) {
            throw error;
        }
    }

    async getUserTickets(userEmail) {
        try {
            const userTickets = await this.ticketsModel.find({ payer: userEmail });
            return userTickets;
        } catch (error) {
            throw error;
        }
    };
};