import mongoose from "mongoose";

const ticketCollection = "tickets";

const ticketSchema = new mongoose.Schema({
    payment_id: { type: String, require: true },
    purchase_datetime: { type: String, require: true },
    transaction_amount: { type: Number, require: true },
    payer: { type: String, require: true },
    status: { type: String },
    payment_type: { type: String, require: true },
});

const ticketsModel = mongoose.model(ticketCollection, ticketSchema);
export default ticketsModel;