#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini AI Chat CLI - Using Official Google AI SDK
Ứng dụng chat với Gemini AI qua command line
"""

import google.generativeai as genai
import os
import sys
from datetime import datetime
import colorama
from colorama import Fore, Back, Style

# Khởi tạo colorama để hiển thị màu sắc trên Windows
colorama.init(autoreset=True)

class GeminiChat:
    def __init__(self):
        self.api_key = ""
        self.conversation_history = []
        self.available_models = {
            "1": {
                "name": "Gemini 2.5 Flash",
                "id": "gemini-2.5-flash",
                "description": "Nhanh, hiệu quả cho hầu hết tác vụ"
            },
            "2": {
                "name": "Gemini 2.5 Pro", 
                "id": "gemini-2.5-pro",
                "description": "Mạnh mẽ, phù hợp với tác vụ phức tạp"
            },
            "3": {
                "name": "Gemini 1.0 Pro",
                "id": "gemini-1.0-pro", 
                "description": "Ổn định, cân bằng"
            }
        }
        self.selected_model_id = "gemini-1.5-flash"  # Mặc định
        self.model = None
        self.chat_session = None
        
    def clear_screen(self):
        """Xóa màn hình console"""
        os.system('cls' if os.name == 'nt' else 'clear')
        
    def print_banner(self):
        """In banner ứng dụng"""
        banner = f"""
{Fore.CYAN}╔══════════════════════════════════════════════════════════════╗
║                    🤖 GEMINI AI CHAT CLI                     ║
║                  Trò chuyện với AI Gemini                   ║
║                 (Sử dụng Google AI SDK)                     ║
╚══════════════════════════════════════════════════════════════╝{Style.RESET_ALL}
        """
        print(banner)
        
    def setup_api_key(self):
        """Thiết lập API key"""
        print(f"{Fore.YELLOW}📋 Hướng dẫn lấy API Key:")
        print(f"{Fore.WHITE}1. Truy cập: https://aistudio.google.com/app/apikey")
        print(f"2. Đăng nhập với tài khoản Google")
        print(f"3. Tạo API Key mới")
        print(f"4. Copy API Key và paste vào đây\n")
        
        # Kiểm tra xem có API key trong biến môi trường không
        env_api_key = "AIzaSyAZcruujcWqlaG-Tu0KPIMAljxg16JFVII"
        if env_api_key:
            use_env = input(f"{Fore.GREEN}✅ Tìm thấy API Key trong biến môi trường. Sử dụng? (y/n): {Style.RESET_ALL}")
            if use_env.lower() in ['y', 'yes', '']:
                self.api_key = env_api_key
                genai.configure(api_key=self.api_key)
                return True
        
        while True:
            api_key = input(f"{Fore.CYAN}🔑 Nhập API Key của bạn: {Style.RESET_ALL}").strip()
            if api_key:
                self.api_key = api_key
                try:
                    genai.configure(api_key=self.api_key)
                    # Test API key bằng cách list models
                    list(genai.list_models())
                    print(f"{Fore.GREEN}✅ API Key hợp lệ và đã được thiết lập!\n{Style.RESET_ALL}")
                    return True
                except Exception as e:
                    print(f"{Fore.RED}❌ API Key không hợp lệ: {str(e)}\n{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}❌ Vui lòng nhập API Key!\n{Style.RESET_ALL}")
                
    def select_model(self):
        """Cho phép người dùng chọn mô hình"""
        print(f"\n{Fore.CYAN}🤖 Chọn mô hình Gemini:{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}{'='*60}{Style.RESET_ALL}")
        
        for key, model in self.available_models.items():
            print(f"{Fore.WHITE}{key}. {Fore.GREEN}{model['name']}{Style.RESET_ALL}")
            print(f"   📝 {model['description']}")
            print(f"   🆔 ID: {Fore.CYAN}{model['id']}{Style.RESET_ALL}\n")
        
        while True:
            choice = input(f"{Fore.YELLOW}Chọn mô hình (1-{len(self.available_models)}) [Enter = 1]: {Style.RESET_ALL}").strip()
            
            if not choice:
                choice = "1"  # Mặc định
                
            if choice in self.available_models:
                selected = self.available_models[choice]
                self.selected_model_id = selected["id"]
                
                try:
                    # Khởi tạo mô hình
                    self.model = genai.GenerativeModel(self.selected_model_id)
                    
                    # Tạo chat session mới
                    self.chat_session = self.model.start_chat(history=[])
                    
                    print(f"{Fore.GREEN}✅ Đã chọn: {selected['name']} ({selected['id']}){Style.RESET_ALL}\n")
                    return True
                except Exception as e:
                    print(f"{Fore.RED}❌ Lỗi khi khởi tạo mô hình: {str(e)}{Style.RESET_ALL}")
                    print(f"{Fore.YELLOW}Thử chọn mô hình khác...{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}❌ Lựa chọn không hợp lệ! Vui lòng chọn từ 1-{len(self.available_models)}{Style.RESET_ALL}")
                
    def get_current_model_info(self):
        """Lấy thông tin mô hình hiện tại"""
        for model in self.available_models.values():
            if model["id"] == self.selected_model_id:
                return model
        return {"name": "Unknown", "id": self.selected_model_id, "description": "Mô hình tùy chỉnh"}
        
    def format_message(self, text):
        """Format tin nhắn với màu sắc và style"""
        # Thay thế markdown cơ bản
        text = text.replace('**', '')  # Loại bỏ bold markdown
        text = text.replace('*', '')   # Loại bỏ italic markdown
        return text
        
    def print_message(self, sender, message, timestamp=None):
        """In tin nhắn với format đẹp"""
        if timestamp is None:
            timestamp = datetime.now().strftime("%H:%M:%S")
            
        if sender == "user":
            print(f"\n{Fore.BLUE}👤 Bạn ({timestamp}):{Style.RESET_ALL}")
            print(f"{Fore.WHITE}{message}{Style.RESET_ALL}")
        else:
            print(f"\n{Fore.GREEN}🤖 Gemini ({timestamp}):{Style.RESET_ALL}")
            print(f"{Fore.CYAN}{self.format_message(message)}{Style.RESET_ALL}")
            
    def show_loading(self):
        """Hiển thị loading animation"""
        import time
        import threading
        
        def animate():
            chars = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
            for char in chars:
                if not self.loading:
                    break
                print(f"\r{Fore.YELLOW}🤖 Gemini đang suy nghĩ {char}{Style.RESET_ALL}", end="", flush=True)
                time.sleep(0.1)
        
        self.loading = True
        loading_thread = threading.Thread(target=animate)
        loading_thread.daemon = True
        loading_thread.start()
        
    def hide_loading(self):
        """Ẩn loading animation"""
        self.loading = False
        print("\r" + " " * 50 + "\r", end="")  # Xóa dòng loading
        
    def send_message_to_gemini(self, message):
        """Gửi tin nhắn tới Gemini sử dụng SDK"""
        try:
            if not self.chat_session:
                raise Exception("Chat session chưa được khởi tạo")
                
            # Gửi tin nhắn và nhận phản hồi
            response = self.chat_session.send_message(message)
            return response.text
            
        except Exception as e:
            if "API_KEY_INVALID" in str(e):
                return "❌ API Key không hợp lệ. Vui lòng kiểm tra lại."
            elif "QUOTA_EXCEEDED" in str(e):
                return "❌ Đã vượt quá quota API. Vui lòng thử lại sau."
            elif "SAFETY" in str(e):
                return "❌ Tin nhắn bị từ chối do chính sách an toàn."
            else:
                return f"❌ Lỗi: {str(e)}"
                
    def show_commands(self):
        """Hiển thị danh sách lệnh"""
        current_model = self.get_current_model_info()
        commands = f"""
{Fore.YELLOW}📋 Danh sách lệnh:{Style.RESET_ALL}
{Fore.WHITE}/help    - Hiển thị trợ giúp
/clear   - Xóa màn hình
/history - Xem lịch sử chat
/reset   - Xóa lịch sử hội thoại
/model   - Thay đổi mô hình AI
/info    - Thông tin mô hình hiện tại
/save    - Lưu hội thoại ra file
/quit    - Thoát ứng dụng{Style.RESET_ALL}

