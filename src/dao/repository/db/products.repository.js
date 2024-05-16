export default class ProductsRepository {
    constructor(model) {
        this.productsModel = model;
    }
    
    getAllProducts = async () => {
        let products = await this.productsModel.find().lean();
        return products;
    };

    searchProducts = async (text) => {
        let products = await this.productsModel.find({ $text: { $search: text } }).lean();
        return products;
    };

    saveProduct = async (product) => {
        let newProduct = new this.productsModel(product);
        let result = await newProduct.save();
        return result;
    };

    getProductById = async (id) => {
        let product = await this.productsModel.findById(id).lean();
        return product;
    };

    getProductByCode = async (code) => {
        let product = await this.productsModel.findOne({ code: code }).lean();
        return product;
    };

    updateProductThumbnail = async (id, picsPaths) => {
        picsPaths.forEach(async path => {
            await this.productsModel.findByIdAndUpdate(id, { $push: { thumbnails: path } });
        });
        return;
    };

    updateProduct = async (pid, product) => {
        const result = await this.productsModel.updateOne({ _id: pid }, product);
        return result;
    };

    deleteProduct = async (pid) => {
        const result = await this.productsModel.findByIdAndDelete(pid);
        return result;
    }

    paginateProduct = async (find, options) => {
        const report = await this.productsModel.paginate(find, options);
        return report;
    }
};