import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true, max: 8 },
    role: { type: String, default: "user" },
    avatar: { type: String, default: "http://localhost:8080/userguest3.png" },
    idgoogle: { type: String, default: null, unique: true },
    idgithub: { type: String, default: null, unique: true },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts"
    },
    verified: { type: Boolean, default: false },
    documents:
        [
            {
                name: { type: String },
                reference: { type: String },
                _id: false,
            }
        ],
    last_connection: { type: String, default: null }
});

const usersModel = mongoose.model(userCollection, userSchema);
export default usersModel;