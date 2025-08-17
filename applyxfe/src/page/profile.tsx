import React, { useState, useEffect } from 'react';
import { Bell, HelpCircle, Plus, Calendar, Trash2, Download, FileText, X } from 'lucide-react';
import Sidebar from '../component/sidebar';

const ProfileForm: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: 'Nam',
        birthDate: '',
        email: '',
        phone: '',
        school: '',
        major: '',
        gpa: '',
        portfolio: ''
    });

    const [achievements, setAchievements] = useState([
        { title: '', year: '', description: '' }
    ]);

    const [notes, setNotes] = useState('');
    const [shareProfile, setShareProfile] = useState(false);
    const [profileImage, setProfileImage] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // API Base URL
    const API_BASE_URL = 'http://127.0.0.1:8000';

    // Load profile data when component mounts
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/profile/get`);

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const profileData = result.data;

                    // Update form data
                    setFormData({
                        firstName: profileData.firstName || '',
                        lastName: profileData.lastName || '',
                        gender: profileData.gender || 'Nam',
                        birthDate: profileData.birthDate || '',
                        email: profileData.email || '',
                        phone: profileData.phone || '',
                        school: profileData.school || '',
                        major: profileData.major || '',
                        gpa: profileData.gpa || '',
                        portfolio: profileData.portfolio || ''
                    });

                    // Update achievements
                    if (profileData.achievements && profileData.achievements.length > 0) {
                        setAchievements(profileData.achievements);
                    }

                    // Update other fields
                    setNotes(profileData.notes || '');
                    setShareProfile(profileData.shareProfile || false);
                    setProfileImage(profileData.profileImageUrl || '');
                }
            } else if (response.status === 404) {
                // Profile doesn't exist yet, keep default empty values
                console.log('Profile chưa được tạo, sử dụng giá trị mặc định');
            } else {
                console.error('Lỗi khi tải profile:', response.statusText);
            }
        } catch (error) {
            console.error('Lỗi khi tải profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            // Basic validation
            if (!formData.firstName.trim()) {
                alert('Vui lòng nhập họ và tên');
                return;
            }

            if (!formData.email.trim()) {
                alert('Vui lòng nhập email');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Vui lòng nhập email hợp lệ');
                return;
            }

            setSaving(true);

            const profileData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                birthDate: formData.birthDate,
                email: formData.email,
                phone: formData.phone,
                school: formData.school,
                major: formData.major,
                gpa: formData.gpa,
                portfolio: formData.portfolio,
                achievements: achievements.filter(achievement =>
                    achievement.title.trim() !== '' ||
                    achievement.year.trim() !== '' ||
                    achievement.description.trim() !== ''
                ),
                notes: notes,
                shareProfile: shareProfile,
                profileImageUrl: profileImage,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            const response = await fetch(`${API_BASE_URL}/profile/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert('Profile đã được lưu thành công!');
                } else {
                    alert('Lỗi khi lưu profile: ' + result.message);
                }
            } else {
                const error = await response.json();
                alert('Lỗi khi lưu profile: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Lỗi khi lưu profile:', error);
            alert('Lỗi khi lưu profile. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // Handle image upload and convert to base64
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh phải nhỏ hơn 5MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh (JPG, PNG, GIF, etc.)');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target?.result as string;

                // If image is large, compress it
                if (file.size > 1024 * 1024) { // If larger than 1MB
                    compressImage(base64String, (compressedBase64) => {
                        setProfileImage(compressedBase64);
                        alert('Ảnh đã được tự động nén để tối ưu hóa kích thước');
                    });
                } else {
                    setProfileImage(base64String);
                }
            };
            reader.onerror = () => {
                alert('Lỗi khi đọc file ảnh');
            };
            reader.readAsDataURL(file);
        }
    };

    // Compress image using canvas
    const compressImage = (base64: string, callback: (compressed: string) => void) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions (max 800x800)
            let { width, height } = img;
            const maxSize = 800;

            if (width > height && width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            } else if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            callback(compressedBase64);
        };

        img.src = base64;
    };

    // Remove profile image
    const removeProfileImage = () => {
        setProfileImage('');
    };

    // Trigger file input click
    const triggerImageUpload = () => {
        const fileInput = document.getElementById('profile-image-input') as HTMLInputElement;
        fileInput?.click();
    };

    // Calculate base64 string size in KB
    const getImageSizeInKB = (base64String: string): number => {
        if (!base64String) return 0;
        const sizeInBytes = (base64String.length * 3) / 4;
        return Math.round(sizeInBytes / 1024);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addAchievement = () => {
        setAchievements(prev => [...prev, { title: '', year: '', description: '' }]);
    };

    const removeAchievement = (index: number) => {
        setAchievements(prev => prev.filter((_, i) => i !== index));
    };

    const updateAchievement = (index: number, field: string, value: string) => {
        setAchievements(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar></Sidebar>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-900">Morning</h1>
                    <div className="flex items-center space-x-4">
                        <Bell className="w-5 h-5 text-gray-500" />
                        <HelpCircle className="w-5 h-5 text-gray-500" />
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            TH
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Đang tải dữ liệu profile...</div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="p-6 max-w-4xl w-full">
                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Độ hoàn thiện hồ sơ</span>
                                    <span className="text-sm text-gray-500">6 of 8 mục</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>

                            {/* Profile Photo Section */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ảnh hồ sơ</h2>
                                <div className="flex items-center space-x-4">
                                    {profileImage ? (
                                        <div className="relative">
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => setShowImageModal(true)}
                                            />
                                            <button
                                                onClick={removeProfileImage}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400 text-2xl">👤</span>
                                        </div>
                                    )}

                                    <input
                                        id="profile-image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />

                                    <button
                                        onClick={triggerImageUpload}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {profileImage ? 'Thay đổi ảnh' : 'Thêm ảnh'}
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">JPG, PNG dưới 5MB</span>
                                        {profileImage && (
                                            <span className="text-xs text-green-600 mt-1">
                                                Ảnh đã tải: ~{getImageSizeInKB(profileImage)}KB
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Biệt danh</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tùy chọn"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={formData.birthDate}
                                                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên lạc</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-gray-500 mt-1">Chúng tôi sẽ gửi kết quả khuyến nghị qua email này</span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Education */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Học vấn</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Trường đang học</label>
                                        <input
                                            type="text"
                                            value={formData.school}
                                            onChange={(e) => handleInputChange('school', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tổ hợp môn</label>
                                        <input
                                            type="text"
                                            value={formData.major}
                                            onChange={(e) => handleInputChange('major', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Điểm trung bình</label>
                                        <input
                                            type="text"
                                            value={formData.gpa}
                                            onChange={(e) => handleInputChange('gpa', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mạng xã hội</label>
                                        <input
                                            type="url"
                                            value={formData.portfolio}
                                            onChange={(e) => handleInputChange('portfolio', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Achievements & Awards */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Danh hiệu & Giải thưởng</h2>
                                    <button
                                        onClick={addAchievement}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm danh hiệu
                                    </button>
                                </div>

                                {achievements.map((achievement, index) => (
                                    <div key={index} className="flex items-center space-x-4 mb-4 p-4 border border-gray-200 rounded-md">
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                                <input
                                                    type="text"
                                                    value={achievement.title}
                                                    onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Học bổng"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                                                <input
                                                    type="text"
                                                    value={achievement.year}
                                                    onChange={(e) => updateAchievement(index, 'year', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="2023"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                                <input
                                                    type="text"
                                                    value={achievement.description}
                                                    onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Top 10 của lớp"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeAchievement(index)}
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Notes */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ghi chú</h2>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                />
                            </div>

                            {/* Share Profile */}
                            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        checked={shareProfile}
                                        onChange={(e) => setShareProfile(e.target.checked)}
                                        className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900 mb-1">Chia sẻ profile của bạn</div>
                                        <div className="text-sm text-gray-600">
                                            AI sẽ truy cập vào profile của bạn. Có thể thay đổi tính năng này bất cứ lúc nào.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Export Options */}
                            <div className="mb-8">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Thao tác nhanh</h3>
                                <div className="flex space-x-4">
                                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                        <Download className="w-4 h-4 mr-2" />
                                        Xuất JSON
                                    </button>
                                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Tải PDF
                                    </button>
                                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-red-600">
                                        <X className="w-4 h-4 mr-2" />
                                        Xóa dữ liệu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Navigation */}
                <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                    <button className="flex items-center text-gray-500 hover:text-gray-700">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Cần hỗ trợ?
                        <span className="text-xs ml-1">Trải nghiệm thực tuyệt vời</span>
                    </button>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={loadProfile}
                            disabled={loading}
                            className="flex items-center text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                            <span className="mr-2">🔄</span>
                            {loading ? 'Đang tải...' : 'Tải lại'}
                        </button>
                        <button className="flex items-center text-gray-600 hover:text-gray-800">
                            <span className="mr-2">👁</span>
                            Xem trước
                        </button>
                        <button
                            onClick={saveProfile}
                            disabled={saving || loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Đang lưu...' : 'Cập nhật và lưu'}
                            <span className="ml-2">→</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {showImageModal && profileImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
                    <div className="relative max-w-2xl max-h-2xl p-4" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={profileImage}
                            alt="Profile Preview"
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                            Kích thước: ~{getImageSizeInKB(profileImage)}KB
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileForm;