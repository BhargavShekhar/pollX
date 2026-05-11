import crypto from "crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface UserTokenPayload {
    id: string
}

export interface RefreshTokenPayload {
    id: string
}

export function createAccessToken(payload: UserTokenPayload) {
    return jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "5m" }
    );
}

export function verifyAccessToken(token: string) {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    return payload as UserTokenPayload;
}

export function createRefreshToken(payload: RefreshTokenPayload) {
    return jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
    );
}

export function verifyRefreshToken(token: string) {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
    return payload as RefreshTokenPayload;
}

export function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}