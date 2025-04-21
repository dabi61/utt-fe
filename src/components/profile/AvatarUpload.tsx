import React, { useState, useEffect } from 'react';
import { Upload, message, Button, Spin, Avatar } from 'antd';
import { UserOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import * as userApi from '../../api/userApi';
import { UserProfile } from '../../types/user';
import type { RcFile } from 'antd/es/upload';

interface AvatarUploadProps {
  user: UserProfile | null;
  onAvatarChange: (newUser: UserProfile) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ user, onAvatarChange }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(user?.avatar_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Cập nhật imageUrl khi user prop thay đổi
  useEffect(() => {
    if (user?.avatar_url) {
      setImageUrl(user.avatar_url);
    }
  }, [user?.avatar_url]);

  // Xử lý trước khi tải lên
  const beforeUpload = (file: RcFile) => {
    // Kiểm tra loại file
    const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
    if (!isValidType) {
      message.error('Chỉ hỗ trợ định dạng JPG, PNG, GIF!');
      return Upload.LIST_IGNORE;
    }
    
    // Kiểm tra kích thước file (2MB = 2 * 1024 * 1024 bytes)
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước ảnh không được vượt quá 2MB!');
      return Upload.LIST_IGNORE;
    }
    
    // Lưu file đã chọn
    setSelectedFile(file);
    
    // Tạo URL preview tạm thời
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
    
    // Trả về false để ngăn hành vi tải lên mặc định của antd
    return false;
  };

  // Xử lý tải lên file
  const handleUpload = async () => {
    if (!selectedFile) {
      message.error('Vui lòng chọn ảnh trước!');
      return;
    }
    
    try {
      setLoading(true);
      console.log("Bắt đầu tải lên file:", selectedFile.name, selectedFile.type, selectedFile.size);
      
      // Gọi API để tải lên avatar
      const response = await userApi.uploadAvatar(selectedFile);
      console.log("Phản hồi API thành công:", response);
      
      // Thông báo thành công
      message.success('Tải lên avatar thành công!');
      
      // Reset selectedFile sau khi tải lên thành công
      setSelectedFile(null);
      
      // Cập nhật thông tin người dùng sau khi thay đổi avatar
      if (response) {
        onAvatarChange(response);
        
        // Cập nhật URL ảnh nếu có trong phản hồi
        if (response.avatar_url) {
          setImageUrl(response.avatar_url);
        }
      }
    } catch (error: any) {
      console.error("Lỗi khi tải lên avatar:", error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.avatar?.[0] || 
                      'Không thể tải lên avatar. Vui lòng thử lại.';
      message.error(errorMsg);
      
      // Khôi phục URL ảnh ban đầu nếu có lỗi
      setImageUrl(user?.avatar_url || null);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa avatar
  const handleRemoveAvatar = async () => {
    try {
      setLoading(true);
      
      // Gọi API để xóa avatar
      const response = await userApi.removeAvatar();
      console.log("Phản hồi xóa avatar:", response);
      
      // Đặt lại URL ảnh
      setImageUrl(null);
      setSelectedFile(null);
      
      // Thông báo thành công
      message.success('Xóa avatar thành công!');
      
      // Cập nhật thông tin người dùng
      if (response) {
        onAvatarChange(response);
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa avatar:", error);
      message.error(error.response?.data?.detail || 'Không thể xóa avatar. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng 2 nút riêng biệt: một để chọn file, một để tải lên
  return (
    <div className="avatar-upload-container" style={{ textAlign: 'center' }}>
      <Spin spinning={loading}>
        <div style={{ marginBottom: 16 }}>
          {imageUrl ? (
            <Avatar 
              src={imageUrl}
              size={120}
              style={{
                border: '5px solid white',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              }}
            />
          ) : (
            <Avatar 
              icon={<UserOutlined />}
              size={120}
              style={{
                border: '5px solid white',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              }}
            />
          )}
        </div>
        
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={beforeUpload}
            accept="image/png,image/jpeg,image/gif"
          >
            <Button 
              icon={<UploadOutlined />}
              style={{
                borderRadius: '50px',
              }}
            >
              Chọn ảnh
            </Button>
          </Upload>
          
          {selectedFile && (
            <Button 
              type="primary"
              onClick={handleUpload}
              style={{
                backgroundColor: '#FF7F00',
                borderColor: '#FF7F00',
                borderRadius: '50px',
              }}
            >
              Tải lên
            </Button>
          )}
          
          {imageUrl && (
            <Button 
              onClick={handleRemoveAvatar}
              icon={<DeleteOutlined />}
              danger
              style={{ borderRadius: '50px' }}
            >
              Xóa
            </Button>
          )}
        </div>
        
        {selectedFile && (
          <div style={{ marginTop: 8, color: '#666' }}>
            Đã chọn: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </div>
        )}
      </Spin>
    </div>
  );
};

export default AvatarUpload; 