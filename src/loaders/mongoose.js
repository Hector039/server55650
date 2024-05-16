import mongoose from "mongoose";

export default async function mongoLoader(dburl){
    try{
        await mongoose.connect(dburl);
        return "Mongo DB connected"
    }catch(error){
        throw new Error("Error connecting to Mongo DB", error)
    }
}