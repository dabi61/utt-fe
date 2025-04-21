import React from 'react';
import { Spin } from 'antd';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: '1.5rem',
    color: '#1A2C56',
    marginTop: '20px',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    marginTop: '10px',
    textAlign: 'center' as const,
  },
  logo: {
    width: 'auto',
    height: '100px',
    marginBottom: '20px',
  },
  spinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '30px',
  },
};

const LoadingPage: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.logo}>
        <img 
          src="/logo.png" 
          alt="UTT Logo" 
          style={{ width: 'auto', height: '100%' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxQTJDNTYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+VVRUPS9zdmc+';
          }}
        />
      </div>
      <h1 style={styles.title}>UTT School Management</h1>
      <p style={styles.subtitle}>Đang tải ứng dụng...</p>
      <div style={styles.spinnerContainer}>
        <Spin size="large" />
      </div>
    </div>
  );
};

export default LoadingPage; 