import React, { useState } from 'react';

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
    const [questionCount, setQuestionCount] = useState<number>(0); // Đếm số câu

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
        }
    };

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

            let question = "";
            let options: string[] = [];

            if (questionCount < 8) {
                const questionMatch = data.response.match(/\*\*Câu\s*\d+:\*\*\s*(.+)/);
                question = questionMatch ? questionMatch[1].trim() : "";

                options = Array.from(
                    data.response.matchAll(/[a-e]\)\s*(.+)/g)
                ).map((m: any) => m[1].trim());
            } else {
                const questionMatch = data.response.match(/\*\*Option\s*\d+:\*\*\s*(.+)/);
                question = questionMatch ? questionMatch[1].trim() : "";
                options = [];
            }

            setQuestionCount((prev) => prev + 1);

            setQuiz({
                id: questionCount + 1,
                question,
                options,
            });

            console.log("Parsed question:", { question, options });
        } catch (error) {
            console.error("Error fetching ikigai question:", error);
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
        setAnswer(""); // reset lại
        await generateQuestion(sessionId, finalAnswer);
    };

    return (
        <div>
            {!isStarted ? (
                <button onClick={startJourney}>Start</button>
            ) : (
                <div>
                    {quiz ? (
                        <>
                            <h2>{quiz.question}</h2>
                            {/* Nếu <= 8 câu thì hiển thị trắc nghiệm */}
                            {questionCount <= 8 ? (
                                <ul>
                                    {quiz.options.map((opt, idx) => (
                                        <li key={idx}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="answer"
                                                    value={opt}
                                                    checked={answer === opt}
                                                    onChange={() => setAnswer(opt)}
                                                />
                                                {opt}
                                            </label>

                                            {opt.toLowerCase() === "khác" && answer === opt && (
                                                <input
                                                    type="text"
                                                    placeholder="Nhập câu trả lời của bạn"
                                                    value={otherAnswer}
                                                    onChange={(e) => setOtherAnswer(e.target.value)}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ul>

                            ) : (
                                // Sau 8 câu thì hiển thị input text
                                <textarea
                                    rows={3}
                                    cols={50}
                                    placeholder="Nhập câu trả lời của bạn..."
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                />
                            )}

                            <button onClick={handleNext}>Next</button>
                        </>
                    ) : (
                        <p>Đang tải câu hỏi...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Ikigai;
