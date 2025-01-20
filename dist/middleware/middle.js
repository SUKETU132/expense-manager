"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../utils/error");
const user_model_1 = require("../model/user.model");
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new error_1.AppError('You are not logged in! Please log in to get access.', 401));
    }
    console.log("this is token: ", token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, "This is the key");
        const user = yield user_model_1.User.findById(decoded.id);
        if (!user) {
            return next(new error_1.AppError('The user belonging to this token does not exist.', 404));
        }
        req.user = user;
        next();
    }
    catch (error) {
        return next(new error_1.AppError('Invalid or expired token', 401));
    }
});
exports.protect = protect;
// export const isAuthorized = async (req, res, next) => {
//     if (!req.headers.cookie) throw new UnauthorizedError("please login!");
//     console.log(req.headers.cookie);
//     const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
//       const [name, value] = cookie.trim().split('=');
//       acc[name] = value;
//       return acc;
//     }, {});
//     const token = cookies.token;
//     if (!token) throw new UnauthorizedError("Token not found");
//     const decoded = await verifyToken(token);
//     const user = await User.findById(decoded.id, { password: 0 });
//     if (!user || user.sessionId !== decoded.sessionId) {
//       throw new UnauthorizedError("Invalid or expired session. Please log in again.");
//     }
//     req.user = {
//       id: user._id,
//       isAdmin: user.role,
//     };
//     console.log(req.user);
//     next();
//   };
