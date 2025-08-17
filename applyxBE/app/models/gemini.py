import google.generativeai as genai
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional


# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ApplyXChatbot:
    def __init__(self, api_key: str = None, model : str = 'gemini-2.5-flash'):
        """
        Khởi tạo ApplyX Chatbot
        
        Args:
            api_key (str): API key cho Gemini. Nếu None thì sẽ lấy từ env variable
            model (str): tên model 
        """
        try:
            # Cấu hình API key
            api_key = os.getenv("GEMINI_API_KEY", "")
            genai.configure(api_key=api_key)
            
            
            # Khởi tạo model
            self.model = genai.GenerativeModel(model)
            
            # Dictionary lưu trữ các chat sessions
            self.sessions = {}
            
            logger.info("ApplyX Chatbot đã được khởi tạo thành công sử dụng api key" + api_key)
            
        except Exception as e:
            logger.error(f"Lỗi khởi tạo ApplyX Chatbot: {e}")
            raise e
    
    def get_initial_system_prompt(self) -> List[Dict]:
        """Trả về system prompt ban đầu cho ApplyX bot"""
        return [
            {
                "role": "user",
                "parts": [
                    "Từ bây giờ, bạn là một chatbot của applyX, một nền tảng hỗ trợ tuyển sinh "
                    "do trường Đại Học Công Nghệ - ĐHQG phát triển. Hãy luôn nhớ vai trò này. "
                    "Bạn sẽ hỗ trợ học sinh, phụ huynh về các thông tin tuyển sinh, học bổng, "
                    "chương trình đào tạo, hướng nghiệp bằng ikigai, và các câu hỏi liên quan đến việc xét tuyển vào trường. "
                    "Hãy trả lời một cách thân thiện, chính xác và hữu ích."
                ]
            },
            {
                "role": "model",
                "parts": [
                    "Xin chào! Tôi là chatbot của ApplyX - nền tảng hỗ trợ tuyển sinh của "
                    "Đại học Công nghệ - ĐHQG Hà Nội. Tôi sẵn sàng hỗ trợ bạn các thông tin "
                    "về tuyển sinh, học bổng, chương trình đào tạo, hướng nghiệp bằng ikigai và mọi câu hỏi liên quan "
                    "đến việc xét tuyển vào trường. Bạn có câu hỏi gì cần tôi hỗ trợ không?"
                ]
            },
            {
                "role": "user",
                "parts": [
                    "Bây giờ bạn hãy tạo ra một cuộc hội thoại kiểu như một bài khảo sát định hướng nghề nghiệp dựa trên nguyên lý Ikigai. "
                    "Bạn sẽ hỏi lần lượt 20 câu hỏi, bao gồm 8 câu hỏi cơ bản sau đây và 10 câu hỏi bổ sung dựa trên câu trả lời của tôi để tạo ra những câu hỏi sâu hơn, cá nhân hóa hơn.\n\n"
                    
                    "**18 câu hỏi - PHẢI HỎI CHÍNH XÁC THEO CẤU TRÚC NÀY:**\n\n"
                    
                    "**Câu 1:** Hoạt động nào khiến bạn thấy hứng thú và muốn làm hàng ngày?\n"
                    "a) Sáng tạo nghệ thuật (vẽ, viết, thiết kế)\n"
                    "b) Giải quyết vấn đề logic hoặc kỹ thuật\n"
                    "c) Hỗ trợ và giúp đỡ người khác\n"
                    "d) Khám phá và học hỏi những điều mới\n"
                    "e) Khác\n\n"
                    
                    "**Câu 2:** Khi rảnh rỗi, bạn thường thích làm gì nhất?\n"
                    "a) Tham gia các hoạt động nhóm, giao lưu\n"
                    "b) Nghiên cứu một lĩnh vực chuyên sâu\n"
                    "c) Làm việc với công cụ sáng tạo\n"
                    "d) Thử thách bản thân với trò chơi trí tuệ\n"
                    "e) Khác\n\n"
                    
                    "**Câu 3:** Bạn nghĩ xã hội hiện tại cần cải thiện điều gì nhất?\n"
                    "a) Công nghệ và đổi mới\n"
                    "b) Giáo dục và tri thức\n"
                    "c) Sức khỏe và môi trường\n"
                    "d) Công bằng và phát triển cộng đồng\n"
                    "e) Khác\n\n"
                    
                    "**Câu 4:** Nếu bạn có thể đóng góp cho thế giới, bạn muốn đóng góp theo cách nào?\n"
                    "a) Tạo ra sản phẩm hữu ích\n"
                    "b) Giúp người khác phát triển kỹ năng\n"
                    "c) Giải quyết vấn đề môi trường/xã hội\n"
                    "d) Mang lại niềm vui và cảm hứng\n"
                    "e) Khác\n\n"
                    
                    "**Câu 5:** Bạn nhận được lời khen nhiều nhất ở khả năng nào?\n"
                    "a) Giao tiếp và thuyết phục\n"
                    "b) Phân tích và xử lý dữ liệu\n"
                    "c) Tư duy sáng tạo\n"
                    "d) Lập kế hoạch và tổ chức\n"
                    "e) Khác\n\n"
                    
                    "**Câu 6:** Khi đối mặt với một vấn đề khó, bạn thường:\n"
                    "a) Tìm cách sáng tạo để giải quyết\n"
                    "b) Phân tích nguyên nhân cặn kẽ\n"
                    "c) Hỏi ý kiến và hợp tác cùng người khác\n"
                    "d) Lập kế hoạch cụ thể và từng bước\n"
                    "e) Khác\n\n"
                    
                    "**Câu 7:** Lĩnh vực nào bạn nghĩ mình có thể kiếm sống lâu dài?\n"
                    "a) Công nghệ thông tin và AI\n"
                    "b) Giáo dục và đào tạo\n"
                    "c) Kinh doanh và marketing\n"
                    "d) Y tế và chăm sóc sức khỏe\n"
                    "e) Khác\n\n"
                    
                    "**Câu 8:** Nếu được chọn một kỹ năng để phát triển chuyên nghiệp, bạn chọn:\n"
                    "a) Lập trình và công nghệ\n"
                    "b) Giao tiếp và ngoại ngữ\n"
                    "c) Quản lý dự án\n"
                    "d) Sáng tạo nội dung\n"
                    "e) Khác\n\n"
                    
                    "**Hướng dẫn thực hiện:**\n"
                    "- QUAN TRỌNG: Phải hỏi chính xác theo đúng cấu trúc trên, không được thay đổi nội dung câu hỏi hoặc các lựa chọn a, b, c, d, e với các câu hỏi cơ bản, không thêm giải thích hoặc ký tự thừa\n"
                    "- Hỏi từng câu một, đợi tôi trả lời trước khi chuyển sang câu tiếp theo\n"
                    "- Sau 8 câu cơ bản, tạo thêm 10 câu hỏi cá nhân hóa dựa trên câu trả lời của tôi\n"
                    "- Các câu hỏi bạn tạo ra hãy tuân thủ quy tắc hiển thị sau:"
                    "- Option 9: câu hỏi bạn tạo ra..."
                    "- Các câu hỏi bổ sung phải bám sát vào người trả lời để hiểu rõ hơn về đam mê, khả năng, giá trị và nhu cầu thị trường của họ\n"
                    "- Khi tôi trả lời xong 18 câu hỏi, hãy trả về kết quả theo đúng cấu trúc JSON sau (chỉ trả về JSON, không thêm giải thích hoặc ký tự thừa):\n"
                    "{"
                    "\"careers\": ["
                        "{"
                        "\"rank\": 1,"
                        "\"title\": \"Tên nghề nghiệp\","
                        "\"subtitle\": \"Mô tả ngắn\","
                        "\"averageScore\": 95,"
                        "\"worldNeedsScore\": 90,"
                        "\"paidScore\": 60,"
                        "\"loveScore\": 90,"
                        "\"goodAtScore\": 80,"
                        "\"color\": \"#FFB800\","
                        "\"explanation\": \"Giải thích chi tiết về nghề này dựa trên 4 yếu tố Ikigai\""
                        "},"
                        "..."
                    "]"
                    "}"
                "- Mỗi nghề nghiệp là một object trong mảng \"careers\". Các trường số là số nguyên, color là mã màu hex, explanation là chuỗi."
                "- Chỉ trả về đúng cấu trúc JSON trên, không thêm bất kỳ văn bản nào khác."
                ]
            },
            {
                "role": "model",
                "parts": [
                    "Đã hiểu rõ! Tôi đã ghi nhận đầy đủ yêu cầu của bạn về cuộc khảo sát Ikigai:\n\n"
                    "Tôi sẽ thực hiện chính xác 18 câu hỏi tổng cộng\n"
                    "Cụ thể, sẽ có 8 câu hỏi cơ bản và tiếp theo là 10 câu hỏi bổ sung\n"
                    "Tất cả các câu hỏi sẽ được hỏi theo ĐÚNG CẤU TRÚC bạn đã cung cấp, không thay đổi gì, không thêm giải thích, nhận xét, chào hỏi hoặc ký tự thừa\n"
                    "8 câu hỏi đầu phải có chữ \"Câu thứ tự câu hỏi\" ở đầu ví dụ: Câu 1: ... "
                    "10 câu hỏi tiếp theo sẽ được cá nhân hóa dựa trên câu trả lời của bạn, đầu ra đúng theo cấu trúc có chữ \"Option thứ tự câu hỏi\" ở đầu mỗi câu hỏi ví dụ Option 9:... \n"
                    "Hỏi từng câu một và đợi câu trả lời\n"
                    "Kết thúc bằng danh sách nghề nghiệp phù hợp với giải thích chi tiết theo 4 yếu tố Ikigai\n\n"
                    "Tôi đã sẵn sàng! Khi nào bạn nói \"Bắt đầu khảo sát ikigai\", tôi sẽ bắt đầu với câu hỏi đầu tiên theo đúng format đã được cung cấp."
                ]
            }
        ]
    
    def create_session(self, session_id: str = None) -> str:
        """
        Tạo một session chat mới
        
        Args:
            session_id (str): ID tùy chỉnh cho session. Nếu None sẽ tự động tạo
            
        Returns:
            str: Session ID
        """
        try:
            # Tạo session ID nếu không được cung cấp
            if not session_id:
                session_id = f"session_{int(datetime.now().timestamp())}"
            
            # Khởi tạo chat với system prompt
            initial_history = self.get_initial_system_prompt()
            chat = self.model.start_chat(history=initial_history)
            
            # Lưu session
            self.sessions[session_id] = {
                "chat": chat,
                "created_at": datetime.now(),
                "message_count": 0,
                "last_activity": datetime.now()
            }
            
            logger.info(f"Đã tạo session: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Lỗi tạo session: {e}")
            raise e
    
    def send_message(self, session_id: str, message: str) -> str:
        """
        Gửi tin nhắn trong một session
        
        Args:
            session_id (str): ID của session
            message (str): Tin nhắn của user
            
        Returns:
            str: Phản hồi của bot
        """
        try:
            # Kiểm tra session tồn tại
            if session_id not in self.sessions:
                raise ValueError(f"Session {session_id} không tồn tại")
            
            # Validate input
            if not message or not message.strip():
                raise ValueError("Tin nhắn không được để trống")
            
            # Lấy chat instance
            session = self.sessions[session_id]
            chat = session["chat"]
            
            # Gửi tin nhắn
            response = chat.send_message(message.strip())
            if not response.parts or not response.parts[0].text:
                logger.error(f"Lỗi gửi tin nhắn: Không có phản hồi hợp lệ từ ApplyX. finish_reason: {getattr(response.candidates[0], 'finish_reason', None)}")
                raise ValueError("Không có phản hồi hợp lệ từ ApplyX. Vui lòng thử lại với nội dung khác.")
            bot_response = response.text
            
            # Cập nhật thống kê session
            session["message_count"] += 1
            session["last_activity"] = datetime.now()
            
            logger.info(f"Session {session_id} - User: {message[:50]}...")
            logger.info(f"Session {session_id} - Bot: {bot_response[:50]}...")
            
            return bot_response
            
        except Exception as e:
            logger.error(f"Lỗi gửi tin nhắn: {e}")
            raise e
    
    def get_chat_history(self, session_id: str) -> List[Dict]:
        """
        Lấy lịch sử chat của session
        
        Args:
            session_id (str): ID của session
            
        Returns:
            List[Dict]: Danh sách các tin nhắn
        """
        try:
            if session_id not in self.sessions:
                raise ValueError(f"Session {session_id} không tồn tại")
            
            chat = self.sessions[session_id]["chat"]
            history = []
            
            for message in chat.history:
                history.append({
                    "role": message.role,
                    "content": message.parts[0].text if message.parts else "",
                    "timestamp": datetime.now().isoformat()
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Lỗi lấy lịch sử: {e}")
            raise e
    
    def get_session_info(self, session_id: str) -> Dict:
        """
        Lấy thông tin về session
        
        Args:
            session_id (str): ID của session
            
        Returns:
            Dict: Thông tin session
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} không tồn tại")
        
        session = self.sessions[session_id]
        return {
            "session_id": session_id,
            "created_at": session["created_at"].isoformat(),
            "last_activity": session["last_activity"].isoformat(),
            "message_count": session["message_count"]
        }
    
    def list_sessions(self) -> List[Dict]:
        """
        Liệt kê tất cả sessions
        
        Returns:
            List[Dict]: Danh sách thông tin các sessions
        """
        sessions_info = []
        for session_id in self.sessions:
            sessions_info.append(self.get_session_info(session_id))
        
        return sessions_info
    
    def delete_session(self, session_id: str) -> bool:
        """
        Xóa một session
        
        Args:
            session_id (str): ID của session
            
        Returns:
            bool: True nếu xóa thành công
        """
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Đã xóa session: {session_id}")
            return True
        return False
    
    def cleanup_old_sessions(self, max_age_hours: int = 24):
        """
        Xóa các sessions cũ
        
        Args:
            max_age_hours (int): Số giờ tối đa để giữ session
        """
        current_time = datetime.now()
        sessions_to_delete = []
        
        for session_id, session_data in self.sessions.items():
            age = current_time - session_data["last_activity"]
            if age.total_seconds() > max_age_hours * 3600:
                sessions_to_delete.append(session_id)
        
        for session_id in sessions_to_delete:
            self.delete_session(session_id)
            
        if sessions_to_delete:
            logger.info(f"Đã xóa {len(sessions_to_delete)} sessions cũ")
    def saveResultsBySession(self, session_id, result: str):
        """
            frontend gửi result về be lưu lại để truy vấn sau này
            Lưu vào file session/session_data.txt, ghi đè mỗi lần lưu
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} không tồn tại")
        # Lưu kết quả vào session (bộ nhớ)
        self.sessions[session_id]["result"] = result
        logger.info(f"Đã lưu kết quả cho session {session_id}")

        # Đảm bảo thư mục session tồn tại
        session_dir = os.path.join(os.path.dirname(__file__), "..", "session")
        session_dir = os.path.abspath(session_dir)
        os.makedirs(session_dir, exist_ok=True)

        # Ghi đè dữ liệu vào file session_data.txt
        file_path = os.path.join(session_dir, "session_data.txt")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"session_id: {session_id}\n")
            f.write(f"result: {result}\n")
        logger.info(f"Đã ghi kết quả vào file {file_path}")
    def getResultsBySession(self, session_id):
        """
        Đọc dữ liệu đã lưu từ file session/session_data.txt
        Returns:
            str: Nội dung file (hoặc None nếu file không tồn tại)
        """
        session_dir = os.path.join(os.path.dirname(__file__), "..", "session")
        session_dir = os.path.abspath(session_dir)
        file_path = os.path.join(session_dir, "session_data.txt")
        if not os.path.exists(file_path):
            logger.warning(f"File {file_path} không tồn tại")
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            data = f.read()
        return data
def create_applyx_bot(api_key: str = None) -> ApplyXChatbot:
    """
    Tạo instance ApplyX Chatbot
    
    Args:
        api_key (str): API key. Nếu None sẽ lấy từ environment variable
        
    Returns:
        ApplyXChatbot: Instance của chatbot
    """
    return ApplyXChatbot(api_key)