import type { Request, Response, NextFunction } from "express";
import ApiError from "../../common/api-error.js";
import { verifyAccessToken } from "../auth/utils/token.js";

export function authenticationMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
        const header = req.headers["authorization"];

        if (!header) return next();

        const [type, token] = header?.split(" ");

        if (type !== "Bearer" || !token) return next(ApiError.unauthorized("Malformed authorization token"));

        try {
            const { id } = verifyAccessToken(token);
            req.user = { id };
            return next();
        } catch (error) {
            console.error(error);
            return next(ApiError.unauthorized("Invalid or expired token"))
        }
    }
}

export function requireAuth() {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user?.id) return next(ApiError.unauthorized("Authentication required"));
        return next();
    }
}