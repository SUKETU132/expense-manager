import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IExpenseTodo, IUser } from '../model/user.model';
import { AppError, asyncHandler } from '../utils/error';

const signToken = (id: string) => {
    return jwt.sign({ id }, "This is the key", { expiresIn: '1h' });
};

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { username, userName, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        throw new AppError('Passwords do not match', 400);
    }

    const existingUser = await User.findOne({ userName });
    if (existingUser) {
        throw new AppError('User already exists', 409);
    }

    const newUser = await User.create({
        username,
        userName,
        password,
    });

    res.status(201).json({
        status: 'success',
        data: newUser,
    });
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        throw new AppError('Please provide username and password', 400);
    }

    const user: IUser | null = await User.findOne({ userName });

    if (!user || !(await user.checkPassword(password))) {
        throw new AppError('Invalid username or password', 401);
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
});

export const addExpense = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const { name, amount, paymentStatus } = req.body;
    console.log(req.user);
    const userId = (req.user as IUser)._id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const newExpense: any = {
        name,
        amount,
        paid: false,
        paymentStatus,
    };

    user.expenseTodo.push(newExpense);

    await user.save();

    res.status(201).json({
        status: 'success',
        data: newExpense,
    });
});

export const updateExpense = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const expenseId = req.params.id;
    const userId = (req.user as IUser)._id;
    const { name, amount, paymentStatus } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const expense = user?.expenseTodo.find(exp => exp._id.toString() === expenseId);
    if (!expense) {
        return next(new AppError('Expense not found', 404));
    }

    expense.name = name || expense.name;
    expense.amount = amount || expense.amount;
    expense.paymentStatus = paymentStatus;

    await user.save();

    res.status(200).json({
        status: 'success',
        data: expense,
    });
});


export const deleteExpense = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const expenseId = req.params.id;
    const userId = (req.user as any)._id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const expenseIndex = user.expenseTodo.findIndex(exp => exp._id.toString() === expenseId);
    if (expenseIndex === -1) {
        return next(new AppError('Expense not found', 404));
    }

    user.expenseTodo.splice(expenseIndex, 1);

    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Expense deleted successfully.',
    });
});

export const getExpenses = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser)._id;

    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const totalPayable = user.expenseTodo
        .filter((expense: IExpenseTodo) => expense.paymentStatus === "payable")
        .reduce((sum: number, expense: IExpenseTodo) => sum + expense.amount, 0);

    const totalReceivable = user.expenseTodo
        .filter((expense: IExpenseTodo) => expense.paymentStatus === "receivable")
        .reduce((sum: number, expense: IExpenseTodo) => sum + expense.amount, 0);

    res.status(200).json({
        status: 'success',
        data: user.expenseTodo,
        totalPayable,
        totalReceivable,
    });
});


export const getCurrentUser = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser)._id;
    console.log("Api hit");
    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: user,
    });
});
