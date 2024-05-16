import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
            },
            quantity: Number,
            _id: false,
        },
    ]
});

const cartsModel = mongoose.model(cartCollection, cartSchema);
export default cartsModel;