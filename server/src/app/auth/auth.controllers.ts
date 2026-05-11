import type { Request, Response } from "express";
import AuthService from "./auth.services.js";
import { signinPayloadModel, signupPayloadModel, type signinDto, type signupDto } from "./auth.models.js";
import ApiError from "../../common/api-error.js";
import ApiResponse from "../../common/api-response.js";

class AuthController {
    private authService = new AuthService(); 

    public async handleSignup(req: Request, res: Response) {
        const validateResult = signupPayloadModel.safeParse(req.body);

        if (!validateResult.success) throw ApiError.badRequest("Validation failed");

        const data: signupDto = validateResult.data;

        const result = await this.authService.signup(data);

        return ApiResponse.created(res, "User created successfully", result);
    }

    public async handleSignin(req: Request, res: Response) {
        const validateResult = signinPayloadModel.safeParse(req.body);

         if (!validateResult.success) throw ApiError.badRequest("Validation failed");

        const data: signinDto = validateResult.data;

        const result = await this.authService.signin(data);

        return ApiResponse.ok(res, "Signin successfully", result);
    }

    public async handleRefreshToken(req: Request, res: Response) {
        const header = req.headers["authorization"];

        if (!header || !header.startsWith("Bearer")) throw ApiError.badRequest("Bearer token is required");

        const refreshToken = header.split(" ")[1];

        if (!refreshToken) throw ApiError.badRequest("Bearer token is required");

        await this.authService.refresh(refreshToken);
    }
}

export default AuthController;