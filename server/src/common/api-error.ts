class ApiError extends Error {
    statusCode: number;

    constructor (message="internal server error", statusCode=500) {
        super(message);

        this.statusCode = statusCode;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message="bad request") {
        return new ApiError(message, 400);
    }

    static unauthorized(message="Unauthorize") {
        return new ApiError(message, 401);
    }

    static conflict(message="Conflict - data already exists") {
        return new ApiError(message, 409);
    }

    static forbidden(message="forbidden") {
        return new ApiError(message, 403);
    }

    static notfound(message="notfound") {
        return new ApiError(message, 404);
    }

    static internal(message="internal server error") {
        return new ApiError(message, 500)
    }
}

export default ApiError;