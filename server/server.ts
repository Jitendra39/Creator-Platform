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

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Restart worker if it exits
    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
        cluster.fork();
    });
} else {
    const app: express.Application = express();

    app.use(customCors);
    app.use(express.json());
    app.use("/api", router);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        console.error("TELEGRAM_BOT_TOKEN is not set");
        process.exit(1);
    }

    const bot = new TelegramBot(botToken, { polling: true });
    bot.on("message", (msg: any) => {
        BotHandler(msg, bot);
    });

    app.listen(port, () => {
        console.log(`Worker ${process.pid} is listening at port: ${port}`);
    });
}