{Fore.CYAN}🤖 Mô hình hiện tại: {current_model['name']}{Style.RESET_ALL}
        """
        print(commands)
        
    def show_history(self):
        """Hiển thị lịch sử hội thoại"""
        if not self.chat_session or not self.chat_session.history:
            print(f"{Fore.YELLOW}📝 Chưa có lịch sử hội thoại nào.{Style.RESET_ALL}")
            return
            
        print(f"\n{Fore.YELLOW}📝 Lịch sử hội thoại ({len(self.chat_session.history)} tin nhắn):{Style.RESET_ALL}")
        for i, message in enumerate(self.chat_session.history):
            role = "👤 Bạn" if message.role == "user" else "🤖 Gemini"
            content = message.parts[0].text[:100] + "..." if len(message.parts[0].text) > 100 else message.parts[0].text
            print(f"{i+1}. {role}: {content}")
            
    def reset_conversation(self):
        """Xóa lịch sử hội thoại"""
        if self.model:
            self.chat_session = self.model.start_chat(history=[])
            print(f"{Fore.GREEN}✅ Đã xóa lịch sử hội thoại và tạo session mới.{Style.RESET_ALL}")
        else:
            print(f"{Fore.RED}❌ Chưa có mô hình được khởi tạo.{Style.RESET_ALL}")
            
    def show_model_info(self):
        """Hiển thị thông tin mô hình hiện tại"""
        current_model = self.get_current_model_info()
        print(f"""
{Fore.CYAN}🤖 Thông tin mô hình hiện tại:{Style.RESET_ALL}
{Fore.GREEN}📛 Tên: {current_model['name']}
🆔 ID: {current_model['id']}
📝 Mô tả: {current_model['description']}{Style.RESET_ALL}
        """)
        
        # Hiện thông tin session
        if self.chat_session:
            history_count = len(self.chat_session.history)
            print(f"{Fore.YELLOW}💬 Số tin nhắn trong session: {history_count}{Style.RESET_ALL}")
            
    def save_conversation(self):
        """Lưu hội thoại ra file"""
        if not self.chat_session or not self.chat_session.history:
            print(f"{Fore.YELLOW}📝 Không có gì để lưu.{Style.RESET_ALL}")
            return
            
        filename = f"gemini_chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"Lịch sử chat với Gemini AI\n")
                f.write(f"Mô hình: {self.get_current_model_info()['name']}\n")
                f.write(f"Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 50 + "\n\n")
                
                for message in self.chat_session.history:
                    role = "Bạn" if message.role == "user" else "Gemini"
                    content = message.parts[0].text
                    f.write(f"{role}: {content}\n\n")
                    
            print(f"{Fore.GREEN}✅ Đã lưu hội thoại vào file: {filename}{Style.RESET_ALL}")
        except Exception as e:
            print(f"{Fore.RED}❌ Lỗi khi lưu file: {str(e)}{Style.RESET_ALL}")
            
    def list_available_models(self):
        """Liệt kê các mô hình có sẵn từ API"""
        try:
            print(f"\n{Fore.CYAN}🔍 Đang lấy danh sách mô hình từ Google AI...{Style.RESET_ALL}")
            models = genai.list_models()
            print(f"\n{Fore.YELLOW}📋 Các mô hình có sẵn:{Style.RESET_ALL}")
            
            for model in models:
                if 'generateContent' in model.supported_generation_methods:
                    print(f"{Fore.GREEN}✅ {model.name}{Style.RESET_ALL}")
                    print(f"   📝 {model.display_name}")
                    print(f"   🔧 Supported: {', '.join(model.supported_generation_methods)}\n")
        except Exception as e:
            print(f"{Fore.RED}❌ Lỗi khi lấy danh sách mô hình: {str(e)}{Style.RESET_ALL}")
            
    def run(self):
        """Chạy ứng dụng chat"""
        self.clear_screen()
        self.print_banner()
        
        # Thiết lập API key
        if not self.setup_api_key():
            return
            
        # Chọn mô hình
        if not self.select_model():
            return
            
        self.clear_screen()
        self.print_banner()
        
        # Tin nhắn chào mừng
        current_model = self.get_current_model_info()
        welcome_msg = f"Xin chào! Tôi là {current_model['name']}. Hãy đặt câu hỏi hoặc gõ /help để xem danh sách lệnh. 🌟"
        self.print_message("gemini", welcome_msg)
        
        print(f"\n{Fore.YELLOW}💡 Gõ /quit để thoát{Style.RESET_ALL}")
        
        # Vòng lặp chat chính
        while True:
            try:
                # Nhập tin nhắn
                user_input = input(f"\n{Fore.BLUE}👤 Bạn: {Style.RESET_ALL}").strip()
                
                if not user_input:
                    continue
                    
                # Xử lý các lệnh
                if user_input.startswith('/'):
                    command = user_input.lower()
                    
                    if command == '/quit' or command == '/exit':
                        print(f"\n{Fore.GREEN}👋 Tạm biệt! Cảm ơn bạn đã sử dụng Gemini Chat.{Style.RESET_ALL}")
                        break
                    elif command == '/help':
                        self.show_commands()
                    elif command == '/clear':
                        self.clear_screen()
                        self.print_banner()
                    elif command == '/history':
                        self.show_history()
                    elif command == '/reset':
                        self.reset_conversation()
                    elif command == '/model':
                        self.select_model()
                    elif command == '/info':
                        self.show_model_info()
                    elif command == '/save':
                        self.save_conversation()
                    elif command == '/list':
                        self.list_available_models()
                    else:
                        print(f"{Fore.RED}❌ Lệnh không hợp lệ. Gõ /help để xem danh sách lệnh.{Style.RESET_ALL}")
                    continue
                
                # Gửi tin nhắn tới Gemini
                self.show_loading()
                response = self.send_message_to_gemini(user_input)
                self.hide_loading()
                
                # Hiển thị phản hồi
                self.print_message("gemini", response)
                
            except KeyboardInterrupt:
                print(f"\n\n{Fore.YELLOW}⚠️  Đã nhận Ctrl+C. Gõ /quit để thoát an toàn.{Style.RESET_ALL}")
            except EOFError:
                print(f"\n\n{Fore.GREEN}👋 Tạm biệt!{Style.RESET_ALL}")
                break
            except Exception as e:
                print(f"\n{Fore.RED}❌ Lỗi không mong muốn: {str(e)}{Style.RESET_ALL}")

def main():
    """Hàm main"""
    try:
        # Kiểm tra Python version
        if sys.version_info < (3, 7):
            print("❌ Yêu cầu Python 3.7 trở lên!")
            sys.exit(1)
            
        # Tạo và chạy ứng dụng
        chat = GeminiChat()
        chat.run()
        
    except ImportError as e:
        missing_lib = str(e).split("'")[1] if "'" in str(e) else "unknown"
        print(f"❌ Thiếu thư viện: {missing_lib}")
        if "generativeai" in missing_lib:
            print("📦 Cài đặt bằng lệnh: pip install google-generativeai colorama")
        else:
            print("📦 Cài đặt bằng lệnh: pip install colorama")
    except Exception as e:
        print(f"❌ Lỗi khởi động: {str(e)}")

if __name__ == "__main__":
    main()