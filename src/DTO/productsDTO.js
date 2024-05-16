export default class ProductsDTO {
    constructor(product) {
        this._id = product._id === undefined ? product.id : product._id;
        this.title = product.title;
        this.description = !product.description ? "Sin descripción disponible" : product.description;
        this.code = product.code;
        this.price = parseInt(product.price);
        this.stock = parseInt(product.stock);
        this.category = product.category;
        this.thumbnails = !product.thumbnails ? [] : product.thumbnails;
        this.status = product.status;
        this.owner = product.owner;
    }
}