import dotenv from "dotenv"
import connectDB from "./database/connection.database.js";
import express from "express";

const app = express();

dotenv.config({
    path: 'src/.env'
})



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

