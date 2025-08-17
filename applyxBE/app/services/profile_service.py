import json
import os
from flask import request, jsonify

def save_profile():
    """Lưu profile vào folder profile_data dạng file huy.json"""
    try:
        # Lấy dữ liệu từ request
        data = request.get_json()
        
        # Đường dẫn tới file JSON
        profile_dir = os.path.join(os.path.dirname(__file__), '..', 'profile_data')
        profile_file = os.path.join(profile_dir, 'huy.json')
        
        # Tạo thư mục nếu chưa tồn tại
        os.makedirs(profile_dir, exist_ok=True)
        
        # Chuẩn bị dữ liệu profile
        profile_data = {
            'firstName': data.get('firstName', ''),
            'lastName': data.get('lastName', ''),
            'gender': data.get('gender', ''),
            'birthDate': data.get('birthDate', ''),
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'school': data.get('school', ''),
            'major': data.get('major', ''),
            'gpa': data.get('gpa', ''),
            'portfolio': data.get('portfolio', ''),
            'achievements': data.get('achievements', []),
            'notes': data.get('notes', ''),
            'shareProfile': data.get('shareProfile', False),
            'profileImageUrl': data.get('profileImageUrl', ''),
            'updatedAt': data.get('updatedAt', ''),
            'createdAt': data.get('createdAt', '')
        }
        
        # Lưu vào file JSON
        with open(profile_file, 'w', encoding='utf-8') as f:
            json.dump(profile_data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Profile đã được lưu thành công',
            'data': profile_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lưu profile: {str(e)}'
        }), 500

def get_profile():
    """Lấy thông tin profile từ file"""
    try:
        # Đường dẫn tới file JSON
        profile_dir = os.path.join(os.path.dirname(__file__), '..', 'profile_data')
        profile_file = os.path.join(profile_dir, 'huy.json')
        
        # Kiểm tra file có tồn tại không
        if not os.path.exists(profile_file):
            return jsonify({
                'success': False,
                'message': 'Profile chưa được tạo',
                'data': None
            }), 404
        
        # Đọc dữ liệu từ file JSON
        with open(profile_file, 'r', encoding='utf-8') as f:
            profile_data = json.load(f)
        
        return jsonify({
            'success': True,
            'message': 'Lấy profile thành công',
            'data': profile_data
        }), 200
        
    except json.JSONDecodeError:
        return jsonify({
            'success': False,
            'message': 'File profile bị lỗi định dạng'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi đọc profile: {str(e)}'
        }), 500
    