import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
import { useAuth } from './hooks/useAuth';
import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import LoadingPage from './pages/common/LoadingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SchedulePage from './pages/schedule/SchedulePage';

// Mở rộng interface Window để khai báo thuộc tính tùy chỉnh
declare global {
  interface Window {
    __AUTH_INIT_COUNT__: number;
  }
}

function App() {
  // Biến toàn cục để theo dõi việc khởi tạo
  if (typeof window.__AUTH_INIT_COUNT__ === 'undefined') {
    window.__AUTH_INIT_COUNT__ = 0;
  }
  
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [appReady, setAppReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(() => {
    const path = window.location.pathname;
    return path.split('/')[1] || 'dashboard';
  });
  
  useEffect(() => {
    // Đếm số lần useEffect này chạy
    window.__AUTH_INIT_COUNT__++;
    console.log('🔄 App useEffect chạy lần thứ', window.__AUTH_INIT_COUNT__);

    // Kiểm tra nếu quá nhiều lần, có thể có vòng lặp vô hạn
    if (window.__AUTH_INIT_COUNT__ > 5) {
      console.warn('⚠️ Phát hiện có thể có vòng lặp vô hạn. Bắt buộc đánh dấu ứng dụng đã sẵn sàng');
      setAppReady(true);
      return;
    }
    
    // Đợi một khoảng thời gian ngắn rồi đánh dấu ứng dụng sẵn sàng
    const timer = setTimeout(() => {
      console.log('✅ App đã sẵn sàng, loading =', loading);
      setAppReady(true);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [loading]);
  
  if (!appReady) {
    console.log('⏳ Đang tải ứng dụng...');
    return <LoadingPage />;
  }
  
  console.log('🚀 Render App với isAuthenticated =', isAuthenticated);
  
  // Tạo một component đơn giản để hiển thị tạm thời cho các trang chưa được triển khai
  const PlaceholderPage = ({ title }: { title: string }) => (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>{title}</h1>
      <p>Trang này đang được phát triển.</p>
    </div>
  );
  
  // Modern Layout với hiệu ứng
  const SimpleLayout = ({ children }: { children: React.ReactNode }) => {
    const handleNavigation = (path: string) => {
      setActiveLink(path.split('/')[1]);
      window.location.href = path;
    };
    
    const logoutWithAnimation = () => {
      localStorage.clear();
      logout();
      window.location.href = '/login';
    };
    
    return (
      <div className="app-container" style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f5f7fa',
      }}>
        {/* Header/Navbar */}
        <header className="app-navbar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}>
          {/* Logo */}
          <div className="navbar-brand" style={{
            display: 'flex',
            alignItems: 'center',
          }}>
            <img 
              src="/logo-short.png" 
              alt="UTT Logo" 
              style={{ height: '40px' }}
            />
          </div>
          
          {/* Nút co/giãn menu - chỉ hiển thị trên màn hình nhỏ */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mobile-menu-button"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          
          {/* Navigation - Desktop */}
          <nav className="desktop-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            {[
              { path: '/dashboard', label: 'Dashboard', icon: '📊' },
              { path: '/profile', label: 'Hồ sơ', icon: '👤' },
              { path: '/schedule', label: 'Lịch học', icon: '📆' },
              { path: '/attendance', label: 'Điểm danh', icon: '✓' },
              { path: '/classes', label: 'Lớp học', icon: '👨‍🏫' },
            ].map((item) => (
              <a 
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: activeLink === item.path.split('/')[1] ? '#1890ff' : '#666',
                  fontWeight: activeLink === item.path.split('/')[1] ? 'bold' : 'normal',
                  background: activeLink === item.path.split('/')[1] ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                }}
              >
                <span style={{ marginRight: '6px' }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
            
            {/* Logout button */}
            <button 
              onClick={logoutWithAnimation}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                color: '#f44336',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              <span style={{ marginRight: '6px' }}>🚪</span>
              Đăng xuất
            </button>
          </nav>
        </header>
        
        {/* Sidebar - Mobile */}
        <div style={{
          position: 'fixed',
          top: '60px',
          right: 0,
          bottom: 0,
          width: '250px',
          backgroundColor: 'white',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0',
        }}>
          {[
            { path: '/dashboard', label: 'Dashboard', icon: '📊' },
            { path: '/profile', label: 'Hồ sơ', icon: '👤' },
            { path: '/schedule', label: 'Lịch học', icon: '📆' },
            { path: '/attendance', label: 'Điểm danh', icon: '✓' },
            { path: '/classes', label: 'Lớp học', icon: '👨‍🏫' },
          ].map((item) => (
            <a 
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.path);
                setSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                textDecoration: 'none',
                color: activeLink === item.path.split('/')[1] ? '#1890ff' : '#666',
                fontWeight: activeLink === item.path.split('/')[1] ? 'bold' : 'normal',
                background: activeLink === item.path.split('/')[1] ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
          
          <button 
            onClick={logoutWithAnimation}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              color: '#f44336',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '20px' }}>🚪</span>
            Đăng xuất
          </button>
        </div>
        
        {/* Overlay khi sidebar mở */}
        {sidebarOpen && (
          <div 
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main style={{
          flex: 1,
          padding: '20px',
        }}>
          {/* Content container */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            minHeight: 'calc(100vh - 140px)',
          }}>
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer style={{
          padding: '10px 20px',
          backgroundColor: 'white',
          borderTop: '1px solid #eaeaea',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666',
        }}>
          © {new Date().getFullYear()} UTT School Management System
        </footer>
        
        {/* CSS cho responsive */}
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav {
              display: none;
            }
            .mobile-menu-button {
              display: block;
            }
          }
          
          @media (min-width: 769px) {
            .desktop-nav {
              display: flex;
            }
            .mobile-menu-button {
              display: none;
            }
          }
        `}</style>
      </div>
    );
  };
  
  const AttendancePlaceholder = () => <PlaceholderPage title="Attendance" />;
  const ClassPlaceholder = () => <PlaceholderPage title="Classes" />;
  const ClassDetailPlaceholder = () => <PlaceholderPage title="Class Detail" />;
  
  return (
    <ConfigProvider locale={viVN}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SimpleLayout>
                <DashboardPage />
              </SimpleLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <SimpleLayout>
                <ProfilePage />
              </SimpleLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <SimpleLayout>
                <AttendancePlaceholder />
              </SimpleLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <SimpleLayout>
                <SchedulePage />
              </SimpleLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <SimpleLayout>
                <ClassPlaceholder />
              </SimpleLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/classes/:id"
          element={
            <ProtectedRoute>
              <SimpleLayout>
                <ClassDetailPlaceholder />
              </SimpleLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;