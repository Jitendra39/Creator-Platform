import { useEffect, useState } from "react";
import ProblemPage from "./pages/ProblemPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProblemSet from "./pages/ProblemSet";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ErrorPage from "./pages/ErrorPage";
import ProfilePage from "./pages/ProfilePage";
import SettingPage from "./pages/SettingPage";
import { API_URL } from "./config";

export const TOKEN_STORAGE_KEY = "authToken";
export const ID_STORAGE_KEY = "id";

const getCookieValue = (name: string): string | undefined => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : undefined;
};
export let accessToken = getCookieValue('accessToken');
export let refreshToken = getCookieValue('refreshToken');

function App() {
    const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY));
    const [id, setId] = useState(localStorage.getItem(ID_STORAGE_KEY));

    const changeToken = (string: string) => {
        setToken(string);
    };
    const changeId = (string: string) => {
        setId(string);
    };

    useEffect(() => {
        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        if (id) {
            localStorage.setItem(ID_STORAGE_KEY, id);
        } else {
            localStorage.removeItem(ID_STORAGE_KEY);
        }
    }, [token, id]);

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<LandingPage accessToken={accessToken} refreshToken={refreshToken} token={token} id={id} />}
                    />
                    <Route
                        path="/problemset"
                        element={<ProblemSet accessToken={accessToken} refreshToken={refreshToken} token={token} id={id} />}
                    />
                    <Route
                        path="/problem/:name/editorial"
                        element={
                            <ProblemPage
                                accessToken={accessToken} refreshToken={refreshToken}
                                data={{ activeNavOption: "editorial" }}
                                token={token}
                                id={id}
                            />
                        }
                    />
                    <Route
                        path="/problem/:name/solutions"
                        element={
                            <ProblemPage
                                accessToken={accessToken} refreshToken={refreshToken}
                                data={{ activeNavOption: "solutions" }}
                                token={token}
                                id={id}
                            />
                        }
                    />
                    <Route
                        path="/problem/:name/submissions"
                        element={
                            <ProblemPage
                                accessToken={accessToken} refreshToken={refreshToken}
                                data={{ activeNavOption: "submissions" }}
                                token={token}
                                id={id}
                            />
                        }
                    />
                    <Route
                        path="/problem/:name"
                        element={
                            <ProblemPage
                                accessToken={accessToken} refreshToken={refreshToken}
                                data={{ activeNavOption: "description" }}
                                token={token}
                                id={id}
                            />
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <SignupPage

                                Data={{
                                    token: token || "",
                                    setTokenFunction: changeToken,
                                    id: id || "",
                                    setIdFunction: changeId,
                                }}
                            />
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <LoginPage

                                Data={{
                                    token: token || "",
                                    setTokenFunction: changeToken,
                                    id: id || "",
                                    setIdFunction: changeId,
                                }}
                            />
                        }
                    />
                    <Route
                        path="/sorry"
                        element={
                            <ErrorPage

                                data={{
                                    header: "Sorry :(",
                                    message:
                                        "If you already have an account, please log in. If you don't, please sign up.",
                                    links: [
                                        {
                                            text: "Login",
                                            link_path: "/login",
                                        },
                                        {
                                            text: "Signup",
                                            link_path: "/signup",
                                        },
                                    ],
                                }}
                            />
                        }
                    />
                    <Route
                        path="/settings"
                        element={<SettingPage
                            accessToken={accessToken} refreshToken={refreshToken}
                            token={token} id={id} />}
                    />
                    <Route
                        path="/accounts/:name"
                        element={<ProfilePage
                            accessToken={accessToken} refreshToken={refreshToken}
                            token={token} id={id} />}
                    />

                    <Route
                        path="*"
                        element={
                            <ErrorPage

                                data={{
                                    header: "404",
                                    message: "Page not found.",
                                    links: [
                                        { text: "Main Page", link_path: "/" },
                                        {
                                            text: "Problem List",
                                            link_path: "/problemset",
                                        },
                                    ],
                                }}
                            />
                        }
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
