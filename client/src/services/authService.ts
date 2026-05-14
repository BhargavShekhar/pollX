import { api } from "./api";
import TokenStore from "./tokenStore";

import type { SigninPayload, SignupPayload } from "@/types/types";

class AuthService {
    async signin({ email, password }: SigninPayload) {
        const { data } = await api.post("/auth/signin", {
            email,
            password
        })

        TokenStore.set(data.data);

        return data.data;
    }

    async signup({ name, email, password }: SignupPayload) {
        const { data } = await api.post("/auth/signup", {
            name,
            email,
            password
        })

        TokenStore.set(data.data);

        return data.data;
    }

    async signout() {
        await api.post("/auth/signout");

        TokenStore.clear();
    }
}

const authService = new AuthService();
export default authService;