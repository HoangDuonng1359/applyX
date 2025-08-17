import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Users, Heart, DollarSign, Globe, Mic, MicOff } from 'lucide-react';
import { count } from 'console';
import { useNavigate } from "react-router-dom";
import Sidebar from '../component/sidebar';

interface Quiz {
    id: number;
    question: string;
    options: string[];
}

const Ikigai = () => {
    const [sessionId, setSessionId] = useState("");
    const [quiz, setQuiz] = useState<Quiz>();
    const [answer, setAnswer] = useState("");
    const [otherAnswer, setOtherAnswer] = useState("");
    const [isStarted, setIsStarted] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [questionCount, setQuestionCount] = useState<number>(0);
    const totalQuestions = 18;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [data, setData] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const navigate = useNavigate();
    useEffect(() => {
    document.title = "Định hướng bản thân | ApplyX";
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
        (link as HTMLLinkElement).href = "/logo2.png";
    }
    }, []);


    const getsessionID = async () => {
        try {
            const res1 = await fetch("http://127.0.0.1:8000/chat/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const data = await res1.json();
            console.log("Session data:", data);

            const sessionId = data.session_id;
            setSessionId(sessionId);
            return sessionId;
        } catch (error) {
            console.error("Error starting journey:", error);
            const mockSessionId = "demo-" + Date.now();
            setSessionId(mockSessionId);
            return mockSessionId;
        }
    };

    const saveResult = async (results: string) => {
        if (!sessionId) {
            console.log("Chưa có sessionId!");
            return;
        }
        try {
            const res = await fetch("http://127.0.0.1:8000/chat/saveResult", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    result: results
                })
            });
            const data = await res.json();
            if (res.ok) {
                console.log("Lưu kết quả thành công!");
            } else {
                console.log("Lỗi khi lưu kết quả: " + data.detail);
            }
        } catch (error) {
            console.log("Lỗi kết nối khi lưu kết quả!");
            console.error(error);
        }
        
    }

    const generateQuestion = async (sessionId: string, mess: string) => {
        try {
            const res = await fetch("http://127.0.0.1:8000/chat/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: mess,
                }),
            });

            const data = await res.json();
            console.log("Raw data:", data);
            setData(data);
            let question = "";
            let options: string[] = [];

            setQuestionCount((prev) => prev + 1);
            const currentCount = questionCount + 1;

            if (currentCount <= 8) {
                const questionMatch = data.response.match(/Câu\s*\d+:\s*([\s\S]*?)(?=\s*[a-e]\)|\n|$)/);

                question = questionMatch ? questionMatch[1].trim() : "";

                const optionMatches = Array.from(
                    data.response.matchAll(/([a-e])\)\s*([^\n]+?)(?=\s*[a-e]\)|$)/g)
                ) as RegExpMatchArray[];

                options = optionMatches.map(match => match[2].trim());

            } else {

                const questionMatch = data.response.match(/Option\s*\d+:\s*(.+)/);
                question = questionMatch ? questionMatch[1].trim() : "";
                options = []; 
            }

            setQuiz({
                id: currentCount,
                question,
                options,
            });

            console.log("Parsed question:", { question, options });
        } catch (error) {
            console.error("Error fetching ikigai question:", error);
            // Mock question for demo
            const mockQuestions = [
                {
                    question: "At a social event, you often:",
                    options: [
                        "Share interesting articles or ideas you've discovered",
                        "Organize activities or games for everyone",
                        "Tell stories that inspire or entertain",
                        "Make sure everyone feels included and comfortable",
                        "Khác"
                    ]
                },
                {
                    question: "When working on a project, what motivates you most?",
                    options: [
                        "The opportunity to learn something new",
                        "Helping others solve their problems",
                        "Creating something beautiful or meaningful",
                        "The potential financial rewards",
                        "Khác"
                    ]
                },
                {
                    question: "What type of work environment do you thrive in?",
                    options: [
                        "Collaborative team settings",
                        "Independent, quiet spaces",
                        "Dynamic, fast-paced environments",
                        "Structured, organized workplaces",
                        "Khác"
                    ]
                },
                {
                    question: "Describe your ideal way to spend free time and what activities make you feel most fulfilled.",
                    options: []
                },
                {
                    question: "What specific skills or talents do you feel you excel at, and how do you like to use them?",
                    options: []
                }
            ];

            const currentCount = questionCount + 1;
            setQuestionCount(currentCount);

            if (currentCount > totalQuestions) {
                setIsCompleted(true);
                return;
            }

            const currentQ = mockQuestions[Math.min(currentCount - 1, mockQuestions.length - 1)];

            setQuiz({
                id: currentCount,
                question: currentQ.question,
                options: currentCount <= 8 ? currentQ.options : [],
            });
        } finally {
            if (questionCount >= 1) setIsLoading(false);
        }
    };

    const startJourney = async () => {
        setIsStarted(true);
        const sessionId = await getsessionID();
        console.log(sessionId);
        await generateQuestion(sessionId, "Bắt đầu ikigai");
    };

    const handleNext = async () => {
        const finalAnswer = answer === "Khác" ? otherAnswer : answer;
        if (!sessionId || !finalAnswer) {
            alert("Vui lòng nhập hoặc chọn một đáp án!");
            return;
        }

        console.log("User answer:", finalAnswer);
        setAnswer("");
        setOtherAnswer("");

        if (questionCount >= 1) setIsLoading(true);

        await generateQuestion(sessionId, finalAnswer);

        if (questionCount >= 1) setIsLoading(false);

        if (questionCount >= totalQuestions) {
            setIsCompleted(true);
            return;
        }
    };

    const handleMicClick = () => {
        if (!recognition) return;

        if (isListening) {
            // Dừng ghi âm
            setIsListening(false);
            recognition.stop();
        } else {
            // Bắt đầu ghi âm
            setIsListening(true);
            recognition.start();
        }
    };

    useEffect(() => {
        if (!recognition) return;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setAnswer(transcript);
            recognition.stop();
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        return () => {
            recognition.onstart = null;
            recognition.onend = null;
            recognition.onresult = null;
            recognition.onerror = null;
        };
    }, [recognition, isListening]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recog = new SpeechRecognition();
            recog.lang = 'vi-VN';
            recog.continuous = false;
            recog.interimResults = false;
            setRecognition(recog);
        }
    }, []);

    const progressPercentage = Math.round((questionCount / totalQuestions) * 100);

    // Landing Screen
    if (!isStarted && !isCompleted) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <Sidebar></Sidebar>
                {/* Main Content */}
                <div className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Hãy tìm xem định hướng của bạn
                        </h1>
                        <p className="text-gray-600 mb-12">
                            Dựa trên dữ liệu và câu trả lời của bạn, AI sẽ tìm ra công việc phù hợp nhất với bạn.
                        </p>

                        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                <div className="text-3xl">🎯</div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Tìm IKIGAI của bạn
                            </h2>

                            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                Khám phá điểm giao thoa giữa những gì bạn yêu thích và những gì thế giới cần.
                            </p>

                            <div className="bg-orange-50 p-6 rounded-xl mb-8 max-w-2xl mx-auto">
                                <div className="flex items-start gap-3">
                                    <div className="text-orange-500 mt-1">💡</div>
                                    <div className="text-left">
                                        <p className="text-gray-700">
                                            <strong> Ikigai là gì?</strong> Đây là một khái niệm của Nhật Bản có nghĩa là ‘lý do để tồn tại’. Ikigai của bạn nằm ở giao điểm giữa những gì bạn yêu thích, những gì bạn giỏi, những gì bạn có thể được trả công và những gì thế giới cần.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={startJourney}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Bắt đầu nào →
                            </button>

                            <p className="text-gray-500 text-sm mt-4">
                                Thời gian hoàn thành khoảng 8–12 phút
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Completion Screen
    if (isCompleted) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                    <Sidebar></Sidebar>
                {/* Main Content */}
                <div className="flex-1 p-5">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Hãy tìm xem định hướng của bạn
                        </h1>
                        <p className="text-gray-600 mb-10">
                            Dựa trên dữ liệu và câu trả lời của bạn, AI sẽ tìm ra công việc phù hợp nhất với bạn.
                        </p>

                        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                            <div className="mb-8">
                                <div className="w-32 h-32 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                        <div className="text-6xl">🏆</div>
                                    </div>
                                </div>

                                <div className="text-blue-500 text-sm mb-2 flex items-center gap-2 justify-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                Congratulations!
                            </h2>

                            <p className="text-gray-600 mb-12">
                                Làm xong bài test rồi
                            </p>

                            <button
                                onClick={async () => {
                                    if (data && (data as any).response) {
                                        await saveResult((data as any).response);
                                    }
                                    // Chuyển sang trang kết quả
                                    navigate(`/ikigai-result/${sessionId}`);
                                    // Reset state nếu muốn quay lại làm lại
                                    setIsCompleted(false);
                                    setIsStarted(false);
                                    setQuestionCount(0);
                                    setAnswer("");
                                    setOtherAnswer("");
                                    setQuiz(undefined);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Screen
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
                <Sidebar></Sidebar>
            {/* Main Content */}
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Hãy tìm xem định hướng của bạn
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Dựa trên dữ liệu và câu trả lời của bạn, AI sẽ tìm ra công việc phù hợp nhất với bạn.
                    </p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">
                                    Question {questionCount} of {totalQuestions}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {progressPercentage}% completed
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {quiz && !isLoading ? (
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                {quiz.question}
                            </h2>
                            {questionCount > 8 && (
                                <div className="bg-yellow-50 p-4 rounded-lg mb-6 flex items-center gap-2">
                                    <div className="text-yellow-600">💡</div>
                                    <span className="text-sm text-gray-700">Tip: bạn hãy đọc thật kĩ, trả lời rõ ràng nhé!</span>
                                </div>
                            )}

                            {/* Options */}
                            {questionCount <= 8 ? (
                                <div className="space-y-4 mb-8">
                                    {quiz.options.map((option, index) => (
                                        <label
                                            key={index}
                                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${answer === option
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="answer"
                                                value={option}
                                                checked={answer === option}
                                                onChange={() => setAnswer(option)}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${answer === option ? 'border-blue-500' : 'border-gray-300'
                                                }`}>
                                                {answer === option && (
                                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <span className="text-gray-700 flex-1">{option}</span>
                                        </label>
                                    ))}

                                    {/* Other option input */}
                                    {answer === "Khác" && (
                                        <div className="ml-9 mt-4">
                                            <input
                                                type="text"
                                                placeholder="Nhập câu trả lời của bạn"
                                                value={otherAnswer}
                                                onChange={(e) => setOtherAnswer(e.target.value)}
                                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-8 relative">
                                    <textarea
                                        rows={4}
                                        placeholder="Nhập câu trả lời của bạn..."
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleMicClick}
                                        className={`absolute right-4 top-4 p-2 rounded-full transition-all duration-200
                                            ${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        title={isListening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
                                    >
                                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                    {!(window as any).webkitSpeechRecognition && !(window as any).SpeechRecognition && (
                                        <p className="text-sm text-red-500 mt-2">
                                            Trình duyệt của bạn không hỗ trợ Speech Recognition
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!answer || (answer === "Khác" && !otherAnswer)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
                                >
                                    {questionCount >= totalQuestions ? 'Complete' : 'Next'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">{questionCount == totalQuestions ? "Chúng tôi đang phân tích..." : "Đang tải câu hỏi..."}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Ikigai;