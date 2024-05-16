import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productCollection = "products";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    thumbnails: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        default: "admin"
    }
});

productSchema.plugin(mongoosePaginate);
productSchema.index({ title: "text" })
const productsModel = mongoose.model(productCollection, productSchema);
export default productsModel;