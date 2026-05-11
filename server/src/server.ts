import http from "node:http";

import "dotenv/config";
import createExpressApp from "./app/index.js";
import initializeSocket from "./socket/index.js";

async function main() {
    const PORT = process.env.PORT ||  8080;

    const app = createExpressApp();
    const server = http.createServer(app);

    initializeSocket(server);

    server.listen(PORT, () => {
        console.log(`Server started at http://localhost:${PORT} in ${process.env.NODE_ENV}`);
    })
}

main().catch((error) => {
    console.error("Could not start server", error);
    process.exit(1);
})