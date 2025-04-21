import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Kiểm tra có thông báo từ URL không (khi bị đẩy về từ trang khác)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expiredToken = params.get('expired');
    const unauthorized = params.get('unauthorized');
    
    if (expiredToken === 'true') {
      setLoginError('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.');
      message.error('Phiên đăng nhập đã hết hạn', 3);
    } else if (unauthorized === 'true') {
      setLoginError('Bạn cần đăng nhập để truy cập trang này.');
    }
  }, [location]);

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      const defaultRedirect = '/dashboard';
      const from = (location.state as any)?.from?.pathname || defaultRedirect;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Xử lý đăng nhập
  const onFinish = async (values: { email: string; password: string }) => {
    setLoginError(null);
    try {
      const result = await login(values.email, values.password);
      if (!result.success) {
        setLoginError(result.error || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      setLoginError(error.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderRadius: '15px'
        }}
        bodyStyle={{ padding: '30px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ margin: 0, color: '#1A2C56' }}>
            UTT <span style={{ color: '#FF7F00' }}>School</span>
          </Title>
          <Text type="secondary">Hệ thống quản lý đào tạo</Text>
        </div>
        
        {loginError && (
          <Alert
            message="Lỗi đăng nhập"
            description={loginError}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}
        
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
              size="large" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Mật khẩu" 
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '10px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              style={{ 
                width: '100%', 
                height: 'auto',
                padding: '10px 0',
                fontSize: '16px',
                borderRadius: '8px',
                backgroundColor: '#FF7F00',
                border: 'none'
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text type="secondary">
            Chưa có tài khoản? <a href="/register">Đăng ký</a>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage; 