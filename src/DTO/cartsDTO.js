export default class CartsDTO {
    constructor(cart) {
        this._id = cart._id === undefined ? cart : cart._id;
        this.products = cart.products;
    }
}