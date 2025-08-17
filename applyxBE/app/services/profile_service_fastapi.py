import json
import os
from typing import Dict, Any, Optional

class ProfileService:
    def __init__(self):
        self.profile_dir = os.path.join(os.path.dirname(__file__), '..', 'profile_data')
        self.profile_file = os.path.join(self.profile_dir, 'huy.json')
        
    def save_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Lưu profile vào folder profile_data dạng file huy.json"""
        try:
            # Tạo thư mục nếu chưa tồn tại
            os.makedirs(self.profile_dir, exist_ok=True)
            
            # Lưu vào file JSON
            with open(self.profile_file, 'w', encoding='utf-8') as f:
                json.dump(profile_data, f, ensure_ascii=False, indent=2)
            
            return {
                'success': True,
                'message': 'Profile đã được lưu thành công',
                'data': profile_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Lỗi khi lưu profile: {str(e)}'
            }

    def get_profile(self) -> Dict[str, Any]:
        """Lấy thông tin profile từ file"""
        try:
            # Kiểm tra file có tồn tại không
            if not os.path.exists(self.profile_file):
                return {
                    'success': False,
                    'message': 'Profile chưa được tạo',
                    'data': None
                }
            
            # Đọc dữ liệu từ file JSON
            with open(self.profile_file, 'r', encoding='utf-8') as f:
                profile_data = json.load(f)
            
            return {
                'success': True,
                'message': 'Lấy profile thành công',
                'data': profile_data
            }
            
        except json.JSONDecodeError:
            return {
                'success': False,
                'message': 'File profile bị lỗi định dạng'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Lỗi khi đọc profile: {str(e)}'
            }
    
    def update_profile(self, updated_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cập nhật một phần thông tin profile"""
        try:
            # Lấy dữ liệu hiện tại
            current_profile = self.get_profile()
            
            if not current_profile['success']:
                # Nếu chưa có profile, tạo mới
                return self.save_profile(updated_data)
            
            # Merge dữ liệu cũ với dữ liệu mới
            current_data = current_profile['data']
            current_data.update(updated_data)
            
            # Lưu lại
            return self.save_profile(current_data)
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Lỗi khi cập nhật profile: {str(e)}'
            }
    
    def delete_profile(self) -> Dict[str, Any]:
        """Xóa profile"""
        try:
            if os.path.exists(self.profile_file):
                os.remove(self.profile_file)
                return {
                    'success': True,
                    'message': 'Profile đã được xóa thành công'
                }
            else:
                return {
                    'success': False,
                    'message': 'Profile không tồn tại'
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': f'Lỗi khi xóa profile: {str(e)}'
            }
