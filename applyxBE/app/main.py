from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services.chat_services import ChatService
from app.services.chatbot_sevice import ChatService as ChatBot
from app.services.profile_service import save_profile, get_profile
from app.services.profile_service_fastapi import ProfileService
import uvicorn
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional


load_dotenv()

app = FastAPI()
chat_service = ChatService()
profile_service = ProfileService()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class MessageRequest(BaseModel):
    session_id: str
    message: str

class CreateSessionResponse(BaseModel):
    session_id: str

class Achievement(BaseModel):
    title: str
    year: str
    description: str

class ProfileRequest(BaseModel):
    firstName: str
    lastName: Optional[str] = ""
    gender: Optional[str] = ""
    birthDate: Optional[str] = ""
    email: str
    phone: Optional[str] = ""
    school: Optional[str] = ""
    major: Optional[str] = ""
    gpa: Optional[str] = ""
    portfolio: Optional[str] = ""
    achievements: Optional[List[Achievement]] = []
    notes: Optional[str] = ""
    shareProfile: Optional[bool] = False
    profileImageUrl: Optional[str] = ""
    updatedAt: Optional[str] = ""
    createdAt: Optional[str] = ""

chatbot = ChatBot()

class MessageRequestBot(BaseModel):
    session_id: str
    message: str

class CreateSessionResponseBot(BaseModel):
    session_id: str

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/chat/session", response_model=CreateSessionResponse)
async def create_session():
    session_id = chat_service.create_session()
    return {"session_id": session_id}

@app.post("/chat/send")
async def send_message(request: MessageRequest):
    try:
        response = chat_service.send_message(request.session_id, request.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/chat/history/{session_id}")
async def get_history(session_id: str):
    try:
        history = chat_service.get_chat_history(session_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/chat/session/{session_id}")
async def get_session_info(session_id: str):
    try:
        info = chat_service.get_session_info(session_id)
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/chat/sessions")
async def list_sessions():
    return {"sessions": chat_service.list_sessions()}

@app.delete("/chat/session/{session_id}")
async def delete_session(session_id: str):
    try:
        chat_service.delete_session(session_id)
        return {"message": "Session deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/chatbot")
async def root():
    return {"message": "Welcome to the Admission Counseling Chatbot API"}

@app.post("/chatbot/session", response_model=CreateSessionResponse, tags=["Chat"])
async def create_session():
    """Tạo một phiên trò chuyện mới."""
    session_id = chatbot.create_session()
    return {"session_id": session_id}

@app.post("/chatbot/send", tags=["Chat"])
async def send_message(request: MessageRequest):
    """Gửi một tin nhắn trong một phiên trò chuyện và nhận câu trả lời."""
    try:
        response = chatbot.send_message(request.session_id, request.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/chatbot/history/{session_id}", tags=["Session Management"])
async def get_history(session_id: str):
    """Lấy lịch sử của một phiên trò chuyện."""
    try:
        history = chatbot.get_chat_history(session_id)
        return {"session_id": session_id, "history": history}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/chatbot/session/{session_id}", tags=["Session Management"])
async def get_session_info(session_id: str):
    """Lấy thông tin của một phiên trò chuyện."""
    try:
        info = chatbot.get_session_info(session_id)
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/chatbot/sessions", tags=["Session Management"])
async def list_sessions():
    """Liệt kê tất cả các phiên đang hoạt động."""
    return {"sessions": chatbot.list_sessions()}

@app.delete("/chatbot/session/{session_id}", tags=["Session Management"])
async def delete_session(session_id: str):
    """Xóa một phiên trò chuyện."""
    try:
        chatbot.delete_session(session_id)
        return {"message": f"Session {session_id} đã được xóa."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class SaveResultRequest(BaseModel):
    session_id: str
    result: str

@app.post("/chat/saveResult", tags=["Save Results"])
async def save_result_by_session(request: SaveResultRequest):
    """
        Gọi save_result để lưu kết quả dạng chuỗi vào session.
    """
    try:
        chat_service.save_result(request.session_id, request.result)
        return {"message": f"Kết quả đã được lưu cho session {request.session_id}."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/chat/getResult/{session_id}", tags=["get Results"])
async def get_result_by_session(session_id: str):
    """
        Lấy kết quả đã lưu từ session.
    """
    try:
        result = chat_service.get_results_by_session(session_id)
        return {"session_id": session_id, "result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post('/profile/save', tags=["Profile"])
async def save_user_profile(profile: ProfileRequest):
    """Lưu thông tin profile của người dùng."""
    try:
        # Chuyển đổi Pydantic model thành dict
        profile_data = profile.dict()
        
        # Gọi service để lưu profile
        result = profile_service.save_profile(profile_data)
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=500, detail=result['message'])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Lỗi khi lưu profile: {str(e)}')

@app.get('/profile/get', tags=["Profile"])
async def get_user_profile():
    """Lấy thông tin profile của người dùng."""
    try:
        result = profile_service.get_profile()
        
        if result['success']:
            return result
        else:
            if "chưa được tạo" in result['message']:
                raise HTTPException(status_code=404, detail=result['message'])
            else:
                raise HTTPException(status_code=500, detail=result['message'])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Lỗi khi đọc profile: {str(e)}')

@app.put('/profile/update', tags=["Profile"])
async def update_user_profile(profile: ProfileRequest):
    """Cập nhật thông tin profile của người dùng."""
    try:
        # Chuyển đổi Pydantic model thành dict
        profile_data = profile.dict()
        
        # Gọi service để cập nhật profile
        result = profile_service.update_profile(profile_data)
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=500, detail=result['message'])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Lỗi khi cập nhật profile: {str(e)}')

@app.delete('/profile/delete', tags=["Profile"])
async def delete_user_profile():
    """Xóa profile của người dùng."""
    try:
        result = profile_service.delete_profile()
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=500, detail=result['message'])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Lỗi khi xóa profile: {str(e)}')

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

