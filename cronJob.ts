const { ThreadsAPI } = require("threads-api");
const cron = require("node-cron");
require("dotenv").config();
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

//get bot credentials
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!);
const chatID: string = process.env.TELEGRAM_CHAT_ID!;

//get thread (instagram) account credentials
const threadUsername: string = process.env.THREAD_USERNAME!;
const threadPassword: string = process.env.THREAD_PASSWORD!;


let seconds: number = 10;

const makeIteration = (): void => {
    console.clear();
    if (seconds > 0) {
        console.log(seconds);
        setTimeout(makeIteration, 1000); // 1 second waiting
    } else {
        console.log('time has passed');
    }
    seconds -= 1;
};

setTimeout(makeIteration, 1000); // 1 second waiting
// console.log(makeIteration);
// cron.schedule("0 30 * * * *", function () {
//     const currentDate = new Date();
//     console.log("Running");
//   });