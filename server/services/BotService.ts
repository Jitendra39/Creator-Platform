import fs from "fs";
import {
    checkAuth,
    generateQR,
    getAllProblems,
    getCommenRoutes,
    getProblemDetails,
    getUserProfileData,
    handleAuthNow,
} from "./BotFunctions";
const BotHandler = async (msg: any, bot: any) => {
    const chatId = msg.chat.id;
    const message = msg.text?.trim().toLowerCase();

    console.log(`Received message: ${message} from chatId: ${chatId}`);

    if (message === "/start" || message === "done" || message === "hi") {
        bot.sendMessage(chatId, "Welcome! Choose an option:", {
            reply_markup: {
                keyboard: [
                    [
                        { text: "Problem_list" },
                        { text: "Profile" },
                        { text: "Website_Link" },
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    } else if (message === "problem_list") {
        try {
            const user = await checkAuth(chatId);
        
            if (!user || user === null) {
                
              await handleAuthNow(chatId, bot);
            } else {
              const res = await getAllProblems(chatId);
              if (typeof res === "string") {
                bot.sendMessage(chatId, res);
              } else {
                const { problemListText, length } = res;
                
                let problemButtons = [];
                for (let i = 0; i < length; i++) {
                  problemButtons.push([{ text: `Question-${i + 1}` }]);
                }

                bot.sendMessage(chatId, problemListText, {
                  parse_mode: "Markdown",
                  reply_markup: {
                    keyboard: problemButtons,
                    resize_keyboard: true,
                  },
                });
              }
              
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            bot.sendMessage(
                chatId,
                "An error occurred while fetching the problem list."
            );
        }
    } else if (message === "authenticate") {
        const authUrl = `${process.env.FRONTEND_URL}/signup?telegram_id=${chatId}`;
        const filePath = await generateQR(authUrl);
        await bot.sendPhoto(chatId, fs.createReadStream(filePath), {
            caption: "Scan this QR code to authenticate!",
            parse_mode: "Markdown",
        });
        await bot.sendMessage(chatId, authUrl);
        // Optional: remove file after sending
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } else if (message === "website_link") {
        bot.sendMessage(chatId, process.env.FRONTEND_URL, {
            reply_markup: {
                keyboard: getCommenRoutes(),
                resize_keyboard: true,
            },
        });
    } else if (message === "profile") {

      const user = await checkAuth(chatId);
      if (!user || user === null) {
        await handleAuthNow(chatId, bot);
      } else {
        const res = await getUserProfileData(user);
        bot.sendMessage(chatId, res, {
            parse_mode: "Markdown",
            reply_markup: {
                keyboard: getCommenRoutes(),
                resize_keyboard: true,
            },
        });
      }
    }else if(
        message.includes("question-")
    ){
        const problemId = message.split("-")[1];
        const res = await getProblemDetails(problemId);
        bot.sendMessage(chatId, res, {
            reply_markup: {
                keyboard: getCommenRoutes(),
                resize_keyboard: true,
            },
        });
    } else {
        bot.sendMessage(
            chatId,
            "I don’t recognize that command. Please use the buttons below:",
            {
                reply_markup: {
                    keyboard: getCommenRoutes(),
                    resize_keyboard: true,
                },
            }
        );
    }
};

export default BotHandler;
