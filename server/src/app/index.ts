import express from "express";

function createExpressApp() {
    const app = express();

    app.use(express.json());

    app.get("/health", (req, res) => res.json({ healthy: true }));

    return app;
}

export default createExpressApp;