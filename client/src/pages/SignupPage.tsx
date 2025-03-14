import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import axiosInstance from "../ts/utils/axios";
import axios, { AxiosError } from "axios";

const SignupPage = ({
    Data,
}: {
    Data: {
        token: string;
        setTokenFunction: (string: string) => void;
        id: string;
        setIdFunction: (string: string) => void;
    };
}) => {
    const [searchParams] = useSearchParams();
    const telegram_id = searchParams.get("telegram_id");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setisLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        setisLoading(true);
        setMessage(""); // Clear any previous messages

        try {
            if (password !== confirmPassword) {
                setMessage(
                    "Password and confirm password do not match. Please make sure you enter the same password in both fields."
                );
                setisLoading(false);
                return;
            }

            const response = await axiosInstance.post(
                `/api/accounts/signup`,
                {
                    username: username,
                    email: email,
                    telegram_id: telegram_id || "",
                    password: password,
                }
            );

            const data = response.data;

            if (!data.success) {
                setMessage(data.message || "Signup failed");
                setisLoading(false);
                return;
            }

            // Store tokens in localStorage
            if (data.token) {
                Data.setTokenFunction(data.token);
                localStorage.setItem("authToken", data.token);
            }

            if (data.accessToken) {
                localStorage.setItem("authToken", data.accessToken);
            }

            if (data.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
            }

            if (data.id) {
                Data.setIdFunction(data.id);
                localStorage.setItem("id", data.id);
            }

            navigate("/problemset");
        } catch (error) {
            console.error("Sign-up failed:", error);

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ message?: string, success?: boolean }>;

                if (axiosError.response) {
                    // Server responded with an error
                    setMessage(
                        axiosError.response.data?.message ||
                        "Signup failed. Please check your information."
                    );
                } else if (axiosError.request) {
                    // Request was made but no response received
                    setMessage("Cannot connect to server. Please try again later.");
                } else {
                    // Something else happened while setting up the request
                    setMessage(axiosError.message || "An error occurred. Please try again.");
                }
            } else {
                // For non-Axios errors
                setMessage("An unexpected error occurred. Please try again.");
            }
        } finally {
            setisLoading(false);
        }
    };
    return (
        <>
            <Link to={"/"}>
                <div
                    id="logo-cont"
                    className="inline-block relative text-[24px] left-1/2 -translate-x-1/2 font-bold italic mx-auto mt-[12px]"
                >
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 px-[1px]">

                        Creator
                    </span>
                    <span>Platform</span>
                </div>
            </Link>
            <div className="min-h-fit w-[300px] mx-auto text-[14px]">
                <div className="relative bg-black shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-[34px] font-bold mb-[30px] text-center mt-[60px]">
                        Sign Up
                    </h2>
                    <div className="mb-4">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-orange-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-orange-500"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-orange-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-orange-500"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-orange-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-orange-500"
                            type="password"
                            placeholder="Password"
                            value={password}

                            onChange={(e) => setPassword(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-orange-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-orange-500"
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-orange-500 hover:bg-red-600 text-black font-bold py-[6px] px-4 rounded focus:outline-none focus:shadow-outline w-full transition"
                            type="button"
                            onClick={handleSignUp}
                        >
                            {isLoading ? (
                                <div className="w-full block h-[21px]">
                                    <div className="absolute left-1/2 -translate-x-1/2">
                                        <Loading />
                                    </div>
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-[20px]">
                        <span className="text-text_2">
                            Already have an account?{" "}
                        </span>
                        <Link
                            to={`/login?telegram_id=${telegram_id}`}
                            className="text-orange-500 hover:text-red-600"
                        >
                            Login
                        </Link>
                    </div>
                    <div className="text-center mt-[20px] text-red-600 w-full overflow-hidden">
                        {message}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignupPage;
