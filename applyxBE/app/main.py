from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services.chat_services import ChatService
import uvicorn
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()
chat_service = ChatService()

class MessageRequest(BaseModel):
    session_id: str
    message: str

class CreateSessionResponse(BaseModel):
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

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
