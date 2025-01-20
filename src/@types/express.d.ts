import { IUser } from "../model/user.model";

console.log("express.d.ts file loaded");

declare global {
    namespace Express {
        interface Request {
            user: IUser
        }
    }
}
