import express from "express";
import { addExpense, updateExpense, deleteExpense, getExpenses, login, register, getCurrentUser } from "../controller/index.controller";
import { protect } from "../middleware/middle";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/add-expense', protect, addExpense);
router.put('/update-expense/:id', protect, updateExpense);
router.delete('/delete-expense/:id', protect, deleteExpense);
router.get('/user/getCurrentUser', protect, getCurrentUser);
router.get('/get-expenses', protect, getExpenses);

export default router