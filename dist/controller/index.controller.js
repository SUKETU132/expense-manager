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
exports.getCurrentUser = exports.getExpenses = exports.deleteExpense = exports.updateExpense = exports.addExpense = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../model/user.model");
const error_1 = require("../utils/error");
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, "This is the key", { expiresIn: '60d' });
};
exports.register = (0, error_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, userName, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        throw new error_1.AppError('Passwords do not match', 400);
    }
    const existingUser = yield user_model_1.User.findOne({ userName });
    if (existingUser) {
        throw new error_1.AppError('User already exists', 409);
    }
    const newUser = yield user_model_1.User.create({
        username,
        userName,
        password,
    });
    res.status(201).json({
        status: 'success',
        data: newUser,
    });
}));
exports.login = (0, error_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, password } = req.body;
    if (!userName || !password) {
        throw new error_1.AppError('Please provide username and password', 400);
    }
    const user = yield user_model_1.User.findOne({ userName });
    if (!user || !(yield user.checkPassword(password))) {
        throw new error_1.AppError('Invalid username or password', 401);
    }
    const token = signToken(user._id.toString());
    const oneDay = 1000 * 60 * 60 * 24;
    return res.status(200).cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + oneDay),
        sameSite: 'lax',
    }).json({
        status: 'success',
        token,
        data: user,
        message: 'Login successful.',
    });
}));
exports.addExpense = (0, error_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, amount, paymentStatus } = req.body;
    console.log(req.user);
    const userId = req.user._id;
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        return next(new error_1.AppError('User not found', 404));
    }
    const newExpense = {
        name,
        amount,
        paid: false,
        paymentStatus,
    };
    user.expenseTodo.push(newExpense);
    yield user.save();
    res.status(201).json({
        status: 'success',
        data: newExpense,
    });
}));
exports.updateExpense = (0, error_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const expenseId = req.params.id;
    const userId = req.user._id;
    const { name, amount, paymentStatus } = req.body;
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        return next(new error_1.AppError('User not found', 404));
    }
    const expense = user === null || user === void 0 ? void 0 : user.expenseTodo.find(exp => exp._id.toString() === expenseId);
    if (!expense) {
        return next(new error_1.AppError('Expense not found', 404));
    }
    expense.name = name || expense.name;
    expense.amount = amount || expense.amount;
    expense.paymentStatus = paymentStatus;
    yield user.save();
    res.status(200).json({
        status: 'success',
        data: expense,
    });
}));
exports.deleteExpense = (0, error_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const expenseId = req.params.id;
    const userId = req.user._id;
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        return next(new error_1.AppError('User not found', 404));
    }
    const expenseIndex = user.expenseTodo.findIndex(exp => exp._id.toString() === expenseId);
    if (expenseIndex === -1) {
        return next(new error_1.AppError('Expense not found', 404));
    }
    user.expenseTodo.splice(expenseIndex, 1);
    yield user.save();
    res.status(200).json({
        status: 'success',
        message: 'Expense deleted successfully.',
    });
}));
exports.getExpenses = (0, error_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        return next(new error_1.AppError('User not found', 404));
    }
    const totalPayable = user.expenseTodo
        .filter((expense) => expense.paymentStatus === "payable")
        .reduce((sum, expense) => sum + expense.amount, 0);
    const totalReceivable = user.expenseTodo
        .filter((expense) => expense.paymentStatus === "receivable")
        .reduce((sum, expense) => sum + expense.amount, 0);
    res.status(200).json({
        status: 'success',
        data: user.expenseTodo,
        totalPayable,
        totalReceivable,
    });
}));
exports.getCurrentUser = (0, error_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    console.log("Api hit");
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        return next(new error_1.AppError('User not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: user,
    });
}));
