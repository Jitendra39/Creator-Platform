import React, { SetStateAction, useEffect, useRef } from "react";
import { useState } from "react";
import ReactCodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { AxiosError } from "axios";
import axiosInstance from "../ts/utils/axios";
import ProblemNavbar from "../components/ProblemNavbar";
import ProblemDescription from "../components/ProblemDescription";
import { useNavigate, useParams } from "react-router-dom";
import Editorial from "../components/Editorial";
import MainHeading from "../components/MainHeading";
import Submissions from "../components/Submissions";
import Loading from "../components/Loading";

// Importing or defining the necessary types
interface DProblem {
    main: {
        id: number;
        name: string;
        difficulty: "easy" | "medium" | "hard";
        like_count: number;
        dislike_count: number;
        description_body: string;
        accept_count: number;
        submission_count: number;
        acceptance_rate_count: number;
        discussion_count: number;
        related_topics: string[];
        similar_questions: string[];
        solution_count: number;
        code_default_language: string;
        code_body: Record<string, string>;
        status?: string;
    };
    editorial: {
        editorial_body: string;
    };
}

// Define response interfaces that match the server's structure
interface ApiResponseWrapper {
    data: any;
    accessToken?: string;
    refreshToken?: string;
}

// Sample usage for type checking:
// axiosInstance.post<any, { data: ApiResponseWrapper }>

