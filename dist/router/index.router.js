"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_controller_1 = require("../controller/index.controller");
const middle_1 = require("../middleware/middle");
const router = express_1.default.Router();
router.post('/register', index_controller_1.register);
router.post('/login', index_controller_1.login);
router.post('/add-expense', middle_1.protect, index_controller_1.addExpense);
router.put('/update-expense/:id', middle_1.protect, index_controller_1.updateExpense);
router.delete('/delete-expense/:id', middle_1.protect, index_controller_1.deleteExpense);
router.get('/user/getCurrentUser', middle_1.protect, index_controller_1.getCurrentUser);
router.get('/get-expenses', middle_1.protect, index_controller_1.getExpenses);
exports.default = router;
