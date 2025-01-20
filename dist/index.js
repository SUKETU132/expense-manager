"use strict";
//                                     || Shree Krishna ||
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const error_1 = require("./utils/error");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./db/db"));
const index_router_1 = __importDefault(require("./router/index.router"));
const app = (0, express_1.default)();
const PORT = 3000;
(0, db_1.default)()
    .then(() => {
    const server = app.listen(process.env.PORT || 5500, () => {
        console.log(`⚙️  Server is running at port : ${PORT}`);
    });
})
    .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express_1.default.json({
    limit: "16kb",
}));
app.use((0, cookie_parser_1.default)());
app.use("/api/v1/manager", index_router_1.default);
app.use(error_1.errorHandler);
app.all("*", (req, res, next) => {
    res.status(404).send("Page not found.");
});
const server = app.listen(PORT, () => {
    console.log(`Server starting on port: ${PORT}`);
}).on('error', (err) => {
    console.log("Error starting the server:", err);
    console.log("Server will shut down in 2 seconds...");
    setTimeout(() => {
        process.exit(1);
    }, 2000);
});
process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection occurred! shutting down in 2 seconds...');
    server.close(() => {
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    });
});
