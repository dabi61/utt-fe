import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  InputAdornment,
  FormHelperText,
  useTheme,
  styled
} from '@mui/material';
import { Student } from '../types/student';
import { Class } from '../types/class';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi';
import dayjs from 'dayjs';
import { Email, Phone, Person, School, CalendarMonth } from '@mui/icons-material';

interface StudentFormProps {
  student?: Student;
  classes: Class[];
  onSubmit: (student: Partial<Student>) => void;
  loading?: boolean;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  borderTop: `4px solid ${theme.palette.primary.main}`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  fontWeight: 'bold',
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&.MuiButton-outlined': {
    borderColor: theme.palette.secondary.main,
    color: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main + '10',
    },
  },
}));

const StudentForm: React.FC<StudentFormProps> = ({ 
  student, 
  classes, 
  onSubmit, 
  loading = false 
}) => {
  const theme = useTheme();
  const [formValues, setFormValues] = useState<Partial<Student>>({
    id: '',
    name: '',
    email: '',
    phone: '',
    class_id: '',
    date_of_birth: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormValues({
        id: student.id || '',
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        class_id: student.class_id || '',
        date_of_birth: student.date_of_birth ? new Date(student.date_of_birth) : null,
      });
    }
  }, [student]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formValues.name?.trim()) {
      newErrors.name = 'Tên sinh viên không được để trống';
    }
    
    if (!formValues.email?.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^\S+@\S+\.\S+$/.test(formValues.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formValues.phone?.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10}$/.test(formValues.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10 chữ số';
    }
    
    if (!formValues.class_id) {
      newErrors.class_id = 'Vui lòng chọn lớp học';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormValues((prev) => ({ ...prev, date_of_birth: date }));
    
    // Clear error when field is edited
    if (errors.date_of_birth) {
      setErrors((prev) => ({ ...prev, date_of_birth: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formValues);
    }
  };

  return (
    <StyledPaper elevation={3}>
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{ 
          color: theme.palette.secondary.main,
          borderBottom: `1px solid ${theme.palette.divider}`,
          paddingBottom: 1,
          marginBottom: 2,
          fontWeight: 600
        }}
      >
        {student ? 'Cập nhật thông tin sinh viên' : 'Thêm sinh viên mới'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Họ và tên"
              name="name"
              variant="outlined"
              value={formValues.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              value={formValues.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              name="phone"
              variant="outlined"
              value={formValues.phone}
              onChange={handleChange}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(errors.class_id)} required>
              <InputLabel id="class-select-label">Lớp học</InputLabel>
              <Select
                labelId="class-select-label"
                name="class_id"
                value={formValues.class_id}
                onChange={handleSelectChange}
                label="Lớp học"
                startAdornment={
                  <InputAdornment position="start">
                    <School color="primary" />
                  </InputAdornment>
                }
              >
                {classes.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.class_id && <FormHelperText>{errors.class_id}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
              <DatePicker
                label="Ngày sinh"
                value={formValues.date_of_birth}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonth color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <StyledButton
              variant="outlined"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Hủy bỏ
            </StyledButton>
            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : student ? 'Cập nhật' : 'Thêm mới'}
            </StyledButton>
          </Grid>
        </Grid>
      </Box>
    </StyledPaper>
  );
};

export default StudentForm; 