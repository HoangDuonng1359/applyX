import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../component/sidebar';

// Types
interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface ChatSession {
    session_id: string;
}

// API Configuration
const BASE_API_URL = 'http://localhost:8000'; // Change this to your API URL

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);

    const chatMessagesRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Suggestions for quick replies
    const suggestions = [
        'Các ngành học phù hợp với tôi?',
        'Điểm chuẩn các trường đại học?',
        'Học phí các trường như thế nào?',
        'Thời gian đăng ký xét tuyển?',
        'Tư vấn định hướng nghề nghiệp'
    ];

    // Sidebar menu items
    const menuItems = [
        { icon: '🎯', label: 'Định hướng bản thân', active: false },
        { icon: '📊', label: 'Kết quả phân tích', active: false },
        { icon: '🤖', label: 'Chatbot AI', active: true },
        { icon: '📁', label: 'Hồ sơ & Tài liệu', active: false }
    ];

    // Create session when component mounts
    useEffect(() => {
        createSession();
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Focus input when connected
    useEffect(() => {
        if (isConnected && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isConnected]);

    const createSession = async (): Promise<void> => {
        try {
            const response = await fetch(`${BASE_API_URL}/chatbot/session`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const data: ChatSession = await response.json();
            setSessionId(data.session_id);
            setIsConnected(true);
            console.log('Session created:', data.session_id);

        } catch (error) {
            console.error('Cannot create session:', error);
            setShowWelcome(false);
            addMessage('Xin lỗi, không thể kết nối đến máy chủ. Vui lòng tải lại trang.', 'bot');
        }
    };

    const addMessage = (content: string, sender: 'user' | 'bot'): void => {
        const newMessage: Message = {
            id: Date.now().toString(),
            content,
            sender,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const sendMessage = async (): Promise<void> => {
        const message = inputValue.trim();
        if (message === '' || !isConnected || !sessionId) return;

        // Hide welcome message on first interaction
        if (showWelcome) {
            setShowWelcome(false);
        }

        // Add user message
        addMessage(message, 'user');
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch(`${BASE_API_URL}/chatbot/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const data = await response.json();
            const botReply = data.response;

            setIsTyping(false);
            addMessage(botReply, 'bot');

        } catch (error) {
            console.error('Error sending message:', error);
            setIsTyping(false);
            addMessage('Xin lỗi, đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.', 'bot');
        }
    };

    const sendSuggestion = (suggestion: string): void => {
        if (!isConnected) return;
        setInputValue(suggestion);
        // Auto-send the suggestion
        setTimeout(() => {
            const event = new Event('submit');
            sendMessage();
        }, 100);
    };

    const scrollToBottom = (): void => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Render markdown-like content (basic implementation)
    const renderContent = (content: string) => {
        return <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />;
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm">
                    <h1 className="text-2xl font-semibold text-slate-900 mb-2">Chatbot AI</h1>
                    <p className="text-sm text-slate-600">
                        Trò chuyện với AI để được tư vấn và hỗ trợ về định hướng nghề nghiệp
                    </p>
                </div>

                {/* Chat Container */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div
                        ref={chatMessagesRef}
                        className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400"
                    >
                        {/* Welcome Message */}
                        {showWelcome && (
                            <div className="text-center py-12 max-w-2xl mx-auto">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">
                                    🤖
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 mb-3">
                                    Chào mừng đến với Chatbot AI!
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Tôi là trợ lý AI của bạn, sẵn sàng hỗ trợ về tư vấn tuyển sinh, định hướng nghề nghiệp,
                                    và trả lời mọi thắc mắc của bạn. Hãy bắt đầu cuộc trò chuyện bằng cách chọn một gợi ý
                                    bên dưới hoặc nhập câu hỏi của bạn.
                                </p>
                            </div>
                        )}

                        {/* Messages */}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-4 max-w-3xl animate-in slide-in-from-bottom-5 duration-400 ${message.sender === 'user'
                                    ? 'self-end flex-row-reverse max-w-2xl'
                                    : 'self-start'
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm ${message.sender === 'bot'
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                                        : 'bg-gradient-to-br from-slate-500 to-slate-600 text-white'
                                        }`}
                                >
                                    {message.sender === 'bot' ? '🤖' : '👤'}
                                </div>
                                <div
                                    className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${message.sender === 'user'
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-transparent'
                                        : 'bg-white text-slate-700 border-slate-100'
                                        }`}
                                >
                                    {renderContent(message.content)}
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex gap-4 max-w-3xl self-start">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-lg text-white flex-shrink-0 shadow-sm">
                                    🤖
                                </div>
                                <div className="bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                                    <span className="text-sm text-slate-500">AI đang suy nghĩ</span>
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                                                style={{
                                                    animationDelay: `${i * 0.2}s`,
                                                    animation: 'pulse 1.4s infinite ease-in-out'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="bg-white border-t border-slate-200 p-8">
                        {/* Quick Suggestions */}
                        <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => sendSuggestion(suggestion)}
                                    disabled={!isConnected}
                                    className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-full text-xs text-slate-600 cursor-pointer whitespace-nowrap transition-all font-medium hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-600 disabled:hover:translate-y-0"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>

                        {/* Input Field */}
                        <div className="flex gap-3 items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 px-5 py-4 border border-slate-200 rounded-xl outline-none text-sm transition-all bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                                placeholder={
                                    isConnected
                                        ? 'Nhập câu hỏi của bạn...'
                                        : 'Đang kết nối với AI...'
                                }
                                maxLength={500}
                                disabled={!isConnected}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!isConnected || inputValue.trim() === ''}
                                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 border-0 rounded-xl text-white cursor-pointer flex items-center justify-center transition-all text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-blue-500/10"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;