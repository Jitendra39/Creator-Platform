import { useState } from "react";
import CustomNavbar from "../components/CustomNavbar";
import ProblemList from "../components/ProblemList";
import MainHeading from "../components/MainHeading";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../ts/utils/axios";

interface ProblemSetProps {
    token: string | null;
    id: string | null;
    accessToken: string | undefined;
    refreshToken: string | undefined;
}

const ProblemSet: React.FC<ProblemSetProps> = ({ token, id, accessToken, refreshToken }) => {
    const [username, setUsername] = useState<string>("");
    const [verified, setVerified] = useState<boolean>(false);
    const navigate = useNavigate();
    const [problemListData, setProblemListData] = useState();
    const customNavData: Navbar = {
        items: [
            { text: "All Topics", link_path: "/problemset" },
            { text: "Algorithms", link_path: "/problemset" },
            { text: "JavaScript", link_path: "/problemset" },
            { text: "DataBase", link_path: "/problemset" },
            { text: "Shell", link_path: "/problemset" },
        ],
    };

    const [searchQ, setSearchQ] = useState<string>("");

    const handleSearch = async (
        searchQuery: string,
        options: SortOptions = {
            acceptance_rate_count: "",
            difficulty: "",
            title: "",
        }
    ) => {
        const { acceptance_rate_count, difficulty, title } = options;
        try {
            const { data } = await axiosInstance.post(
                `/api/problem/all?search=${searchQuery}&acceptance=${acceptance_rate_count}&difficulty=${difficulty}&title=${title}`,
                { id }
            );
            setProblemListData(data.data.allProblemsArray);
        } catch (error) {
            console.error("Error searching:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get user data
                const userResponse = await axiosInstance.get(`/api/accounts/id/${id}?accessToken=${accessToken}&refreshToken=${refreshToken}`);
                setUsername(userResponse.data.username);
                setVerified(true);

                // Get problems
                const problemsResponse = await axiosInstance.post('/api/problem/all', { id,accessToken,refreshToken });
                setProblemListData(problemsResponse.data.data.allProblemsArray);
            } catch (error) {
                console.error("Error fetching data:", error);
                navigate("/sorry");
                setVerified(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, navigate]);

    return (
        <>
            {verified ? (
                <MainHeading data={{ username: username }} />
            ) : (
                <MainHeading data={{ status: "none" }} />
            )}

            <div className="h-[calc(100vh-60px)] overflow-hidden bg-black">
                <div
                    id="cont"
                    className="relative flex flex-row h-[calc(100vh-60px)] w-full mt-[8px] "
                >
                    <div
                        id="explanation"
                        className="h-[calc(100%-16px)] bg-black border border-borders ml-[8px] rounded-lg w-[calc(100%-16px)] overflow-hidden"
                    >
                        <div className="w-full bg-black border-b border-borders ">
                            <div className="ml-[9px]">
                                <CustomNavbar data={customNavData} />
                            </div>
                        </div>
                        <div className="w-full bg-black h-[40px] relative border-b border-borders">
                            <input
                                type="text"
                                placeholder="Search questions..."
                                onChange={(e) => {
                                    handleSearch(e.target.value);
                                    setSearchQ(e.target.value);
                                }}
                                className="bg-black outline-none border-none relative -translate-y-1/2 top-1/2 left-[9px] px-[20px] text-[14px] h-[calc(100%-2px)] placeholder:text-[14px] placeholder:text-text_2 w-[calc(100%-100px)]"
                            />
                        </div>
                        <div>
                            <ProblemList
                                searchFn={handleSearch}
                                searchQuery={searchQ}
                                data={problemListData as any}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProblemSet;
