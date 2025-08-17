# app/services/chat_services.py

import os
import uuid
from dotenv import load_dotenv

from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[1]   # .../applyxBE/app
PDFS_PATH = APP_DIR / "data"                    # .../applyxBE/app/data
VECTORSTORE_PATH = APP_DIR / "faiss_index"

# Tải các biến môi trường từ file .env
load_dotenv()

class ChatService:
    def __init__(self):
        """
        Khởi tạo ChatService, tải mô hình và thiết lập RAG chain.
        """
        # --- 1. Lấy API Key và kiểm tra ---
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY không được tìm thấy. Vui lòng kiểm tra file .env.")

        # --- 2. Đường dẫn và kiểm tra Vector Store ---
        self.vectorstore_path = VECTORSTORE_PATH
        if not os.path.exists(self.vectorstore_path):
            raise FileNotFoundError(f"Thư mục Vector Store '{self.vectorstore_path}' không tồn tại. "
                                    "Vui lòng chạy script để tạo index trước.")

        # --- 3. Khởi tạo các mô hình của Google ---
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", google_api_key=self.api_key, temperature=0.3)
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=self.api_key)

        # --- 4. Tải Vector Store ---
        self.vector_store = FAISS.load_local(
            self.vectorstore_path, 
            self.embeddings, 
            allow_dangerous_deserialization=True # Cần thiết cho FAISS
        )
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 5})

        # --- 5. Xây dựng RAG Chain có khả năng ghi nhớ lịch sử ---
        self.conversational_rag_chain = self._create_conversational_rag_chain()
        
        # --- 6. Quản lý các phiên chat (lưu trong bộ nhớ) ---
        self.sessions = {}

    def _create_conversational_rag_chain(self):
        """
        Tạo ra một chain phức tạp hơn, có khả năng xem lại lịch sử chat
        để hiểu câu hỏi mới trong ngữ cảnh của cuộc hội thoại.
        """
        # Prompt này dùng để biến câu hỏi mới (có thể là câu hỏi nối tiếp)
        # thành một câu hỏi độc lập dựa trên lịch sử trò chuyện.
        contextualize_q_system_prompt = (
            "Given a chat history and the latest user question "
            "which might reference context in the chat history, "
            "formulate a standalone question which can be understood "
            "without the chat history. Do NOT answer the question, "
            "just reformulate it if needed and otherwise return it as is."
        )
        contextualize_q_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", contextualize_q_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )
        # Tạo history-aware retriever
        history_aware_retriever = create_history_aware_retriever(
            self.llm, self.retriever, contextualize_q_prompt
        )

        # Prompt cuối cùng để Gemini trả lời câu hỏi DỰA TRÊN context (lấy từ PDF)
        qa_system_prompt = """
            Bạn là một trợ lý tư vấn tuyển sinh chuyên nghiệp và thân thiện của trường đại học.
            Hãy trả lời câu hỏi của người dùng một cách chi tiết và chính xác nhất có thể.
            Bạn CHỈ được trả lời dựa vào Context. Nếu Context không có thông tin, TRẢ LỜI NGAY:
            "Tôi không tìm thấy thông tin này trong tài liệu được cung cấp."
            Không được sử dụng kiến thức nền hoặc suy đoán.
            Context:
            {context}
            """
        qa_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", qa_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )
        
        # Chain này nhận context và câu hỏi để tạo câu trả lời
        document_prompt = ChatPromptTemplate.from_template(
            "Nguồn: {source} | Trang: {page}\n{page_content}"
        )

        question_answer_chain = create_stuff_documents_chain(
            self.llm, qa_prompt, document_prompt=document_prompt
        )

        # Kết hợp tất cả lại thành RAG chain cuối cùng
        rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
        
        return rag_chain

    def create_session(self) -> str:
        """Tạo một session chat mới và trả về session_id."""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {"chat_history": []}
        return session_id

    def send_message(self, session_id: str, message: str) -> str:
        """Xử lý tin nhắn từ người dùng và trả về câu trả lời của chatbot."""
        if session_id not in self.sessions:
            raise ValueError("Session ID không hợp lệ.")

        chat_history = self.sessions[session_id]["chat_history"]

        # Gọi RAG chain để xử lý
        
        response = self.conversational_rag_chain.invoke({
            "chat_history": chat_history,
            "input": message
        })

        answer = response["answer"]

        # Cập nhật lịch sử chat
        chat_history.append(HumanMessage(content=message))
        chat_history.append(AIMessage(content=answer))
        
        self.sessions[session_id]["chat_history"] = chat_history

        return answer
    
    def get_chat_history(self, session_id: str) -> list:
        """Lấy lịch sử của một phiên chat."""
        if session_id not in self.sessions:
            raise ValueError("Session ID không hợp lệ.")
        
        # Chuyển đổi object Message thành dict để dễ serialize qua JSON
        return [
            {"type": "human", "content": msg.content} if isinstance(msg, HumanMessage) 
            else {"type": "ai", "content": msg.content}
            for msg in self.sessions[session_id]["chat_history"]
        ]

    def get_session_info(self, session_id: str):
        if session_id not in self.sessions:
            raise ValueError("Session ID không hợp lệ.")
        return {
            "session_id": session_id,
            "history_length": len(self.sessions[session_id]["chat_history"])
        }

    def list_sessions(self) -> list:
        return list(self.sessions.keys())

    def delete_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]
        else:
            raise ValueError("Session ID không hợp lệ.")