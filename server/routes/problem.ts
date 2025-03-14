import express, { json } from "express";
import { writeTestFile } from "../utils/createTest";
import ProblemModel from "../models/problem";
import UserModel from "../models/user";
import { DProblem, EditorialData } from "../models/problem";
import {
    sortByAcceptance,
    sortByDifficulty,
    sortByTitle,
} from "../utils/utils";
import { Submission } from "../types/problem";
import { Auth, authenticateToken } from "../middlewares/token";

interface ApiResponse<T> {
    data: T;
    accessToken?: string;
    refreshToken?: string;
}

interface ErrorResponse {
    success: false;
    message: string;
}

interface NotFoundResponse {
    error: string;
}

const problem = express.Router();

// Apply Auth middleware to all routes
problem.use(Auth);

problem.post("/all", async (req, res) => {
    const { id } = req.body;
    const search = req.query.search || "";
    const difficulty = req.query.difficulty || "";
    const acceptance = req.query.acceptance || "";
    const title = req.query.title || "";

    try {
        const allProblems = await ProblemModel.find(
            { "main.name": { $regex: search, $options: "i" } },
            "main.id main.name main.acceptance_rate_count main.difficulty main.like_count main.dislike_count"
        )
            .sort({ "main.id": 1 })
            .exec();

        const allProblemsSorted = sortByAcceptance(
            acceptance.toString() as any,
            sortByDifficulty(
                difficulty.toString() as any,
                sortByTitle(title.toString() as any, allProblems)
            )
        );

        const user = await UserModel.findById(id);
        const sOrA = {
            solved: user?.problems_solved,
            attempted: user?.problems_attempted,
        };

        let allProblemsArray: DProblem[] = JSON.parse(
            JSON.stringify(allProblemsSorted)
        );

        if (sOrA.attempted) {
            for (let i = 0; i < allProblemsArray.length; i++) {
                if (sOrA.attempted.includes(allProblemsArray[i].main.name)) {
                    allProblemsArray[i].main.status = "attempted";
                }
            }
        }
        if (sOrA.solved) {
            for (let i = 0; i < allProblemsArray.length; i++) {
                if (sOrA.solved.includes(allProblemsArray[i].main.name)) {
                    allProblemsArray[i].main.status = "solved";
                }
            }
        }

        const response: ApiResponse<{ allProblemsArray: DProblem[] }> = {
            data: { allProblemsArray },
            accessToken: req.cookies.accessToken,
            refreshToken: req.cookies.refreshToken,
        };
        res.json(response);
    } catch (e) {
        console.log(e);
        const errorResponse: ErrorResponse = {
            success: false,
            message: "Internal Server Error",
        };
        res.status(500).json(errorResponse);
    }
});

problem.post<
    { name: string },
    | ApiResponse<{ submissions: Submission[] }>
    | ErrorResponse
    | NotFoundResponse,
    { code: string; id: string; problem_name: string }
>("/submit/:name", authenticateToken, async (req, res) => {
    const { name } = req.params;
    const { id, problem_name } = req.body;

    try {
        const problem = await ProblemModel.findOne({
            "main.name": name,
        });
        const user = await UserModel.findById(id);
        if (!user) {
            const errorResponse: NotFoundResponse = { error: "user not found" };
            res.json(errorResponse);
            return;
        }
        let history: Submission[] | null;
        if (user.submissions) {
            history = user.submissions;
        } else {
            history = null;
        }
        if (problem) {
            writeTestFile(req.body.code, problem.test, problem.function_name)
                .then(async (resolve) => {
                    if (resolve.stdout != undefined) {
                        console.log(resolve.stdout);
                        let submission: Submission[] = [
                            {
                                problem_name: problem_name,
                                status: resolve.stdout.status,
                                error: resolve.stdout.error_message,
                                time: resolve.stdout.date,
                                runtime: resolve.stdout.runtime,
                                language: "JavaScript",
                                memory: Math.random() * 80,
                                code_body: resolve.code_body,
                                input: resolve.stdout.input,
                                expected_output: resolve.stdout.expected_output,
                                user_output: resolve.stdout.user_output,
                            },
                        ];
                        if (history != null) {
                            submission.push(...history);
                        }

                        const subsByName = submission.filter(
                            (elem) => elem.problem_name === problem_name
                        );
                        user.submissions = submission;

                        if (submission[0].status === "Accepted") {
                            if (!user.problems_solved.includes(problem_name)) {
                                user.problems_solved.push(problem_name);
                                user.problems_solved_count += 1;
                            }
                        } else {
                            if (
                                !user.problems_attempted.includes(problem_name)
                            ) {
                                user.problems_attempted.push(problem_name);
                            }
                        }
                        await user.save();
                        const response: ApiResponse<{
                            submissions: Submission[];
                        }> = {
                            data: { submissions: subsByName },
                            accessToken: req.cookies.accessToken,
                            refreshToken: req.cookies.refreshToken,
                        };
                        res.json(response);
                    }
                })
                .catch(async (e) => {
                    let submission: Submission[] = [
                        {
                            problem_name: problem_name,
                            status: "Runtime Error",
                            error: e,
                            time: new Date(),
                            runtime: 0,
                            language: "JavaScript",
                            memory: Math.random() * 80,
                            code_body: undefined,
                        },
                    ];
                    if (history) {
                        submission.push(...history);
                    }

                    if (!user.problems_attempted.includes(problem_name)) {
                        user.problems_attempted.push(problem_name);
                    }

                    const subsByName = submission.filter(
                        (elem) => elem.problem_name === problem_name
                    );

                    user.submissions = submission;
                    await user.save();
                    const response: ApiResponse<{ submissions: Submission[] }> =
                        {
                            data: { submissions: subsByName },
                            accessToken: req.cookies.accessToken,
                            refreshToken: req.cookies.refreshToken,
                        };
                    res.json(response);
                });
        }
    } catch (e) {
        console.log(e);
        const errorResponse: ErrorResponse = {
            success: false,
            message: "Internal Server Error",
        };
        res.status(500).json(errorResponse);
    }
});

