export default class CartService {
    constructor(repository) {
        this.cartRepo = repository;
    }

    async getCartById(id) {
        try {
            const cart = await this.cartRepo.getCartById(id);
            return cart;
        } catch (error) {
            throw error;
        }
    };

    async saveCart() {
        try {
            const newCart = await this.cartRepo.saveCart()
            return newCart;
        } catch (error) {
            throw error;
        }
    };

    async updateCart(cid, cartProducts) {
        try {
            await this.cartRepo.updateCart(cid, cartProducts)
            return;
        } catch (error) {
            throw error;
        }
    };

    async deleteAllProducts(id) {
        try {
            const cartById = await this.cartRepo.deleteAllProducts(id)
            return cartById;
        } catch (error) {
            throw error;
        }
    };

    async deleteProductToCart(id, productToDelete) {
        try {
            const cartById = await this.cartRepo.deleteProductToCart(id, productToDelete)
            return cartById;
        } catch (error) {
            throw error;
        }
    };

    async addProductAndQuantityToCart(cid, pid, quantity) {
        try {
            const result = await this.cartRepo.addProductAndQuantityToCart(cid, pid, quantity);
            return result;
        } catch (error) {
            throw error;
        }
    };

    async deleteCart(id) {
        try {
            await this.cartRepo.deleteCart(id);
            return;
        } catch (error) {
            throw error;
        }
    };
};