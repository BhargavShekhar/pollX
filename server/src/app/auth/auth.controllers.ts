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

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return ApiResponse.created(res, "User created successfully", result);
    }

    public async handleSignin(req: Request, res: Response) {
        const validateResult = signinPayloadModel.safeParse(req.body);

        if (!validateResult.success) throw ApiError.badRequest("Validation failed");

        const data: signinDto = validateResult.data;

        const result = await this.authService.signin(data);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return ApiResponse.ok(res, "Signin successfull", result);
    }

    public async handleRefreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) throw ApiError.badRequest("Refresh token is required");

        const result = await this.authService.refresh(refreshToken);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        return ApiResponse.ok(res, "Token refreshed successfully", result);
    }

    public async handleSignout(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) throw ApiError.badRequest("Refresh token is required");

        await this.authService.signout(refreshToken);

        res.clearCookie("refreshToken");

        return ApiResponse.ok(res, "Signout successfull");
    }
}

export default AuthController;