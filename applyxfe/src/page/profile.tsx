import React, { useState } from 'react';
import { Bell, HelpCircle, Plus, Calendar, Trash2, Download, FileText, X } from 'lucide-react';
import Sidebar from '../component/sidebar';

const ProfileForm: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: 'Nguyễn Gia Huy',
        lastName: 'Huy đẹp trai',
        gender: 'Nam',
        birthDate: '1999-03-15',
        email: 'sarah.chen@university.edu',
        phone: '+1 (555) 123-4567',
        school: 'Trường THPT Quỳ Hợp',
        major: 'Toán - Lý - Hóa',
        gpa: '9.5',
        portfolio: 'https://your-portfolio.com'
    });

    const [achievements, setAchievements] = useState([
        { title: 'Học bổng', year: '2023', description: 'Top 10 của lớp' }
    ]);

    const [shareProfile, setShareProfile] = useState(false);

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

                <div className="p-6 max-w-4xl">
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
                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover"
                                />
                                <button className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center">
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm ảnh
                            </button>
                            <span className="text-sm text-gray-500">JPG, PNG dưới 5MB</span>
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
                                <span className="text-xs text-gray-500 mt-1">24 tuổi</span>
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
                                <span className="text-xs text-gray-500 mt-1">Chúng tôi sẽ gửi kết quả khuyến nghị email này</span>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                            placeholder="Share anything that might help your coach understand your goals, challenges, or interests..."
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
                                    AI sẽ vận hành sinh sẽ thúy cắp profile của bạn. Có thể thậy đổi tình năng này bất cứ lúc nào.
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

                {/* Bottom Navigation */}
                <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                    <button className="flex items-center text-gray-500 hover:text-gray-700">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Cần hỗ trợ?
                        <span className="text-xs ml-1">Trải nghiệm thực tuyệt vời</span>
                    </button>

                    <div className="flex items-center space-x-4">
                        <button className="flex items-center text-gray-600 hover:text-gray-800">
                            <span className="mr-2">👁</span>
                            Xem trước
                        </button>
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center">
                            Cập nhật và lưu
                            <span className="ml-2">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileForm;