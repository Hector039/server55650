export default class CartsRepository {
    constructor(model) {
        this.CartModel = model;
    }

    saveCart = async () => {
        let newCart = new this.CartModel();
        let result = await newCart.save();
        return result;
    };

    getCartById = async (id) => {
        let cart = await this.CartModel.findById(id).populate("products.product").lean();
        return cart;
    };

    async updateCart(id, cartProducts) {
        try {
            await this.CartModel.updateOne({ _id: id }, { $set: { "products": cartProducts } });
            return;
        } catch (error) {
            throw error;
        }
    };

    deleteProductToCart = async (id, productToDelete) => {
        await this.CartModel.findByIdAndUpdate(id, { $pull: { products: { product: productToDelete.product, quantity: productToDelete.quantity } } });
        const cartById = await this.getCartById(id)
        return cartById;
    };

    deleteAllProducts = async (id) => {
        await this.CartModel.findByIdAndUpdate(id, { $push: { products: { $each: [], $slice: 0 } } });
        const cartById = await this.getCartById(id)
        return cartById;
    };

    addProductAndQuantityToCart = async (cid, pid, quantity) => {
        const cartById = await this.getCartById(cid)
            const cartIndexProduct = cartById.products.findIndex(prod => prod.product._id == pid);
            if (cartIndexProduct < 0) {
                await this.CartModel.findByIdAndUpdate(cartById._id, { $push: { products: { product: pid, quantity: quantity } } });
            } else {
                await this.CartModel.updateOne({ _id: cartById._id, "products.product": pid }, { $set: { "products.$.quantity": quantity } });
            }
            const updatedCart = await this.getCartById(cartById._id);
        return updatedCart;
    };

    deleteCart = async (id) => {
        await this.CartModel.findOneAndDelete({ _id: id });
        return;
    };
}