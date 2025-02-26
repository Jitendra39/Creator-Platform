import UserModel from "../models/user";
import * as QRCode from "qrcode";
import path from "path";
import ProblemModel from "../models/problem";


export const checkAuth = async (chatId: any) => {
    return await UserModel.findOne({ telegram_id: chatId });
};

export const generateQR = async (authUrl: string): Promise<string> => {
    try {
        const filePath = path.join(__dirname, "qr.png");
        await QRCode.toFile(filePath, authUrl, {
            width: 500,
            errorCorrectionLevel: "H",
            margin: 2,
        });
        return filePath;
    } catch (error) {
        console.error("QR generation failed:", error);
        throw new Error("QR code generation error");
    }
};

export const getCommenRoutes = () => {
    return [
        [
            { text: "Problem_list" },
            { text: "Profile" },
            { text: "Website_Link" },
        ],
    ];
};

export const getUserProfileData = async ( user: any) => {
    try {
      
        if (user || user !== null) {
            let profileText = `👤 *User Profile*\n\n`;
            profileText += `🆔 *Username:* ${user?.username}\n`;
            profileText += `📧 *Email:* ${user.email}\n`;
            profileText += user.telegram_id
                ? `📲 *Telegram ID:* ${user.telegram_id}\n`
                : "";

            profileText += `\n📊 *Activity Summary:*\n`;
            profileText += `✅ *Problems Solved:* ${user.problems_solved_count}\n`;
            profileText += `📚 *Total Submissions:* ${user.submissions.length}\n`;
            profileText += `⭐ *Starred Problems:* ${user.problems_starred.length}\n`;
            profileText += `📈 *Profile Views:* ${user.views}\n`;
            profileText += `🏅 *Reputation:* ${user.reputation_count}\n`;
            profileText += `🧩 *Solution Count:* ${user.solution_count}\n`;

            if (user.problems_solved.length > 0) {
                profileText += `\n🎯 *Solved Problems:*\n- ${user.problems_solved.join(
                    "\n- "
                )}\n`;
            } else {
                profileText += `\n🎯 *Solved Problems:* None yet. Start solving to build your streak! 💪\n`;
            }

            if (user.problems_attempted.length > 0) {
                profileText += `\n📝 *Attempted Problems:*\n- ${user.problems_attempted.join(
                    "\n- "
                )}\n`;
            } else {
                profileText += `\n📝 *Attempted Problems:* None yet. Give it a shot! 🚀\n`;
            }

            if (user.submissions.length > 0) {
                profileText += `\n📄 *Recent Submissions:*\n`;
                user.submissions
                    .slice(0, 3)
                    .forEach((sub: any, index: number) => {
                        profileText += `\n*${index + 1}. Problem:* ${
                            sub.problem_name
                        }\n`;
                        profileText += `   - *Status:* ${sub.status}\n`;
                        profileText += `   - *Runtime:* ${
                            sub.runtime || "N/A"
                        } ms\n`;
                        profileText += `   - *Memory:* ${
                            sub.memory || "N/A"
                        } MB\n`;
                        profileText += `   - *Language:* ${sub.language}\n`;
                        if (sub.error && sub.error !== "undefined") {
                            profileText += `   - *Error:* ${sub.error}\n`;
                        }
                    });
            } else {
                profileText += `\n📄 *Recent Submissions:* None yet. Submit your first solution! 🚀\n`;
            }

            return profileText;
        } 
    } catch (error) {
        console.error("Error fetching user:", error);

        return "An error occurred while fetching the problem list.";
    }
};




export const handleAuthNow = async (chatId: any, bot: any) => {
    bot.sendMessage(chatId, "Welcome! Choose an option:", {
        reply_markup: {
            keyboard: [[{ text: "Authenticate" }]],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
}




export const getAllProblems = async (chatId: any) => {
    try {
        const data = await ProblemModel.find({});
        if (data.length === 0) {
            return "No problems found.";
        }
        
        let problemListText = "💻 *Problem List:*\n\n";
        
        data.forEach((problem, index) => {
            const main = problem.main;
            const difficultyEmoji = main.difficulty === "easy" ? "🟢" 
                                : main.difficulty === "medium" ? "🟡" 
                                : "🔴";
            
            const statusEmoji = main.status === "solved" ? "✅" 
                            : main.status === "attempted" ? "✏️" 
                            : "❌";
        
            problemListText += `${index + 1}️⃣ *${main.name}*\n`;
            problemListText += `   - *Difficulty:* ${difficultyEmoji} ${main.difficulty.charAt(0).toUpperCase() + main.difficulty.slice(1)}\n`;
            problemListText += `   - 👍 *Likes:* ${main.like_count} | 👎 *Dislikes:* ${main.dislike_count}\n`;
            problemListText += `   - ✅ *Acceptance Rate:* ${main.acceptance_rate_count}%\n`;
            problemListText += `   - 📄 *Submissions:* ${main.submission_count}\n`;
            problemListText += `   - 💬 *Discussions:* ${main.discussion_count}\n`;
            problemListText += `   - 📦 *Solutions:* ${main.solution_count}\n`;
            if (main.status) {
                problemListText += `   - 🚀 *Status:* ${statusEmoji} ${main.status.charAt(0).toUpperCase() + main.status.slice(1)}\n\n`;
            }
        });
        
        return { problemListText, length: data.length };
        
              
    } catch (error) {
        console.error("Error fetching problems:", error);
        return "An error occurred while fetching the problem list.";
    }
}


export const getProblemDetails = async (id: number) => {
    try {
const problem = await ProblemModel.findOne({ "main.id": id });
if (!problem) {
    throw new Error("Problem not found");
}

let problemListText = "💻 *Problem Details:*\n\n";

const main = problem.main;
const editorial = problem.editorial?.editorial_body || "No editorial available.";
const difficultyEmoji = main.difficulty === "easy" ? "🟢" 
                    : main.difficulty === "medium" ? "🟡" 
                    : "🔴";

const statusEmoji = main.status === "solved" ? "✅" 
                : main.status === "attempted" ? "✏️" 
                : "❌";

problemListText += `1️⃣ *${main.name}*\n`;
problemListText += `   - *Difficulty:* ${difficultyEmoji} ${main.difficulty.charAt(0).toUpperCase() + main.difficulty.slice(1)}\n`;
problemListText += `   - 👍 *Likes:* ${main.like_count} | 👎 *Dislikes:* ${main.dislike_count}\n`;
problemListText += `   - ✅ *Acceptance Rate:* ${main.acceptance_rate_count}%\n`;
problemListText += `   - 📄 *Submissions:* ${main.submission_count}\n`;
problemListText += `   - 💬 *Discussions:* ${main.discussion_count}\n`;
problemListText += `   - 📦 *Solutions:* ${main.solution_count}\n`;
if (main.status) {
    problemListText += `   - 🚀 *Status:* ${statusEmoji} ${main.status.charAt(0).toUpperCase() + main.status.slice(1)}\n\n`;
}

problemListText += `📜 *Description:*\n${main.description_body}\n\n`;
problemListText += `📘 *Editorial:*\n${editorial}\n\n`;
problemListText += `⚡ *Default Code (in ${main.code_default_language}):*\n${main.code_body?.default_code || "No default code available."}\n\n`;
problemListText += `-------------------------------------\n\n`;

return problemListText;
    }catch (error) {
        console.error("Error fetching problems:", error);
        return "An error occurred while fetching the problem list.";
    }
}
