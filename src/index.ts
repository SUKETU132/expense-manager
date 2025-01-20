//                                     || Shree Krishna ||

import express from "express";
import { errorHandler } from "./utils/error";
import cors from "cors";
import cookieParser from 'cookie-parser';
import connectDB from "./db/db";
import managerRouter from "./router/index.router";

const app = express();
const PORT = 3000;

connectDB()
    .then(() => {
        const server = app.listen(process.env.PORT || 5500, () => {
            console.log(`⚙️  Server is running at port : ${PORT}`);
        });
    })
    .catch((err: any) => {
        console.log("MONGO db connection failed !!! ", err);
    })

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);
app.use(express.json({
    limit: "16kb",
}));

app.use(cookieParser());

app.use("/api/v1/manager", managerRouter);

app.use(errorHandler);

app.all("*", (req, res, next) => {
    res.status(404).send("Page not found.");
});

const server = app.listen(PORT, () => {
    console.log(`Server starting on port: ${PORT}`);
}).on('error', (err: any) => {
    console.log("Error starting the server:", err);
    console.log("Server will shut down in 2 seconds...");

    setTimeout(() => {
        process.exit(1);
    }, 2000);
});

process.on("unhandledRejection", (err: any) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection occurred! shutting down in 2 seconds...');
    server.close(() => {
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    })
});