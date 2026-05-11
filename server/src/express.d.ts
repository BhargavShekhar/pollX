import { Request } from 'express';
import type { UserTokenPayload } from './app/auth/utils/token.ts';

declare global {
    namespace Express {
        interface Request {
            user?: UserTokenPayload
        };
    }
}