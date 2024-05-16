import ProductsDTO from "../DTO/productsDTO.js";

export default class ProductService {
    constructor(repository) {
        this.productsRepo = repository;
    }

    async searchProducts(text) {
        const result = await this.productsRepo.searchProducts(text);
        return result;
    }

    async getAllProducts() {
        const result = await this.productsRepo.getAllProducts();
        return result;
    }

    async getProductById(id) {
        const result = await this.productsRepo.getProductById(id);
        return result;
    }

    async getProductByCode(code) {
        const result = await this.productsRepo.getProductByCode(code);
        return result;
    }

    async updateProductThumbnail(id, picsPaths) {
        await this.productsRepo.updateProductThumbnail(id, picsPaths);
        return;
    }

    async saveProduct(product) {
        const newProduct = new ProductsDTO(product);
        const result = await this.productsRepo.saveProduct(newProduct);
        return result;
    }

    async updateProduct(id, product) {
        const productToUpdate = new ProductsDTO(product);
        const result = await this.productsRepo.updateProduct(id, productToUpdate);
        return result;
    }

    async deleteProduct(pid) {
        const result = await this.productsRepo.deleteProduct(pid);
        return result;
    }

    async paginateProduct(find, options) {
        const result = await this.productsRepo.paginateProduct(find, options);
        return result;
    }

};