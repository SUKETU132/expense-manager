"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const expenseTodoSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ["payable", "receivable"], required: true },
}, { timestamps: true });
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    userName: { type: String, required: true },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        maxlength: [128, 'Password must be at most 128 characters long'],
    },
    confirmPassword: {
        type: String,
        validate: {
            validator: function (value) {
                return this.password === value;
            },
            message: 'Passwords must match',
        },
    },
    expenseTodo: {
        type: [expenseTodoSchema],
        default: [],
    },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
userSchema.virtual('totalPayable').get(function () {
    return this.expenseTodo
        .filter((expense) => expense.paymentStatus === "payable")
        .reduce((sum, expense) => sum + expense.amount, 0);
});
userSchema.virtual('totalReceivable').get(function () {
    return this.expenseTodo
        .filter((expense) => expense.paymentStatus === "receivable")
        .reduce((sum, expense) => sum + expense.amount, 0);
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        try {
            this.password = yield bcryptjs_1.default.hash(this.password, 12);
            this.confirmPassword = undefined;
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
userSchema.methods.getExpenseIds = function () {
    return this.expenseTodo.map((expense) => expense._id);
};
userSchema.methods.checkPassword = function (enteredPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.compare(enteredPassword, this.password);
    });
};
const User = mongoose_1.default.model('User', userSchema);
exports.User = User;
