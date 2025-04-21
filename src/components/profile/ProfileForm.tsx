import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Select, message, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, BookOutlined } from '@ant-design/icons';
import * as userApi from '../../api/userApi';
import { UserProfile } from '../../types/user';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

interface ProfileFormProps {
  user: UserProfile | null;
  onProfileUpdate: (newUser: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onProfileUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Cập nhật form khi user thay đổi
  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth ? moment(user.date_of_birth) : undefined,
        gender: user.gender || undefined,
        bio: user.bio || '',
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Xử lý chuyển đổi date_of_birth từ moment sang string nếu có
      const formattedValues = {
        ...values,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : undefined,
      };
      
      // Gọi API để cập nhật thông tin
      const updatedUser = await userApi.updateProfile(formattedValues);
      
      // Thông báo thành công
      message.success('Cập nhật thông tin thành công!');
      
      // Cập nhật thông tin người dùng ở component cha
      onProfileUpdate(updatedUser);
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: user?.name || '',
          email: user?.email || '',
          phone_number: user?.phone_number || '',
          address: user?.address || '',
          date_of_birth: user?.date_of_birth ? moment(user.date_of_birth) : undefined,
          gender: user?.gender || undefined,
          bio: user?.bio || '',
        }}
      >
        <Form.Item
          name="name"
          label="Họ tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="Họ tên" 
            size="large"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="Email"
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="Email" 
            disabled
            size="large"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
        
        <Form.Item
          name="phone_number"
          label="Số điện thoại"
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="Số điện thoại" 
            size="large"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
        
        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <Input 
            prefix={<HomeOutlined />} 
            placeholder="Địa chỉ" 
            size="large"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
        
        <Form.Item
          name="date_of_birth"
          label="Ngày sinh"
        >
          <DatePicker 
            placeholder="Chọn ngày sinh"
            format="DD/MM/YYYY"
            style={{ width: '100%', borderRadius: '8px' }}
            size="large"
          />
        </Form.Item>
        
        <Form.Item
          name="gender"
          label="Giới tính"
        >
          <Select
            placeholder="Chọn giới tính"
            size="large"
            style={{ width: '100%', borderRadius: '8px' }}
          >
            <Option value="M">Nam</Option>
            <Option value="F">Nữ</Option>
            <Option value="O">Khác</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="bio"
          label="Giới thiệu"
        >
          <TextArea 
            rows={4} 
            placeholder="Nhập giới thiệu ngắn về bản thân"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit"
            size="large"
            style={{
              backgroundColor: '#FF7F00',
              borderColor: '#FF7F00',
              borderRadius: '50px',
              width: '100%',
              height: 'auto',
              padding: '10px 0',
              fontWeight: 'bold',
            }}
          >
            Cập nhật thông tin
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default ProfileForm; 