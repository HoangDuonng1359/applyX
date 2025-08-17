const Sidebar = () => {
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
                        <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">Định hướng bản thân</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <div className="w-5 h-5 flex items-center justify-center">📊</div>
                            <span>Kết quả phân tích</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <div className="w-5 h-5 flex items-center justify-center">💬</div>
                            <span>Chatbox AI</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <div className="w-5 h-5 flex items-center justify-center">📁</div>
                            <span>Hồ sơ & Tài liệu</span>
                        </div>
                    </div>
            </div>
    )
}

export default Sidebar;