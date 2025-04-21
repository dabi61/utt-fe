import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register, selectAuth, setAuthError } from '../../store/slices/authSlice';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Tên quá ngắn')
    .max(50, 'Tên quá dài')
    .required('Họ tên là bắt buộc'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
  re_password: Yup.string()
    .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp')
    .required('Xác nhận mật khẩu là bắt buộc'),
});

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector(selectAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  
  useEffect(() => {
    // Xóa lỗi trước đó
    dispatch(setAuthError(null));
  }, [dispatch]);
  
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      re_password: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values) => {
      const resultAction = await dispatch(register(values));
      if (register.fulfilled.match(resultAction)) {
        setRegisterSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    },
  });
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography component="h2" variant="h5" align="center" gutterBottom>
        Đăng ký tài khoản
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          id="name"
          name="name"
          label="Họ tên"
          margin="normal"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          margin="normal"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          margin="normal"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <TextField
          fullWidth
          id="re_password"
          name="re_password"
          label="Xác nhận mật khẩu"
          type={showConfirmPassword ? 'text' : 'password'}
          margin="normal"
          value={formik.values.re_password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.re_password && Boolean(formik.errors.re_password)}
          helperText={formik.touched.re_password && formik.errors.re_password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleClickShowConfirmPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Đăng ký'}
        </Button>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Đã có tài khoản?{' '}
            <Link component={RouterLink} to="/login" variant="body2">
              Đăng nhập
            </Link>
          </Typography>
        </Box>
      </Box>
      
      <Snackbar
        open={registerSuccess}
        autoHideDuration={3000}
        message="Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập..."
      />
    </Box>
  );
};

export default RegisterPage; 