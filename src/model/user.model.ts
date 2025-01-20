import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IExpenseTodo {
    remove: any;
    _id: mongoose.Types.ObjectId;
    name: string;
    amount: number;
    paid: boolean;
    paymentStatus: string,
    createdAt: Date;
    updatedAt: Date;
}

interface IUser extends Document {
    username: string;
    userName: string;
    _id: mongoose.Types.ObjectId;
    password: string;
    confirmPassword?: string;
    expenseTodo: IExpenseTodo[];
    totalAmount: number;
    checkPassword: (enteredPassword: string) => Promise<boolean>;
    getExpenseIds: () => mongoose.Types.ObjectId[];
}

const expenseTodoSchema = new Schema<IExpenseTodo>(
    {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        paid: { type: Boolean, default: false },
        paymentStatus: { type: String, enum: ["payable", "receivable"], required: true },
    },
    { timestamps: true }
);

const userSchema = new Schema<IUser>(
    {
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
                validator: function (this: IUser, value: string) {
                    return this.password === value;
                },
                message: 'Passwords must match',
            },
        },
        expenseTodo: {
            type: [expenseTodoSchema],
            default: [],
        },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

userSchema.virtual('totalPayable').get(function (this: IUser) {
    return this.expenseTodo
        .filter((expense: IExpenseTodo) => expense.paymentStatus === "payable")
        .reduce((sum: number, expense: IExpenseTodo) => sum + expense.amount, 0);
});

userSchema.virtual('totalReceivable').get(function (this: IUser) {
    return this.expenseTodo
        .filter((expense: IExpenseTodo) => expense.paymentStatus === "receivable")
        .reduce((sum: number, expense: IExpenseTodo) => sum + expense.amount, 0);
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 12);
        this.confirmPassword = undefined;
        next();
    } catch (error: any) {
        next(error);
    }
});

userSchema.methods.getExpenseIds = function (): mongoose.Types.ObjectId[] {
    return this.expenseTodo.map((expense: any) => expense._id);
};

userSchema.methods.checkPassword = async function (enteredPassword: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export { User, IUser, IExpenseTodo };