problem.post<
    { name: string },
    | ApiResponse<{ submissions: Submission[] }>
    | ErrorResponse
    | NotFoundResponse,
    { id: string }
>("/submissions/:name", authenticateToken, async (req, res) => {
    const { name } = req.params;
    const { id } = req.body;
    try {
        const user = await UserModel.findById(id);
        if (!user) {
            const errorResponse: NotFoundResponse = { error: "User not found" };
            res.json(errorResponse);
            return;
        }
        if (!user.submissions) {
            const response: ApiResponse<{ submissions: Submission[] }> = {
                data: { submissions: [] },
                accessToken: req.cookies.accessToken,
                refreshToken: req.cookies.refreshToken,
            };
            res.json(response);
            return;
        }

        const subsByName = user.submissions.filter(
            (elem) => elem.problem_name === name
        );

        const response: ApiResponse<{ submissions: Submission[] }> = {
            data: { submissions: subsByName },
            accessToken: req.cookies.accessToken,
            refreshToken: req.cookies.refreshToken,
        };
        res.json(response);
    } catch (e) {
        console.log(e);
        const errorResponse: ErrorResponse = {
            success: false,
            message: "Internal Server Error",
        };
        res.status(500).json(errorResponse);
    }
});

problem.post<
    { name: string },
    ApiResponse<{ problem: DProblem }> | ErrorResponse | NotFoundResponse,
    { id: string }
>("/:name", authenticateToken, async (req, res) => {
    const { name } = req.params;
    const { id } = req.body;
    try {
        const problem = await ProblemModel.findOne({
            "main.name": name,
        });

        const user = await UserModel.findById(id);
        const problemJson: DProblem = JSON.parse(JSON.stringify(problem));

        if (user?.problems_attempted.includes(name)) {
            problemJson.main.status = "attempted";
        }
        if (user?.problems_solved.includes(name)) {
            problemJson.main.status = "solved";
        }

        if (problemJson) {
            const response: ApiResponse<{ problem: DProblem }> = {
                data: { problem: problemJson },
                accessToken: req.cookies.accessToken,
                refreshToken: req.cookies.refreshToken,
            };
            res.json(response);
        } else {
            const errorResponse: NotFoundResponse = {
                error: "Problem not found",
            };
            res.json(errorResponse);
        }
    } catch (e) {
        console.log(e);
        const errorResponse: ErrorResponse = {
            success: false,
            message: "Internal Server Error",
        };
        res.status(500).json(errorResponse);
    }
});

problem.get<
    { name: string },
    ApiResponse<{ editorial: EditorialData }> | ErrorResponse | NotFoundResponse
>("/:name/editorial", authenticateToken, async (req, res) => {
    const name = req.params.name;
    try {
        const problem = await ProblemModel.findOne({ "main.name": name });
        if (problem) {
            const response: ApiResponse<{ editorial: EditorialData }> = {
                data: { editorial: problem.editorial },
                accessToken: req.cookies.accessToken,
                refreshToken: req.cookies.refreshToken,
            };
            res.json(response);
        } else {
            const errorResponse: NotFoundResponse = {
                error: "Problem not found",
            };
            res.json(errorResponse);
        }
    } catch (e) {
        console.log(e);
        const errorResponse: ErrorResponse = {
            success: false,
            message: "Internal Server Error",
        };
        res.status(500).json(errorResponse);
    }
});

export default problem;
