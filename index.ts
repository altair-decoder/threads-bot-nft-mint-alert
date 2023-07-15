
(async function () {
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
  let deviceID: string = process.env.THREAD_DEVICE_ID ?? "null";

  if (deviceID == "null") {
    //generate a random device ID if one is not provided
    console.warn(
      "%cNo device ID provided. Generating a random one and adding it to the .env file",
      "background: yellow; color: black; font-weight: bold;"
    );
    deviceID = `android-${(Math.random() * 1e24).toString(36)}`;

    //write the device ID to the .env file
    const envPath = path.join(__dirname, ".env");
    let envData = await fs.readFile(envPath);
    envData += `\nTHREAD_DEVICE_ID="${deviceID}"`;
    await fs.writeFile(envPath, envData);
  }

  console.log("Logging in into Threads...");

  const threadsAPI = new ThreadsAPI({
    username: threadUsername,
    password: threadPassword,
    // deviceID: deviceID,
  });


  async function extractData(req: any) {
    try {
      const resData = await axios.get(`https://mint.fun/api/mintfun/feed/trending?range=${req}`)
      // const dataApi = JSON.parse(resData);
      return resData.data;
    } catch (error: any) {
      console.error('Error posting advice:', error.message);
    }
  }
  async function postFromApi(req: any) {
    try {
      // threadsAPI.login();
      const data = await extractData(req);
      const contractArray = data.collections[0].contract.split(":");
      const contract = contractArray[1];
      console.log('Contract:' + contract)
      const txtToPost = `☀️ LIVE MINT ONCHAIN ☀️
    Top mint NFTs: ${data.collections[0].name}
    Total Value: ${data.collections[0].totalValue}Eth
    Total Mint Last Hour: ${data.collections[0].mintsLastHour}
    Minter: ${data.collections[0].minterCount}
    Last Event Snapshoot: ${data.collections[0].lastEvent}
    Media Sources:${data.collections[0].mediaSource}
    Metadata Sources:${data.collections[0].metadataSource}

    Mint at: 
    MINTFUN -> https://mint.fun/ethereum/${contract}
    SEABOOK -> https://www.seabook.io/project/${contract}

    Market:
    OPENSEA -> https://opensea.io/assets/ethereum/${contract}
    Blur    -> https://blur.io/collection/${contract}
    `
      const imgUri = `${data.collections[0].imageUrl}`
      // const dataApi = JSON.parse(resData);
      const didPostThread: boolean = await postThread(txtToPost, imgUri);
      // return true;
    } catch (error: any) {
      console.error('Error posting advice:', error.message);
    }
  }

  async function postThread(
    text: string,
    url: string,
    randomWait = false
  ): Promise<boolean> {
    console.log("postThread", text, url);
    if (randomWait) {
      //wait for a random amount of time between 0 to 5 mins
      const randomWaitTime = Math.floor(Math.random() * 300);
      await new Promise((resolve) =>
        setTimeout(resolve, randomWaitTime * 1000)
      );
    }
    console.log("posting to thread...");
    // Create a new thread post using the (unofficial) Threads API
    const didPost: boolean = await threadsAPI.publish({ text, url });

    const msgText = `${didPost ? "Posted" : "ERROR: Could not post"}: ${text}`;

    console.log("posted thread");

    //after posting
    if (process.env.TELEGRAM_BOT_TOKEN != "" && process.env.TELEGRAM_CHAT_ID != "") {
      await bot.sendMessage(chatID, msgText ?? "No message");
    }

    return didPost;
  }

  //run immediately on startup
  // getProgress(true);
  // console.log(threadsAPI)
  postFromApi('30m')
  cron.schedule("0 30 * * * *", function () {
    threadsAPI.login();
    postFromApi('30m')
  });
  //schedule run at 12:02 AM (Midnight) every day
  // cron.schedule("2 0 * * *", () => getProgress(true));

  // 2: Specifies the minute when the cron job should run (2 minutes past the hour).
  // 0: Specifies the hour when the cron job should run (midnight).
  // *: The asterisks represent every day of the month, every month, and every day of the week.
})();
