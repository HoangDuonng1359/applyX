# process_data.py
import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env
load_dotenv()

# Cấu hình API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY không được tìm thấy. Hãy chắc chắn bạn đã tạo file .env")

# Đường dẫn đến thư mục chứa các file PDF và nơi lưu vector store
from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[1]   # .../applyxBE/app
PDFS_PATH = APP_DIR / "data"                    # .../applyxBE/app/data
VECTORSTORE_PATH = APP_DIR / "faiss_index"

def create_vector_store():
    """
    Hàm này đọc tất cả các file PDF trong thư mục data,
    chia nhỏ chúng thành các đoạn văn bản,
    vector hóa chúng và lưu vào FAISS vector store.
    """
    print("Bắt đầu xử lý các file PDF...")
    # Tải các tài liệu từ thư mục
    loader = PyPDFDirectoryLoader(PDFS_PATH)
    documents = loader.load()
    if not documents:
        print("Không tìm thấy file PDF nào trong thư mục 'data'.")
        return

    print(f"Đã tải được {len(documents)} trang từ các file PDF.")

    # Chia nhỏ văn bản thành các chunk
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)
    print(f"Đã chia tài liệu thành {len(docs)} chunks.")

    # Tạo embeddings
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)

    # Tạo vector store từ các chunk và embeddings
    print("Bắt đầu tạo vector store...")
    vector_store = FAISS.from_documents(docs, embeddings)

    # Lưu vector store vào ổ đĩa
    vector_store.save_local(VECTORSTORE_PATH)
    print(f"Đã lưu vector store vào '{VECTORSTORE_PATH}'.")

if __name__ == '__main__':
    create_vector_store()