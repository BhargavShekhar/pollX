import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { usersTable } from "../../db/schema.js";
import type { signinDto, signupDto } from "./auth.models.js";
import ApiError from "../../common/api-error.js";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from "./utils/token.js";

class AuthService {
    async signup({ name, email, password }: signupDto) {
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (existingUser) throw ApiError.badRequest("User alredy exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        const [user] = await db.insert(usersTable).values({
            name,
            email,
            password: hashedPassword
        }).returning({ id: usersTable.id });

        if (!user) {
            throw ApiError.internal("User creation failed");
        }

        const accessToken = createAccessToken({ id: user.id });
        const refreshToken = createRefreshToken({ id: user.id });

        return { user, accessToken, refreshToken };
    }

    async signin({ email, password }: signinDto) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (!user || !user.password) throw ApiError.unauthorized("Invalid Credentials");

        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword) throw ApiError.unauthorized("Invalid Credentials");

        const accessToken = createAccessToken({ id: user.id });
        const refreshToken = createRefreshToken({ id: user.id });

        await db.update(usersTable).set({
            refreshToken: hashToken(refreshToken)
        }).where(eq(usersTable.email, email));

        return { user: { id: user.id} , accessToken, refreshToken }
    }

    async refresh(refreshToken: string) {
        const payload = verifyRefreshToken(refreshToken);

        if (!payload || !payload.id) throw ApiError.unauthorized("Invalid refresh token");

        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));

        if (!user || !user.refreshToken) throw ApiError.unauthorized("User not found");

        if (user.refreshToken !== hashToken(refreshToken)) throw ApiError.unauthorized("Invalid refresh token");

        const accessToken = createAccessToken({ id: user.id });
        const newRefreshToken = createRefreshToken({ id: user.id });

        await db.update(usersTable).set({
            refreshToken: hashToken(newRefreshToken)
        }).where(eq(usersTable.id, user.id));

        return { accessToken, refreshToken: newRefreshToken };
    }

    async signout(refreshToken: string) {
        const payload = verifyRefreshToken(refreshToken);

        if (!payload || !payload.id) throw ApiError.unauthorized("Invalid refresh token");

        await db.update(usersTable).set({
            refreshToken: null
        }).where(eq(usersTable.id, payload.id));
    }
}

export default AuthService;