require("dotenv").config();
import express from "express";
import router from "./routes/index";
import mongoose from "mongoose";
import { customCors } from "./middlewares/cors";
const TelegramBot = require("node-telegram-bot-api");
import BotHandler from "./services/BotService";
import cluster from "cluster";
import os from "os";

const MONGODB_URI = process.env.MONGODB_URI || "";
const port = process.env.PORT || 80;
const numCPUs = os.cpus().length;

mongoose.connect(MONGODB_URI);

export const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});
if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork({ RUN_BOT: i === 0 ? "true" : "false" }); // Pass env vars directly to fork
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process?.pid} died. Restarting...`);
        cluster.fork(); // Restart with default env
    });
} else {
    const app: express.Application = express();
   
    app.use(customCors);
    app.use(express.json());
    app.use("/api", router);
   app.get("/", (req, res) => {
        res.send("Hello World");
    });
    if (process.env.RUN_BOT === "true") {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error("TELEGRAM_BOT_TOKEN is not set");
            process.exit(1);
        }

        const bot = new TelegramBot(botToken, { polling: true });
        bot.on("message", (msg: any) => {
            BotHandler(msg, bot);
        });

        console.log(`Bot is running on worker ${process.pid}`);
    }

    app.listen(port, () => {
        console.log(`Worker ${process.pid} listening on port ${port}`);
    });
}
