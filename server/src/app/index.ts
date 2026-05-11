import express from "express";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import ApiError from "../common/api-error.js";

function createExpressApp() {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    app.get("/health", (req, res) => res.json({ healthy: true }));

    app.use((req, res, next) => {
        next(ApiError.notfound("No such route exists"));
    })

    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(error.stack);

        if (error instanceof ApiError) {
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                sucess: false,
                message: { error: error.message },
                data: null
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        })
    });

    return app;
}

export default createExpressApp;