const ProblemPage = ({
    data,
    token,
    id,
    accessToken,
    refreshToken,
}: {
    accessToken: string | undefined;
    refreshToken: string | undefined;
    data?: ProblemPageData;
    token: string | null;
    id: string | null;
}) => {
    const [username, setUsername] = useState<string>("");
    const [initCode, setInitCode] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const explanationRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [currentLang, setCurrentLang] = useState<string>("javascript");
    const handleSlider = (event: React.MouseEvent<HTMLDivElement>) => {
        const mouseX = event.clientX;
        const newWidth = mouseX - 8;
        if (explanationRef.current)
            explanationRef.current.style.width = newWidth + "px";
    };

    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
    const [editorial, setEditorial] = useState<string>("");
    const activeNavOption = data?.activeNavOption || "description";
    const [problemDescriptionData, setProblemDescriptionData] =
        useState<DescriptionData>();
    const [submissionData, setSubmissionData] = useState<Submission[]>();
    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const { name } = useParams();

    const submitCode = () => {
        setIsSubmitLoading(true);
        if (!id || !name) {
            console.log("id not found");
            setIsSubmitLoading(false);
            return;
        }

        const problem_name = name;
        axiosInstance
            .post(
                `/api/problem/submit/${name}`,
                {
                    code,
                    id,
                    problem_name
                }
            )
            .then(response => {
                // Using type assertion to help TypeScript understand the structure
                const apiResponse = response.data as ApiResponseWrapper;
                if (apiResponse && apiResponse.data && apiResponse.data.submissions) {
                    setIsSubmitted(true);
                    setSubmissionData(apiResponse.data.submissions);
                    navigate(`/problem/${name}/submissions`);
                }
                setIsSubmitLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsSubmitLoading(false);
                setIsSubmitted(true);
            });
    };

    useEffect(() => {
        // Fetch problem details
        axiosInstance
            .post(`/api/problem/${name}`, { id: id })
            .then(response => {
                // Using type assertion to help TypeScript understand the structure
                const apiResponse = response.data as ApiResponseWrapper;
                if (apiResponse && apiResponse.data && apiResponse.data.problem) {
                    const problemData = apiResponse.data.problem.main;
                    setProblemDescriptionData(problemData as unknown as DescriptionData);

                    if (problemData.code_body && problemData.code_body.javascript) {
                        setInitCode(problemData.code_body.javascript);
                    }
                } else {
                    console.error("Unexpected response format:", response.data);
                }
            })
            .catch((e) => console.error(e));

        // Fetch user info
        if (!id) return;
        axiosInstance
            .get(`/api/accounts/id/${id}`)
            .then(({ data }) => {
                setUsername(data.username);
            })
            .catch((e: AxiosError) => {
                console.log(e);
                navigate("/sorry");
            });

        // Fetch submissions
        if (!id || !name) {
            console.log("id not found");
            return;
        }

        axiosInstance
            .post(`/api/problem/submissions/${name}`, { id: id || "" })
            .then(response => {
                // Using type assertion to help TypeScript understand the structure
                const apiResponse = response.data as ApiResponseWrapper;
                if (apiResponse && apiResponse.data && apiResponse.data.submissions) {
                    const submissions = apiResponse.data.submissions;
                    if (submissions.length !== 0) {
                        setCode(submissions[0].code_body);
                    }
                    setSubmissionData(submissions);
                } else {
                    console.error("Unexpected submissions response format:", response.data);
                }
            })
            .catch((e) => console.log(e));
    }, []);

    useEffect(() => {
        if (activeNavOption === "description") return;

        axiosInstance
            .get(`/api/problem/${name}/${activeNavOption}`)
            .then(response => {
                // Using type assertion to help TypeScript understand the structure
                const apiResponse = response.data as ApiResponseWrapper;
                if (activeNavOption === "editorial" &&
                    apiResponse &&
                    apiResponse.data &&
                    apiResponse.data.editorial) {
                    setEditorial(apiResponse.data.editorial.editorial_body);
                }
            })
            .catch((e) => console.error(e));
    }, [activeNavOption]);

    return (
        <>
            <MainHeading
                data={{
                    items: [{ text: "Problem List", link_path: "/problemset" }],
                    username: username,
                }}
            />
            <div className="h-[calc(100vh-60px)] overflow-hidden bg-black">
                <div
                    id="cont"
                    className="relative flex flex-row h-[calc(100vh-60px)] w-full mt-[8px] "
                >
                    <div
                        id="explanation"
                        className="h-[calc(100%-16px)] bg-black border border-borders ml-[8px] rounded-lg w-[50%] overflow-hidden"
                        ref={explanationRef}
                    >
                        <div className="relative w-full bg-black h-[50px] rounded-t-lg overflow-hidden border-b border-borders box-content">
                            {name != undefined && (
                                <ProblemNavbar
                                    data={{
                                        problem_name: name,
                                        nav_option_name: activeNavOption,
                                    }}
                                />
                            )}
                        </div>
                        <div className="description-body relative w-full h-[calc(100%-50px)] overflow-y-auto bg-black">
                            {problemDescriptionData != undefined &&
                                activeNavOption === "description" ? (
                                <>
                                    <ProblemDescription
                                        data={problemDescriptionData}
                                    />
                                </>
                            ) : activeNavOption === "description" ? (
                                <Loading For="pDescription" />
                            ) : (
                                <></>
                            )}
                            {activeNavOption === "editorial" &&
                                editorial != "" ? (
                                <Editorial data={editorial} />
                            ) : activeNavOption === "editorial" ? (
                                <Loading For="pEditorial" />
                            ) : (
                                <></>
                            )}

                            {activeNavOption === "submissions" &&
                                submissionData != undefined && (
                                    <Submissions
                                        data={{
                                            submissions_list: submissionData,
                                            is_submitted: isSubmitted,
                                        }}
                                    />
                                )}
                        </div>
                    </div>
                    <div
                        id="slider"
                        className="w-[8px] h-[calc(100%-16px)] rounded-lg hover:bg-blue-800 hover:cursor-col-resize transition active:bg-blue-800 active:cursor-col-resize"
                        onDrag={handleSlider}
                        ref={sliderRef}
                        draggable="true"
                    ></div>
                    <div className="flex flex-col h-[calc(100%-16px)] min-w-[calc(20%-8px)] mr-[8px] flex-grow">
                        <div className="min-h-0 flex-grow min-w-full mr-[8px] mb-[8px] rounded-lg overflow-hidden bg-black border border-borders">
                            <div className="h-[50px] bg-black relative border-b border-borders">
                                <div className=" inline-block relative w-fit h-fit rounded-md ml-[13px] top-[8px] px-[6px] py-[6px] text-text_2 hover:text-white cursor-pointer text-[14px] transition select-none">
                                    {currentLang}
                                </div>
                            </div>
                            <ReactCodeMirror
                                value={
                                    code === "" || code == null
                                        ? initCode || ""
                                        : code || ""
                                }
                                extensions={[loadLanguage("javascript")!]}
                                theme={tokyoNight}
                                onChange={(value) => {
                                    setCode(value);
                                }}
                                width="100%"
                                height="100%"
                            />
                        </div>
                        <div
                            id="console"
                            className="flex justify-end items-center bg-black w-full h-[50px] rounded-lg overflow-hidden border border-borders"
                        >
                            <div
                                className="w-fit h-fit rounded mr-[11px] px-[20px] py-[4px] hover:bg-green-500 cursor-pointer hover:text-black text-black bg-green-500 text-[14px] active:border-green-800 active:bg-green-800 border-green-500 font-bold right-0 transition select-none"
                                onClick={submitCode}
                            >
                                {isSubmitLoading ? (
                                    <div className="w-full block h-[21px]">
                                        <div className="">
                                            <Loading />
                                        </div>
                                    </div>
                                ) : (
                                    "Submit"
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProblemPage;
