import os
import json
from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.schema.document import Document
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env
load_dotenv()

# Cấu hình API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY không được tìm thấy. Hãy chắc chắn bạn đã tạo file .env")

# Đường dẫn đến thư mục chứa các file JSON và nơi lưu vector store
APP_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = APP_DIR / "data"
VECTORSTORE_PATH = APP_DIR / "faiss_index"

def create_documents_from_generic_json(data, source_filename):
    """
    Hàm này phân tích một file JSON bất kỳ và tạo ra các Document một cách thông minh.
    Nó tìm các danh sách đối tượng để tạo document cho từng thực thể.
    MỌI DOCUMENT ĐƯỢC TẠO RA ĐỀU CÓ METADATA 'source' và 'page'.
    """
    documents = []
    
    # Nếu dữ liệu gốc là một danh sách đối tượng
    if isinstance(data, list) and all(isinstance(i, dict) for i in data):
        for i, item in enumerate(data):
            content = json.dumps(item, ensure_ascii=False, indent=2)
            # Thêm 'page' key, sử dụng index + 1
            metadata = {
                "source": source_filename,
                "page": i + 1,  # SỬA LỖI: Thêm key 'page'
                "type": "entity_from_list",
                "index": i 
            }
            documents.append(Document(page_content=content, metadata=metadata))
        return documents

    # Nếu dữ liệu gốc là một đối tượng (dictionary)
    if isinstance(data, dict):
        top_level_info = {}
        for key, value in data.items():
            # Tìm các danh sách đối tượng bên trong
            if isinstance(value, list) and all(isinstance(i, dict) for i in value):
                print(f"  -> Tìm thấy danh sách thực thể dưới key: '{key}'")
                for i, item in enumerate(value):
                    content = json.dumps(item, ensure_ascii=False, indent=2)
                    # Thêm 'page' key, sử dụng index + 1
                    metadata = {
                        "source": source_filename,
                        "page": i + 1, # SỬA LỖI: Thêm key 'page'
                        "type": "entity",
                        "parent_key": key,
                        "index": i
                    }
                    documents.append(Document(page_content=content, metadata=metadata))
            else:
                top_level_info[key] = value

        # Tạo một document tóm tắt cho các thông tin cấp cao còn lại
        if top_level_info:
            summary_content = "Thông tin tổng quan từ file:\n" + json.dumps(top_level_info, ensure_ascii=False, indent=2)
            # Thêm 'page' key với giá trị mặc định là 1
            metadata = {
                "source": source_filename,
                "page": 1, # SỬA LỖI: Thêm key 'page'
                "type": "summary"
            }
            documents.append(Document(page_content=summary_content, metadata=metadata))
            
        return documents

    # Trường hợp dữ liệu không phải list hoặc dict
    documents.append(Document(
        page_content=str(data),
        # Thêm 'page' key với giá trị mặc định là 1
        metadata={
            "source": source_filename,
            "page": 1, # SỬA LỖI: Thêm key 'page'
            "type": "raw_data"
        }
    ))
    return documents


def create_vector_store():
    """
    Hàm này đọc tất cả các file JSON trong thư mục data,
    phân tích cấu trúc và tạo các Document thông minh,
    vector hóa và lưu vào FAISS vector store.
    """
    print("Bắt đầu xử lý các file JSON...")
    
    all_docs = []
    json_files = list(DATA_PATH.glob("*.json"))

    if not json_files:
        print(f"Không tìm thấy file JSON nào trong thư mục '{DATA_PATH}'.")
        return

    for json_file_path in json_files:
        print(f"Đang xử lý file: {json_file_path.name}")
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Tạo các document từ dữ liệu JSON một cách tổng quát
            docs_from_file = create_documents_from_generic_json(data, json_file_path.name)
            all_docs.extend(docs_from_file)
            print(f"Đã tạo được {len(docs_from_file)} document từ file {json_file_path.name}.")
        
        except json.JSONDecodeError:
            print(f"  [LỖI] File {json_file_path.name} không phải là file JSON hợp lệ. Bỏ qua.")
        except Exception as e:
            print(f"  [LỖI] Xảy ra lỗi không xác định khi xử lý file {json_file_path.name}: {e}")


    if not all_docs:
        print("Không tạo được document nào từ các file JSON.")
        return
        
    print(f"\nTổng cộng đã tạo được {len(all_docs)} document.")

    # Tạo embeddings
    print("Tạo embeddings cho các document...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)

    # Tạo vector store từ các document đã xử lý
    print("Bắt đầu tạo và lưu vector store...")
    vector_store = FAISS.from_documents(all_docs, embeddings)

    # Lưu vector store vào ổ đĩa
    vector_store.save_local(str(VECTORSTORE_PATH))
    print(f"Hoàn tất! Đã lưu vector store vào '{VECTORSTORE_PATH}'.")


if __name__ == '__main__':
    create_vector_store()