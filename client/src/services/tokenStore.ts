import type { UserType } from "@/types/types";

class TokenStore {
    private static AccessTokenKey = "accessToken";
    private static UserKey = "user";

    static getAccessToken = () => localStorage.getItem(this.AccessTokenKey);

    static getUser = () => {
        const userString = localStorage.getItem(this.UserKey);

        if (!userString) return;

        const user: UserType = JSON.parse(userString);
        return user
    }

    static set = ({ accessToken, user }: {
        accessToken: string | null,
        user: UserType | null
    }) => {
        if (accessToken) localStorage.setItem(this.AccessTokenKey, accessToken);
        if (user) localStorage.setItem(this.UserKey, JSON.stringify(user));
    }

    static clear = () => {
        localStorage.removeItem(this.AccessTokenKey);
        localStorage.removeItem(this.UserKey);
    }
}

export default TokenStore;