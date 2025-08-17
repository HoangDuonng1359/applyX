from app.models.gemini import ApplyXChatbot

class ChatService:
    def __init__(self):
        self.bot = ApplyXChatbot()

    def create_session(self, session_id: str = None):
        return self.bot.create_session(session_id)

    def send_message(self, session_id: str, message: str):
        return self.bot.send_message(session_id, message)

    def get_chat_history(self, session_id: str):
        return self.bot.get_chat_history(session_id)

    def get_session_info(self, session_id: str):
        return self.bot.get_session_info(session_id)

    def list_sessions(self):
        return self.bot.list_sessions()

    def delete_session(self, session_id: str):
        return self.bot.delete_session(session_id)
    def save_result(self, session_id: str, result: str):
        """
            Lưu kết quả vào session
        """
        if session_id not in self.bot.sessions:
            raise ValueError(f"Session {session_id} không tồn tại")
        
        # Lưu kết quả vào session
        self.bot.saveResultsBySession(session_id, result)
    def get_results_by_session(self, session_id: str):
        """
            Lấy kết quả đã lưu từ session
        """
        if session_id not in self.bot.sessions:
            raise ValueError(f"Session {session_id} không tồn tại")
        
        # Trả về kết quả đã lưu
        return self.bot.getResultsBySession(session_id)

