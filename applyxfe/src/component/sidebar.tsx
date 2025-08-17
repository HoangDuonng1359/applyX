import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-8">
                <img
                    src="/logo.png"
                    alt="ApplyX Logo"
                    className="w-10 h-10 rounded-xl object-cover"
                />
                <span className="text-xl font-semibold text-gray-800">ApplyX</span>
            </div>

            <div className="space-y-2">
                <div className="text-sm text-gray-500 mb-4">Hành trình của bạn</div>
                <div
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        location.pathname === "/" || location.pathname === "/ikigai-career"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/ikigai-career")}
                >
                    <div className="w-5 h-5 flex items-center justify-center">🚀</div>
                    <span>Định hướng bản thân</span>
                </div>
                <div
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        location.pathname.startsWith("/ikigai-result")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/ikigai-result/demo")}
                >
                    <div className="w-5 h-5 flex items-center justify-center">📊</div>
                    <span>Kết quả phân tích</span>
                </div>
                <div
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        location.pathname === "/chatbox"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/chatbox")}
                >
                    <div className="w-5 h-5 flex items-center justify-center">💬</div>
                    <span>Chatbox AI</span>
                </div>
                <div
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        location.pathname === "/profile"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => navigate("/profile")}
                >
                    <div className="w-5 h-5 flex items-center justify-center">📁</div>
                    <span>Hồ sơ</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;