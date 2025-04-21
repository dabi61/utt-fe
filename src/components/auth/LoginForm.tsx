import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  InputAdornment, 
  IconButton, 
  Link, 
  Alert,
  styled,
  useTheme
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Login as LoginIcon 
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { JWT_CONFIG } from '../../config';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 450,
  width: '100%',
  margin: 'auto',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  background: '#FFFFFF',
  border: `1px solid ${theme.palette.divider}`,
  borderTop: `4px solid ${theme.palette.primary.main}`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  marginTop: theme.spacing(3),
  boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(255, 107, 0, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

interface LoginFormError {
  email?: string;
  password?: string;
}

const LoginForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  // Lấy đường dẫn trước khi redirect đến trang login (nếu có)
  const from = (location.state as any)?.from || '/dashboard';
  
  const validateForm = (): boolean => {
    const newErrors: LoginFormError = {};
    
    if (!credentials.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    
    // Xóa lỗi khi người dùng nhập lại
    if (errors[name as keyof LoginFormError]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    // Xóa lỗi form
    if (formError) {
      setFormError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setDebugInfo(`Đang đăng nhập với: ${JSON.stringify(credentials)}`);
        const result = await login(credentials.email, credentials.password);
        
        if (result.success) {
          // Hiển thị thông tin token để debug
          const token = localStorage.getItem(JWT_CONFIG.tokenStorageName);
          const tokenPreview = token ? `${token.substring(0, 20)}...` : 'không có';
          setDebugInfo(`Đăng nhập thành công! Token: ${tokenPreview}`);
          
          // Chuyển hướng sau khi đăng nhập thành công
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000); // Delay để xem thông tin debug
        } else {
          setFormError(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
          setDebugInfo(`Lỗi đăng nhập: ${result.error}`);
        }
      } catch (error: any) {
        setFormError('Có lỗi xảy ra khi đăng nhập.');
        setDebugInfo(`Lỗi exception: ${error.message}`);
      }
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  
  return (
    <StyledPaper elevation={4}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            color: theme.palette.secondary.main,
            fontWeight: 700,
            letterSpacing: '-0.5px'
          }}
        >
          Đăng Nhập
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          Vui lòng đăng nhập để truy cập hệ thống quản lý trường học
        </Typography>
      </Box>
      
      {(formError || error) && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, '& .MuiAlert-message': { fontWeight: 500 } }}
        >
          {formError || error}
        </Alert>
      )}
      
      {debugInfo && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, '& .MuiAlert-message': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
        >
          {debugInfo}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          autoFocus
          value={credentials.email}
          onChange={handleChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: theme.palette.primary.main }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={credentials.password}
          onChange={handleChange}
          error={Boolean(errors.password)}
          helperText={errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: theme.palette.primary.main }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ textAlign: 'right', mt: 1 }}>
          <Link 
            component={RouterLink} 
            to="/forgot-password"
            underline="hover"
            sx={{ 
              color: theme.palette.secondary.main,
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            Quên mật khẩu?
          </Link>
        </Box>
        
        <StyledButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          startIcon={<LoginIcon />}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </StyledButton>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Chưa có tài khoản?{' '}
            <Link 
              component={RouterLink} 
              to="/register"
              underline="hover"
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600 
              }}
            >
              Đăng ký ngay
            </Link>
          </Typography>
        </Box>
      </Box>
    </StyledPaper>
  );
};

export default LoginForm; 