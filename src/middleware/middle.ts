import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/error';
import { IUser, User } from '../model/user.model';

export const protect = async (req: any, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    console.log("this is token: ",token);

    try {
        const decoded: any = jwt.verify(token, "This is the key");

        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new AppError('The user belonging to this token does not exist.', 404));
        }

        req.user = user as IUser;
        next();
    } catch (error) {
        return next(new AppError('Invalid or expired token', 401));
    }
};


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