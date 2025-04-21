import React, { useEffect, useState, useRef } from 'react';
import { Card, Tabs, Form, Input, Button, Typography, Row, Col, Divider, message, Spin, Alert } from 'antd';
import { LockOutlined, IdcardOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import * as userApi from '../../api/userApi';
import { UserProfile } from '../../types/user';
import AvatarUpload from '../../components/profile/AvatarUpload';
import ProfileForm from '../../components/profile/ProfileForm';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Định nghĩa biến CSS custom
const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    padding: '20px',
    margin: '0 auto',
  },
  pageHeader: {
    textAlign: 'center' as const,
    marginBottom: '40px'
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: 600,
    margin: 0,
    letterSpacing: '1px',
    color: '#1A2C56'
  },
  pageSubtitle: {
    color: '#666',
    fontSize: '1.2rem',
    marginTop: '10px',
  },
  highlight: {
    color: '#FF7F00'
  },
  card: {
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  cardHover: {
    transform: 'translateY(-10px)',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
  },
  cardHeader: {
    padding: '25px 20px',
    textAlign: 'center' as const,
    position: 'relative' as 'relative',
  },
  cardHeaderStudent: {
    background: 'linear-gradient(135deg, #FF7F00 0%, #E57200 100%)',
    color: 'white',
  },
  cardHeaderTeacher: {
    background: 'linear-gradient(135deg, #233B78 0%, #1A2C56 100%)',
    color: 'white',
  },
  cardHeaderAdmin: {
    background: 'linear-gradient(135deg, #1A2C56 0%, #233B78 100%)',
    color: 'white',
  },
  tabPane: {
    padding: '30px'
  },
  primaryButton: {
    backgroundColor: '#FF7F00',
    color: 'white',
    fontWeight: 600,
    borderRadius: '50px',
    padding: '8px 24px',
    border: 'none',
    height: 'auto',
    transition: 'all 0.3s',
  },
  primaryButtonHover: {
    backgroundColor: '#E57200',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(255,127,0,0.3)',
  },
  secondaryButton: {
    backgroundColor: '#1A2C56',
    color: 'white',
    fontWeight: 600,
    borderRadius: '50px',
    padding: '8px 24px',
    border: 'none',
    height: 'auto',
    transition: 'all 0.3s',
  },
  secondaryButtonHover: {
    backgroundColor: '#233B78',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(26,44,86,0.3)',
  },
  profileSection: {
    textAlign: 'center' as const,
    backgroundColor: '#f8f9fa',
    padding: '30px',
    borderRadius: '15px',
  },
  formSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
  },
  footer: {
    marginTop: '60px',
    textAlign: 'center' as const,
    color: '#666',
    opacity: 0.8,
    fontSize: '0.9rem',
  },
  loadingContainer: {
    textAlign: 'center' as const,
    padding: '50px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
  }
};

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('1');

  const [passwordForm] = Form.useForm();
  
  // Sử dụng useRef để theo dõi trạng thái tải dữ liệu
  const fetchOnce = useRef(false);
  const isInitialMount = useRef(true);

  // Xử lý tải thông tin profile người dùng
  useEffect(() => {
    // Bỏ qua khi component render lần đầu
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Nếu đã gọi API rồi, bỏ qua
    if (fetchOnce.current) {
      return;
    }
    
    // Chỉ tải dữ liệu khi đã xác thực
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        fetchOnce.current = true;
        setLoading(true);
        
        // Thử lấy thông tin profile từ API
        try {
          const profileResponse = await userApi.getUserInfo();
          
          if (!isMounted) return;
          
          if (!profileResponse || typeof profileResponse !== 'object') {
            throw new Error('Dữ liệu profile không đúng định dạng');
          }
          
          setProfileData(profileResponse);
        } catch (error: any) {
          console.error('Lỗi khi lấy profile:', error);
          setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
        }
      } catch (error: any) {
        console.error('Lỗi:', error);
        if (isMounted) {
          setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Xử lý cập nhật thông tin người dùng 
  const handleProfileUpdate = (updatedUser: UserProfile) => {
    setProfileData(updatedUser);
  };

  // Xử lý thay đổi mật khẩu
  const handlePasswordChange = async (values: any) => {
    try {
      setPasswordLoading(true);
      
      // Gọi API thay đổi mật khẩu
      await userApi.changePasswordProfile({
        old_password: values.oldPassword,
        new_password: values.newPassword,
      });
      
      message.success('Thay đổi mật khẩu thành công!');
      passwordForm.resetFields();
      
      // Đăng xuất sau khi đổi mật khẩu nếu cần
      // logout();
    } catch (error: any) {
      const errorMsg = error.response?.data?.old_password 
        || error.response?.data?.new_password 
        || error.response?.data?.non_field_errors
        || error.response?.data?.detail
        || 'Đã có lỗi xảy ra khi thay đổi mật khẩu. Vui lòng thử lại.';
        
      message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin tip="Đang tải thông tin người dùng..." size="large" />
      </div>
    );
  }

  if (!profileData && !error) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Không thể tải thông tin hồ sơ. Vui lòng thử lại sau."
        type="error"
        showIcon
      />
    );
  }

  // Xác định kiểu card header dựa trên vai trò
  const getCardHeaderStyle = () => {
    if (profileData?.role === 'student') {
      return { ...styles.cardHeader, ...styles.cardHeaderStudent };
    } else if (profileData?.role === 'teacher') {
      return { ...styles.cardHeader, ...styles.cardHeaderTeacher };
    } else {
      return { ...styles.cardHeader, ...styles.cardHeaderAdmin };
    }
  };

  // Hiển thị vai trò dưới dạng text
  const getRoleDisplay = () => {
    if (profileData?.role === 'student') {
      return 'Sinh viên';
    } else if (profileData?.role === 'teacher') {
      return 'Giáo viên';
    } else if (profileData?.role === 'admin') {
      return 'Quản trị viên';
    } else {
      return 'Người dùng';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <Title level={2} style={styles.pageTitle}>
          <span style={styles.highlight}>Hồ sơ</span> Người dùng
        </Title>
        <Text style={styles.pageSubtitle}>
          Quản lý thông tin cá nhân và mật khẩu
        </Text>
      </div>
      
      {error && (
        <Alert 
          message="Thông báo" 
          description={error} 
          type="warning" 
          showIcon 
          style={{ marginBottom: '20px' }}
        />
      )}
      
      <Card 
        style={styles.card}
        bodyStyle={{ padding: 0 }}
        bordered={false}
      >
        <div style={getCardHeaderStyle()}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            {getRoleDisplay()}
          </Title>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          centered
        >
          <TabPane tab="Thông tin cá nhân" key="1">
            <div style={styles.tabPane}>
              <Row gutter={[24, 24]}>
                <Col span={24} md={8}>
                  <div style={styles.profileSection}>
                    <AvatarUpload 
                      user={profileData}
                      onAvatarChange={handleProfileUpdate}
                    />
                    
                    <Title level={3} style={{ marginTop: '16px', color: '#1A2C56' }}>
                      {profileData?.name || 'Không có tên'}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                      {getRoleDisplay()}
                    </Text>
                    
                    {profileData?.student_info && (
                      <div style={{ marginTop: '24px', textAlign: 'left' }}>
                        <Row gutter={[0, 16]}>
                          <Col span={24}>
                            <Card bordered={false} style={{ borderRadius: '10px' }}>
                              <Row align="middle">
                                <Col span={4}>
                                  <IdcardOutlined style={{ fontSize: '24px', color: '#FF7F00' }} />
                                </Col>
                                <Col span={20}>
                                  <div>
                                    <Text type="secondary">Mã sinh viên</Text>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                      {profileData.student_info.student_code}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </Card>
                          </Col>
                          <Col span={24}>
                            <Card bordered={false} style={{ borderRadius: '10px' }}>
                              <Row align="middle">
                                <Col span={4}>
                                  <BookOutlined style={{ fontSize: '24px', color: '#FF7F00' }} />
                                </Col>
                                <Col span={20}>
                                  <div>
                                    <Text type="secondary">Số lớp đang học</Text>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                      {profileData.student_info.classes_count}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    )}
                    
                    {profileData?.teacher_info && (
                      <div style={{ marginTop: '24px', textAlign: 'left' }}>
                        <Row gutter={[0, 16]}>
                          <Col span={24}>
                            <Card bordered={false} style={{ borderRadius: '10px' }}>
                              <Row align="middle">
                                <Col span={4}>
                                  <IdcardOutlined style={{ fontSize: '24px', color: '#1A2C56' }} />
                                </Col>
                                <Col span={20}>
                                  <div>
                                    <Text type="secondary">Mã giáo viên</Text>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                      {profileData.teacher_info.teacher_code}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </Card>
                          </Col>
                          <Col span={24}>
                            <Card bordered={false} style={{ borderRadius: '10px' }}>
                              <Row align="middle">
                                <Col span={4}>
                                  <TeamOutlined style={{ fontSize: '24px', color: '#1A2C56' }} />
                                </Col>
                                <Col span={20}>
                                  <div>
                                    <Text type="secondary">Số lớp giảng dạy</Text>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                      {profileData.teacher_info.classes_count}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </div>
                </Col>
                
                <Col span={24} md={16}>
                  <div style={styles.formSection}>
                    <Title level={4} style={{ color: '#1A2C56', marginTop: 0 }}>
                      Thông tin chi tiết
                    </Title>
                    <Divider style={{ margin: '16px 0 24px' }} />
                    
                    <ProfileForm
                      user={profileData}
                      onProfileUpdate={handleProfileUpdate}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane tab="Đổi mật khẩu" key="2">
            <div style={styles.tabPane}>
              <Row justify="center">
                <Col span={24} md={14}>
                  <div style={styles.formSection}>
                    <Title level={4} style={{ color: '#1A2C56', marginTop: 0 }}>
                      Thay đổi mật khẩu
                    </Title>
                    <Divider style={{ margin: '16px 0 24px' }} />
                    
                    <Spin spinning={passwordLoading}>
                      <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordChange}
                      >
                        <Form.Item
                          name="oldPassword"
                          label="Mật khẩu hiện tại"
                          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                        >
                          <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Mật khẩu hiện tại" 
                            size="large"
                            style={{ borderRadius: '8px' }}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          name="newPassword"
                          label="Mật khẩu mới"
                          rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                          ]}
                        >
                          <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Mật khẩu mới" 
                            size="large"
                            style={{ borderRadius: '8px' }}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          name="confirmPassword"
                          label="Xác nhận mật khẩu mới"
                          dependencies={['newPassword']}
                          rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Xác nhận mật khẩu mới" 
                            size="large"
                            style={{ borderRadius: '8px' }}
                          />
                        </Form.Item>
                        
                        <Form.Item style={{ marginTop: '40px' }}>
                          <Button 
                            type="primary" 
                            htmlType="submit"
                            size="large"
                            style={{
                              backgroundColor: '#1A2C56',
                              borderColor: '#1A2C56',
                              borderRadius: '50px',
                              width: '100%',
                              height: 'auto',
                              padding: '10px 0',
                              fontWeight: 'bold',
                            }}
                          >
                            Thay đổi mật khẩu
                          </Button>
                        </Form.Item>
                      </Form>
                    </Spin>
                  </div>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
      
      <div style={styles.footer}>
        <p>UTT School &copy; {new Date().getFullYear()} | Hệ thống quản lý trường học</p>
      </div>
    </div>
  );
};

export default ProfilePage; 