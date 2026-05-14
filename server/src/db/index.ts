import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema.js";
import * as relations from "./relations.js";

export const db = drizzle(process.env.DATABASE_URL!, {
    schema: {
        ...schema,
        ...relations
    }
});