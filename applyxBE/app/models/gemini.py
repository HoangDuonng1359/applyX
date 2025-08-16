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
            if api_key:
                genai.configure(api_key=api_key)
            else:
                genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
            
            # Khởi tạo model
            self.model = genai.GenerativeModel(model)
            
            # Dictionary lưu trữ các chat sessions
            self.sessions = {}
            
            logger.info("ApplyX Chatbot đã được khởi tạo thành công")
            
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
                "parts":[
                    "Bây giờ bạn hãy tạo ra một cuộc hội thoại kiểu "
                    "như một bài khảo sát, bạn hỏi lần lượt những câu sau, "
                    "sau đó từ những câu trả lời của tôi bạn hãy tạo ra những câu hỏi mới hơn, "
                    "tổng số câu hỏi mà bạn phải hỏi là 20 câu, các câu hỏi phải bán sát vào người trả lời, "
                    "để có thể định hướng nghề nghiệp kết thúc bạn hãy đưa ra danh sách các nghề nghiệp phù hợp và giải thích chúng, "
                    "khi nào tôi nói \"Bắt đầu khảo sát ikigai\" thì bạn hãy lần lượt hỏi các câu hỏi hãy bắt đầu nhé"
                ]
            },
            {
                "role": "model",
                "parts": [
                    "Đã rõ! Tôi hiểu hoàn toàn yêu cầu của bạn."
                    "Tôi đã sẵn sàng để bắt đầu một cuộc khảo sát Ikigai hoàn toàn mới, tuân thủ chính xác các hướng dẫn bạn vừa đưa ra:"
                    "Tôi sẽ hỏi lần lượt từng câu một."
                    "Dựa trên câu trả lời của bạn, tôi sẽ tạo ra các câu hỏi tiếp theo (tổng cộng 20 câu), bám sát và đi sâu vào những gì bạn chia sẻ."
                    "Mục tiêu cuối cùng là định hướng nghề nghiệp, và tôi sẽ kết thúc bằng một danh sách các nghề nghiệp phù hợp cùng giải thích chi tiết."
                    "Khi nào bạn nói \"Bắt đầu khảo sát ikigai\", chúng ta sẽ chính thức khởi động và tôi sẽ hỏi câu hỏi đầu tiên trong danh sách bạn đã cung cấp."
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
def create_applyx_bot(api_key: str = None) -> ApplyXChatbot:
    """
    Tạo instance ApplyX Chatbot
    
    Args:
        api_key (str): API key. Nếu None sẽ lấy từ environment variable
        
    Returns:
        ApplyXChatbot: Instance của chatbot
    """
    return ApplyXChatbot(api_key)