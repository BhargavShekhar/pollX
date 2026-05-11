import type { Response } from "express";

class ApiResponse {
    static ok<T>(res: Response, message = "ok", data?: T) {
        res.status(200).json({
            sucess: true,
            message,
            data
        });
    }

    static created<T>(res: Response, message = "created", data?: T) {
        return res.status(201).json({
            success: true,
            message,
            data
        })
    }

    static noContent(res: Response) {
        return res.status(204).send();
    }
}

export default ApiResponse;