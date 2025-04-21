import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography, Paper, useTheme } from '@mui/material';

const AuthLayout = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              mb: 2 
            }}
          >
            <img 
              src="/logo.png" 
              alt="UTT Logo" 
              style={{ 
                height: '64px', 
                width: 'auto', 
                marginBottom: '16px' 
              }}
            />
            <Typography
              component="h1"
              variant="h4"
              color="primary"
              gutterBottom
              align="center"
              fontWeight="bold"
            >
              UTT School
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              align="center"
              gutterBottom
              sx={{ mb: 4 }}
            >
              Hệ thống quản lý trường học
            </Typography>
          </Box>
          
          <Outlet />
        </Paper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} UTT School - Hệ thống quản lý trường học
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout; 